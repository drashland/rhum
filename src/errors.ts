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
 * Error to throw in relation to method verification logic. For example, when a
 * method is being verified that it was called once via
 * `mock.method("doSomething").toBeCalled(1)`.
 */
export class MethodVerificationError extends RhumError {
  #actual_results: string;
  #code_that_threw: string;
  #expected_results: string;

  /**
   * @param message - The error message.
   */
  constructor(
    message: string,
    codeThatThrew: string,
    actualResults: string,
    expectedResults: string,
  ) {
    super("MethodVerificationError", message);
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
      "method_verifier.ts",
      "_mixin.ts",
    ];

    if (!this.stack) {
      return;
    }

    const conciseStack = this.stack.split("\n").filter((line: string) => {
      try {
        return ignoredLines.filter((ignoredLine: string) => {
          return line.includes(ignoredLine);
        }).length === 0;
      } catch (_error) {
        // Do nothing. If we can't filter because the `ignoredLines.filter()`
        // call errored out. Whatev... we just move on and show a full stack
        // trace. No biggie.
      }
      return false;
    }).join("\n");

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
      newStack += `\n\nCheck the above '${
        filename.replace("/", "")
      }' file at/around line ${lineNumber} for the following code to fix this error:`;
      newStack += `\n    ${this.#code_that_threw}`;
    }
    newStack += "\n\n\n"; // Give spacing when displayed in the console

    this.stack = newStack;
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