/* Tests for the JavaScript implementation. node test_kina.js */
"use strict";

var kina = require("./kina.js");
var failures = [];

function check(label, actual, expected) {
  var ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures.push(label + ": expected " + JSON.stringify(expected) +
                         ", got " + JSON.stringify(actual));
  console.log("  " + (ok ? "ok   " : "FAIL ") + label);
}

console.log("round trips");
["the door is the full stop.", "you are early.", "don't stop.",
 "export x='a b'", "a wallet for agents, priced at 39 usdc.",
 "zzyzx qwerty"].forEach(function (p) {
  check(p, kina.decode(kina.encode(p)), p);
});

console.log("\nevery word in the dictionary");
var words = kina.words();
var bad = words.filter(function (w) { return kina.decode(kina.encode(w)) !== w; });
check("all " + words.length + " words survive", bad, []);

console.log("\nagreement with the reference output");
check("the door is the full stop", kina.encode("the door is the full stop"),
      "ka mani ku ka tiva kimo");
check("decodes back", kina.decode("ka mani ku ka tiva kimo."),
      "the door is the full stop.");

console.log("\nwhat must be left alone");
check("digits", kina.decode(kina.encode("39 usdc")), "39 usdc");
check("a bare quote", kina.decode(kina.encode("x='a b'")), "x='a b'");

console.log("\nrandom strings");
var alphabet = "abcdefghijklmnopqrstuvwxyz  .,'\"-0123456789\n/:_=";
var seed = 11;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
var broken = 0;
for (var i = 0; i < 5000; i++) {
  var n = 1 + Math.floor(rnd() * 80), t = "";
  for (var j = 0; j < n; j++) t += alphabet[Math.floor(rnd() * alphabet.length)];
  if (kina.decode(kina.encode(t)) !== t) broken++;
}
check("5000 of them round trip", broken, 0);

console.log("");
if (failures.length) {
  console.log(failures.length + " FAILED:");
  failures.forEach(function (f) { console.log("  - " + f); });
  process.exit(1);
}
console.log("All kina tests passed.");
