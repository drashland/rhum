import type { Constructor, MethodOf } from "../types.ts";
import type { IMethodVerification, ISpy, ISpyStub } from "../interfaces.ts";
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
     * Helper property to see that this is a mock object and not the original.
     */
    is_spy = true;

    /**
     * Property of stubbed methods. Each stubbed method has tracking (e.g., `spy.verify("someMethod").toBeCalled()`.
     */
    #stubbed_methods!: Record<MethodOf<OriginalObject>, ISpyStub>;
    /**
     * The original object that this class creates a mock of.
     */
    #original!: OriginalObject;

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - GETTERS / SETTERS /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    get stubbed_methods(): Record<MethodOf<OriginalObject>, ISpyStub> {
      return this.#stubbed_methods;
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
      this.#stubbed_methods = this.#constructStubbedMethodsProperty(
        methodsToTrack,
      );
    }

    /**
     * Get the verifier for the given method to do actual verification using
     */
    public verify(
      methodName: MethodOf<OriginalObject>,
    ): IMethodVerification {
      return this.#stubbed_methods[methodName].verify();
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
    #constructStubbedMethodsProperty(
      methodsToTrack: string[],
    ): Record<MethodOf<OriginalObject>, ISpyStub> {
      const stubbedMethods: Partial<
        Record<MethodOf<OriginalObject>, ISpyStub>
      > = {};

      methodsToTrack.forEach((method: string) => {
        const spyMethod = new SpyStubBuilder(this)
          .method(method as MethodOf<this>)
          .returnValue("stubbed")
          .createForObjectMethod();
        stubbedMethods[method as MethodOf<OriginalObject>] = spyMethod;
      });

      return stubbedMethods as Record<MethodOf<OriginalObject>, ISpyStub>;
    }
  }();
}
