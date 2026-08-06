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
    WORDS.forEach(function (word, n) {
      var code;
      if (n < POOL.length) {
        code = POOL[n];
      } else {
        var j = n - POOL.length;
        code = POOL[Math.floor(j / SYLLABLES.length)] + SYLLABLES[j % SYLLABLES.length];
      }
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
