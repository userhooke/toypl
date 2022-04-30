import * as AST from "./AST";
import { Environment, EnvironmentRecord } from "./Environment";
import getGitTagVersion from "./helpers/getGitTagVersion";

const VERSION = getGitTagVersion();

class DefaultGlobalEnvironment extends Environment {
  constructor() {
    super({
      VERSION: { value: VERSION, mutable: false },
      print: { value: console.log, mutable: false },
      "+": {
        value: (a: number, b: number) => a + b,
        mutable: false,
      },
      "*": {
        value: (a: number, b: number) => a * b,
        mutable: false,
      },
      "/": {
        value: (a: number, b: number) => a / b,
        mutable: false,
      },
      "-": {
        value: (a: number, b?: number) => (b ? a - b : -a),
        mutable: false,
      },
      ">": {
        value: (a: number, b: number) => a > b,
        mutable: false,
      },
      "<": {
        value: (a: number, b: number) => a < b,
        mutable: false,
      },
      ">=": {
        value: (a: number, b: number) => a >= b,
        mutable: false,
      },
      "<=": {
        value: (a: number, b: number) => a <= b,
        mutable: false,
      },
      "=": {
        value: (a: number, b: number) => a === b,
        mutable: false,
      },
    });
  }
}

export class Interpreter {
  public global: Environment;

  constructor(global = new DefaultGlobalEnvironment()) {
    this.global = global;
  }

  public eval(ast: AST.GenericAST, env: Environment = this.global): any {
    switch (ast.type) {
      case AST.ASTType.Program:
        return this.Program(ast as AST.Program, env);

      case AST.ASTType.NumericLiteral:
        return (ast as AST.NumericLiteral).value;

      case AST.ASTType.StringLiteral:
        return (ast as AST.StringLiteral).value;

      case AST.ASTType.BooleanLiteral:
        return (ast as AST.BooleanLiteral).value;

      case AST.ASTType.NullLiteral:
        return null;

      case AST.ASTType.Identifier:
        return env.lookup((ast as AST.Identifier).name);

      case AST.ASTType.DefinitionExpression:
        return this.DefinitionExpression(ast as AST.DefinitionExpression, env);

      case AST.ASTType.SetExpression:
        return this.SetExpression(ast as AST.SetExpression, env);

      case AST.ASTType.IfExpression:
        return this.IfExpression(ast as AST.IfExpression, env);

      case AST.ASTType.WhileExpression:
        return this.WhileExpression(ast as AST.WhileExpression, env);

      case AST.ASTType.DoWhileExpression:
        return this.DoWhileExpression(ast as AST.DoWhileExpression, env);

      case AST.ASTType.BlockExpression:
        return this.BlockExpression(ast as AST.BlockExpression, env);

      case AST.ASTType.CallExpression:
        return this.CallExpression(ast as AST.CallExpression, env);

      case AST.ASTType.CallMemberExpression:
        return this.CallMemberExpression(ast as AST.CallMemberExpression, env);

      case AST.ASTType.FunctionExpression:
        return this.FunctionExpression(ast as AST.FunctionExpression, env);

      case AST.ASTType.ClassExpression:
        return this.ClassExpression(ast as AST.ClassExpression, env);

      case AST.ASTType.ClassBodyExpression:
        return this.ClassBodyExpression(ast as AST.ClassBodyExpression, env);

      case AST.ASTType.NewExpression:
        return this.NewExpression(ast as AST.NewExpression, env);

      default:
        throw new Error(
          `Unsupported AST type: ${JSON.stringify(ast, null, 2)}`
        );
    }
  }

  FunctionExpression(ast: AST.FunctionExpression, env: Environment): any {
    return {
      params: ast.params,
      body: ast.body,
      env: env, // Closure
    };
  }

  BlockExpression(ast: AST.BlockExpression, env: Environment): any {
    const blockEnv = new Environment({}, env);
    let block;
    ast.body.forEach((node) => {
      block = this.eval(node, blockEnv);
    });
    return block;
  }

