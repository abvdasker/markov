var globalRegex = /\b(\w|['])+([\.,-\/#!$%\^&\*;:{}=\-_`~])*/;

function Markov(text) {
  this.textSource = text;
  this.tokenRegex = globalRegex;
  
  this.nodes = {};
  this.generateNodes = generateNodes;
  this.calculateProbabilities = calculateProbabilities;
  this.generateSentence = generateSentence;
  
  this.generateNodes(this.nodes, this.textSource, this.tokenRegex);
  this.calculateProbabilities();
  
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
    
    var tokens = Object.keys(this.nodes);
    var startNodeToken = tokens[Math.round(Math.random()*tokens.length)];
    var startNode = this.nodes[startNodeToken];
    
    while (startNode.isEndToken) {
      startNodeToken = tokens[Math.round(Math.random()*tokens.length)];
      startNode = this.nodes[startNodeToken];
    }
    
    var sentence = "";
    nextNode = startNode;
    while (nextNode != null && !nextNode.isEndToken) {
      nextNode = nextNode.getFollowingNode();
      sentence += nextNode.token + " ";
      //console.log(nextNode.token);
    }
    
    return sentence;
  }

}

function MarkovNode(token) {
  this.token = token;
  this.count = 1;
  this.followingNodeObjects = {};
  this.tokenRegex = globalRegex;
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