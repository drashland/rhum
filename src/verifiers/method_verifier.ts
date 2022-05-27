import type { MethodOf } from "../types.ts";
import { CallableVerifier } from "./callable_verifier.ts";

/**
 * Test doubles use this class to verify that their methods were called, were
 * called with a number of args, were called with specific types of args, and so
 * on.
 */
export class MethodVerifier<OriginalObject> extends CallableVerifier {
  /**
   * The name of the method using this class. This is only used for display in
   * error stack traces if this class throws.
   */
  #method_name: MethodOf<OriginalObject> | null;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - See `this.#method_name`.
   */
  constructor(methodName?: MethodOf<OriginalObject>) {
    super();
    this.#method_name = methodName ?? null;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get method_name(): MethodOf<OriginalObject> | null {
    return this.#method_name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Verify that the actual calls match the expected calls.
   *
   * @param actualCalls - The number of actual calls.
   * @param expectedCalls - The number of calls expected. If this is -1, then
   * just verify that the method was called without checking how many times it
   * was called.
   * @param codeThatThrew - (Optional) A custom display of code that throws.
   *
   * @returns `this` To allow method chaining.
   */
  public toBeCalled(
    actualCalls: number,
    expectedCalls?: number,
    codeThatThrew?: string,
  ): this {
    const calls = expectedCalls ?? "";
    codeThatThrew = codeThatThrew ??
      `.verify("${this.#method_name}").toBeCalled(${calls})`;

    const errorMessage = expectedCalls
      ? `Method "${this.#method_name}" was not called ${calls} time(s).`
      : `Method "${this.#method_name}" was not called.`;

    this.verifyToBeCalled(
      actualCalls,
      expectedCalls,
      errorMessage,
      codeThatThrew,
    );

    return this;
  }

  /**
   * Verify that this method was called with the given args.
   *
   * @param actualArgs - The actual args that this method was called with.
   * @param expectedArgs - The args this method is expected to have received.
   * @param codeThatThrew - (Optional) A custom display of code that throws.
   *
   * @returns `this` To allow method chaining.
   */
  public toBeCalledWithArgs(
    actualArgs: unknown[],
    expectedArgs: unknown[],
    codeThatThrew?: string,
  ): this {
    const expectedArgsAsString = this.argsAsString(expectedArgs);
    codeThatThrew = codeThatThrew ??
      `.verify("${this.#method_name}").toBeCalledWithArgs(${expectedArgsAsString})`;

    this.verifyToBeCalledWithArgsTooManyArgs(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" received too many args.`,
      codeThatThrew,
    );

    this.verifyToBeCalledWithArgsTooFewArgs(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" was called with ${actualArgs.length} arg(s) instead of ${expectedArgs.length}.`,
      codeThatThrew,
    );

    this.verifyToBeCalledWithArgsUnexpectedValues(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" received unexpected arg {{ unexpected_arg }} at parameter position {{ parameter_position }}.`,
      codeThatThrew,
    );

    return this;
  }

  /**
   * Verify that this method was called without args.
   *
   * @param actualArgs - The actual args that this method was called with. This
   * method expects it to be an empty array.
   * @param codeThatThrew - (Optional) A custom display of code that throws.
   *
   * @returns `this` To allow method chaining.
   */
  public toBeCalledWithoutArgs(
    actualArgs: unknown[],
    codeThatThrew?: string,
  ): this {
    codeThatThrew = codeThatThrew ??
      `.verify("${this.method_name}").toBeCalledWithoutArgs()`;

    this.verifyToBeCalledWithoutArgs(
      actualArgs,
      `Method "${this.#method_name}" was called with args when expected to receive no args.`,
      codeThatThrew,
    );

    return this;
  }
}
