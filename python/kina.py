"""kina — a small language for things that read.

    python kina.py read "ka mani ku ka tiva kimo."
    python kina.py say  "the door is the full stop"

See SPEC.md. No dependencies.
"""

import os
import re
import sys

CONSONANTS = "ktsnmrhvzl"
VOWELS = "aiueo"
SYLLABLES = [c + v for c in CONSONANTS for v in VOWELS]

# Reserved. The escape marker cannot also be a word, or a line stops parsing.
ESCAPE = "zo"

_HERE = os.path.dirname(os.path.abspath(__file__))
_WORDS_FILE = os.path.join(_HERE, os.pardir, "words.txt")

with open(_WORDS_FILE, encoding="utf-8") as _f:
    WORDS = [w.strip() for w in _f if w.strip()]

_POOL = [s for s in SYLLABLES if s != ESCAPE]
_LETTERS = {chr(ord("a") + i): SYLLABLES[i] for i in range(26)}
_LETTERS["'"] = SYLLABLES[26]
_UNLETTERS = {v: k for k, v in _LETTERS.items()}

# An apostrophe belongs to a word only between letters. A bare quote is
# punctuation, and swallowing it mangles any shell example you encode.
_TOKEN = re.compile(r"([a-z]+(?:'[a-z]+)*)")


def _code(i):
    """The code for the word at index i.

    One syllable for the first 49 words, two for the next 2,450, three after
    that. A word's index is its identity: appending is safe, reordering is not.
    """
    n, s = len(_POOL), len(SYLLABLES)
    if i < n:
        return _POOL[i]
    i -= n
    if i < n * s:
        return _POOL[i // s] + SYLLABLES[i % s]
    i -= n * s
    if i < n * s * s:
        return _POOL[i // (s * s)] + SYLLABLES[(i // s) % s] + SYLLABLES[i % s]
    raise ValueError("past %d words" % (n + n * s + n * s * s))


def _build():
    to_kina, from_kina = {}, {}
    for i, word in enumerate(WORDS):
        code = _code(i)
        to_kina[word] = code
        from_kina[code] = word
    return to_kina, from_kina


TO_KINA, FROM_KINA = _build()


def _encode_word(word):
    known = TO_KINA.get(word)
    if known:
        return known
    return ESCAPE + "".join(_LETTERS.get(c, "") for c in word)


def _decode_word(token):
    if token.startswith(ESCAPE):
        body = token[len(ESCAPE):]
        pairs = [body[i:i + 2] for i in range(0, len(body), 2)]
        return "".join(_UNLETTERS.get(p, "") for p in pairs)
    return FROM_KINA.get(token, token)


def encode(text):
    """English in, kina out. Case is discarded; punctuation and digits survive."""
    return _TOKEN.sub(lambda m: _encode_word(m.group(1)), text.lower())


def decode(text):
    """kina in, English out. Anything that is not kina is passed through."""
    return _TOKEN.sub(lambda m: _decode_word(m.group(1)), text.lower())


def main(argv):
    if len(argv) < 3 or argv[1] not in ("say", "read"):
        print(__doc__.strip())
        return 2
    text = " ".join(argv[2:])
    print(encode(text) if argv[1] == "say" else decode(text))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
