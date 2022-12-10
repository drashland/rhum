import type { IFake, IMethodChanger } from "../interfaces.ts";
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
        const typeSafeMethodName = String(methodName as string);

        throw new FakeError(
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
  }();
}
