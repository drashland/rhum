import { CallableVerifier } from "./callable_verifier.ts";

/**
 * Test doubles use this class to verify that their methods were called, were
 * called with a number of args, were called with specific types of args, and so
 * on.
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
   * @param name - See `this.#name`.
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
  public toBeCalled(
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
   */
  public toBeCalledWithArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
  ): this {
    const expectedArgsAsString = this.argsAsString(expectedArgs);
    const codeThatThrew =
      `.verify().toBeCalledWithArgs(${expectedArgsAsString})`;

    this.verifyToBeCalledWithArgsTooManyArgs(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" received too many args.`,
      codeThatThrew,
    );

    this.verifyToBeCalledWithArgsTooFewArgs(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" was called with ${actualArgs.length} {{ arg_noun }} instead of ${expectedArgs.length}.`,
      codeThatThrew,
    );

    this.verifyToBeCalledWithArgsUnexpectedValues(
      actualArgs,
      expectedArgs,
      `Function "${this.#name}" received unexpected arg {{ unexpected_arg }} at parameter position {{ parameter_position }}.`,
      codeThatThrew,
    );

    return this;
  }

  /**
   * Verify that this method was called without args.
   *
   * @param actualArgs - The actual args that this method was called with. This
   * method expects it to be an empty array.
   */
  public toBeCalledWithoutArgs(
    actualArgs: unknown[],
  ): this {
    return super.verifyToBeCalledWithoutArgs(
      actualArgs,
      `Function "${this.#name}" was called with args when expected to receive no args.`,
      `.verify().toBeCalledWithoutArgs()`,
    );
  }
}
