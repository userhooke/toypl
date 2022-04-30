import { Scanner } from "./Scanner";
import { Token, TokenType } from "./Token";
import * as AST from "./AST";

export class Parser {
  private scanner: Scanner;
  private lookahead: Token;

  public parse(scanner: Scanner): AST.Program {
    this.scanner = scanner;
    this.lookahead = this.scanner.getNextToken();
    return this.Program();
  }

  Program(): AST.Program {
    return {
      type: AST.ASTType.Program,
      body: this.ExpressionList(),
    };
  }

  ExpressionList(stopLookahead: TokenType = null): AST.ExpressionList {
    const expressionList = [this.Expression()];

    while (
      this.lookahead !== null &&
      this.lookahead.type !== TokenType.EOF &&
      this.lookahead.type !== stopLookahead
    ) {
      expressionList.push(this.Expression());
    }
    return expressionList;
  }

  Expression(): AST.Expression {
    switch (this.lookahead.type) {
      case TokenType.NUMBER:
        return this.NumericLiteral();

      case TokenType.STRING:
        return this.StringLiteral();

      case TokenType.TRUE:
        return this.BooleanLiteral(true);

      case TokenType.FALSE:
        return this.BooleanLiteral(false);

      case TokenType.NULL:
        return this.NullLiteral();

      case TokenType.DEF:
        return this.DefinitionExpression();

      case TokenType.SET:
        return this.SetExpression();

      case TokenType.IF:
        return this.IfExpression();

      case TokenType.WHILE:
        return this.WhileStatement();

      case TokenType.DO:
        return this.DoWhileStatement();

      case TokenType.LAMBDA:
        return this.FunctionExpression();

      case TokenType.LEFT_BRACE:
        return this.BlockExpression();

      case TokenType.CLASS:
        return this.ClassExpression();

      case TokenType.NEW:
        return this.NewExpression();

      case TokenType.IDENTIFIER:
        return this.IdentifierExpression();

      default:
        throw new SyntaxError(
          `Unexpected expression token: ${JSON.stringify(
            this.lookahead,
            null,
            2
          )}`
        );
    }
  }

  DefinitionExpression(): AST.DefinitionExpression {
    this.eat(TokenType.DEF);
    const mutable =
      this.lookahead.type === TokenType.MUT && !!this.eat(TokenType.MUT);
    const id = this.IdentifierExpression();
    const expression = this.Expression();

    return {
      type: AST.ASTType.DefinitionExpression,
      id,
      expression,
      mutable,
    };
  }

  SetExpression(): AST.SetExpression {
    this.eat(TokenType.SET);
    const id = this.IdentifierExpression();
    const expression = this.Expression();
    return {
      type: AST.ASTType.SetExpression,
      id,
      expression,
    };
  }

  BlockExpression(): AST.BlockExpression {
    this.eat(TokenType.LEFT_BRACE);
    const body =
      this.lookahead.type !== TokenType.RIGHT_BRACE
        ? this.ExpressionList(TokenType.RIGHT_BRACE)
        : [];
    this.eat(TokenType.RIGHT_BRACE);
    return {
      type: AST.ASTType.BlockExpression,
      body,
    };
  }

  IfExpression(): AST.IfExpression {
    this.eat(TokenType.IF);
    const test = this.Expression();
    this.eat(TokenType.THEN);
    const consequent = this.Expression();
    this.eat(TokenType.ELSE);
    const alternate = this.Expression();
    return {
      type: AST.ASTType.IfExpression,
      test,
      consequent,
      alternate,
    };
  }

  WhileStatement(): AST.WhileExpression {
    this.eat(TokenType.WHILE);
    const test = this.Expression();
    const body = this.Expression();
    return {
      type: AST.ASTType.WhileExpression,
      test,
      body,
    };
  }

  DoWhileStatement(): AST.DoWhileExpression {
    this.eat(TokenType.DO);
    const body = this.Expression();
    this.eat(TokenType.WHILE);
    const test = this.Expression();
    return {
      type: AST.ASTType.DoWhileExpression,
      body,
      test,
    };
  }

  CallExpression(callee: any): any {
    const args = this.Arguments();
    let callExpression = {
      type: AST.ASTType.CallExpression,
      callee,
      arguments: args,
    };
    if (this.lookahead.type === TokenType.LEFT_PAREN) {
      callExpression = this.CallExpression(callExpression);
    }
    return callExpression;
  }

  NewExpression(): AST.NewExpression {
    this.eat(TokenType.NEW);
    const callee = this.Identifier();
    const args = this.Arguments();
    return {
      type: AST.ASTType.NewExpression,
      callee,
      arguments: args,
    };
  }

