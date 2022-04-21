import type {
  Constructor,
  MethodArguments,
  MethodCalls,
  MethodOf,
} from "../types.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import { Stub } from "../../mod.ts";
import type { IMethodExpectation, ISpy } from "../interfaces.ts";

class SpyError extends Error {}

class MethodVerification<OriginalObject> {
  #method_name: MethodOf<OriginalObject>;
  #calls: number;
  #args: unknown[];

  constructor(
    methodName: MethodOf<OriginalObject>,
    calls: number,
    args: unknown[],
  ) {
    this.#method_name = methodName;
    this.#calls = calls;
    this.#args = args;
  }

  /**
   * Verify that this method was called. Optionally, verify that it was called a
   * specific number of times.
   *
   * @param expectedCalls - The number of calls this method is expected to have
   * received.
   *
   * @returns this To add chainable verification methods.
   */
  public toBeCalled(expectedCalls?: number): this {
    if (!expectedCalls) {
      if (this.#calls <= 0) {
        throw new SpyError(
          `Method "${this.#method_name}" expected to be called, but received 0 calls.`,
        );
      }
    }

    if (this.#calls !== expectedCalls) {
      throw new SpyError(
        `Method "${this.#method_name}" expected ${expectedCalls} call(s), but received ${this.#calls} call(s).`,
      );
    }

    return this;
  }

  /**
   * Verify that this method was called with the following arguments.
   *
   * @returns this To add chainable verification methods.
   */
  public toBeCalledWith(...expectedArgs: unknown[]): this {
    if (expectedArgs.length != this.#args.length) {
      throw new SpyError(
        `Method "${this.#method_name}" expected ${expectedArgs.length} arguments(s), but received ${this.#args.length} argument(s).` +
          `\nActual args: [${this.#args.join(", ")}]` +
          `\nExpected args: [${expectedArgs.join(", ")}]`,
      );
    }

    expectedArgs.forEach((arg: unknown, index: number) => {
      const parameterPosition = index + 1;
      if (this.#args[index] !== arg) {
        if (this.#comparingArrays(this.#args[index], arg)) {
          const match = this.#compareArrays(
            this.#args[index] as unknown[],
            arg as unknown[],
          );
          if (match) {
            return;
          }
        }

        const actualArgType = this.#getArgType(this.#args[index]);
        const expectedArgType = this.#getArgType(arg);

        throw new SpyError(
          `Method "${this.#method_name}" expected ${arg}${expectedArgType} argument at parameter position ${parameterPosition}, but received ${
            this.#args[index]
          }${actualArgType} argument.`,
        );
      }
    });

    this.#args.every((arg: unknown) => {
      return expectedArgs.indexOf(arg) >= 0;
    });

    return this;
  }

  /**
   * Get the arg type in string format for the given arg.
   *
   * @param arg - The arg to evaluate.
   *
   * @returns The arg type surrounded by brackets (e.g., <type>).
   */
  #getArgType(arg: unknown): string {
    if (arg && typeof arg === "object") {
      if ("prototype" in arg) {
        return "<" + Object.getPrototypeOf(arg) + ">";
      }
      return "<object>";
    }

    return "<" + typeof arg + ">";
  }

  /**
   * Are we comparing arrays?
   *
   * @param obj1 - Object to evaluate if it is an array.
   * @param obj2 - Object to evaluate if it is an array.
   *
   * @returns True if yes, false if no.
   */
  #comparingArrays(obj1: unknown, obj2: unknown): boolean {
    return Array.isArray(obj1) && Array.isArray(obj2);
  }

  /**
   * Check that the given arrays are exactly equal.
   *
   * @param a - The first array.
   * @param b - The second array (which should match the first array).
   *
   * @returns True if the arrays match, false if not.
   */
  #compareArrays(a: unknown[], b: unknown[]): boolean {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
}

/**
 * Create a spy as an extension of an original object.
 */
export function createSpy<OriginalConstructor, OriginalObject>(
  OriginalClass: OriginalConstructor,
): ISpy<OriginalObject> {
  const Original = OriginalClass as unknown as Constructor<
    // deno-lint-ignore no-explicit-any
    (...args: any[]) => any
  >;
  return new class SpyExtension extends Original {
    /**
     * Helper property to see that this is a mock object and not the original.
     */
    is_spy = true;

    /**
     * Property to track method calls.
     */
    #calls!: MethodCalls<OriginalObject>;

    /**
     * Property to track method calls.
     */
    #calls_arguments!: MethodArguments<OriginalObject>;

    /**
     * The original object that this class creates a mock of.
     */
    #original!: OriginalObject;

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - GETTERS / SETTERS /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    get calls(): MethodCalls<OriginalObject> {
      return this.#calls;
    }

    get calls_arguments(): MethodArguments<OriginalObject> {
      return this.#calls_arguments;
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
      this.#calls_arguments = this.#constructCallsArguments(methodsToTrack);
      this.#stubMethods(methodsToTrack);
    }

    /**
     * Verify all expectations created in this mock.
     */
    public verify(
      methodName: MethodOf<OriginalObject>,
    ): MethodVerification<OriginalObject> {
      return new MethodVerification(
        methodName,
        this.#calls[methodName],
        this.#calls_arguments[methodName],
      );
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PRIVATE /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Construct the calls property. Only construct it, do not set it. The
     * constructor will set it.
     * @param methodsToTrack - All of the methods on the original object to make
     * trackable.
     * @returns - Key-value object where the key is the method name and the
     * value is the number of calls. All calls start at 0.
     */
    #constructCallsProperty(
      methodsToTrack: string[],
    ): Record<keyof OriginalObject, number> {
      const calls: Partial<Record<keyof OriginalObject, number>> = {};

      methodsToTrack.forEach((key: string) => {
        calls[key as keyof OriginalObject] = 0;
      });

      return calls as Record<keyof OriginalObject, number>;
    }

    /**
     * Construct the calls property. Only construct it, do not set it. The
     * constructor will set it.
     * @param methodsToTrack - All of the methods on the original object to make
     * trackable.
     * @returns - Key-value object where the key is the method name and the
     * value is the number of calls. All calls start at 0.
     */
    #constructCallsArguments(
      methodsToTrack: string[],
    ): Record<keyof OriginalObject, unknown[]> {
      const args: Partial<Record<keyof OriginalObject, unknown[]>> = {};

      methodsToTrack.forEach((key: string) => {
        args[key as keyof OriginalObject] = [];
      });

      return args as Record<keyof OriginalObject, unknown[]>;
    }

    /**
     * Spies are stubs that also record some information on how they were
     * called.
     * Since they are stubs, we stub every single method and only track how the
     * methods are called.
     * @param methodsToTrack - All of the methods on the original object to make
     * trackable.
     */
    #stubMethods(
      methodsToTrack: string[],
    ): void {
      methodsToTrack.forEach((key: string) => {
        Stub(this.#original, key as keyof OriginalObject);
      });
    }
  }();
}
