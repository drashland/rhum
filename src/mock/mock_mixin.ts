import type { Constructor, MethodCalls, MethodOf } from "../types.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import type { IMock } from "../interfaces.ts";

class MockError extends Error {}

class MethodExpectation<OriginalObject> {
  #method_name: MethodOf<OriginalObject>;
  #expected_calls = 0;

  get method_name(): MethodOf<OriginalObject> {
    return this.#method_name;
  }

  get expected_calls(): number {
    return this.#expected_calls;
  }

  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;
  }

  public toBeCalled(expectedCalls: number) {
    this.#expected_calls = expectedCalls;
  }
}

export function createMock<OriginalConstructor, OriginalObject>(
  OriginalClass: OriginalConstructor,
): IMock<OriginalObject> {
  // deno-lint-ignore no-explicit-any
  const Original = OriginalClass as unknown as Constructor<
    (...args: any[]) => any
  >;
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
     * An array of expectations to verify (if any).
     */
    #expectations: MethodExpectation<OriginalObject>[] = [];

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
     * Create a method expectation, which is basically asserting calls.
     *
     * @param method - The method to create an expectation for.
     * @returns A method expectation.
     */
    public expects(method: MethodOf<OriginalObject>): MethodExpectation<OriginalObject> {
      const expectation = new MethodExpectation(method);
      this.#expectations.push(expectation);
      return expectation;
    }

    /**
     * Pre-program a method on the original to return a specific value.
     *
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
        methodName,
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
     * Verify all expectations created in this mock.
     */
    public verifyExpectations(): void {
      this.#expectations.forEach((e: MethodExpectation<OriginalObject>) => {
        const expectedCalls = e.expected_calls;
        const actualCalls = this.#calls[e.method_name];
        if (expectedCalls !== actualCalls) {
          throw new MockError(
            `Method "${e.method_name}" expected ${expectedCalls} call(s), but received ${actualCalls} call(s).`
          );
        }
      });
    }

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

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
  }();
}
