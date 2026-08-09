# The kina format

Everything needed to implement it. There is nothing else.

## Alphabet

Consonants: `k t s n m r h v z l`
Vowels: `a i u e o`

A **syllable** is one consonant followed by one vowel. There are fifty:

```
ka ki ku ke ko   ta ti tu te to   sa si su se so   na ni nu ne no
ma mi mu me mo   ra ri ru re ro   ha hi hu he ho   va vi vu ve vo
za zi zu ze zo   la li lu le lo
```

## The escape marker

`zo` is reserved. It can never be a word, and no word may begin with it.

## Encoding a word

Let `POOL` be the fifty syllables **with `zo` removed**, in order — 49 of them.
Let `WORDS` be the frozen list in `words.txt`, zero-indexed.

For the word at index `i`:

- if `i < 49` the code is `POOL[i]` — one syllable
- otherwise, with `j = i - 49`: if `j < 2450` the code is
  `POOL[j // 50] + SYLLABLES[j % 50]` — two syllables
- otherwise, with `k = j - 2450`, the code is
  `POOL[k // 2500] + SYLLABLES[(k // 50) % 50] + SYLLABLES[k % 50]`
  — three syllables

That gives 49 one-syllable, 2,450 two-syllable and 122,500 three-syllable
words: 124,999 in total.

The two-syllable arithmetic is exactly what it always was, so the third rank
changes no existing code. It only says what happens past the point where the
encoding used to stop.

## Words not in the dictionary

Write `zo`, then each letter as a syllable: `a` is `ka`, `b` is `ki`, `c` is
`ku` … `z` is `to`, following `SYLLABLES[0..25]`. An apostrophe is
`SYLLABLES[26]`, which is `na`, so `don't` survives a round trip.

## Decoding

Split on anything that is not a letter or an apostrophe. For each token:

- if it starts with `zo`, take the rest two characters at a time and map each
  back to its letter
- otherwise look it up in the code-to-word table
- if it is in neither, leave it exactly as it was

## What is left alone

Digits, punctuation and whitespace pass through untouched. An apostrophe is part
of a word only between letters — `don't` is one word, but a quote character in
`x='a b'` is punctuation and must not be swallowed.

Case is discarded. kina is lowercase.

## Round trip

`decode(encode(text))` must equal `text.lower()` for any input. If it does not,
the implementation is wrong. Both implementations here are tested against the
entire dictionary and several thousand random strings.
