import type { IFake } from "../interfaces.ts";
import type { Constructor, MethodOf } from "../types.ts";
import { FakeError } from "../errors.ts";

import { PreProgrammedMethod } from "../pre_programmed_method.ts";

/**
 * Create a mock object as an extension of an original object.
 *
 * @param OriginalClass - The class the mock should extend.
 *
 * @returns A mock object of the `OriginalClass`.
 */
export function createFake<OriginalConstructor, OriginalObject>(
  OriginalClass: OriginalConstructor,
  ...originalConstructorArgs: unknown[]
): IFake<OriginalObject> {
  const Original = OriginalClass as unknown as Constructor<
    // deno-lint-ignore no-explicit-any
    (...args: any[]) => any
  >;
  return new class FakeExtension extends Original {
    /**
     * Helper property to see that this is a fake object and not the original.
     */
    is_fake = true;

    /**
     * The original object that this class creates a fake of.
     */
    #original!: OriginalObject;

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - CONSTRUCTOR ///////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    constructor() {
      super(...originalConstructorArgs);
    }

    ////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC //////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @param original - The original object to fake.
     */
    public init(original: OriginalObject) {
      this.#original = original;
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

      if (
        !((methodName as string) in (this.#original as Record<string, unknown>))
      ) {
        const typeSafeMethodName = String(methodName as string);

        throw new FakeError(
          `Method "${typeSafeMethodName}" does not exist.`,
        );
      }

      Object.defineProperty(this.#original, methodName, {
        value: methodConfiguration,
        writable: true,
      });

      return methodConfiguration;
    }
  }();
}
