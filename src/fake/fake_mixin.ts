import type { Constructor, MethodOf } from "../types.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import type { IFake } from "../interfaces.ts";

class FakeError extends Error {}

export function createFake<OriginalConstructor, OriginalObject>(OriginalClass: OriginalConstructor): IFake<OriginalObject> {
  // deno-lint-ignore no-explicit-any
  const Original = OriginalClass as unknown as Constructor<(...args: any[]) => any>;
  return new class FakeExtension extends Original {
    /**
     * Helper property to see that this is a fake object and not the original.
     */
    is_fake = true;

    /**
     * The original object that this class creates a fake of.
     */
    #original!: OriginalObject;

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * @param original - The original object to fake.
     */
    public init(original: OriginalObject) {
      this.#original = original;
    }

    //////////////////////////////////////////////////////////////////////////////
    // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

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
        methodName
      );

      if (!((methodName as string) in this.#original)) {
        throw new FakeError(
          `Method "${methodName}" does not exist.`,
        );
      }

      Object.defineProperty(this.#original, methodName, {
        value: methodConfiguration,
        writable: true,
      });

      return methodConfiguration;
    }
  }
}
