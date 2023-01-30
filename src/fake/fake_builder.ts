import type { IFake, ITestDouble } from "../interfaces.ts";
import type { Constructor } from "../types.ts";

import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import { TestDoubleBuilder } from "../test_double_builder.ts";
import { createFake } from "./fake_mixin.ts";

/**
 * Builder to help build a fake object. This does all of the heavy-lifting to
 * create a fake object.
 */
export class FakeBuilder<ClassToFake> extends TestDoubleBuilder<ClassToFake> {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the fake object.
   *
   * @returns The original object with faking capabilities.
   */
  public create(): ClassToFake & IFake<ClassToFake> {
    const original = new this.constructor_fn(...this.constructor_args);

    const fake = createFake<Constructor<ClassToFake>, ClassToFake>(
      this.constructor_fn,
      ...this.constructor_args,
    );

    (fake as IFake<ClassToFake> & ITestDouble<ClassToFake>).init(
      original,
      this.getAllFunctionNames(original),
    );

    // Attach all of the original's properties to the fake
    this.addOriginalProperties<IFake<ClassToFake>>(original, fake);

    // Attach all of the original's functions to the fake
    this.getAllFunctionNames(original).forEach((method: string) => {
      this.#addOriginalMethod(
        original,
        fake,
        method,
      );
    });

    return fake as ClassToFake & IFake<ClassToFake>;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an original object's method to a fake object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param fake - The fake object receiving the method.
   * @param method - The name of the method to fake -- callable via
   * `fake[method](...)`.
   */
  #addOriginalMethod(
    original: ClassToFake,
    fake: IFake<ClassToFake>,
    method: string,
  ): void {
    if (this.native_methods.indexOf(method as string) !== -1) {
      return this.addOriginalMethodWithoutTracking<IFake<ClassToFake>>(
        original,
        fake,
        method,
      );
    }

    this.#addOriginalMethodAsProxy(
      original,
      fake,
      method as keyof ClassToFake,
    );
  }

  /**
   * Adds the original method as a proxy, which can be configured during tests.
   *
   * @param original - The original object containing the method to add.
   * @param fake - The fake object receiving the method.
   * @param method - The name of the method.
   */
  #addOriginalMethodAsProxy(
    original: ClassToFake,
    fake: IFake<ClassToFake>,
    method: keyof ClassToFake,
  ): void {
    Object.defineProperty(fake, method, {
      value: (...args: unknown[]) => {
        // Make sure the method calls its original self
        const methodToCall =
          (original[method as keyof ClassToFake] as unknown as (
            ...params: unknown[]
          ) => unknown);

        // We need to check if the method was pre-preprogrammed to do something.
        // If it was, then we make sure that this method we are currently
        // defining returns that pre-programmed expectation.
        if (methodToCall instanceof PreProgrammedMethod) {
          return methodToCall.run(args);
        }

        // When method calls its original self, let the `this` context of the
        // original be the fake. Reason being the fake has tracking and the
        // original does not.
        const bound = methodToCall.bind(fake);

        // Use `return` because the original function could return a value
        return bound(...args);
      },
      writable: true,
    });
  }
}
