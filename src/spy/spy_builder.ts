import type { Constructor } from "../types.ts";
import type { ISpy, ITestDouble } from "../interfaces.ts";
import { createSpy } from "./spy_mixin.ts";
import { TestDoubleBuilder } from "../test_double_builder.ts";

/**
 * Builder to help build a spy object. This does all of the heavy-lifting to
 * create a spy object. Its `create()` method returns an instance of `Spy`,
 * which is basically an original object with stubbed data members.
 *
 * This builder differs from the `SpyStub` because it stubs out the
 * entire class, whereas the `SpyStub` stubs specific data members.
 *
 * Under the hood, this builder uses `SpyStub` to stub the data members
 * in the class.
 */
export class SpyBuilder<ClassToSpy> extends TestDoubleBuilder<ClassToSpy> {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the spy object.
   *
   * @returns The original object with capabilities from the Spy class.
   */
  public create(): ClassToSpy {
    const original = new this.constructor_fn(...this.constructor_args);

    const spy = createSpy<Constructor<ClassToSpy>, ClassToSpy>(
      this.constructor_fn,
    );

    (spy as ISpy<ClassToSpy> & ITestDouble<ClassToSpy>).init(
      original,
      this.getAllFunctionNames(original),
    );

    // Attach all of the original's properties to the spy
    this.addOriginalProperties<ISpy<ClassToSpy>>(original, spy);

    // Attach all of the original's native methods to the spy
    this.#addNativeMethods(original, spy);

    return spy as ClassToSpy & ISpy<ClassToSpy>;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an original object's method to a spy object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param spy - The spy object receiving the method.
   */
  #addNativeMethods(
    original: ClassToSpy,
    spy: ISpy<ClassToSpy>,
  ): void {
    this.getAllFunctionNames(original).forEach((method: string) => {
      // If this is not a native method, then we do not care to add it because all
      // methods should be stubbed in `SpyExtension#init()`. The `init()` method
      // sets `#stubbed_methods` to `SpyStub` objects with a return value of
      // "stubbed".
      if (this.native_methods.indexOf(method as string) === -1) {
        return;
      }

      return this.addOriginalMethodWithoutTracking(
        original,
        spy,
        method,
      );
    });
  }
}
