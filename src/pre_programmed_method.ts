import type { IError } from "./interfaces.ts";
import type { MethodOf } from "./types.ts";

class PreProgrammedMethodError extends Error {}

/**
 * Class that allows to be a "stand-in" for a method. For example, when used in
 * a mock object, the mock object can replace methods with pre-programmed
 * methods (using this class), and have a system under test use the
 * pre-programmed methods.
 */
export class PreProgrammedMethod<OriginalObject, ReturnValue> {
  /**
   * Pre-programmed methods can have multiple setups. For example, a method can
   * be pre-programmed to return or throw when it receives a specific set of
   * arguments. Each setup is stored here. Setups are either created or updated.
   * For example, if a setup for `someMethod("hello")` was not created yet, then
   * it will be created; and if a setup for `someMethod("hello")` was already
   * created and being set up again, then it will be updated.
   */
  #setups: Map<string, MethodSetup<OriginalObject, ReturnValue>> = new Map();

  /**
   * The original name of the method being pre-programmed.
   */
  #method_name: MethodOf<OriginalObject>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName - The name of the method to program. Must be a method of
   * the original object in question.
   */
  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;

    // Add a method setup that takes no args for this pre-programmed method.
    // Users are required to finish setting up this pre-programmed method. If
    // the method is not finished being pre-programmed, then the
    // `PreProgrammedMethodError` will be thrown.
    this.#setups.set("[]", new MethodSetup(this.#method_name));
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC  ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Find the given method setup with the given arguments.
   * @param args The arguments to use to query the method setup map.
   * @returns A `MethodSetup` instance that holds the pre-programmed return
   * value or error to throw.
   */
  public findSetupByArgs(
    args: unknown,
  ): MethodSetup<OriginalObject, ReturnValue> | undefined {
    return this.#setups.get(JSON.stringify(args));
  }

  /**
   * Create a method setup with a specific set of arguments.
   * @param args The arguments to use for this setup. When this pre-programmed
   * method is called with these arguments, it will return or throw the
   * defined return value or error associated with these arguments.
   * @returns A `MethodSetup` instance that can further configure this
   * pre-programmed method to return a value or throw an error.
   */
  public withArgs(
    ...args: unknown[]
  ): MethodSetup<OriginalObject, ReturnValue> {
    const methodSetup = new MethodSetup<OriginalObject, ReturnValue>(
      this.#method_name,
    );
    methodSetup.setArgs(args);

    this.#setups.set(methodSetup.args_as_string, methodSetup);

    return methodSetup;
  }

  /**
   * Pre-program this method to return the given value.
   *
   * @param returnValue The value that should be returned when this object is
   * being used in place of an original method.
   */
  public willReturn(
    returnValue: ReturnValue,
  ): MethodSetup<OriginalObject, ReturnValue> {
    const methodSetup = new MethodSetup<OriginalObject, ReturnValue>(
      this.#method_name,
    );
    methodSetup.setReturnValue(returnValue);

    this.#setups.set(methodSetup.args_as_string, methodSetup);

    return methodSetup;
  }

  /**
   * Pre-program this method to throw the given error.
   *
   * @param error - The error to throw.
   */
  public willThrow(error: IError): MethodSetup<OriginalObject, ReturnValue> {
    const methodSetup = new MethodSetup<OriginalObject, ReturnValue>(
      this.#method_name,
    );
    methodSetup.setErrorToThrow(error);

    this.#setups.set(methodSetup.args_as_string, methodSetup);

    return methodSetup;
  }
}

/**
 * Class to hold information about a specific pre-programmed method setup.
 */
class MethodSetup<OriginalObject, ReturnValue> {
  #args?: unknown[] = [];
  #error?: IError;
  #method_name: MethodOf<OriginalObject>;
  #return?: ReturnValue;
  #will_return = false;
  #will_throw = false;

  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;
  }

  get args_as_string() {
    return JSON.stringify(this.#args);
  }

  get will_throw() {
    return this.#will_throw;
  }

  get will_return() {
    return this.#will_return;
  }

  setArgs(args: unknown[]): this {
    this.#args = args ?? [];
    return this;
  }

  setReturnValue(returnValue: ReturnValue): this {
    this.#will_return = true;
    this.#return = returnValue;
    return this;
  }

  setErrorToThrow(error: IError): this {
    this.#will_throw = true;
    this.#error = error;
    return this;
  }

  return(): ReturnValue {
    if (this.#return === undefined) {
      const typeSafeMethodName = String(this.#method_name);

      throw new PreProgrammedMethodError(
        `Pre-programmed method "${typeSafeMethodName}" does not have a return value.`,
      );
    }

    return this.#return;
  }

  throw(): void {
    const typeSafeMethodName = String(this.#method_name);

    if (!this.#will_throw) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${typeSafeMethodName}" is not set up to throw an error.`,
      );
    }
    if (this.#error === undefined) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${typeSafeMethodName}" is set up to throw an error, but no error was provided.`,
      );
    }

    throw this.#error;
  }

  /**
   * Pre-program this method to return the given value.
   *
   * @param returnValue The value that should be returned when this object is
   * being used in place of an original method.
   */
  public willReturn(returnValue: ReturnValue): void {
    this.#will_return = true;
    this.#return = returnValue;
  }

  /**
   * Pre-program this method to throw the given error.
   *
   * @param error - The error to throw.
   */
  public willThrow(error: IError): void {
    this.#will_throw = true;
    this.#error = error;
  }
}
