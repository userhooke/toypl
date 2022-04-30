import { AssertionError } from "assert";
import scannerTest from "./Scanner.test";
import parserTest from "./Parser.test";
import interpreterTest from "./Interpreter.test";
import helpersTest from "./helpers.test";

try {
  helpersTest();
  scannerTest();
  parserTest();
  interpreterTest();

  console.log("All units are good 👌");
} catch (e) {
  console.log("\x1b[41m", e.message);
  if (e instanceof AssertionError) {
    console.log("\x1b[0m", "Expected:");
    console.log("\x1b[32m", JSON.stringify(e.expected, null, 2));
    console.log("\x1b[0m", "Actual:");
    console.log("\x1b[31m", JSON.stringify(e.actual, null, 2));
  }
  console.log("\x1b[0m", e.stack);
}
