import type { IMock } from "../interfaces.ts";
import type { Constructor, MethodOf, MockMethodCalls } from "../types.ts";

import { MethodVerifier } from "../verifiers/method_verifier.ts";
import { MockError } from "../errors.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";

/**
 * Class to help mocks create method expectations.
 */
class MethodExpectation<OriginalObject> {
  /**
   * Property to hold the number of expected calls this method should receive.
   */
  #expected_calls?: number | undefined;

  /**
   * See `MethodVerifier#method_name`.
   */
  #method_name: MethodOf<OriginalObject>;

  /**
   * The verifier to use when verifying expectations.
   */
  #verifier: MethodVerifier<OriginalObject>;

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * @param methodName See `MethodVerifier#method_name`.
   */
  constructor(methodName: MethodOf<OriginalObject>) {
    this.#method_name = methodName;
    this.#verifier = new MethodVerifier(methodName);
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  get method_name(): MethodOf<OriginalObject> {
    return this.#method_name;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Set an expected number of calls.
   *
   * @param expectedCalls - (Optional) The number of calls to receive. Defaults
   * to -1 to tell `MethodVerifier` to "just check that the method was called".
   */
  public toBeCalled(expectedCalls?: number): void {
    this.#expected_calls = expectedCalls;
  }

  // public verify(actualCalls: number, actualArgs: unknown[]): void {
  //   this.verifyCalls(
  // }

  /**
   * Verify all expected calls were made.
   *
   * @param actualCalls - The number of actual calls.
   */
  public verifyCalls(actualCalls: number): void {
    this.#verifier.toBeCalled(
      actualCalls,
      this.#expected_calls,
    );
  }
}

/**
 * Create a mock object as an extension of an original object.
 *
 * @param OriginalClass - The class the mock should extend.
 *
 * @returns A mock object of the `OriginalClass`.
 */
export function createMock<OriginalConstructor, OriginalObject>(
  OriginalClass: OriginalConstructor,
  ...originalConstructorArgs: unknown[]
): IMock<OriginalObject> {
  const Original = OriginalClass as unknown as Constructor<
    // deno-lint-ignore no-explicit-any
    (...args: any[]) => any
  >;
  return new class MockExtension extends Original {
    /**
     * See `IMock#is_mock`.
     */
    is_mock = true;

    /**
     * See `IMock#calls`.
     */
    #calls!: MockMethodCalls<OriginalObject>;

    /**
     * An array of expectations to verify (if any).
     */
    #expectations: MethodExpectation<OriginalObject>[] = [];

    /**
     * The original object that this class creates a mock of.
     */
    #original!: OriginalObject;

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - CONSTRUCTOR ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    constructor() {
      super(...originalConstructorArgs);
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - GETTERS / SETTERS /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    get calls(): MockMethodCalls<OriginalObject> {
      return this.#calls;
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @param original - The original object to mock.
     * @param methodsToTrack - The original object's method to make trackable.
     */
    public init(original: OriginalObject, methodsToTrack: string[]) {
      this.#original = original;
      this.#calls = this.#constructCallsProperty(methodsToTrack);
    }

    /**
     * Create a method expectation, which is basically asserting calls.
     *
     * @param method - The method to create an expectation for.
     * @returns A method expectation.
     */
    public expects(
      method: MethodOf<OriginalObject>,
    ): MethodExpectation<OriginalObject> {
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
        e.verifyCalls(this.#calls[e.method_name]);
      });
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PRIVATE /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

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
