var fs = require('fs');
var Markov = require('./markov.js').Markov;

var args = process.argv;

var first_file_name = args[2];
var second_file_name = args[3];
// var ngrams = args[3] || 3;
// var count = args[4] || 1;

var options = {
  flags: 'r',
  encoding: 'utf8'
}

var markovs = new Array();
for (var i = 2; i < args.length; i++) {
  var file_name = args[i];
  if (!fs.existsSync(file_name)) {
    console.error("File " + file_name + " not found. Aborting.");
    process.exit(1);
  }
  console.log("reading " + file_name);
  var text = fs.readFileSync(file_name, options);
  var markov = new Markov(text, 7, 1);
  if (markovs[markovs.length - 1] != null) {
    markovs[markovs.length - 1].chain(markov);
  }
  markovs.push(markov);
}

console.log(markovs[0].generateChainedSentences());
//console.log("File: "+ file_name);

//
// var text = fs.readFileSync(file_name, options);
// //console.log("read file synchronously");
// var markov = new Markov(text, ngrams, count);
// console.log(markov.generateSentences());
//console.log(markov.generateSentenceNGrams());
//console.log(markov.nodes['all'].followingNodeObjects);
