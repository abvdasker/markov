var fs = require('fs');
var Markov = require('./markov.js').Markov;

var args = process.argv;

var file_name = args[2];

if (!fs.existsSync(file_name)) {
  console.error("File " + file_name + " not found. Aborting.");
  process.exit(1);
}

console.log("File: "+ file_name);

var options = {
  flags: 'r',
  encoding: 'utf8'
}

var text = fs.readFileSync(file_name, options);
console.log("read file synchronously");
var markov = new Markov(text);

var nodeArray = [];
//console.log(markov.nodes);
for (var token in markov.nodes) {
  nodeArray.push(markov.nodes[token]);
  //console.log("word: "+markov.nodes[token].token+" count: "+markov.nodes[token].count);
}

nodeArray.sort(function(nodea, nodeb) {
  return nodea.count - nodeb.count;
});

console.log(markov.generateSentence());
//console.log(markov.nodes['all'].followingNodeObjects);

// for (var node in nodeArray) {
//   console.log("word: "+nodeArray[node].token+" count: " + nodeArray[node].count)
// }

/*
var file_stream = fs.createReadStream(file_name, options);

var chunk_count = 0;
chunk_array = new Array;
//var words = new Array;
var words = {};
var text_blob = "";
token_rgx = /\b(\w|[']|[\.,-\/#!$%\^&\*;:{}=\-_`~])+/;

file_stream.on('data', function(chunk) {
  chunk_count++;
  text_blob += chunk;
  chunk_array.push(new Array);
  text_blob = chomp(text_blob);
});

file_stream.on('end', function() {
  console.log(words);
  text_blob = chomp(text_blob, true);
});

var count = 0;
function chomp(text, last) {
  if (typeof last === 'undefined') {
    last = false;
  }
  
  var match = text.match(token_rgx);
  while (match != null && match.index + match[0].length < text.length) {

    var word = match[0];
    if (match.index + word.length == text.length){ // closes chunk
      if (last) { // last chunk
        text = text.substr(match.index + word.length);
        chunk_array[chunk_array.length-1].push(word);
        count_word(word);
        //words.push(word);
      }
    } else {
      text = text.substr(match.index + word.length);
      chunk_array[chunk_array.length-1].push(word)//words.push(word);
      count_word(word);
    }
    
    match = text.match(token_rgx);
  }

  return text
}

function count_word(word) {
  if (words[word]) {
    words[word]++;
  } else {
    words[word] = 1;
  }
}*/