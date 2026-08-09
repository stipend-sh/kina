/* kina — a small language for things that read.
 *
 *   const kina = require("./kina.js");
 *   kina.decode("ka mani ku ka tiva kimo.");
 *
 * See SPEC.md. No dependencies. Works in node or a browser (in a browser,
 * load words.txt yourself and call kina.load(text) first).
 */
(function (root) {
  "use strict";

  var CONSONANTS = "ktsnmrhvzl";
  var VOWELS = "aiueo";
  var SYLLABLES = [];
  for (var c = 0; c < CONSONANTS.length; c++) {
    for (var v = 0; v < VOWELS.length; v++) SYLLABLES.push(CONSONANTS[c] + VOWELS[v]);
  }

  var ESCAPE = "zo";
  var POOL = SYLLABLES.filter(function (s) { return s !== ESCAPE; });

  var letters = {}, unletters = {};
  for (var i = 0; i < 26; i++) letters[String.fromCharCode(97 + i)] = SYLLABLES[i];
  letters["'"] = SYLLABLES[26];
  for (var k in letters) unletters[letters[k]] = k;

  var WORDS = [], toKina = {}, fromKina = {};

  function load(text) {
    WORDS = text.split(/\r?\n/).map(function (s) { return s.trim(); })
                .filter(function (s) { return s.length; });
    toKina = {}; fromKina = {};
    /* One syllable for the first 49 words, two for the next 2,450, three after
       that. A word's index is its identity: appending is safe, reordering is
       not. Stopping at two ranks does not truncate the table -- it makes
       POOL[49] undefined and files every later word under a colliding key. */
    function codeFor(i) {
      var n = POOL.length, s = SYLLABLES.length;
      if (i < n) return POOL[i];
      i -= n;
      if (i < n * s) return POOL[Math.floor(i / s)] + SYLLABLES[i % s];
      i -= n * s;
      return POOL[Math.floor(i / (s * s))] +
             SYLLABLES[Math.floor(i / s) % s] +
             SYLLABLES[i % s];
    }
    WORDS.forEach(function (word, n) {
      var code = codeFor(n);
      toKina[word] = code;
      fromKina[code] = word;
    });
    return WORDS.length;
  }

  function encodeWord(word) {
    if (Object.prototype.hasOwnProperty.call(toKina, word)) return toKina[word];
    var out = ESCAPE;
    for (var n = 0; n < word.length; n++) out += letters[word[n]] || "";
    return out;
  }

  function decodeWord(token) {
    if (token.indexOf(ESCAPE) === 0) {
      var body = token.slice(ESCAPE.length), out = "";
      for (var n = 0; n < body.length; n += 2) out += unletters[body.substr(n, 2)] || "";
      return out;
    }
    return Object.prototype.hasOwnProperty.call(fromKina, token) ? fromKina[token] : token;
  }

  /* An apostrophe belongs to a word only between letters. */
  var TOKEN = /[a-z]+(?:'[a-z]+)*/g;

  function encode(text) { return text.toLowerCase().replace(TOKEN, encodeWord); }
  function decode(text) { return text.toLowerCase().replace(TOKEN, decodeWord); }

  var api = {load: load, encode: encode, decode: decode,
             SYLLABLES: SYLLABLES, ESCAPE: ESCAPE,
             words: function () { return WORDS.slice(); }};

  if (typeof module !== "undefined" && module.exports) {
    var fs = require("fs"), path = require("path");
    load(fs.readFileSync(path.join(__dirname, "..", "words.txt"), "utf8"));
    module.exports = api;
  } else {
    root.kina = api;
  }
})(this);
