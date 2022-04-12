import type { MethodOf } from "./types.ts";
import type { IError } from "./interfaces.ts";

class PreProgrammedMethodError extends Error {}

/**
 * Class that allows to be a "stand-in" for a method. For example, when used in
 * a mock object, the mock object can replace methods with pre-programmed
 * methods (using this class), and have a system under test use the
 * pre-programmed methods.
 */
export class PreProgrammedMethod<OriginalObject, ReturnValue> {
  #method_name: MethodOf<OriginalObject>;
  #will_throw = false;
  #will_return = false;
  #return?: ReturnValue;
  #error?: IError;

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
  // FILE MARKER - GETTERS / SETTERS  //////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get error(): void {
    if (!this.#will_throw) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${this.#method_name}" is not set up to throw an error.`,
      );
    }
    if (this.#error === undefined) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${this.#method_name}" is set up to throw an error, but no error was provided.`,
      );
    }

    throw this.#error;
  }

  get return(): ReturnValue {
    if (this.#return === undefined) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${this.#method_name}" does not have a return value.`,
      );
    }

    return this.#return;
  }

  get will_return(): boolean {
    return this.#will_return;
  }

  get will_throw(): boolean {
    return this.#will_throw;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC  ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Pre-program this method to return the given value.

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
