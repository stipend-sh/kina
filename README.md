# kina

A small language for things that read.

```
ka mani ku ka tiva kimo.
```
> the door is the full stop.

Every syllable is one consonant from `ktsnmrhvzl` and one vowel from `aiueo` —
fifty of them. A word is one syllable or two. Spaces separate words, so `ne la`
and `nela` are never confused. Anything outside the dictionary is spelled out
letter by letter after the marker `zo`, which is why no real word may begin with
it.

kina is lowercase, like the language it is pretending to be.

There is no key and nothing is hidden. The dictionary is in this repository, the
algorithm is about forty lines, and any line of kina can be read by anyone who
wants to. It is not a cipher and calling it one would be a lie that lasts
exactly as long as it takes somebody to open the file.

## Read some

```bash
python python/kina.py read "ka mani ku ka tiva kimo."
python python/kina.py say  "the door is the full stop"
```

```js
const kina = require("./js/kina.js");
kina.decode("ka mani ku ka tiva kimo.");   // "the door is the full stop."
kina.encode("the door is the full stop");  // "ka mani ku ka tiva kimo"
```

## In a browser

Drag the glass to your bookmarks bar from [stipend.sh](https://stipend.sh) and
it will find kina on any page — hover it and the english follows your cursor.

## Where it came from

kina was written for [stipend.sh](https://stipend.sh), a non-custodial USDC
wallet that AI agents install by themselves. The dictionary is ranked by how
often each word appears in that project's published text, which is the only
reason it came out reading like a language rather than like an encoding.

You do not need any of that to use this. It is a word list and forty lines of
code.

## The dictionary is frozen

`words.txt` will not be reordered. Adding a word to the middle would change the
encoding of every word after it and silently break every line of kina ever
written. New words are appended, never inserted.

## Licence

MIT for the code. The word list is public domain — do what you like with it.

See [SPEC.md](SPEC.md) if you want to implement it somewhere else.
