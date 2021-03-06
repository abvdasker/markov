var endPunctuationRegex = /[\.]|[!]|[?]/;

function MarkovNode(token) {
  // variables
  this.token = token;
  this.count = 1;
  this.followingNodeObjects = {};
  this.notEndings = ['Mr.', 'Mrs.', 'Miss.'];
  this.isStartNode = false;
}
MarkovNode.prototype = {
  calculateProbabilities: function() {
    var totalCount = 0;
    for (var token in this.followingNodeObjects) {
      totalCount += this.followingNodeObjects[token].count;
    }
    
    for (var token in this.followingNodeObjects) {
      var nodeObject = this.followingNodeObjects[token];
      this.followingNodeObjects[token].probability = nodeObject.count/totalCount;
    }
  },
  followedBy: function(node) {
    if (this.followingNodeObjects[node.token] != null) {
      var followingNode = this.followingNodeObjects[node.token];
      this.followingNodeObjects[node.token].count++;
    } else {
      this.followingNodeObjects[node.token] = {
        count: 1,
        node: node
      }
    }
  },
  isEndToken: function() {
    var token = this.token
    var lastChar = token.charAt(token.length - 1);
    if (this.notEndings.indexOf(token) != -1) {
      return false;
    }
    
    return lastChar.match(endPunctuationRegex) != null;
  },
  getFollowingNode: function() {
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

module.exports = MarkovNode;