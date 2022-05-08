import { MethodVerifier } from "../../../../src/verifiers/method_verifier.ts";
import { assertEquals } from "../../deps.ts";

class _MyClass {
  public doSomething(): void {
    return;
  }
}

function throwError(
  cb: (...args: unknown[]) => void,
): { message: string; stack: string } {
  let e;

  try {
    cb();
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

Deno.test("MethodVerifier", async (t) => {
  await t.step("toBeCalled()", async (t) => {
    await t.step(
      "shows error message, code that threw, actual and expected results",
      () => {
        const mv = new MethodVerifier<_MyClass>("doSomething");

        const error = throwError(() => mv.toBeCalled(1, 2));

        const expected = `

VerificationError: Method "doSomething" was not called 2 time(s).
    at /deno/src/verifiers/method_verifier_test.ts:{line}:{column}

Verification Results:
    Actual calls   -> 1
    Expected calls -> 2

Check the above "method_verifier_test.ts" file at/around line {line} for code like the following to fix this error:
    .verify("doSomething").toBeCalled(2)


`;

        assertEquals(
          error.stack.replace(/file.+tests/g, ""), // Remove file://path/to/local/rhum/tests
          expected,
        );
      },
    );
  });

  await t.step("toBeCalledWithArgs()", async (t) => {
    await t.step(
      "shows error message, code that threw, actual and expected results",
      () => {
        const mv = new MethodVerifier<_MyClass>("doSomething");

        const error = throwError(() => mv.toBeCalledWithArgs([1], [2]));

        const expected = `

VerificationError: Method "doSomething" received unexpected arg \`1<number>\` at parameter position 1.
    at /deno/src/verifiers/method_verifier_test.ts:{line}:{column}

Verification Results:
    Actual call   -> (1<number>)
    Expected call -> (2<number>)

Check the above "method_verifier_test.ts" file at/around line {line} for code like the following to fix this error:
    .verify("doSomething").toBeCalledWithArgs(2)


`;

        assertEquals(
          error.stack.replace(/file.+tests/g, ""), // Remove file://path/to/local/rhum/tests
          expected,
        );
      },
    );
  });

  await t.step("toBeCalledWithoutArgs()", async (t) => {
    await t.step(
      "shows error message, code that threw, actual and expected results",
      () => {
        const mv = new MethodVerifier<_MyClass>("doSomething");

        const error = throwError(() =>
          mv.toBeCalledWithoutArgs([2, "hello", {}])
        );

        const expected = `

VerificationError: Method "doSomething" was called with args when expected to receive no args.
    at /deno/src/verifiers/method_verifier_test.ts:{line}:{column}

Verification Results:
    Actual args   -> (2, "hello", {})
    Expected args -> (no args)

Check the above "method_verifier_test.ts" file at/around line {line} for code like the following to fix this error:
    .verify("doSomething").toBeCalledWithoutArgs()


`;

        assertEquals(
          error.stack.replace(/file.+tests/g, ""), // Remove file://path/to/local/rhum/tests
          expected,
        );
      },
    );
  });
});
