import { VerificationError } from "../errors.ts";

export class CallableVerifier {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Make a user friendly version of the args. This is for display in the
   * `VerificationError` stack trace. For example, the original args ...
   *
   *     [true, false, "hello"]
   *
   * ... becomes ...
   *
   *     true, false, "hello"
   *
   * The above will ultimately end up in stack trace messages like:
   *
   *     .toBeCalledWith(true, false, "hello")
   *
   * If we do not do this, then the following stack trace message will show,
   * which is not really clear because the args are in an array and the
   * "hello" string has its quotes missing:
   *
   *     .toBeCalledWith([true, false, hello])
   *
   * @param args - The args to convert to a string.
   *
   * @returns The args as a string.
   */
  protected argsAsString(args: unknown[]): string {
    return JSON.stringify(args)
      .slice(1, -1)
      .replace(/,/g, ", ");
  }

  /**
   * Same as `this.argsAsString()`, but add typings to the args. For example:
   *
   *     [true, false, "hello"]
   *
   * ... becomes ...
   *
   *     true<boolean>, false<boolean>, "hello"<string>
   *
   * @param args - The args to convert to a string.
   *
   * @returns The args as a string with typings.
   */
  protected argsAsStringWithTypes(args: unknown[]): string {
    return args.map((arg: unknown) => {
      return `${JSON.stringify(arg)}${this.getArgType(arg)}`;
    }).join(", ");
  }

  /**
   * Get the arg type in string format for the given arg.
   *
   * @param arg - The arg to evaluate.
   *
   * @returns The arg type surrounded by brackets (e.g., <type>).
   */
  protected getArgType(arg: unknown): string {
    if (arg && typeof arg === "object") {
      if ("prototype" in arg) {
        return "<" + Object.getPrototypeOf(arg) + ">";
      }
      return "<object>";
    }

    return "<" + typeof arg + ">";
  }

  /**
   * Verify that the number of actual calls matches the number of expected
   * calls.
   *
   * @param actualCalls - The actual number of calls.
   * @param expectedCalls - The expected number of calls.
   * @param errorMessage - The error message to show in the stack trace.
   * @param codeThatThrew - The code using this verification.
   *
   * @returns `this` To allow method chaining.
   */
  protected verifyToBeCalled(
    actualCalls: number,
    expectedCalls: number | undefined,
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    // If expected calls were not specified, then just check that the method was
    // called at least once
    if (!expectedCalls) {
      if (actualCalls > 0) {
        return;
      }

      throw new VerificationError(
        errorMessage,
        codeThatThrew,
        `Actual calls   -> 0`,
        `Expected calls -> 1 (or more)`,
      );
    }

    // If we get here, then we gucci. No need to process further.
    if (actualCalls === expectedCalls) {
      return;
    }

    // If we get here, then the actual number of calls do not match the expected
    // number of calls, so we should throw an error
    throw new VerificationError(
      errorMessage,
      codeThatThrew,
      `Actual calls   -> ${actualCalls}`,
      `Expected calls -> ${expectedCalls}`,
    );
  }

  /**
   * Verify that the number of expected args is not more than the actual args.
   *
   * @param actualArgs - The actual args.
   * @param expectedArgs - The expected args.
   * @param errorMessage - The error message to show in the stack trace.
   * @param codeThatThrew - The code using this verification.
   */
  protected verifyToBeCalledWithArgsTooManyArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    if (expectedArgs.length > actualArgs.length) {
      throw new VerificationError(
        errorMessage,
        codeThatThrew,
        `Actual args   -> ${
          actualArgs.length > 0
            ? `(${this.argsAsStringWithTypes(actualArgs)})`
            : "(no args)"
        }`,
        `Expected args -> ${this.argsAsStringWithTypes(expectedArgs)}`,
      );
    }
  }

  /**
   * Verify that the number of expected args is not less than the actual args.
   *
   * @param actualArgs - The actual args.
   * @param expectedArgs - The expected args.
   * @param errorMessage - The error message to show in the stack trace.
   * @param codeThatThrew - The code using this verification.
   */
  protected verifyToBeCalledWithArgsTooFewArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    if (expectedArgs.length < actualArgs.length) {
      throw new VerificationError(
        errorMessage,
        codeThatThrew,
        `Actual call   -> (${this.argsAsStringWithTypes(actualArgs)})`,
        `Expected call -> (${this.argsAsStringWithTypes(expectedArgs)})`,
      );
    }
  }

  /**
   * Verify that the expected args match the actual args by value and type.
   *
   * @param actualArgs - The actual args.
   * @param expectedArgs - The expected args.
   * @param errorMessage - The error message to show in the stack trace.
   * @param codeThatThrew - The code using this verification.
   */
  protected verifyToBeCalledWithArgsUnexpectedValues(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    expectedArgs.forEach((arg: unknown, index: number) => {
      const parameterPosition = index + 1;

      // Args match? We gucci.
      if (actualArgs[index] === arg) {
        return;
      }

      // Args do not match? Check if we are comparing arrays and see if they
      // match
      if (this.#comparingArrays(actualArgs[index], arg)) {
        const match = this.#compareArrays(
          actualArgs[index] as unknown[],
          arg as unknown[],
        );
        // Arrays match? We gucci.
        if (match) {
          return;
        }
      }

      // Alright, we have an unexpected arg, so throw an error
      const unexpectedArg = `\`${arg}${this.getArgType(arg)}\``;

      throw new VerificationError(
        errorMessage
          .replace("{{ unexpected_arg }}", unexpectedArg)
          .replace("{{ parameter_position }}", parameterPosition.toString()),
        codeThatThrew,
        `Actual call   -> (${this.argsAsStringWithTypes(actualArgs)})`,
        `Expected call -> (${this.argsAsStringWithTypes(expectedArgs)})`,
      );
    });
  }

  /**
   * Verify that the no args were used.
   *
   * @param actualArgs - The actual args (if any).
   * @param errorMessage - The error message to show in the stack trace.
   * @param codeThatThrew - The code using this verification.
   */
  protected verifyToBeCalledWithoutArgs(
    actualArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): this {
    const actualArgsAsString = JSON.stringify(actualArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");

    if (actualArgs.length === 0) {
      return this;
    }

    // One arg? Say "arg". More than one arg? Say "args". Yaaaaaarg.
    const argNoun = actualArgs.length > 1 ? "args" : "arg";

    throw new VerificationError(
      errorMessage,
      codeThatThrew.replace("{{ arg_noun }}", argNoun),
      `Actual args   -> (${actualArgsAsString})`,
      `Expected args -> (no args)`,
    );
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Check that the given arrays are exactly equal.
   *
   * @param a - The first array.
   * @param b - The second array (which should match the first array).
   *
   * @returns True if the arrays match, false if not.
   */
  #compareArrays(a: unknown[], b: unknown[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  /**
   * Are we comparing arrays?
   *
   * @param obj1 - Object to evaluate if it is an array.
   * @param obj2 - Object to evaluate if it is an array.
   *
   * @returns True if yes, false if no.
   */
  #comparingArrays(obj1: unknown, obj2: unknown): boolean {
    return Array.isArray(obj1) && Array.isArray(obj2);
  }
}
