import type { MethodOf } from "../types.ts";
import type {
  IFunctionExpressionVerifier,
  IMethodVerifier,
  ISpyStubFunctionExpression,
  ISpyStubMethod,
} from "../interfaces.ts";
import { MethodVerifier } from "../verifiers/method_verifier.ts";
import { FunctionExpressionVerifier } from "../verifiers/function_expression_verifier.ts";

/**
 * This class helps verifying function expression calls. It's a wrapper for
 * `FunctionExpressionVerifier` only to make the verification methods (e.g.,
 * `toBeCalled()`) have a shorter syntax -- allowing the user of this library to
 * only pass in expected calls as opposed to expected calls and actual calls.
 */
class SpyStubFunctionExpressionVerifier extends FunctionExpressionVerifier {
  /**
   * See `IFunctionExpressionVerifier.args`.
   */
  #args: unknown[];

  /**
   * See `IFunctionExpressionVerifier.calls`.
   */
  #calls: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param name - See `FunctionExpressionVerifier.#name`.
   * @param calls - See `IFunctionExpressionVerifier.calls`.
   * @param args - See `IFunctionExpressionVerifier.args`.
   */
  constructor(
    name: string,
    calls: number,
    args: unknown[],
  ) {
    super(name);
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
   * See `IVerifier.toBeCalled()`.
   */
  public toBeCalled(expectedCalls?: number): this {
    return super.toBeCalled(
      this.#calls,
      expectedCalls,
    );
  }

  /**
   * See `IVerifier.toBeCalledWithArgs()`.
   */
  public toBeCalledWithArgs(...expectedArgs: unknown[]): this {
    return super.toBeCalledWithArgs(
      this.#args,
      expectedArgs,
    );
  }

  /**
   * See `IVerifier.toBeCalledWithoutArgs()`.
   */
  public toBeCalledWithoutArgs() {
    super.toBeCalledWithoutArgs(
      this.#args,
    );
    return this;
  }
}

/**
 * This class helps verifying object method calls. It's a wrapper for
 * `MethodVerifier` only to make the verification methods (e.g., `toBeCalled()`)
 * have a shorter syntax -- allowing the user of this library to only pass in
 * expected calls as opposed to expected calls and actual calls.
 */
class SpyStubMethodVerifier<OriginalObject>
  extends MethodVerifier<OriginalObject> {
  /**
   * See `IMethodVerifier.args`.
   */
  #args: unknown[];

  /**
   * See `IMethodVerifier.calls`.
   */
  #calls: number;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - See `MethodVerifier.method_name`.
   * @param calls - See `IMethodVerifier.calls`.
   * @param args - See `IMethodVerifier.args`.
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
   * See `IVerifier.toBeCalled()`.
   */
  public toBeCalled(expectedCalls?: number): this {
    return super.toBeCalled(
      this.calls,
      expectedCalls,
    );
  }

  /**
   * See `IVerifier.toBeCalledWithArgs()`.
   */
  public toBeCalledWithArgs(...expectedArgs: unknown[]): this {
    return super.toBeCalledWithArgs(
      this.args,
      expectedArgs,
    );
  }

  /**
   * See `IVerifier.toBeCalledWithoutArgs()`.
   */
  public toBeCalledWithoutArgs(): this {
    return super.toBeCalledWithoutArgs(
      this.args,
    );
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
   * Property to hold the args this method was last called with.
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Set the name of the method this spy stub is stubbing.
   *
   * @param method - The name of the method. This must be a method of the
   * original object.
   *
   * @returns `this` To allow method chaining.
   */
  public method(method: MethodOf<OriginalObject>): this {
    this.#method = method;
    return this;
  }

  /**
   * Set the return value of this spy stub.
   *
   * @param returnValue - The value to return when this spy stub is called.
   *
   * @returns `this` To allow method chaining.
   */
  public returnValue(returnValue: ReturnValue): this {
    this.#return_value = returnValue;
    return this;
  }

  /**
   * Create this spy stub for an object's method.
   *
   * @returns `this` behind the `ISpyStubMethod` interface so that only
   * `ISpyStubMethod` data members can be seen/called.
   */
  public createForObjectMethod(): ISpyStubMethod {
    this.#stubOriginalMethodWithTracking();

    Object.defineProperty(this, "verify", {
      value: () =>
        new SpyStubMethodVerifier(
          this.#method!,
          this.#calls,
          this.#last_called_with_args,
        ),
    });

    return this as unknown as ISpyStubMethod & { verify: IMethodVerifier };
  }

  /**
   * Create this spy stub for a function expression.
   *
   * @returns `this` behind the `ISpyStubFunctionExpression` interface so that
   * only `ISpyStubFunctionExpression` data members can be seen/called.
   */
  public createForFunctionExpression(): ISpyStubFunctionExpression {
    const ret = (...args: unknown[]) => {
      this.#calls++;
      this.#last_called_with_args = args;
      return this.#return_value ?? "spy-stubbed";
    };

    ret.verify = (): IFunctionExpressionVerifier =>
      new SpyStubFunctionExpressionVerifier(
        (this.#original as unknown as { name: string }).name,
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
          : "spy-stubbed";
      },
      writable: true,
    });
  }
}
