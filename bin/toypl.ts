#!/usr/bin/env ts-node

import { statSync, readFileSync } from "fs";
import { Interpreter } from "../lib/Interpreter";
import { Parser } from "../lib/Parser";
import { Scanner } from "../lib/Scanner";

function scan(source: string) {
  const scanner = new Scanner(source);
  const tokens = [];
  while (scanner.hasMoreTokens()) {
    tokens.push(scanner.getNextToken());
  }
  return tokens;
}

function parse(source: string) {
  const parser = new Parser();
  const scanner = new Scanner(source);
  return parser.parse(scanner);
}

function evl(source: string) {
  const parser = new Parser();
  const scanner = new Scanner(source);
  const ast = parser.parse(scanner);
  const interpreter = new Interpreter();
  return interpreter.eval(ast);
}

function loadFile(path: string) {
  statSync(path);
  return readFileSync(path, "utf-8");
}

const AVAILABLE_COMMANDS = {
  "scan-string": "Convert source code from a string to tokens.",
  "scan-file": "Convert source code from .rr file to tokens.",
  "parse-string": "Convert source code from a string to toypl AST.",
  "parse-file": "Convert source code from .rr file to toypl AST.",
  "eval-string": "Evaluate source code from a string.",
  "eval-file": "Evaluate source code from .rr file.",
};

function helpMessage(): string {
  let output: string = "Supported commands:\n";
  Object.entries(AVAILABLE_COMMANDS).forEach((c) => {
    output += `toypl ${c[0]} [input] -- ${c[1]}\n`;
  });
  return output;
}

function main(cmd: string, exp: string) {
  if (!cmd || !exp) {
    console.log(helpMessage());
    process.exit(64);
  }

  switch (cmd) {
    case "scan-string":
      return scan(exp);
    case "scan-file":
      return scan(loadFile(exp));
    case "parse-string":
      return parse(exp);
    case "parse-file":
      return parse(loadFile(exp));
    case "eval-string":
      return evl(exp);
    case "eval-file":
      return evl(loadFile(exp));
    default:
      console.error(`Command "${cmd}" not supported.\n`);
      console.log(helpMessage());
      process.exit(64);
  }
}

if (process.stdin.isTTY) {
  const [_node, _path, cmd, exp] = process.argv;
  main(cmd, exp);
} else {
  let stdin = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => (stdin += chunk));
  process.stdin.on("end", () => main("eval-string", stdin));
}
