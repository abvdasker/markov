var globalRegex = /(\w|['-])+([\.,\/#!$%\^&\*;:{}=\-_`~])*/;
var endPunctuationRegex = /[\.]|[!]|[?]/;

// generalize this to accept arbitrary gram length. Right now it is only monograms.
function Markov(text) {
  // variables
  this.textSource = text;
  this.tokenRegex = globalRegex;
  this.nodes = {};
  this.startNodes = {};
  this.triGrams = {};
  
  // functions
  this.generateNodes = generateNodes;
  this.calculateProbabilities = calculateProbabilities;
  this.generateSentenceNodes = generateSentenceNodes;
  this.generateSentenceTriGrams = generateSentenceTriGrams;
  this.makeCurrentNode = makeCurrentNode;
  this.makeCurrentTriGram = makeCurrentTriGram;
  
  // initializers
  this.generateNodes(this.nodes, this.startNodes, this.textSource, this.tokenRegex);
  this.calculateProbabilities();
  
  function generateNodes(nodes, startNodes, text, rgx) {
    var subText = text;
    var match   = subText.match(rgx);
    
    var lastLastToken = null;
    var lastToken = null;
    var currentToken = null;
    var currentTriGram = null;
  
    var last3Nodes = [];
    var tokens = 0;
    while (match != null) {
      lastToken = currentToken;
      tokens++;
      currentToken = match[0];
      
      if (lastToken != null) {
        
        var lastNode = nodes[lastToken];
        if (lastNode == null) {
          lastNode = new MarkovNode(lastToken);
        }
        
        var currentNode = this.makeCurrentNode(currentToken, lastNode);
        
        if (last3Nodes.length > 2) {
          last3Nodes.shift();
          last3Nodes.push(currentNode);
        } else {
          last3Nodes.push(currentNode);
        }
        var currentTriGram = this.makeCurrentTriGram(last3Nodes);
        
        /* trigrams are getting clobbered by their starting token.
         * Need to find a different means of uniquely identifying them.
         * i.e. An ending token could start multiple trigrams.
         */
        var triGramToken = currentTriGram.firstNode.token;
        if (this.triGrams[triGramToken] == null) {
          this.triGrams[triGramToken] = [currentTriGram];
        } else {
          this.triGrams[triGramToken].push(currentTriGram);
        }
        
        lastNode.followedBy(currentNode);
      }
      
      // for next loop
      var offset = subText.indexOf(currentToken);
      subText = subText.substr(offset + currentToken.length + 1);
      match = subText.match(rgx);
      
    }
    //console.log(tokens);
    
  }
  
  function makeCurrentTriGram(last3Nodes) {
    var triGramNodes = [];
    for (var idx in last3Nodes) {
      var node = last3Nodes[idx];
      triGramNodes.push(node);
      if (node.isEndToken()) {
        break;
      }
    }
    var triGram = new TriGram(triGramNodes);
    return triGram;
  }
  
  function makeCurrentNode(currentToken, lastNode) {

    var currentNode = this.nodes[currentToken];
    if (currentNode == null) {
      currentNode = new MarkovNode(currentToken);
      this.nodes[currentToken] = currentNode;
      
      if (lastNode.isEndToken()) {
        currentNode.isStartNode = true;
        this.startNodes[currentToken] = currentNode;
      }
      
    }
    
    return currentNode;
  }
  
  function calculateProbabilities() {
    for (var token in this.nodes) {
      var node = this.nodes[token];
      node.caluclateProbabilities();
    }
  }
  
  function generateSentenceTriGrams() {
    // var wordCount = 0;
    // for (var key in this.triGrams) {
    //   var triGramArray = this.triGrams[key];
    //   for (var idx in triGramArray) {
    //     var triGram = triGramArray[idx];
    //     wordCount += triGram.nodes.length;
    //   }
    // }
    var startNode = getRandomStartNode(this.startNodes);
    var triGramArray = this.triGrams[startNode.token];
    var triGram = getRandomObjectFromArray(triGramArray);
    var sentence = "";
    var seenTriGrams = [];
    while (!triGram.lastNode.isEndToken()) {
      //console.log(triGram.getWordString());
      //console.log(triGram.getWordString());
      sentence += triGram.getWordString();
      var bridgeNode = triGram.lastNode;
      var nextTriGramCandidate;
      var triGramArray = this.triGrams[bridgeNode.getFollowingNode().token];
      triGram = getRandomObjectFromArray(triGramArray);
      seenTriGrams.push(triGram);
    }
    
    sentence += triGram.getWordString();
    
    return sentence;
  }
  
  function getRandomTriGrams(triGrams) {
    
  }
  
  function generateSentenceNodes() {
    
    var startNode = getRandomStartNode(this.startNodes);
    
    var sentence = startNode.token + " ";
    nextNode = startNode;
    while (nextNode != null && !nextNode.isEndToken()) {
      nextNode = nextNode.getFollowingNode();
      sentence += nextNode.token + " ";
      //console.log(nextNode.token);
    }
    
    return sentence;
  }
  
  function getRandomStartNode(startNodes) {
    var startTokens = Object.keys(startNodes);
    var randIdx = Math.floor(Math.random()*(startTokens.length - 1));
    var startNodeToken = startTokens[randIdx];
    var startNode = startNodes[startNodeToken];
    
    return startNode;
  }
  
  function getRandomObjectFromArray(array) {
    var arrayLength = array.length;
    var randIdx = Math.round(Math.random()*(array.length - 1));
    return array[randIdx];
  }

}

function TriGram(nodes) {
  this.nodes = nodes;
  this.firstNode = nodes[0];
  this.lastNode = nodes[nodes.length - 1];
  this.nodeCount = nodes.length;
  
  // functions
  this.has3Nodes = has3Nodes;
  this.getWordString = getWordString;
  
  function has3Nodes() {
    return this.nodes.length == 3;
  }
  
  function getWordString() {
    var string = "";
    for (var idx in this.nodes) {
      string += this.nodes[idx].token + " ";
    }
    return string;
  }
}

function MarkovNode(token) {
  // variables
  this.token = token;
  this.count = 1;
  this.followingNodeObjects = {};
  this.tokenRegex = globalRegex;
  this.notEndings = ['Mr.', 'Mrs.', 'Miss.'];
  this.isStartNode = false;
  
  // functions
  this.followedBy = followedBy;
  this.caluclateProbabilities = calculateProbabilities;
  this.getFollowingNode = getFollowingNode;
  this.isEndToken = isEndToken;
  
  function calculateProbabilities() {
    var totalCount = 0;
    for (var token in this.followingNodeObjects) {
      totalCount += this.followingNodeObjects[token].count;
    }
    
    for (var token in this.followingNodeObjects) {
      var nodeObject = this.followingNodeObjects[token];
      this.followingNodeObjects[token].probability = nodeObject.count/totalCount;
    }
  }
  
  function followedBy(node) {
    if (this.followingNodeObjects[node.token] != null) {
      var followingNode = this.followingNodeObjects[node.token];
      this.followingNodeObjects[node.token].count++;
    } else {
      this.followingNodeObjects[node.token] = {
        count: 1,
        node: node
      }
    }
  }
  
  function isEndToken() {
    var token = this.token
    var lastChar = token.charAt(token.length - 1);
    if (this.notEndings.indexOf(token) != -1) {
      return false;
    }
    
    return lastChar.match(endPunctuationRegex) != null;
  }
  
  function getFollowingNode() {
    var probabilityMap = {};
    var currentProbability = 0;
    for (var token in this.followingNodeObjects) {
      var nodeObject = this.followingNodeObjects[token];
      var probability = nodeObject.probability;
      if (probability != null) {
        currentProbability += probability;
        probabilityMap[currentProbability] = nodeObject.node;
      }
    }
    var rand = Math.random();
    
    for (var probabilityRange in probabilityMap) {
      if (rand < probabilityRange) {
        return probabilityMap[probabilityRange];
      }
    }
  }
  
}

function TextSource(name, text) {
  this.text = text; 
  this.name = name;
}

module.exports = {
  Markov: Markov
}