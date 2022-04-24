import { MethodVerificationError } from "../errors.ts";
import { CallableVerifier } from "./callable_verifier.ts";

/**
 * Test doubles use this class to verify that their methods were called, were
 * called with a number of arguments, were called with specific types of
 * arguments, and so on.
 */
export class FunctionExpressionVerifier extends CallableVerifier {
  /**
   * The name of this function.
   */
  #name: string;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param name - See this#name.
   */
  constructor(name: string) {
    super();
    this.#name = name ?? null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get name(): string {
    return this.#name;
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
   */
  protected toBeCalled(
    actualCalls: number,
    expectedCalls?: number,
  ): this {
    const calls = expectedCalls ?? "";
    this.verifyToBeCalled(
      actualCalls,
      expectedCalls,
      `Function "${this.#name}" was not called.`,
      `.verify().toBeCalled(${calls})`,
    );

    return this;
  }

  /**
   * Verify that this method was called with the given args.
   *
   * @param actualArgs - The actual args that this method was called with.
   * @param expectedArgs - The args this method is expected to have received.
   * @param codeThatThrew - See `MethodVerificationError` constructor's
   * `codeThatThrew` param.
   */
  protected toBeCalledWithArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
  ): this {
    const expectedArgsAsString = this.argsAsString(expectedArgs);

    this.verifyToBeCalledWithArgsTooManyArguments(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" received too many arguments.`,
      `.verify().toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    this.verifyToBeCalledWithArgsTooFewArguments(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" was called with ${actualArgs.length} ${
        actualArgs.length > 1 ? "args" : "arg"
      } instead of ${expectedArgs.length}.`,
      `.verify().toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    this.verifyToBeCalledWithArgsUnexpectedValues(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" received unexpected arg {{ unexpected_arg }} at parameter position {{ parameter_position }}.`,
      `.verify().toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    return this;
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
        `Function "${this.#name}" was called with args when expected to receive no args.`,
        codeThatThrew,
        `Expected -> (no args)`,
        `Actual   -> (${actualArgsAsString})`,
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
}
