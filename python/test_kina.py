"""Tests for the Python implementation. python test_kina.py"""

import random
import string
import sys

import kina

FAILURES = []


def check(label, actual, expected):
    ok = actual == expected
    if not ok:
        FAILURES.append("%s: expected %r, got %r" % (label, expected, actual))
    print("  %s %s" % ("ok  " if ok else "FAIL", label))


print("round trips")
for phrase in ["the door is the full stop.",
               "you are early.",
               "don't stop.",
               "export x='a b'",
               "a wallet for agents, priced at 39 usdc.",
               "zzyzx qwerty"]:
    check(phrase, kina.decode(kina.encode(phrase)), phrase)

print("\nevery word in the dictionary")
bad = [w for w in kina.WORDS if kina.decode(kina.encode(w)) != w]
check("all %d words survive" % len(kina.WORDS), bad, [])

print("\nthe escape marker")
check("no code begins with it",
      any(c.startswith(kina.ESCAPE) for c in kina.TO_KINA.values()), False)
check("unknown words are spelled out",
      kina.decode(kina.encode("brillig slithy")), "brillig slithy")

print("\nwhat must be left alone")
check("digits", kina.decode(kina.encode("39 usdc")), "39 usdc")
check("a bare quote", kina.decode(kina.encode("x='a b'")), "x='a b'")
check("punctuation", kina.decode(kina.encode("a, b; c!")), "a, b; c!")

print("\nrandom strings")
random.seed(11)
alphabet = string.ascii_lowercase + "  .,'\"-0123456789\n/:_="
broken = 0
for _ in range(5000):
    text = "".join(random.choice(alphabet) for _ in range(random.randint(1, 80)))
    if kina.decode(kina.encode(text)) != text:
        broken += 1
check("5000 of them round trip", broken, 0)

print()
if FAILURES:
    print("%d FAILED:" % len(FAILURES))
    for f in FAILURES:
        print("  -", f)
    sys.exit(1)
print("All kina tests passed.")
