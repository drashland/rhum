import type { MethodArguments, MethodCalls, MethodOf } from "./types.ts";

export interface IMethodExpectation {
  toBeCalled(expectedCalls: number): void;
  // toBeCalledWith(...args: unknown[]): this;
}

export interface IMethodVerification {
  toBeCalled(expectedCalls: number): this;
  toBeCalledWith(...args: unknown[]): this;
}

export interface IPreProgrammedMethod<ReturnValue> {
  willReturn(returnValue: ReturnValue): void;
  willThrow(error: IError): void;
}

export interface IError {
  /**
   * The name of the error (shown before the error message when thrown).
   * Example: `ErrorName: <error message goes here>`.
   */
  name: string;

  /**
   * The error message.
   */
  message?: string;
}

export interface IFake<OriginalObject> {
  /**
   * Helper property to show that this object is a fake.
   */
  is_fake: boolean;

  /**
   * Entry point to shortcut a method. Example:
   *
   * ```ts
   * fake.method("methodName").willReturn(...);
   * fake.method("methodName").willThrow(...);
   * ```
   */
  method<ReturnValueType>(
    methodName: MethodOf<OriginalObject>,
  ): IPreProgrammedMethod<ReturnValueType>;
}

export interface IMock<OriginalObject> {
  calls: MethodCalls<OriginalObject>;
  is_mock: boolean;

  /**
   * Entry point to set an expectation on a method. Example:
   *
   * ```ts
   * mock.expects("doSomething").toBeCalled(1); // Expect to call it once
   * mock.doSomething(); // Call it once
   * mock.verifyExpectations(); // Verify doSomething() was called once
   * ```
   */
  expects(
    method: MethodOf<OriginalObject>,
  ): IMethodExpectation;

  /**
   * Entry point to pre-program a method. Example:
   *
   * ```ts
   * mock.method("methodName").willReturn(someValue);
   * mock.method("methodName").willThrow(new Error("Nope."));
   * ```
   */
  method<ReturnValueType>(
    methodName: MethodOf<OriginalObject>,
  ): IPreProgrammedMethod<ReturnValueType>;

  /**
   * Call this method after setting expectations on a method. Example:
   *
   * ```ts
   * mock.expects("doSomething").toBeCalled(1); // Expect to call it once
   * mock.doSomething(); // Call it once
   * mock.verifyExpectations(); // Verify doSomething() was called once
   * ```
   */
  verifyExpectations(): void;
}

export interface ISpy<OriginalObject> {
  calls: MethodCalls<OriginalObject>;
  calls_arguments: MethodArguments<OriginalObject>;
  is_spy: boolean;

  verify(
    methodName: MethodOf<OriginalObject>,
  ): IMethodVerification;
}

export interface ITestDouble<OriginalObject> {
  init(
    original: OriginalObject,
    methodsToTrack: string[],
  ): void;
}
