function NGram(n, nodes) {
  this.n = n;
  this.nodes = nodes;
  this.firstNode = nodes[0];
  this.lastNode = nodes[nodes.length - 1];
  this.nodeCount = nodes.length;
  
  // functions
  this.hasNNodes = hasNNodes;
  this.getWordString = getWordString;
  
  function hasNNodes() {
    return this.nodes.length == this.n;
  }
  
  function getWordString() {
    var string = "";
    for (var idx in this.nodes) {
      string += this.nodes[idx].token + " ";
    }
    return string;
  }
  
}

module.exports = NGram;