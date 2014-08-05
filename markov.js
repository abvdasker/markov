var globalRegex = /(\w|['-])+([\.,\/#!$%\^&\*;:{}=\-_`~])*/;

// generalize this to accept arbitrary gram length. Right now it is only monograms.
function Markov(text) {
  // variables
  this.textSource = text;
  this.tokenRegex = globalRegex;
  this.nodes = {};
  this.startNodes = {};
  
  // functions
  this.generateNodes = generateNodes;
  this.calculateProbabilities = calculateProbabilities;
  this.generateSentence = generateSentence;
  
  // initializers
  this.generateNodes(this.nodes, this.startNodes, this.textSource, this.tokenRegex);
  this.calculateProbabilities();
  
  function generateNodes(nodes, startNodes, text, rgx) {
    var subText = text;
    var match   = subText.match(rgx);
    
    var lastLastToken = null;
    var lastToken = null;
    var currentToken = null;
  
    while (match != null) {
      lastToken = currentToken;
      currentToken = match[0];
      
      if (lastToken != null) {
        var lastNode = nodes[lastToken];
        if (lastNode == null) {
          lastNode = new MarkovNode(lastToken);
        }
        var currentNode = nodes[currentToken];
        if (currentNode == null) {
          currentNode = new MarkovNode(currentToken);
          nodes[currentToken] = currentNode;
          
          if (lastNode.isEndToken()) {
            currentNode.isStartNode = true;
            startNodes[currentToken] = currentNode;
          }
          
        }
        
        lastNode.followedBy(currentNode);
      }
      
      // for next loop
      var offset = subText.indexOf(currentToken);
      subText = subText.substr(offset + currentToken.length + 1);
      match = subText.match(rgx);
      
    }
    
  }
  
  function calculateProbabilities() {
    for (var token in this.nodes) {
      var node = this.nodes[token];
      node.caluclateProbabilities();
    }
  }
  
  function generateSentence() {
    
    var startTokens = Object.keys(this.startNodes);
    var randIdx = Math.round(Math.random()*startTokens.length)
    var startNodeToken = startTokens[randIdx];
    var startNode = this.startNodes[startNodeToken];
    
    var sentence = startNode.token + " ";
    nextNode = startNode;
    while (nextNode != null && !nextNode.isEndToken()) {
      nextNode = nextNode.getFollowingNode();
      sentence += nextNode.token + " ";
      //console.log(nextNode.token);
    }
    
    return sentence;
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
    
    return lastChar.match(/[\.]/) != null;
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