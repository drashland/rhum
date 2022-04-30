/**
 * Base class for custom errors in Rhum.
 */
class RhumError extends Error {
  public name: string;

  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

/**
 * Error to throw in relation to fake logic.
 */
export class FakeError extends RhumError {
  constructor(message: string) {
    super("FakeError", message);
  }
}

/**
 * Error to thrown in relation to mock logic.
 */
export class MockError extends RhumError {
  constructor(message: string) {
    super("MockError", message);
  }
}

/**
 * Error to throw in relation to spy logic.
 */
export class SpyError extends RhumError {
  constructor(message: string) {
    super("SpyError", message);
  }
}

/**
 * Error to throw in relation to method verification logic. For example, when a
 * method is being verified that it was called once via
 * `mock.method("doSomething").toBeCalled(1)`.
 */
export class VerificationError extends RhumError {
  #actual_results: string;
  #code_that_threw: string;
  #expected_results: string;

  /**
   * @param message - The error message (to be shown in the stack trace).
   * @param codeThatThrew - An example of the code (or the exact code) that
   * caused this error to be thrown.
   * @param actualResults - A message stating the actual results (to be show in
   * the stack trace).
   * @param expectedResults - A message stating the expected results (to be
   * shown in the stack trace).
   */
  constructor(
    message: string,
    codeThatThrew: string,
    actualResults: string,
    expectedResults: string,
  ) {
    super("VerificationError", message);
    this.#code_that_threw = codeThatThrew;
    this.#actual_results = actualResults;
    this.#expected_results = expectedResults;
    this.#makeStackConcise();
  }

  /**
   * Shorten the stack trace to show exactly what file threw the error. For
   * example:
   *
   * ```ts
   *
   * ```
   */
  #makeStackConcise(): void {
    const ignoredLines = [
      "<anonymous>",
      "deno:runtime",
      "callable_verifier.ts",
      "method_verifier.ts",
      "function_expression_verifier.ts",
      "_mixin.ts",
      ".toBeCalled",
      ".toBeCalledWithArgs",
      ".toBeCalledWithoutArgs",
    ];

    if (!this.stack) {
      return;
    }

    let conciseStackArray = this.stack.split("\n").filter((line: string) => {
      return ignoredLines.filter((ignoredLine: string) => {
        return line.includes(ignoredLine);
      }).length === 0;
    });

    // Sometimes, the error stack will contain the problematic file twice. We
    // only care about showing the problematic file once in this "concise"
    // stack.  In order to check for this, we check to see if the array contains
    // more than 2 values. The first value should be the `VerificationError`
    // message. The second value should be the first instance of the problematic
    // file. Knowing this, we can slice the array to contain only the error
    // message and the first instance of the problematic file.
    if (conciseStackArray.length > 2) {
      conciseStackArray = conciseStackArray.slice(0, 2);
    }

    const conciseStack = conciseStackArray.join("\n");

    const extractedFilenameWithLineAndColumnNumbers = conciseStack.match(
      /\/[a-zA-Z0-9\(\)\[\]_-\d.]+\.ts:\d+:\d+/,
    );

    const [filename, lineNumber] = extractedFilenameWithLineAndColumnNumbers
      ? extractedFilenameWithLineAndColumnNumbers[0].split(":")
      : "";

    let newStack = "\n\n"; // Give spacing when displayed in the console
    newStack += conciseStack;

    newStack += `\n\nVerification Results:`;
    newStack += `\n    ${this.#actual_results}`;
    newStack += `\n    ${this.#expected_results}`;

    if (lineNumber) {
      newStack += `\n\nCheck the above "${
        filename.replace("/", "")
      }" file at/around line ${lineNumber} for code like the following to fix this error:`;
      newStack += `\n    ${this.#code_that_threw}`;
    }
    newStack += "\n\n\n"; // Give spacing when displayed in the console

    this.stack = newStack;
  }
}