  DoWhileExpression(ast: AST.DoWhileExpression, env: Environment): any {
    let doWhileExpressionResult;
    do {
      doWhileExpressionResult = this.eval(ast.body, env);
    } while (this.eval(ast.test, env));
    return doWhileExpressionResult;
  }

  WhileExpression(ast: AST.WhileExpression, env: Environment): any {
    let whileExpressionResult;
    while (this.eval(ast.test, env)) {
      whileExpressionResult = this.eval(ast.body, env);
    }
    return whileExpressionResult;
  }

  IfExpression(ast: AST.IfExpression, env: Environment): any {
    const test = this.eval(ast.test, env);
    if (test) {
      return this.eval(ast.consequent, env);
    } else {
      return this.eval(ast.alternate, env);
    }
  }

  DefinitionExpression(ast: AST.DefinitionExpression, env: Environment): any {
    const [name, idEnv] = this.getIdentifierScope(ast.id, env);
    const value = this.eval(ast.expression, env);
    return idEnv.define(name, value, ast.mutable);
  }

  SetExpression(ast: AST.SetExpression, env: Environment): any {
    const [name, idEnv] = this.getIdentifierScope(ast.id, env);
    const value = this.eval(ast.expression, env);
    return idEnv.assign(name, value);
  }

  CallMemberExpression(ast: AST.CallMemberExpression, env: Environment): any {
    const instanceEnv = this.eval(ast.id, env);
    return this.eval(ast.message, instanceEnv);
  }

  Program(ast: AST.Program, env: Environment): any {
    let program;
    ast.body.forEach((node) => {
      program = this.eval(node, env);
    });
    return program;
  }

  CallExpression(ast: AST.CallExpression, env: Environment): any {
    const fn = this.eval(ast.callee, env);
    const args = ast.arguments.map((a) => this.eval(a, env));

    // 1. Native function:
    if (typeof fn === "function") {
      return fn(...args);
    }

    const activationRecord = this.createActivationRecord(fn.params, args);
    const activationEnv = fn.isMethod
      ? new Environment(activationRecord, env) // 2. User-defined class method
      : new Environment(activationRecord, fn.env); // 3. User-defined functions with static scope
    return this.eval(fn.body, activationEnv);
  }

  ClassExpression(ast: AST.ClassExpression, env: Environment): Environment {
    const classEnv = new Environment({}, env);

    ast.body.forEach((node) => {
      this.eval(node, classEnv);
    });

    return classEnv;
  }

  NewExpression(ast: AST.NewExpression, env: Environment): Environment {
    const classEnv = this.eval(ast.callee, env);
    const instanceEnv = new Environment({ ...classEnv.record }, env);
    const args = ast.arguments.map((a) => this.eval(a, env));

    instanceEnv.define("this", instanceEnv, false);

    if (instanceEnv.record["init"]) {
      const fn = instanceEnv.record["init"].value;
      const activationRecord = this.createActivationRecord(fn.params, args);
      const activationEnv = new Environment(activationRecord, instanceEnv);
      this.eval(fn.body, activationEnv);
    }

    return instanceEnv;
  }

  ClassBodyExpression(ast: AST.ClassBodyExpression, env: Environment): void {
    env.define(
      ast.id.name,
      {
        params: ast.params,
        body: ast.body,
        isMethod: true,
        env,
      },
      false
    );
  }

  private getIdentifierScope(
    ast: AST.Expression,
    env: Environment
  ): [string, Environment] {
    switch (ast.type) {
      case AST.ASTType.Identifier:
        return [ast.name, env];
      case AST.ASTType.CallMemberExpression:
        const calleeEnv = this.eval(ast.id, env);
        return ast.message.type === AST.ASTType.Identifier
          ? [ast.message.name, calleeEnv]
          : this.getIdentifierScope(ast.message, calleeEnv);
      default:
        throw new Error(`def and set on ${ast.type} not implemented.`);
    }
  }

  private createActivationRecord(params: any, args: any): EnvironmentRecord {
    let activationRecord: EnvironmentRecord = {};
    params.forEach((param: AST.Identifier, index: number) => {
      activationRecord[param.name] = {
        value: args[index],
        mutable: false,
      };
    });
    return activationRecord;
  }
}
