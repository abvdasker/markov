function Markov(text) {
  // "nodes" is the array of nodes and probabilities
  //this.nodes = {};
  this.textSource = text;
  this.tokenRegex = /\b\w+([']|[\.,-\/#!$%\^&\*;:{}=\-_`~\?])*\b/;
  
  this.nodes = {};
  this.generateNodes = generateNodes;
  this.calculateProbabilities = calculateProbabilities;
  this.generateSentence = generateSentence;
  
  this.generateNodes(this.nodes, this.textSource, this.tokenRegex);
  this.calculateProbabilities();
  // functions
  
  // need a way to check if a token is an end-token or not
  
  function generateNodes(nodes, text, rgx) {
    var subText = text;
    var match = subText.match(rgx);
    
    var lastToken = null;
    var currentToken = match[0];
    
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
        }
        
        lastNode.followedBy(currentNode);
      }
      
      // for next loop
      subText = subText.substr(currentToken.length + 1);
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
    var nodeArray = [];
    for (var token in this.nodes) {
      nodeArray.push(this.nodes[token]);
    }
    
    var startNode = nodeArray[100];
    console.log(startNode.getFollowingNode());
    while (startNode.isEndToken) {
      startNode = nodeArray[Math.round(Math.random()*nodeArray.length)]
    }
    
    var sentence = "";
    nextNode = startNode;
    while (nextNode != null && !nextNode.isEndToken) {
      sentence += nextNode.token + " ";
    }
    
    return sentence;
  }

}

function MarkovNode(token) {
  this.token = token;
  this.count = 1;
  this.followingNodeObjects = {};
  this.tokenRegex = /\b\w+([']|[\.,-\/#!$%\^&\*;:{}=\-_`~])*\b/;
  this.isEndToken = isEndToken(token);
  
  this.followedBy = followedBy;
  this.caluclateProbabilities = calculateProbabilities;
  this.getFollowingNode = getFollowingNode;
  
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
  
  function isEndToken(token) {
    var lastChar = token.charAt(token.length - 1);
    return lastChar.match(/[.!;:\?]/) != null;
  }
  
  function getFollowingNode() {
    var probabilityMap = {};
    var currentProbability = 0;
    //console.log(this.followingNodeObjects);
    for (var token in this.followingNodeObjects) {
      var nodeObject = this.followingNodeObjects[token];
      var probability = nodeObject.probability;
      console.log(nodeObject.probability);
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