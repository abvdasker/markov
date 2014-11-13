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

module.exports = TriGram;