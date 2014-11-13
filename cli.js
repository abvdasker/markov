var fs = require('fs');
var Markov = require('./markov.js').Markov;

var args = process.argv;

var file_name = args[2];

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
var markov = new Markov(text);
console.log(markov.generateSentenceTriGrams());
//console.log(markov.nodes['all'].followingNodeObjects);
