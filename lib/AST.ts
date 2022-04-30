export enum ASTType {
  Program = "Program",
  NumericLiteral = "NumericLiteral",
  StringLiteral = "StringLiteral",
  DefinitionExpression = "DefinitionExpression",
  Identifier = "Identifier",
  BlockExpression = "BlockExpression",
  SetExpression = "SetExpression",
  CallExpression = "CallExpression",
  FunctionExpression = "FunctionExpression",
  BooleanLiteral = "BooleanLiteral",
  NullLiteral = "NullLiteral",
  IfExpression = "IfExpression",
  WhileExpression = "WhileExpression",
  DoWhileExpression = "DoWhileExpression",
  ClassExpression = "ClassExpression",
  ClassBodyExpression = "ClassBodyExpression",
  CallMemberExpression = "CallMemberExpression",
  NewExpression = "NewExpression",
}

export type GenericAST = {
  type: ASTType;
};

export type Program = {
  type: ASTType.Program;
  body: ExpressionList;
};

export type ExpressionList = Expression[] | [];

export type Expression =
  | PrimaryExpression
  | IdentifierExpression
  | DefinitionExpression
  | SetExpression
  | BlockExpression
  | FunctionExpression
  | IfExpression
  | IterationExpression
  | ClassExpression
  | NewExpression;

/**
 * 'def' IdentifierExpression Expression
 * 'def' 'mut' IdentifierExpression Expression
 */
export type DefinitionExpression = {
  type: ASTType.DefinitionExpression;
  id: IdentifierExpression;
  expression: Expression;
  mutable: boolean;
};

/**
 * 'set' IdentifierExpression Expression
 */
export type SetExpression = {
  type: ASTType.SetExpression;
  id: IdentifierExpression;
  expression: Expression;
};

export type IdentifierExpression =
  | Identifier
  | CallExpression
  | CallMemberExpression;

export type Identifier = {
  type: ASTType.Identifier;
  name: string;
};

/**
 * '{' Expression* '}'
 */
export type BlockExpression = {
  type: ASTType.BlockExpression;
  body: Expression[] | [];
};

/**
 * 'λ' '(' FormalParameterList ')' Expression
 * 'lambda' '(' FormalParameterList ')' Expression
 */
export type FunctionExpression = {
  type: ASTType.FunctionExpression;
  params: FormalParameterList;
  body: Expression;
};

export type FormalParameterList = Identifier[] | [];

/**
 * 'class' Expression
 */
export type ClassExpression = {
  type: ASTType.ClassExpression;
  body: ClassBody;
};

export type ClassBody = ClassBodyExpression[] | [];

/**
 * Identifier '(' FormalParameterList ')' Expression
 */
export type ClassBodyExpression = {
  type: ASTType.ClassBodyExpression;
  id: Identifier;
  params: FormalParameterList;
  body: Expression;
};

/**
 * IdentifierExpression '.' Expression
 * IdentifierExpression '[' Expression ']'
 *
 */
export type CallMemberExpression = {
  type: ASTType.CallMemberExpression;
  id: Identifier;
  message: Expression;
  computed: boolean;
};

/**
 * IdentifierExpression '(' Arguments ')'
 */
export type CallExpression = {
  type: ASTType.CallExpression;
  callee: IdentifierExpression;
  arguments: Arguments;
};

/**
 * 'new' IdentifierExpression '(' Arguments ')'
 */
export type NewExpression = {
  type: ASTType.NewExpression;
  callee: Identifier;
  arguments: Arguments;
};

export type Arguments = Expression[] | [];

/**
 * 'if' Expression 'then' Expression 'else' Expression
 */
export type IfExpression = {
  type: ASTType.IfExpression;
  test: Expression;
  consequent: Expression;
  alternate: Expression;
};

export type IterationExpression = WhileExpression | DoWhileExpression;

/**
 * 'while' '(' Expresssion ')' Expression
 */
export type WhileExpression = {
  type: ASTType.WhileExpression;
  test: Expression;
  body: Expression;
};

/**
 *  'do' Expression 'while '(' Expression ')'
 */
export type DoWhileExpression = {
  type: ASTType.DoWhileExpression;
  body: Expression;
  test: Expression;
};

export type PrimaryExpression =
  | NumericLiteral
  | StringLiteral
  | BooleanLiteral
  | NullLiteral;

export type NumericLiteral = {
  type: ASTType.NumericLiteral;
  value: number;
};

export type StringLiteral = {
  type: ASTType.StringLiteral;
  value: string;
};

export type BooleanLiteral = {
  type: ASTType.BooleanLiteral;
  value: boolean;
};

export type NullLiteral = {
  type: ASTType.NullLiteral;
};
