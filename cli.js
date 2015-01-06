var fs = require('fs');
var Markov = require('./markov.js').Markov;

var args = process.argv;

var file_name = args[2];
var ngrams = args[3] || 3;
var count = args[4] || 1;

if (!fs.existsSync(file_name)) {
  console.error("File " + file_name + " not found. Aborting.");
  process.exit(1);
}

//console.log("File: "+ file_name);

var options = {
  flags: 'r',
  encoding: 'utf8'
}

var text = fs.readFileSync(file_name, options);
//console.log("read file synchronously");
var markov = new Markov(text, ngrams, count);
console.log(markov.generateSentences());
//console.log(markov.generateSentenceNGrams());
//console.log(markov.nodes['all'].followingNodeObjects);
