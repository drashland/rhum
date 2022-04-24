import type { MethodOf } from "./types.ts";
import { MethodVerificationError } from "./errors.ts";

/**
 * Test doubles use this class to verify that their methods were called, were
 * called with a number of arguments, were called with specific types of
 * arguments, and so on.
 */
export class MethodVerifier<OriginalObject> {
  /**
   * The name of the method using this class. This is only used for display in
   * error stack traces if this class throws.
   */
  #method_name: MethodOf<OriginalObject> | null;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - See this#method_name.
   */
  constructor(methodName?: MethodOf<OriginalObject>) {
    this.#method_name = methodName ?? null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get method_name(): MethodOf<OriginalObject> | null {
    return this.#method_name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Verify that the actual calls match the expected calls.
   *
   * @param actualCalls - The number of actual calls.
   * @param expectedCalls - The number of calls expected. If this is -1, then
   * just verify that the method was called without checking how many times it
   * was called.
   * @param codeThatThrew - See `MethodVerificationError` constructor's
   * `codeThatThrew` param.
   */
  public toBeCalled(
    actualCalls: number,
    expectedCalls: number,
    codeThatThrew: string,
  ): void {
    if (expectedCalls === -1) {
      if (actualCalls <= 0) {
        throw new MethodVerificationError(
          `Method "${this.#method_name}" received incorrect number of calls.`,
          codeThatThrew,
          `Expected calls -> 1 (or more)`,
          `Actual calls   -> 0`,
        );
      }
      return;
    }

    if (actualCalls !== expectedCalls) {
      throw new MethodVerificationError(
        `Method "${this.#method_name}" received incorrect number of calls.`,
        codeThatThrew,
        `Expected calls -> ${expectedCalls}`,
        `Actual calls   -> ${actualCalls}`,
      );
    }
  }

  /**
   * Verify that this method was called with the given args.
   *
   * @param actualArgs - The actual args that this method was called with.
   * @param expectedArgs - The args this method is expected to have received.
   * @param codeThatThrew - See `MethodVerificationError` constructor's
   * `codeThatThrew` param.
   */
  public toBeCalledWithArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    codeThatThrew: string,
  ): void {
    const expectedArgsAsString = JSON.stringify(expectedArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");
    const actualArgsAsString = JSON.stringify(actualArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");

    if (expectedArgs.length != actualArgs.length) {
      throw new MethodVerificationError(
        `Method "${this.#method_name}" received incorrect number of arguments.`,
        codeThatThrew,
        `Expected args -> [${expectedArgsAsString}]`,
        `Actual args   -> [${actualArgsAsString}]`,
      );
    }

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

        const actualArgType = this.#getArgType(actualArgs[index]);
        const expectedArgType = this.#getArgType(arg);

        throw new MethodVerificationError(
          `Method "${this.#method_name}" received incorrect argument type at parameter position ${parameterPosition}.`,
          `.method("${this.#method_name}").toBeCalledWithArgs(...)`,
          `Expected arg type -> ${arg}${expectedArgType}`,
          `Actual arg type   ->   ${actualArgs[index]}${actualArgType}`,
        );
      }
    });

    actualArgs.every((arg: unknown) => {
      return expectedArgs.indexOf(arg) >= 0;
    });
  }

  /**
   * Verify that this method was called without arguments.
   *
   * @param actualArgs - The actual args that this method was called with. This
   * method expects it to be an empty array.
   * @param codeThatThrew - See `MethodVerificationError` constructor's
   * `codeThatThrew` param.
   */
  public toBeCalledWithoutArgs(
    actualArgs: unknown[],
    codeThatThrew: string,
  ): void {
    const actualArgsAsString = JSON.stringify(actualArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");

    if (actualArgs.length > 0) {
      throw new MethodVerificationError(
        `Method "${this.#method_name}" received incorrect number of arguments.`,
        codeThatThrew,
        `Expected args -> none`,
        `Actual args   -> [${actualArgsAsString}]`,
      );
    }
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

  /**
   * Get the arg type in string format for the given arg.
   *
   * @param arg - The arg to evaluate.
   *
   * @returns The arg type surrounded by brackets (e.g., <type>).
   */
  #getArgType(arg: unknown): string {
    if (arg && typeof arg === "object") {
      if ("prototype" in arg) {
        return "<" + Object.getPrototypeOf(arg) + ">";
      }
      return "<object>";
    }

    return "<" + typeof arg + ">";
  }
}
