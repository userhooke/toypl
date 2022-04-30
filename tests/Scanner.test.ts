import { deepStrictEqual } from "assert";
import { Scanner } from "../lib/Scanner";
import { Token, TokenType } from "../lib/Token";

function test(input: string, expected: Token[]) {
  const scanner = new Scanner(input);
  const tokens = [];
  while (scanner.hasMoreTokens()) {
    tokens.push(scanner.getNextToken());
  }
  return deepStrictEqual(tokens, expected, input);
}

export default function () {
  test(
    "1;",

    [
      {
        type: TokenType.NUMBER,
        value: "1",
      },
      {
        type: TokenType.SEMICOLON,
        value: ";",
      },
    ]
  );

  test(
    `# This is a comment.
  
    // C style comments
  
    /*
        Multiline comment
    */
    `,

    [{ type: TokenType.EOF }]
  );

  test(
    `"Hello, world!";`,

    [
      {
        type: TokenType.STRING,
        value: '"Hello, world!"',
      },
      {
        type: TokenType.SEMICOLON,
        value: ";",
      },
    ]
  );

  test(
    `
    {
      42;

      "hello";
    }
        `,
    [
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.NUMBER, value: "42" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.STRING, value: '"hello"' },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.RIGHT_BRACE, value: "}" },
      { type: TokenType.EOF },
    ]
  );

  test(
    `
    {
      42;
      {
        "hello";
      }
    }
    `,
    [
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.NUMBER, value: "42" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.LEFT_BRACE, value: "{" },
      { type: TokenType.STRING, value: '"hello"' },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.RIGHT_BRACE, value: "}" },
      { type: TokenType.RIGHT_BRACE, value: "}" },
      { type: TokenType.EOF },
    ]
  );
}
