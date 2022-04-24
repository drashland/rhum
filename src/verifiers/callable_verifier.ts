import { MethodVerificationError } from "../errors.ts";

export class CallableVerifier {
  /**
   * Make a user friendly version of the expected args. This will be displayed
   * in the `MethodVerificationError` stack trace. For example:
   *
   *    [true, false, "hello"] -> true, false, "hello"
   *
   * The above would result in the following stack trace message:
   *
   *     .toBeCalledWith(true, false, "hello")
   *
   * If we do not do this, then the following stack trace message will show,
   * which is not really clear because the args are in an array and the
   * "hello" string has its quotes missing:
   *
   *     .toBeCalledWith([true, false, hello])
   */
  protected argsAsString(expectedArgs: unknown[]): string {
    return JSON.stringify(expectedArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");
  }

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

  protected verifyToBeCalled(
    actualCalls: number,
    expectedCalls: number | undefined,
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    if (!expectedCalls) {
      if (actualCalls <= 0) {
        throw new MethodVerificationError(
          errorMessage,
          codeThatThrew,
          `Expected calls -> 1 (or more)`,
          `Actual calls   -> 0`,
        );
      }
      return;
    }

    if (actualCalls !== expectedCalls) {
      throw new MethodVerificationError(
        errorMessage,
        codeThatThrew,
        `Expected calls -> ${expectedCalls}`,
        `Actual calls   -> ${actualCalls}`,
      );
    }
  }

  protected verifyToBeCalledWithArgsTooManyArguments(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    if (expectedArgs.length > actualArgs.length) {
      throw new MethodVerificationError(
        errorMessage,
        codeThatThrew,
        `Expected args -> ${this.argsAsStringWithTypes(expectedArgs)}`,
        `Actual args   -> ${
          actualArgs.length > 0
            ? this.argsAsStringWithTypes(actualArgs)
            : "(no args)"
        }`,
      );
    }
  }

  protected verifyToBeCalledWithArgsTooFewArguments(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    if (expectedArgs.length < actualArgs.length) {
      throw new MethodVerificationError(
        errorMessage,
        codeThatThrew,
        `Expected call -> (${this.argsAsStringWithTypes(expectedArgs)})`,
        `Actual call   -> (${this.argsAsStringWithTypes(actualArgs)})`,
      );
    }
  }

  protected verifyToBeCalledWithArgsUnexpectedValues(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    expectedArgs.forEach((arg: unknown, index: number) => {
      const parameterPosition = index + 1;
      if (actualArgs[index] !== arg) {
        if (this.#comparingArrays(actualArgs[index], arg)) {
          const match = this.#compareArrays(
            actualArgs[index] as unknown[],
            arg as unknown[],
          );
          if (match) {
            return;
          }
        }

        const unexpectedArg = `\`${arg}${this.getArgType(arg)}\``;

        throw new MethodVerificationError(
          errorMessage
            .replace("{{ unexpected_arg }}", unexpectedArg)
            .replace("{{ parameter_position }}", parameterPosition.toString()),
          codeThatThrew,
          `Expected call -> (${this.argsAsStringWithTypes(expectedArgs)})`,
          `Actual call   -> (${this.argsAsStringWithTypes(actualArgs)})`,
        );
      }
    });
  }

  protected verifyToBeCalledWithoutArgs(
    actualArgs: unknown[],
    errorMessage: string,
    codeThatThrew: string,
  ): void {
    const actualArgsAsString = JSON.stringify(actualArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");

    if (actualArgs.length > 0) {
      throw new MethodVerificationError(
        errorMessage,
        codeThatThrew,
        `Expected args -> (no args)`,
        `Actual args   -> (${actualArgsAsString})`,
      );
    }
  }

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
