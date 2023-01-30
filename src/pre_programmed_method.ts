import type { IError, IMethodChanger } from "./interfaces.ts";
import type { MethodOf } from "./types.ts";

type ReturnValueFunction<ReturnValue> = (...args: unknown[]) => ReturnValue;

/**
 * Class that allows to be a "stand-in" for a method. For example, when used in
 * a mock object, the mock object can replace methods with pre-programmed
 * methods (using this class), and have a system under test use the
 * pre-programmed methods.
 */
export class PreProgrammedMethod<OriginalObject, ReturnValue>
  implements IMethodChanger<ReturnValue> {
  /**
   * The original name of the method being pre-programmed.
   */
  #method_name: MethodOf<OriginalObject>;

  /**
   * The object containing the pre-programmed setup details. This object is what
   * runs under the hood to provide the pre-programmed expectation.
   */
  #method_setup?: MethodSetup<OriginalObject>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - The name of the method to program. Must be a method of
   * the original object in question.
   */
  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC  ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // public willCall(action: (...args: unknown[]) => ReturnValue): void {
  //   this.#method_setup = new MethodSetupCallsCallback(
  //     this.#method_name,
  //     action,
  //   );
  // }

  // public willReturn(action: (...args: unknown[]) => ReturnValue): void;

  public willReturn(
    returnValue: ReturnValue | ReturnValueFunction<ReturnValue>,
  ): void {
    if (typeof returnValue === "function") {
      this.#method_setup = new MethodSetupCallsCallback(
        this.#method_name,
        returnValue as ReturnValueFunction<ReturnValue>,
      );
      return;
    }

    this.#method_setup = new MethodSetupReturnsStaticValue(
      this.#method_name,
      returnValue,
    );
  }

  public willThrow(error: IError): void {
    this.#method_setup = new MethodSetupThrowsError<OriginalObject>(
      this.#method_name,
      error,
    );
  }

  /**
   * Run this method.
   * @param args
   * @returns
   */
  public run(args?: unknown[]): unknown {
    if (!this.#method_setup) {
      throw new Error(
        `Pre-programmed method "${
          String(this.#method_name)
        }" does not have a return value.`,
      );
    }
    return this.#method_setup?.run(args);
  }
}

enum MethodSetupExpectation {
  ExecuteCallback,
  ReturnStaticValue,
  ThrowError,
}

/**
 * Class to hold information about a specific pre-programmed method setup.
 */
abstract class MethodSetup<OriginalObject> {
  readonly id: string;
  protected expectation: MethodSetupExpectation;
  protected method_name: string;

  constructor(
    methodName: MethodOf<OriginalObject>,
    expectation: MethodSetupExpectation,
  ) {
    this.id = this.run.toString();
    this.method_name = String(methodName); // Make the method name type-safe
    this.expectation = expectation;
  }

  abstract run(args?: unknown): unknown;
}

class MethodSetupThrowsError<OriginalObject>
  extends MethodSetup<OriginalObject> {
  #error: IError;

  constructor(
    methodName: MethodOf<OriginalObject>,
    returnValue: IError,
  ) {
    super(methodName, MethodSetupExpectation.ThrowError);
    this.#error = returnValue;
  }

  run(): void {
    throw this.#error;
  }
}

class MethodSetupReturnsStaticValue<OriginalObject, ReturnValue>
  extends MethodSetup<OriginalObject> {
  #return_value: ReturnValue;

  constructor(
    methodName: MethodOf<OriginalObject>,
    returnValue: ReturnValue,
  ) {
    super(methodName, MethodSetupExpectation.ReturnStaticValue);
    this.#return_value = returnValue;
  }

  run(): ReturnValue {
    return this.#return_value;
  }
}

class MethodSetupCallsCallback<
  OriginalObject,
  Callback extends ((...args: unknown[]) => ReturnType<Callback>),
> extends MethodSetup<OriginalObject> {
  #callback: Callback;

  constructor(
    methodName: MethodOf<OriginalObject>,
    callback: Callback,
  ) {
    super(methodName, MethodSetupExpectation.ReturnStaticValue);
    this.#callback = callback;
  }

  run(args: unknown[]): ReturnType<Callback> {
    return this.#callback(...args);
  }
}
