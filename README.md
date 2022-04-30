# Toypl

## Description

A toy programming language created for learning purpose. Includes a parser for a strange syntax and interpreter with JS-like semantics.

Feel free to check [tests](/tests) for some examples.

## Build, run and develop

Prerequisites:

- node.js v14+
- npm v6+
- ts-node v10+

Running `bin/toypl.ts` or `ts-node bin/toypl.ts` should give the following output:

```sh
➜  a-programming-language git:(master) ✗ bin/toypl.ts
Supported commands:
toypl scan-string [input] -- Convert source code from a string to tokens.
toypl scan-file [input] -- Convert source code from .rr file to tokens.
toypl parse-string [input] -- Convert source code from a string to toypl AST.
toypl parse-file [input] -- Convert source code from .rr file to toypl AST.
toypl eval-string [input] -- Evaluate source code from a string.
toypl eval-file [input] -- Evaluate source code from .rr file.
```

For example, to evaluate an input string:

```sh
➜  a-programming-language git:(master) ✗ bin/toypl.ts eval-string "+(10 5)"
15
```

Bash piping also supported:

```sh
➜  a-programming-language git:(master) ✗ echo "+(12 1)" | bin/toypl.ts
13
```

## References

- [Lispy](https://norvig.com/lispy.html)
- [Building a Parser from scratch by Dmitry Soshnikov](https://dmitrysoshnikov.teachable.com/p/parser-from-scratch)
- [Building an Interpreter from scratch by Dmitry Soshnikov](https://dmitrysoshnikov.teachable.com/p/essentials-of-interpretation)
- [Crafting Interpreters by Robert Nystrom](https://craftinginterpreters.com)
