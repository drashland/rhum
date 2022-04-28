import { VerificationError } from "../../../src/errors.ts";
import { assertEquals, assertThrows } from "../../deps.ts";

function throwError(
  message: string,
  codeThatThrew: string,
  actualResults: string,
  expectedResults: string,
): { message: string; stack: string } {
  let e;

  try {
    throw new VerificationError(
      message,
      codeThatThrew,
      actualResults,
      expectedResults,
    );
  } catch (error) {
    e = error;
  }

  return {
    message: e.message,
    stack: e.stack
      .replace(/\.ts:\d+:\d+/g, ".ts:{line}:{column}")
      .replace(/line \d+/g, "line {line}"),
  };
}

Deno.test("VerificationError", async (t) => {
  await t.step(
    "shows error message, code that threw, actual and expected results",
    () => {
      const error = throwError(
        "Some message",
        ".some().code()",
        "Actual:   1 call made",
        "Expected: 2 calls made ah ah ah",
      );

      assertEquals(
        error.message,
        "Some message",
      );

      const expected = `

VerificationError: Some message
    at throwError (/deno/src/errors_test.ts:{line}:{column})

Verification Results:
    Actual:   1 call made
    Expected: 2 calls made ah ah ah

Check the above "errors_test.ts" file at/around line {line} for code like the following to fix this error:
    .some().code()


`;

      assertEquals(
        error.stack.replace(/file.+tests/g, ""), // Remove file://path/to/local/rhum/tests
        expected,
      );
    },
  );
});
