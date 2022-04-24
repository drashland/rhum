import type { MethodOf } from "../types.ts";
import { MethodVerificationError } from "../errors.ts";
import { CallableVerifier } from "./callable_verifier.ts";

/**
 * Test doubles use this class to verify that their methods were called, were
 * called with a number of arguments, were called with specific types of
 * arguments, and so on.
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
   * @param methodName - See this#method_name.
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
      `Method "${this.#method_name}" was not called.`,
      `.verify("${this.#method_name}").toBeCalled(${calls})`,
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

    this.verifyToBeCalledWithArgsTooManyArguments(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" received too many arguments.`,
      `.verify("${this.#method_name}").toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    this.verifyToBeCalledWithArgsTooFewArguments(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" was called with ${actualArgs.length} ${
        actualArgs.length > 1 ? "args" : "arg"
      } instead of ${expectedArgs.length}.`,
      `.verify("${this.#method_name}").toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    this.verifyToBeCalledWithArgsUnexpectedValues(
      actualArgs,
      expectedArgs,
      `Method "${this.#method_name}" received unexpected arg {{ unexpected_arg }} at parameter position {{ parameter_position }}.`,
      `.verify("${this.#method_name}").toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    return this;
  }

  /**
   * Verify that this method was called without arguments.
   *
   * @param actualArgs - The actual args that this method was called with. This
   * method expects it to be an empty array.
   */
  public toBeCalledWithoutArgs(
    actualArgs: unknown[],
  ): this {
    this.verifyToBeCalledWithoutArgs(
      actualArgs,
      `Method "${this.#method_name}" was called with unexpected args.`,
      `.verify("${this.method_name}").toBeCalledWithoutArgs()`,
    );

    return this;
  }
}
