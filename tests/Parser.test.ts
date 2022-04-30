import { deepStrictEqual } from "assert";
import { Token, TokenType } from "../lib/Token";
import * as AST from "../lib/AST";
import { Parser } from "../lib/Parser";
import { Scanner } from "../lib/Scanner";

function test(input: string, expected: AST.Program) {
  const parser = new Parser();
  const scanner = new Scanner(input);
  const output = parser.parse(scanner);
  return deepStrictEqual(output, expected, input);
}

export default function () {
  test(`1`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.NumericLiteral,
        value: 1,
      },
    ],
  });
  test(`"Hello world!"`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.StringLiteral,
        value: "Hello world!",
      },
    ],
  });

  test(`x`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.Identifier,
        name: "x",
      },
    ],
  });

  test(`+()`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallExpression,
        callee: {
          type: AST.ASTType.Identifier,
          name: "+",
        },
        arguments: [],
      },
    ],
  });

  test(`def test 1`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.DefinitionExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "test",
        },
        expression: {
          type: AST.ASTType.NumericLiteral,
          value: 1,
        },
        mutable: false,
      },
    ],
  });

  test(`def mut test 1`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.DefinitionExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "test",
        },
        expression: {
          type: AST.ASTType.NumericLiteral,
          value: 1,
        },
        mutable: true,
      },
    ],
  });

  test(`set test 1`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.SetExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "test",
        },
        expression: {
          type: AST.ASTType.NumericLiteral,
          value: 1,
        },
      },
    ],
  });

  test(`{}`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.BlockExpression,
        body: [],
      },
    ],
  });
  test(`{1}`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.BlockExpression,
        body: [
          {
            type: AST.ASTType.NumericLiteral,
            value: 1,
          },
        ],
      },
    ],
  });

  test(`{ true false null }`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.BlockExpression,
        body: [
          {
            type: AST.ASTType.BooleanLiteral,
            value: true,
          },
          {
            type: AST.ASTType.BooleanLiteral,
            value: false,
          },
          {
            type: AST.ASTType.NullLiteral,
          },
        ],
      },
    ],
  });

  test(`def test { 1 { 2 } }`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.DefinitionExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "test",
        },
        expression: {
          type: AST.ASTType.BlockExpression,
          body: [
            {
              type: AST.ASTType.NumericLiteral,
              value: 1,
            },
            {
              type: AST.ASTType.BlockExpression,
              body: [
                {
                  type: AST.ASTType.NumericLiteral,
                  value: 2,
                },
              ],
            },
          ],
        },
        mutable: false,
      },
    ],
  });

  test(`+(2 2)`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallExpression,
        callee: {
          type: AST.ASTType.Identifier,
          name: "+",
        },
        arguments: [
          {
            type: AST.ASTType.NumericLiteral,
            value: 2,
          },
          {
            type: AST.ASTType.NumericLiteral,
            value: 2,
          },
        ],
      },
    ],
  });

  test(`+(2 *(2 3))`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallExpression,
        callee: {
          type: AST.ASTType.Identifier,
          name: "+",
        },
        arguments: [
          {
            type: AST.ASTType.NumericLiteral,
            value: 2,
          },
          {
            type: AST.ASTType.CallExpression,
            callee: {
              type: AST.ASTType.Identifier,
              name: "*",
            },
            arguments: [
              {
                type: AST.ASTType.NumericLiteral,
                value: 2,
              },
              {
                type: AST.ASTType.NumericLiteral,
                value: 3,
              },
            ],
          },
        ],
      },
    ],
  });

  test(`foo(x)(y)`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallExpression,
        callee: {
          type: AST.ASTType.CallExpression,
          callee: {
            type: AST.ASTType.Identifier,
            name: "foo",
          },
          arguments: [
            {
              type: AST.ASTType.Identifier,
              name: "x",
            },
          ],
        },
        arguments: [
          {
            type: AST.ASTType.Identifier,
            name: "y",
          },
        ],
      },
    ],
  });

  test(`λ(x y) +(x y)`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.FunctionExpression,
        params: [
          {
            type: AST.ASTType.Identifier,
            name: "x",
          },
          {
            type: AST.ASTType.Identifier,
            name: "y",
          },
        ],
        body: {
          type: AST.ASTType.CallExpression,
          callee: {
            type: AST.ASTType.Identifier,
            name: "+",
          },
          arguments: [
            {
              type: AST.ASTType.Identifier,
              name: "x",
            },
            {
              type: AST.ASTType.Identifier,
              name: "y",
            },
          ],
        },
      },
    ],
  });

  test(
    `
    def square λ(x y) {
        *(x y)
    }
    `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "square",
          },
          expression: {
            type: AST.ASTType.FunctionExpression,
            params: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.Identifier,
                name: "y",
              },
            ],
            body: {
              type: AST.ASTType.BlockExpression,
              body: [
                {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "*",
                  },
                  arguments: [
                    {
                      type: AST.ASTType.Identifier,
                      name: "x",
                    },
                    {
                      type: AST.ASTType.Identifier,
                      name: "y",
                    },
                  ],
                },
              ],
            },
          },
          mutable: false,
        },
      ],
    }
  );

  test(
    `
    def calc λ(x y) {
        def z 30
        +( *(x y) z)
    }
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "calc",
          },
          expression: {
            type: AST.ASTType.FunctionExpression,
            params: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.Identifier,
                name: "y",
              },
            ],
            body: {
              type: AST.ASTType.BlockExpression,
              body: [
                {
                  type: AST.ASTType.DefinitionExpression,
                  id: {
                    type: AST.ASTType.Identifier,
                    name: "z",
                  },
                  expression: {
                    type: AST.ASTType.NumericLiteral,
                    value: 30,
                  },
                  mutable: false,
                },
                {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "+",
                  },
                  arguments: [
                    {
                      type: AST.ASTType.CallExpression,
                      callee: {
                        type: AST.ASTType.Identifier,
                        name: "*",
                      },
                      arguments: [
                        {
                          type: AST.ASTType.Identifier,
                          name: "x",
                        },
                        {
                          type: AST.ASTType.Identifier,
                          name: "y",
                        },
                      ],
                    },
                    {
                      type: AST.ASTType.Identifier,
                      name: "z",
                    },
                  ],
                },
              ],
            },
          },
          mutable: false,
        },
      ],
    }
  );

  test(
    `
    def value 100
    
    def calc λ(x y) {
        def z 30
        def inner λ(foo) {
            +( +(foo z)) value
        }
    
        inner()
    }
    
    def fn calc(10 20)
    fn(30)
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "value",
          },
          expression: {
            type: AST.ASTType.NumericLiteral,
            value: 100,
          },
          mutable: false,
        },
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "calc",
          },
          expression: {
            type: AST.ASTType.FunctionExpression,
            params: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.Identifier,
                name: "y",
              },
            ],
            body: {
              type: AST.ASTType.BlockExpression,
              body: [
                {
                  type: AST.ASTType.DefinitionExpression,
                  id: {
                    type: AST.ASTType.Identifier,
                    name: "z",
                  },
                  expression: {
                    type: AST.ASTType.NumericLiteral,
                    value: 30,
                  },
                  mutable: false,
                },
                {
                  type: AST.ASTType.DefinitionExpression,
                  id: {
                    type: AST.ASTType.Identifier,
                    name: "inner",
                  },
                  expression: {
                    type: AST.ASTType.FunctionExpression,
                    params: [
                      {
                        type: AST.ASTType.Identifier,
                        name: "foo",
                      },
                    ],
                    body: {
                      type: AST.ASTType.BlockExpression,
                      body: [
                        {
                          type: AST.ASTType.CallExpression,
                          callee: {
                            type: AST.ASTType.Identifier,
                            name: "+",
                          },
                          arguments: [
                            {
                              type: AST.ASTType.CallExpression,
                              callee: {
                                type: AST.ASTType.Identifier,
                                name: "+",
                              },
                              arguments: [
                                {
                                  type: AST.ASTType.Identifier,
                                  name: "foo",
                                },
                                {
                                  type: AST.ASTType.Identifier,
                                  name: "z",
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: AST.ASTType.Identifier,
                          name: "value",
                        },
                      ],
                    },
                  },
                  mutable: false,
                },
                {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "inner",
                  },
                  arguments: [],
                },
              ],
            },
          },
          mutable: false,
        },
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "fn",
          },
          expression: {
            type: AST.ASTType.CallExpression,
            callee: {
              type: AST.ASTType.Identifier,
              name: "calc",
            },
            arguments: [
              {
                type: AST.ASTType.NumericLiteral,
                value: 10,
              },
              {
                type: AST.ASTType.NumericLiteral,
                value: 20,
              },
            ],
          },
          mutable: false,
        },
        {
          type: AST.ASTType.CallExpression,
          callee: {
            type: AST.ASTType.Identifier,
            name: "fn",
          },
          arguments: [
            {
              type: AST.ASTType.NumericLiteral,
              value: 30,
            },
          ],
        },
      ],
    }
  );

  test(
    `
    def x 10
    def mut y 0
    if >(x 10) 
      then set y 20
      else set y 30
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "x",
          },
          expression: {
            type: AST.ASTType.NumericLiteral,
            value: 10,
          },
          mutable: false,
        },
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "y",
          },
          expression: {
            type: AST.ASTType.NumericLiteral,
            value: 0,
          },
          mutable: true,
        },
        {
          type: AST.ASTType.IfExpression,
          test: {
            type: AST.ASTType.CallExpression,
            callee: {
              type: AST.ASTType.Identifier,
              name: ">",
            },
            arguments: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.NumericLiteral,
                value: 10,
              },
            ],
          },
          consequent: {
            type: AST.ASTType.SetExpression,
            id: {
              type: AST.ASTType.Identifier,
              name: "y",
            },
            expression: {
              type: AST.ASTType.NumericLiteral,
              value: 20,
            },
          },
          alternate: {
            type: AST.ASTType.SetExpression,
            id: {
              type: AST.ASTType.Identifier,
              name: "y",
            },
            expression: {
              type: AST.ASTType.NumericLiteral,
              value: 30,
            },
          },
        },
      ],
    }
  );

  test(
    `
  while > (x 10) {
    set x -(x 1)
  }
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.WhileExpression,
          test: {
            type: AST.ASTType.CallExpression,
            callee: {
              type: AST.ASTType.Identifier,
              name: ">",
            },
            arguments: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.NumericLiteral,
                value: 10,
              },
            ],
          },
          body: {
            type: AST.ASTType.BlockExpression,
            body: [
              {
                type: AST.ASTType.SetExpression,
                id: {
                  type: AST.ASTType.Identifier,
                  name: "x",
                },
                expression: {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "-",
                  },
                  arguments: [
                    {
                      type: AST.ASTType.Identifier,
                      name: "x",
                    },
                    {
                      type: AST.ASTType.NumericLiteral,
                      value: 1,
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    }
  );

  test(
    `
    do {
      set x -(x 1)
    } while > (x 10)
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DoWhileExpression,
          body: {
            type: AST.ASTType.BlockExpression,
            body: [
              {
                type: AST.ASTType.SetExpression,
                id: {
                  type: AST.ASTType.Identifier,
                  name: "x",
                },
                expression: {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "-",
                  },
                  arguments: [
                    {
                      type: AST.ASTType.Identifier,
                      name: "x",
                    },
                    {
                      type: AST.ASTType.NumericLiteral,
                      value: 1,
                    },
                  ],
                },
              },
            ],
          },
          test: {
            type: AST.ASTType.CallExpression,
            callee: {
              type: AST.ASTType.Identifier,
              name: ">",
            },
            arguments: [
              {
                type: AST.ASTType.Identifier,
                name: "x",
              },
              {
                type: AST.ASTType.NumericLiteral,
                value: 10,
              },
            ],
          },
        },
      ],
    }
  );

  test(
    `
    def Point3D class {
      calc() + (this.x this.y)
    }
  `,
    {
      type: AST.ASTType.Program,
      body: [
        {
          type: AST.ASTType.DefinitionExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "Point3D",
          },
          expression: {
            type: AST.ASTType.ClassExpression,
            body: [
              {
                type: AST.ASTType.ClassBodyExpression,
                id: {
                  type: AST.ASTType.Identifier,
                  name: "calc",
                },
                params: [],
                body: {
                  type: AST.ASTType.CallExpression,
                  callee: {
                    type: AST.ASTType.Identifier,
                    name: "+",
                  },
                  arguments: [
                    {
                      type: AST.ASTType.CallMemberExpression,
                      id: {
                        type: AST.ASTType.Identifier,
                        name: "this",
                      },
                      message: {
                        type: AST.ASTType.Identifier,
                        name: "x",
                      },
                      computed: false,
                    },
                    {
                      type: AST.ASTType.CallMemberExpression,
                      id: {
                        type: AST.ASTType.Identifier,
                        name: "this",
                      },
                      message: {
                        type: AST.ASTType.Identifier,
                        name: "y",
                      },
                      computed: false,
                    },
                  ],
                },
              },
            ],
          },
          mutable: false,
        },
      ],
    }
  );

  test(`def point new Point(10 29)`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.DefinitionExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "point",
        },
        expression: {
          type: AST.ASTType.NewExpression,
          callee: {
            type: AST.ASTType.Identifier,
            name: "Point",
          },
          arguments: [
            {
              type: AST.ASTType.NumericLiteral,
              value: 10,
            },
            {
              type: AST.ASTType.NumericLiteral,
              value: 29,
            },
          ],
        },
        mutable: false,
      },
    ],
  });

  test(`a.b.c`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallMemberExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "a",
        },
        message: {
          type: AST.ASTType.CallMemberExpression,
          id: {
            type: AST.ASTType.Identifier,
            name: "b",
          },
          message: {
            type: AST.ASTType.Identifier,
            name: "c",
          },
          computed: false,
        },
        computed: false,
      },
    ],
  });

  test(`a["key"]`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallMemberExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "a",
        },
        message: {
          type: AST.ASTType.StringLiteral,
          value: "key",
        },
        computed: true,
      },
    ],
  });

  test(`console.log("Hello")`, {
    type: AST.ASTType.Program,
    body: [
      {
        type: AST.ASTType.CallMemberExpression,
        id: {
          type: AST.ASTType.Identifier,
          name: "console",
        },
        message: {
          type: AST.ASTType.CallExpression,
          callee: {
            type: AST.ASTType.Identifier,
            name: "log",
          },
          arguments: [
            {
              type: AST.ASTType.StringLiteral,
              value: "Hello",
            },
          ],
        },
        computed: false,
      },
    ],
  });
}
