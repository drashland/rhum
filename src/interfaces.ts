import type { MethodOf, MockMethodCalls } from "./types.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IERROR ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Interface that all errors must follow. This is useful when a client wants to
 * throw a custom error class via `.willThrow()` for mocks and fakes.
 */
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

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IFAKE /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IFake<OriginalObject> {
  /**
   * Helper property to show that this object is a fake.
   */
  is_fake: boolean;

  /**
   * Access the method shortener to make the given method take a shortcut.
   *
   * @param method - The name of the method to shorten.
   */
  method(
    method: MethodOf<OriginalObject>,
  ): IMethodChanger;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IFUNCTIONEXPRESSIONVERIFIER ///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Interface of verifier that verifies function expression calls.
 */
export interface IFunctionExpressionVerifier extends IVerifier {
  /**
   * The args used when called.
   */
  args: unknown[];

  /**
   * The number of calls made.
   */
  calls: number;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMETHODEXPECTATION ////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IMethodExpectation {
  /**
   * Set an expectation that the given number of expected calls should be made.
   *
   * @param expectedCalls - (Optional) The number of expected calls. If not
   * specified, then verify that there was at least one call.
   *
   * @returns `this` To allow method chaining.
   */
  toBeCalled(expectedCalls?: number): this;

  // TODO(crookse) Future release
  /**
   * Set an expectation that the given args should be used during a method call.
   *
   * @param requiredArg - Used to make this method require at least one arg.
   * @param restOfArgs - Any other args to check during verification.
   *
   * @returns `this` To allow method chaining.
   */
  // toBeCalledWithArgs(requiredArg: unknown, ...restOfArgs: unknown[]): this;

  // TODO(crookse) Future release
  /**
   * Set an expectation that a method call should be called without args.
   *
   * @returns `this` To allow method chaining.
   */
  // toBeCalledWithoutArgs(): this;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMETHODCHANGER ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IMethodChanger {
  /**
   * Make the given method return the given `returnValue`.
   *
   * @param returnValue - The value to make the method return.
   */
  willReturn<T>(returnValue: T): void;

  /**
   * Make the given method throw the given error.
   *
   * @param error - An error which extends the `Error` class or has the same
   * interface as the `Error` class.
   */
  willThrow<T>(error: IError & T): void;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMETHODVERIFIER ///////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Interface of verifier that verifies method calls.
 */
export interface IMethodVerifier extends IVerifier {
  /**
   * Property to hold the args used when the method using this verifier was
   * called.
   */
  args: unknown[];

  /**
   * Property to hold the number of times the method using this verifier was
   * called.
   */
  calls: number;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IMOCK /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface IMock<OriginalObject> {
  /**
   * Property to track method calls.
   */
  calls: MockMethodCalls<OriginalObject>;

  /**
   * Helper property to see that this is a mock object and not the original.
   */
  is_mock: boolean;

  /**
   * Access the method expectation creator to create an expectation for the
   * given method.
   *
   * @param method - The name of the method to create an expectation for.
   */
  expects(
    method: MethodOf<OriginalObject>,
  ): IMethodExpectation;

  /**
   * Access the method pre-programmer to change the behavior of the given method.
   *
   * @param method - The name of the method to pre-program.
   */
  method(
    method: MethodOf<OriginalObject>,
  ): IMethodChanger;

  /**
   * Verify that all expectations from the `.expects()` calls.
   */
  verifyExpectations(): void;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ISPY //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface ISpy<OriginalObject> {
  /**
   * Helper property to see that this is a spy object and not the original.
   */
  is_spy: boolean;

  /**
   * Property to track all stubbed methods. This property is used when calling
   * `.verify("someMethod")`. The `.verify("someMethod")` call will return the
   * `ISpyStubMethod` object via `stubbed_methods["someMethod"]`.
   */
  stubbed_methods: Record<MethodOf<OriginalObject>, ISpyStubMethod>;

  /**
   * Access the method verifier.
   *
   * @returns A verifier to verify method calls.
   */
  verify(
    method: MethodOf<OriginalObject>,
  ): IMethodVerifier;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ISPYSTUBFUNCTIONEXPRESSION ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Interface for spies on function expressions.
 */
export interface ISpyStubFunctionExpression {
  /**
   * Access the function expression verifier.
   *
   * @returns A verifier to verify function expression calls.
   */
  verify(): IFunctionExpressionVerifier;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ISPYSTUBMETHOD ////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Interface for spies on object methods.
 */
export interface ISpyStubMethod {
  /**
   * Access the method verifier.
   *
   * @returns A verifier to verify method calls.
   */
  verify(): IMethodVerifier;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - ITESTDOUBLE ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export interface ITestDouble<OriginalObject> {
  init(
    original: OriginalObject,
    methodsToTrack: string[],
  ): void;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - IVERIFIER /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Base interface for verifiers.
 */
export interface IVerifier {
  /**
   * Verify that calls were made.
   *
   * @param expectedCalls - (Optional) The number of expected calls. If not
   * specified, then verify that there was at least one call.
   *
   * @returns `this` To allow method chaining.
   */
  toBeCalled(expectedCalls?: number): this;

  /**
   * Verify that the given args were used. Takes a rest parameter of args to use
   * during verification. At least one arg is required to use this method, which
   * is the `requiredArg` param.
   *
   * @param requiredArg - Used to make this method require at least one arg.
   * @param restOfArgs - Any other args to check during verification.
   *
   * @returns `this` To allow method chaining.
   */
  toBeCalledWithArgs(requiredArg: unknown, ...restOfArgs: unknown[]): this;

  /**
   * Verify that no args were used.
   *
   * @returns `this` To allow method chaining.
   */
  toBeCalledWithoutArgs(): this;
}
