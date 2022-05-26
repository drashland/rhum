import type { MethodCalls, MethodOf } from "./types.ts";

export interface IMethodExpectation {
  toBeCalled(expectedCalls: number): void;
  // toBeCalledWithArgs(...args: unknown[]): this;
}

export interface IMethodVerification {
  /**
   * Verify that this method was called. Optionally, verify that it was called a
   * specific number of times.
   *
   * @param expectedCalls - (Optional) The number of calls this method is
   * expected to have received. If not provided, then the verification process
   * will assume "just verify that the method was called" instead of verifying
   * that it was called a specific number of times.
   *
   * @returns `this` To allow method chaining.
   */
  toBeCalled(expectedCalls?: number): this;
  toBeCalledWithArgs(...args: unknown[]): this;
  toBeCalledWithoutArgs(): this;
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
  is_spy: boolean;
  stubbed_methods: Record<MethodOf<OriginalObject>, ISpyStub>;

  verify(
    methodName: MethodOf<OriginalObject>,
  ): IMethodVerification;
}

export interface ISpyStub {
  /**
   * Access the method verifier in order to call verification methods like `.toBeCalled()`. Example:
   *
   * @example
   * ```ts
   * // Spying on an object's method
   * const spy = Spy(obj, "someMethod");
   * obj.someMethod();
   * spy.verify().toBeCalled();
   *
   * // Spy on a function
   * const spy = Spy(someFunction);
   * someFunction();
   * spy.verify().toBeCalled();
   * ```
   */
  verify(): IMethodVerification;
}

export interface ITestDouble<OriginalObject> {
  init(
    original: OriginalObject,
    methodsToTrack: string[],
  ): void;
}

export interface ISpyStubFunctionExpression {
  verify(): IMethodVerification;
}
