import type { Constructor, MethodCalls, MethodOf } from "../types.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import type { IMock } from "../interfaces.ts";

class MockError extends Error {}

export function createMock<OriginalConstructor, OriginalObject>(OriginalClass: OriginalConstructor): IMock<OriginalObject> {
  // deno-lint-ignore no-explicit-any
  const Original = OriginalClass as unknown as Constructor<(...args: any[]) => any>;
  return new class MockExtension extends Original {
    /**
     * Helper property to see that this is a mock object and not the original.
     */
    is_mock = true;

    /**
     * Property to track method calls.
     */
    #calls!: MethodCalls<OriginalObject>;

    /**
     * The original object that this class creates a mock of.
     */
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
