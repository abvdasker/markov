var MarkovNode = require("./markov_node.js");
//var TriGram = require("./TriGram.js");
var NGram = require("./n_gram.js");

var globalRegex = /(\w|['-])+([\.,\/#!$%\^&\*;:{}=\-_`~])*/;
var endPunctuationRegex = /[\.]|[!]|[?]/;

// generalize this to accept arbitrary gram length. Right now it is only monograms.
function Markov(text, ngrams, sentenceCount) {
  // variables
  this.textSource = text;
  this.tokenRegex = globalRegex;
  this.nodes = {};
  this.startNodes = {};
  this.nGrams = {};
  this.ngrams = ngrams;
  this.sentenceCount = sentenceCount;
  
  // functions
  this.generateNodes = generateNodes;
  this.calculateProbabilities = calculateProbabilities;
  this.generateSentenceNodes = generateSentenceNodes;
  this.generateSentenceNGrams = generateSentenceNGrams;
  this.generateSentences = generateSentences;
  this.makeCurrentNode = makeCurrentNode;
  this.makeCurrentNGram = makeCurrentNGram;
  
  // initializers
  this.generateNodes(
    this.nodes,
    this.startNodes,
    this.textSource,
    this.tokenRegex,
    this.ngrams);
    
  this.calculateProbabilities();
  
  function generateNodes(nodes, startNodes, text, rgx, ngrams) {
    var subText = text;
    var match   = subText.match(rgx);
    
    var lastLastToken = null;
    var lastToken = null;
    var currentToken = null;
    var currentNGram = null;
  
    var lastNNodes = [];
    while (match != null) {
      lastToken = currentToken;
      currentToken = match[0];
      
      if (lastToken != null) {
        
        var lastNode = nodes[lastToken];
        if (lastNode == null) {
          lastNode = new MarkovNode(lastToken);
        }
        
        var currentNode = this.makeCurrentNode(currentToken, lastNode, ngrams);
        
        if (lastNNodes.length > ngrams - 1) {
          lastNNodes.shift();
          lastNNodes.push(currentNode);
        } else {
          lastNNodes.push(currentNode);
        }
        var currentNGram = this.makeCurrentNGram(lastNNodes, ngrams);
        
        /* trigrams are getting clobbered by their starting token.
         * Need to find a different means of uniquely identifying them.
         * i.e. An ending token could start multiple trigrams.
         */
        var nGramToken = currentNGram.firstNode.token;
        if (this.nGrams[nGramToken] == null) {
          this.nGrams[nGramToken] = [currentNGram];
        } else {
          this.nGrams[nGramToken].push(currentNGram);
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
  
  function makeCurrentNGram(lastNNodes, ngrams) {
    var nGramNodes = [];
    for (var idx in lastNNodes) {
      var node = lastNNodes[idx];
      nGramNodes.push(node);
      if (node.isEndToken()) {
        break;
      }
    }
    var nGram = new NGram(ngrams, nGramNodes);
    return nGram;
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
      node.calculateProbabilities();
    }
  }
  
  function generateSentences() {
    var multiSentence = "";
    for (var i = 0; i < this.sentenceCount - 1; i++) {
      multiSentence += this.generateSentenceNGrams();
    }
    multiSentence += this.generateSentenceNGrams();
    return multiSentence;
  }
  
  function generateSentenceNGrams() {
    var startNode = getRandomStartNode(this.startNodes);
    var nGramArray = this.nGrams[startNode.token];
    var nGram = getRandomObjectFromArray(nGramArray);
    var sentence = "";
    var seenNGrams = [];
    while (!nGram.lastNode.isEndToken()) {
      //sentence += "/ " + nGram.getWordString();
      sentence += nGram.getWordString();
      var bridgeNode = nGram.lastNode;
      var nGramArray = this.nGrams[bridgeNode.getFollowingNode().token];
      nGram = getRandomObjectFromArray(nGramArray);
      seenNGrams.push(nGram);
    }
    
    //sentence += "/ " + nGram.getWordString();
    sentence += nGram.getWordString();
    
    return sentence;
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

function TextSource(name, text) {
  this.text = text; 
  this.name = name;
}

module.exports = {
  Markov: Markov
}