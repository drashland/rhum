import type { MethodOf } from "../types.ts";
import type { IMethodVerification, ISpyStub } from "../interfaces.ts";
import { MethodVerifier } from "../method_verifier.ts";

class SpyStubFunctionExpressionVerifier<OriginalObject> {
  #calls: number;
  #args: unknown[];
  #verifier: MethodVerifier<OriginalObject>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param calls - See `this.#calls`.
   * @param args - See `this.#args`.
   */
  constructor(
    calls: number,
    args: unknown[],
  ) {
    this.#calls = calls;
    this.#args = args;
    this.#verifier = new MethodVerifier();
  }
  public toBeCalled(expectedCalls?: number): this {
    this.#verifier.toBeCalled(
      this.#calls,
      expectedCalls ?? -1,
      `.verify().toBeCalled()`,
    );
    return this;
  }
  public toBeCalledWithArgs(...expectedArgs: unknown[]): this {
    this.#verifier.toBeCalledWithArgs(
      this.#args,
      expectedArgs,
      `.verify().toBeCalledWithArgs()`,
    );
    return this;
  }
  public toBeCalledWithoutArgs() {
    return this;
  }
}

/**
 * The `SpyStub` class' verifier. It extends the `MethodVerifier` just to use
 * its verification methods. In order to properly show stack traces in the
 * context of the `SpyStub`, this verifier is used to provide the
 * `codeThatThrew` argument to the `MethodVerifier` class' methods.
 */
class SpyStubMethodVerifier<
  OriginalObject,
> extends MethodVerifier<OriginalObject> {
  /**
   * Property to hold the arguments this method was called with.
   */
  #args: unknown[];

  /**
   * Property to hold the number of time this method was called.
   */
  #calls: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - See `MethodVerifier#method_name`.
   * @param calls - See `this.#calls`.
   * @param args - See `this.#args`.
   */
  constructor(
    methodName: MethodOf<OriginalObject>,
    calls: number,
    args: unknown[],
  ) {
    super(methodName);
    this.#calls = calls;
    this.#args = args;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - GETTERS / SETTERS /////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get args(): unknown[] {
    return this.#args;
  }

  get calls(): number {
    return this.#calls;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Verify that this method was called. Optionally, verify that it was called a
   * specific number of times.
   *
   * @param expectedCalls - (Optional) The number of calls this method is
   * expected to have received. If not provided, then the verification process
   * will assume "just verify that the method was called" instead of verifying
   * that it was called a specific number of times.
   *
   * @returns this To allow method chaining.
   */
  public toBeCalled(expectedCalls?: number): this {
    const calls = expectedCalls ?? "";

    super.toBeCalled(
      this.calls,
      expectedCalls ?? -1,
      `.verify("${this.method_name}").toBeCalled(${calls})`,
    );

    return this;
  }

  /**
   * Verify that this method was called with the following arguments.
   *
   * @param expectedArgs - The expected arguments that this method should be
   * called with.
   *
   * @returns this To allow method chaining.
   */
  public toBeCalledWithArgs(...expectedArgs: unknown[]): this {
    // Make a user friendly version of the expected args. This will be displayed
    // in the error stack trace the parent class throws. For example:
    //
    //    [true, false, "hello"] -> true, false, "hello"
    //
    // The above would result in the following stack trace message:
    //
    //     .toBeCalledWith(true, false, "hello")
    //
    // If we do not do this, then the following stack trace message will show,
    // which is not really clear because the args are in an array and the
    // "hello" string has its quotes missing:
    //
    //     .toBeCalledWith([true, false, hello])
    //
    const expectedArgsAsString = JSON.stringify(expectedArgs)
      .slice(1, -1)
      .replace(/,/g, ", ");

    super.toBeCalledWithArgs(
      this.args,
      expectedArgs,
      `.verify().toBeCalledWithArgs(${expectedArgsAsString})`,
    );

    return this;
  }

  /**
   * Verify that this method was called without arguments.
   *
   * @returns this To allow method chaining.
   */
  public toBeCalledWithoutArgs(): this {
    super.toBeCalledWithoutArgs(
      this.args,
      `.verify().toBeCalledWithoutArgs()`,
    );

    return this;
  }
}

/**
 * Builder to help build the following:
 *
 *   - Spies for object methods (e.g., `someObject.someMethod()`).
 *   - Spies for function expressions (e.g., `const hello = () => "world"`).
 */
export class SpyStubBuilder<OriginalObject, ReturnValue> {
  /**
   * Property to hold the number of time this method was called.
   */
  #calls = 0;

  /**
   * Property to hold the arguments this method was last called with.
   */
  #last_called_with_args: unknown[] = [];

  /**
   * The name of the method this spy is replacing.
   */
  #method?: MethodOf<OriginalObject>;

  /**
   * The original object.
   */
  #original: OriginalObject;

  /**
   * (Optional) The return value to return when the method this spy replaces is
   * called.
   */
  #return_value?: ReturnValue;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param original - The original object containing the method to spy on.
   * @param method - The method to spy on.
   * @param returnValue (Optional) Specify the return value of the method.
   * Defaults to "stubbed".
   */
  constructor(original: OriginalObject) {
    this.#original = original;
  }

  public method(method: MethodOf<OriginalObject>): this {
    this.#method = method;
    return this;
  }

  public returnValue(returnValue: ReturnValue): this {
    this.#return_value = returnValue;
    return this;
  }

  public createForObjectMethod(): ISpyStub {
    this.#stubOriginalMethodWithTracking();

    Object.defineProperty(this, "verify", {
      value: () =>
        new SpyStubMethodVerifier(
          this.#method!,
          this.#calls,
          this.#last_called_with_args,
        ),
    });

    return this as unknown as ISpyStub & { verify: IMethodVerification };
  }

  public createForFunctionExpression(): ISpyStub {
    const ret = (...args: unknown[]) => {
      this.#calls++;
      this.#last_called_with_args = args;
      return this.#return_value ?? "spy-stubbed";
    };

    ret.verify = () =>
      new SpyStubFunctionExpressionVerifier(
        this.#calls,
        this.#last_called_with_args,
      );
    return ret;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Stub the original to have tracking.
   */
  #stubOriginalMethodWithTracking(): void {
    if (!this.#method) {
      throw new Error(
        `Cannot create a spy stub for an object's method without providing the object and method name.`,
      );
    }

    Object.defineProperty(this.#original, this.#method, {
      value: (...args: unknown[]) => {
        this.#calls++;
        this.#last_called_with_args = args;

        return this.#return_value !== undefined
          ? this.#return_value
          : "stubbed";
      },
      writable: true,
    });
  }
}
