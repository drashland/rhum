import type { Constructor, MethodCalls, MethodOf } from "./types.ts";
import { PreProgrammedMethod } from "./pre_programmed_method.ts";

class MockError extends Error {}

/**
 * Class to mock an object. This class is the original object with data members
 * that can be used for verifying behavior (e.g., using `mock.calls.someMethod`
 * to see how many `someMethod` was called).
 */
export class Mock<OriginalObject> {
  readonly #calls: MethodCalls<OriginalObject>;
  is_mock = true;
  #original: OriginalObject;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param original - The original object to mock.
   * @param methodsToTrack - The original object's method to make trackable.
   */
  constructor(original: OriginalObject, methodsToTrack: string[]) {
    this.#original = original;
    this.#calls = this.#constructCallsProperty(methodsToTrack);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get calls(): MethodCalls<OriginalObject> {
    return this.#calls;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Pre-program a method on the original to return a specific value.
   * @param methodName The method name on the original.
   * @returns A pre-programmed method that will be called instead of original.
   */
  public method<ReturnValueType>(
    methodName: MethodOf<OriginalObject>,
  ): PreProgrammedMethod<OriginalObject, ReturnValueType> {
    const methodConfiguration = new PreProgrammedMethod<
      OriginalObject,
      ReturnValueType
    >(
      methodName
    );

    if (!((methodName as string) in this.#original)) {
      throw new MockError(
        `Method "${methodName}" does not exist.`,
      );
    }

    Object.defineProperty(this.#original, methodName, {
      value: methodConfiguration,
      writable: true,
    });

    return methodConfiguration;
  }

  /**
   * Construct the calls property. Only construct it, do not set it. The
   * constructor will set it.
   * @param methodsToTrack - All of the methods on the original object to make
   * trackable.
   * @returns - Key-value object where the key is the method name and the value
   * is the number of calls. All calls start at 0.
   */
  #constructCallsProperty(
    methodsToTrack: string[],
  ): Record<keyof OriginalObject, number> {
    const calls: Partial<Record<keyof OriginalObject, number>> = {};

    methodsToTrack.map((key: string) => {
      calls[key as keyof OriginalObject] = 0;
    });

    return calls as Record<keyof OriginalObject, number>;
  }
}

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

export function createMock<OriginalObject extends Constructor<OriginalObject>>(OriginalClass: OriginalObject) {
  // @ts-ignore
  return class MockExtension extends OriginalClass {
    #calls!: MethodCalls<OriginalObject>;
    is_mock = true;
    #original!: OriginalObject;

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @param original - The original object to mock.
     * @param methodsToTrack - The original object's method to make trackable.
     */
    public init(original: OriginalObject, methodsToTrack: string[]) {
      this.#original = original;
      this.#calls = this.#constructCallsProperty(methodsToTrack);
    }

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - GETTERS / SETTERS ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    get calls(): MethodCalls<OriginalObject> {
      return this.#calls;
    }

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Pre-program a method on the original to return a specific value.
     * @param methodName The method name on the original.
     * @returns A pre-programmed method that will be called instead of original.
     */
    public method<ReturnValueType>(
      methodName: MethodOf<OriginalObject>,
    ): PreProgrammedMethod<OriginalObject, ReturnValueType> {
      const methodConfiguration = new PreProgrammedMethod<
        OriginalObject,
        ReturnValueType
      >(
        methodName
      );

      if (!((methodName as string) in this.#original)) {
        throw new MockError(
          `Method "${methodName}" does not exist.`,
        );
      }

      Object.defineProperty(this.#original, methodName, {
        value: methodConfiguration,
        writable: true,
      });

      return methodConfiguration;
    }

    /**
     * Construct the calls property. Only construct it, do not set it. The
     * constructor will set it.
     * @param methodsToTrack - All of the methods on the original object to make
     * trackable.
     * @returns - Key-value object where the key is the method name and the value
     * is the number of calls. All calls start at 0.
     */
    #constructCallsProperty(
      methodsToTrack: string[],
    ): Record<keyof OriginalObject, number> {
      const calls: Partial<Record<keyof OriginalObject, number>> = {};

      methodsToTrack.map((key: string) => {
        calls[key as keyof OriginalObject] = 0;
      });

      return calls as Record<keyof OriginalObject, number>;
    }
  }
}