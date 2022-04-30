export enum TokenType {
  // Symbols, delimiters
  EOF = "EOF",
  EOL = "EOL",
  SEMICOLON = ";",
  LEFT_BRACE = "{",
  RIGHT_BRACE = "}",
  LEFT_PAREN = "(",
  RIGHT_PAREN = ")",
  COMMA = ",",
  DOT = ".",
  LEFT_BRACKET = "[",
  RIGHT_BRACKET = "]",

  // Keywords
  TRUE = "true",
  FALSE = "false",
  NULL = "null",
  DEF = "def",
  MUT = "mut",
  SET = "set",
  IF = "if",
  THEN = "then",
  ELSE = "else",
  WHILE = "while",
  DO = "do",
  LAMBDA = "lambda",
  CLASS = "class",
  NEW = "new",

  NUMBER = "NUMBER",
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
}

export interface Token {
  type: TokenType;
  value?: string;
}