  IdentifierExpression(): AST.IdentifierExpression {
    const id = this.Identifier();

    switch (this.lookahead.type) {
      case TokenType.LEFT_PAREN:
        return this.CallExpression(id);
      case TokenType.DOT:
      case TokenType.LEFT_BRACKET:
        return this.CallMemberExpression(id);
      default:
        return id;
    }
  }

  CallMemberExpression(id: AST.Identifier): any {
    let object;
    while (
      this.lookahead.type === TokenType.DOT ||
      this.lookahead.type === TokenType.LEFT_BRACKET
    ) {
      if (this.lookahead.type === TokenType.DOT) {
        this.eat(TokenType.DOT);
        object = {
          type: AST.ASTType.CallMemberExpression,
          id,
          message: this.Expression(),
          computed: false,
        };
      }

      if (this.lookahead.type === TokenType.LEFT_BRACKET) {
        this.eat(TokenType.LEFT_BRACKET);
        const message = this.Expression();
        this.eat(TokenType.RIGHT_BRACKET);
        object = {
          type: AST.ASTType.CallMemberExpression,
          id,
          message,
          computed: true,
        };
      }
    }
    return object;
  }

  Arguments(): AST.Arguments {
    this.eat(TokenType.LEFT_PAREN);
    const body =
      this.lookahead.type !== TokenType.RIGHT_PAREN
        ? this.ExpressionList(TokenType.RIGHT_PAREN)
        : [];
    this.eat(TokenType.RIGHT_PAREN);
    return body;
  }

  Identifier(): AST.Identifier {
    const name = this.eat(TokenType.IDENTIFIER).value;

    return {
      type: AST.ASTType.Identifier,
      name,
    };
  }

  FunctionExpression(): AST.FunctionExpression {
    this.eat(TokenType.LAMBDA);
    this.eat(TokenType.LEFT_PAREN);
    const params = this.FormalParameterList();
    this.eat(TokenType.RIGHT_PAREN);
    const body = this.Expression();
    return {
      type: AST.ASTType.FunctionExpression,
      params,
      body,
    };
  }

  FormalParameterList(): AST.FormalParameterList {
    const params = [];

    while (this.lookahead.type !== TokenType.RIGHT_PAREN) {
      params.push(this.Identifier());
    }

    return params;
  }

  ClassExpression(): AST.ClassExpression {
    this.eat(TokenType.CLASS);

    this.eat(TokenType.LEFT_BRACE);
    const body = this.ClassBody();
    this.eat(TokenType.RIGHT_BRACE);
    return {
      type: AST.ASTType.ClassExpression,
      body,
    };
  }

  ClassBody(): AST.ClassBody {
    let classBodyExpression = [];
    while (this.lookahead.type !== TokenType.RIGHT_BRACE) {
      classBodyExpression.push(this.ClassBodyExpression());
    }
    return classBodyExpression;
  }

  ClassBodyExpression(): AST.ClassBodyExpression {
    const id = this.Identifier();
    this.eat(TokenType.LEFT_PAREN);
    const params = this.FormalParameterList();
    this.eat(TokenType.RIGHT_PAREN);
    const body = this.Expression();
    return {
      type: AST.ASTType.ClassBodyExpression,
      id,
      params,
      body,
    };
  }

  StringLiteral(): any {
    const token = this.eat(TokenType.STRING);
    return {
      type: AST.ASTType.StringLiteral,
      value: token.value.slice(1, -1),
    };
  }

  NumericLiteral(): any {
    const token = this.eat(TokenType.NUMBER);
    return {
      type: AST.ASTType.NumericLiteral,
      value: Number(token.value),
    };
  }

  BooleanLiteral(value: boolean): AST.BooleanLiteral {
    value ? this.eat(TokenType.TRUE) : this.eat(TokenType.FALSE);
    return {
      type: AST.ASTType.BooleanLiteral,
      value,
    };
  }

  NullLiteral(): AST.NullLiteral {
    this.eat(TokenType.NULL);
    return {
      type: AST.ASTType.NullLiteral,
    };
  }

  private eat(expected: TokenType) {
    const token = this.lookahead;

    if (token === null) {
      throw new SyntaxError(`Unexpected end of input, expected: "${expected}"`);
    }
    if (token.type !== expected) {
      throw new SyntaxError(
        `Unexpected token: "${token.value}" on line ${this.scanner.line}, expected: "${expected}"`
      );
    }

    this.lookahead = this.scanner.getNextToken();
    return token;
  }
}
