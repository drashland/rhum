import type { IMethodChanger, IMock } from "../interfaces.ts";
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
   * Property to hold the expected args this method should use.
   */
  #expected_args?: unknown[] | undefined;

  /**
   * Property to hold the args this method was called with.
   */
  #args?: unknown[] | undefined;

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
   * @param methodName - See `MethodVerifier#method_name`.
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
   * See `IMethodExpectation.toBeCalled()`.
   */
  public toBeCalled(expectedCalls?: number): this {
    this.#expected_calls = expectedCalls;
    return this;
  }

  /**
   * See `IMethodExpectation.toBeCalledWithArgs()`.
   */
  public toBeCalledWithArgs(...expectedArgs: unknown[]): this {
    this.#expected_args = expectedArgs;
    return this;
  }

  /**
   * See `IMethodExpectation.toBeCalledWithoutArgs()`.
   */
  public toBeCalledWithoutArgs(): this {
    this.#expected_args = undefined;
    return this;
  }

  /**
   * Verify all expected calls were made.
   *
   * @param actualCalls - The number of actual calls.
   */
  public verifyCalls(actualCalls: number): void {
    this.#verifier.toBeCalled(actualCalls, this.#expected_calls);
    this.#verifier.toBeCalledWithoutArgs(this.#args ?? []);
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

    /**
     * Map of pre-programmed methods defined by the user.
     */
    #pre_programmed_methods: Map<
      MethodOf<OriginalObject>,
      IMethodChanger<unknown>
    > = new Map();

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
     * See `IMock.expects()`.
     */
    public expects(
      method: MethodOf<OriginalObject>,
    ): MethodExpectation<OriginalObject> {
      const expectation = new MethodExpectation(method);
      this.#expectations.push(expectation);
      return expectation;
    }

    /**
     * See `IMock.method()`.
     */
    public method<ReturnValueType>(
      methodName: MethodOf<OriginalObject>,
    ): IMethodChanger<ReturnValueType> {
      // If the method was already pre-programmed previously, then return it so
      // the user can add more method setups to it
      if (this.#pre_programmed_methods.has(methodName)) {
        return this.#pre_programmed_methods.get(methodName)!;
      }

      const methodConfiguration = new PreProgrammedMethod<
        OriginalObject,
        ReturnValueType
      >(
        methodName,
      );

      if (
        !((methodName as string) in (this.#original as Record<string, unknown>))
      ) {
        const typeSafeMethodName = String(methodName);
        throw new MockError(
          `Method "${typeSafeMethodName}" does not exist.`,
        );
      }

      Object.defineProperty(this.#original, methodName, {
        value: methodConfiguration,
        writable: true,
      });

      const methodChanger = methodConfiguration as unknown as IMethodChanger<
        ReturnValueType
      >;

      this.#pre_programmed_methods.set(methodName, methodChanger);

      return methodChanger;
    }

    /**
     * See `IMock.verifyExpectations()`.
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
     *
     * @param methodsToTrack - All of the methods on the original object to make
     * trackable.
     *
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
