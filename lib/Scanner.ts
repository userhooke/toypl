import { TokenType, Token } from "./Token";

const Spec: [RegExp, TokenType][] = [
  [/^\n/, TokenType.EOL], // Newlines
  [/^\s+/, null], // Whitespace

  [/^#.*/, null], // Bash style comment
  [/^\/\/.*/, null], // C/JS style comment
  [/^\/\*[\s\S]*?\*\//, null], // C style multiline

  // Symbols, delimiters
  [/^;/, TokenType.SEMICOLON],
  [/^\{/, TokenType.LEFT_BRACE],
  [/^\}/, TokenType.RIGHT_BRACE],
  [/^\(/, TokenType.LEFT_PAREN],
  [/^\)/, TokenType.RIGHT_PAREN],
  [/^\,/, TokenType.COMMA],
  [/^\./, TokenType.DOT],
  [/^\[/, TokenType.LEFT_BRACKET],
  [/^\]/, TokenType.RIGHT_BRACKET],

  // Keywords
  [/^\btrue\b/, TokenType.TRUE],
  [/^\bfalse\b/, TokenType.FALSE],
  [/^\bnull\b/, TokenType.NULL],
  [/^\bdef\b/, TokenType.DEF],
  [/^\bmut\b/, TokenType.MUT],
  [/^\bset\b/, TokenType.SET],
  [/^\bif\b/, TokenType.IF],
  [/^\bthen\b/, TokenType.THEN],
  [/^\belse\b/, TokenType.ELSE],
  [/^\bwhile\b/, TokenType.WHILE],
  [/^\bdo\b/, TokenType.DO],
  [/^λ/, TokenType.LAMBDA],
  [/^\blambda\b/, TokenType.LAMBDA],
  [/^\bclass\b/, TokenType.CLASS],
  [/^\bnew\b/, TokenType.NEW],

  [/^\d+/, TokenType.NUMBER],

  [/^[\w\-+*=<>_]+/, TokenType.IDENTIFIER],

  [/^"[^"]*"/, TokenType.STRING],
  [/^'[^']*'/, TokenType.STRING],
];

export class Scanner {
  private source: string;
  private cursor: number;
  public line: number;

  constructor(source: string) {
    this.source = source;
    this.cursor = 0;
    this.line = 1;
  }

  hasMoreTokens(): boolean {
    return this.cursor < this.source.length;
  }

  getCurrentScope() {
    return this.source.slice(this.cursor - 1);
  }

  getNextToken(): Token {
    if (!this.hasMoreTokens()) {
      return {
        type: TokenType.EOF,
      };
    }
    const string = this.source.slice(this.cursor);

    for (const [regexp, tokenType] of Spec) {
      const tokenValue = this.match(regexp, string);

      if (tokenValue === null) {
        continue;
      }

      if (tokenType === TokenType.EOL) {
        this.line++;
        return this.getNextToken();
      }

      if (tokenType === null) {
        return this.getNextToken();
      }

      return {
        type: tokenType,
        value: tokenValue,
      };
    }

    throw new SyntaxError(
      `Unexpected character: "${string[0]}" at line: ${this.line}`
    );
  }

  match(regexp: RegExp, string: string) {
    const matched = regexp.exec(string);
    if (matched === null) {
      return null;
    }
    this.cursor += matched[0].length;
    return matched[0];
  }
}
