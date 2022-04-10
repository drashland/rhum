import type { MethodOf } from "./types.ts";

class PreProgrammedMethodError extends Error {}

/**
 * Class that allows to be a "stand-in" for a method. For example, when used in a mock object, the mock object can replace methods with pre-programmed methods (using this class), and have a system under test use the pre-programmed methods.
 */
export class PreProgrammedMethod<OriginalObject, MethodReturnValue> {
  #method_name: MethodOf<OriginalObject>;
  #return_value?: MethodReturnValue;
  public is_pre_programmed = true;

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

  get return_value(): MethodReturnValue {
    if (this.#return_value === undefined) {
      throw new PreProgrammedMethodError(
        `Pre-programmed method "${this.#method_name}" does not have a return value.`,
      );
    }

    return this.#return_value;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC  ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Pre-program this method to return the given value.
   * @param returnValue The value that should be returned when this object is
   * being used in place of an original method.
   */
  public willReturn(returnValue: MethodReturnValue): void {
    this.#return_value = returnValue;
  }
}
