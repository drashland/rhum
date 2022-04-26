import type { Constructor, MethodOf } from "../types.ts";
import type { IMethodVerifier, ISpy, ISpyStubMethod } from "../interfaces.ts";
import { SpyStubBuilder } from "./spy_stub_builder.ts";

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
     * See `ISpy#is_spy`.
     */
    is_spy = true;

    /**
     * See `ISpy#stubbed_methods`.
     */
    #stubbed_methods!: Record<MethodOf<OriginalObject>, ISpyStubMethod>;

    /**
     * The original object that this class creates a spy out of.
     */
    #original!: OriginalObject;

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - GETTERS / SETTERS /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    get stubbed_methods(): Record<MethodOf<OriginalObject>, ISpyStubMethod> {
      return this.#stubbed_methods;
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @param original - The original object to create a spy out of.
     * @param methodsToTrack - The original object's method to make trackable.
     */
    public init(original: OriginalObject, methodsToTrack: string[]) {
      this.#original = original;
      this.#stubbed_methods = this.#constructStubbedMethodsProperty(
        methodsToTrack,
      );
    }

    /**
     * Get the verifier for the given method to do actual verification.
     */
    public verify(
      methodName: MethodOf<OriginalObject>,
    ): IMethodVerifier {
      return this.#stubbed_methods[methodName].verify();
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
     * @returns - Key-value object where the key is the method name and the
     * value is the number of calls. All calls start at 0.
     */
    #constructStubbedMethodsProperty(
      methodsToTrack: string[],
    ): Record<MethodOf<OriginalObject>, ISpyStubMethod> {
      const stubbedMethods: Partial<
        Record<MethodOf<OriginalObject>, ISpyStubMethod>
      > = {};

      methodsToTrack.forEach((method: string) => {
        const spyMethod = new SpyStubBuilder(this)
          .method(method as MethodOf<this>)
          .returnValue("spy-stubbed")
          .createForObjectMethod();
        stubbedMethods[method as MethodOf<OriginalObject>] = spyMethod;
      });

      return stubbedMethods as Record<
        MethodOf<OriginalObject>,
        ISpyStubMethod
      >;
    }
  }();
}
