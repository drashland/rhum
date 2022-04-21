import type { MethodOf } from "./types.ts";
import { MethodVerificationError } from "./errors.ts";

export class MethodVerifier<OriginalObject> {
  #method_name: MethodOf<OriginalObject>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Verify that the actual calls match the expected calls.
   *
   * @param expectedCalls - (optional) The number of calls expected. If this is
   * not specified, then this method checks that the actual calls is greater
   * than one -- denoting that there was call.
   */
  public toBeCalled(
    actualCalls: number,
    expectedCalls?: number,
  ): void {
    if (!expectedCalls) {
      if (actualCalls <= 0) {
        throw new MethodVerificationError(
          `Method "${this.#method_name}" received incorrect number of calls.`,
          `.method("${this.#method_name}").toBeCalled(${expectedCalls})`,
          `Expected calls -> 1 (or more)`,
          `Actual calls   ->   0`,
        );
      }
    }

    if (actualCalls !== expectedCalls) {
      throw new MethodVerificationError(
        `Method "${this.#method_name}" received incorrect number of calls.`,
        `.method("${this.#method_name}").toBeCalled(${expectedCalls})`,
        `Expected calls -> ${expectedCalls}`,
        `Actual calls   -> ${actualCalls}`,
      );
    }
  }

  /**
   * Verify that the actual arguments match the expected arguments.
   */
  public toBeCalledWith(
    actualArgs: unknown[],
    expectedArgs: unknown[],
  ): void {
    if (expectedArgs.length != actualArgs.length) {
      throw new MethodVerificationError(
        `Method "${this.#method_name}" received incorrect number of arguments.`,
        `.method("${this.#method_name}").toBeCalledWith(...)`,
        `Expected args -> [${expectedArgs.join(", ")}]`,
        `Actual args   -> [${actualArgs.join(", ")}]`,
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
          `.method("${this.#method_name}").toBeCalledWith(...)`,
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
}
