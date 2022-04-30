import { strictEqual } from "assert";
import { Interpreter } from "../lib/Interpreter";
import { Parser } from "../lib/Parser";
import { Scanner } from "../lib/Scanner";

function test(
  input: string,
  callback: (result: string, state: Interpreter) => any
) {
  const parser = new Parser();
  const scanner = new Scanner(input);
  const interpreter = new Interpreter();
  const ast = parser.parse(scanner);
  return callback(interpreter.eval(ast), interpreter);
}

function testException(input: string, exprectedError: string): void {
  try {
    test(input, () => {});
  } catch (e) {
    strictEqual(e.message, exprectedError);
  }
}

export default function () {
  test(`1`, (result, state) => {
    strictEqual(result, 1);
  });

  test(`"hello"`, (result, state) => {
    strictEqual(result, "hello");
  });

  test(`def x 1`, (result, state) => {
    strictEqual(state.global.record.x.value, 1);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, 1);
  });

  test(`def mut x 1`, (result, state) => {
    strictEqual(state.global.record.x.value, 1);
    strictEqual(state.global.record.x.mutable, true);
    strictEqual(result, 1);
  });

  test(`def x true`, (result, state) => {
    strictEqual(state.global.record.x.value, true);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, true);
  });
  test(`def x false`, (result, state) => {
    strictEqual(state.global.record.x.value, false);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, false);
  });
  test(`def x null`, (result, state) => {
    strictEqual(state.global.record.x.value, null);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, null);
  });

  test(`
    def x 1
    def y {
      def x 2
    }
    x
  `, (result, state) => {
    strictEqual(state.global.record.x.value, 1);
    strictEqual(state.global.record.y.value, 2);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, 1);
  });

  test(`+ (1 2)`, (result, state) => {
    strictEqual(result, 3);
  });

  test(`-(2)`, (result, state) => {
    strictEqual(result, -2);
  });

  test(`
    def mut x 10
    set x 20
    `, (result, state) => {
    strictEqual(state.global.record.x.value, 20);
    strictEqual(state.global.record.x.mutable, true);
    strictEqual(result, 20);
  });

  testException(
    `
    def x 10
    set x 20
    `,
    'Cannot mutate the defined value "x".'
  );

  test(`
    def x 10
    {
      def y 20
      + (x y)
    }
    `, (result, state) => {
    strictEqual(state.global.record.x.value, 10);
    strictEqual(state.global.record.x.mutable, false);
    strictEqual(result, 30);
  });

  test(`
    def x 10
    def mut y 0
    if >(x 10) 
        then set y 20
        else set y 30

  `, (result, state) => {
    strictEqual(state.global.record.y.value, 30);
    strictEqual(result, 30);
  });

  test(`
    def x 10
    def mut y 0
    if <(x 9) 
        then set y 20
        else if >(x 9)
             then set y 30
             else set y 40

  `, (result, state) => {
    strictEqual(state.global.record.y.value, 30);
    strictEqual(result, 30);
  });

  test(`
    def mut x 20
    while > (x 10) 
        set x -(x 1)
  `, (result, state) => {
    strictEqual(state.global.record.x.value, 10);
    strictEqual(result, 10);
  });

  test(`
    def mut x 0
    do set x +(x 1)
        while < (x 10)
  `, (result, state) => {
    strictEqual(state.global.record.x.value, 10);
    strictEqual(result, 10);
  });

  test(`
    def square λ(x) *(x x)
    square(2)
  `, (result, state) => {
    strictEqual(result, 4);
  });

  test(`
    def calc λ(x y) {
        def z 30
        +(*(x y) z)
    }
    calc(10 20)
  `, (result, state) => {
    strictEqual(result, 230);
  });

  test(`
    def value 100
    def calc λ(x y) {
        def z +(x y)

        def inner λ(foo) +(+(foo z) value)
    }
    def fn calc(10 20)
    fn(30)
  `, (result, state) => {
    strictEqual(result, 160);
  });

  test(`
    def onClick λ(callback) {
        def x 10
        def y 20
        callback( +(x y) )
    }

    onClick( λ(data) *(data 10) )

  `, (result, state) => {
    strictEqual(result, 300);
  });

  test(`
    def factorial λ(x) if =(x 1)
                       then 1
                       else *( x factorial( -(x 1) ) )

    factorial(5)

  `, (result, state) => {
    strictEqual(result, 120);
  });

  test(`
    def factorial λ(x) {
        def mut result x
        def mut i x
        while >(i 1) {
            set i -(i 1)
            set result *(result i)
        }
    }

    factorial(5)

  `, (result, state) => {
    strictEqual(result, 120);
  });

  test(`
    def Point class {
        calc(x y) +(x y)
    }
    
    def point new Point()
    point.calc(10 20)
  `, (result, state) => {
    strictEqual(result, 30);
  });

  test(`
    def Point class {
        init(x y) {
            def mut this.x x
            def mut this.y y
        }
        calc() +(this.x this.y)
        calc2() {
            set this.x 20
            set this.y 30
            this.calc()
        }
    }

    def point new Point(10 20)
    def calced point.calc()
    def calced2 point.calc2()
  `, (result, state) => {
    strictEqual(state.global.lookup("calced"), 30);
    strictEqual(state.global.lookup("calced2"), 50);
  });

  test(`
    def Point class {
      init(x) {
        def this.x x
      }
    }

    def Point3D class {
      init(y) {
        def this.y y
      }
    }

    def point3D new Point3D(20)
    def point new Point(point3D)
    def prop point.x.y
    def point.x.z 100
    def sub-prop point.x.z
  `, (result, state) => {
    strictEqual(state.global.lookup("prop"), 20);
    strictEqual(state.global.lookup("sub-prop"), 100);
  });

  test(`
    def Point class {
      init(x y) {
        def this.x x
        def this.y y
      }
    }

    def Point3D class {
      init(p x y z) {
        def parent new p(x y)
        def this.x parent.x
        def this.y parent.y
        def this.z z
      }
    }

    def point3D new Point3D(Point 10 20 30)
    def point3D-2 new Point3D(Point 100 200 300)

    def test1 point3D.x
    def test2 point3D.y
    def test3 point3D-2.x
    def test4 point3D-2.z
  `, (result, state) => {
    strictEqual(state.global.lookup("test1"), 10);
    strictEqual(state.global.lookup("test2"), 20);
    strictEqual(state.global.lookup("test3"), 100);
    strictEqual(state.global.lookup("test4"), 300);
  });
}
