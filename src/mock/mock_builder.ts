import type { IMock, ITestDouble } from "../interfaces.ts";
import type { Constructor } from "../types.ts";

import { PreProgrammedMethod } from "../pre_programmed_method.ts";
import { TestDoubleBuilder } from "../test_double_builder.ts";
import { createMock } from "./mock_mixin.ts";

/**
 * Builder to help build a mock object. This does all of the heavy-lifting to
 * create a mock object. Its `create()` method returns an instance of `Mock`,
 * which is basically an original object with added data members for verifying
 * behavior.
 */
export class MockBuilder<ClassToMock> extends TestDoubleBuilder<ClassToMock> {
  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the mock object.
   *
   * @returns The original object with mocking capabilities.
   */
  public create(): ClassToMock & IMock<ClassToMock> {
    const original = new this.constructor_fn(...this.constructor_args);

    const mock = createMock<Constructor<ClassToMock>, ClassToMock>(
      this.constructor_fn,
    );

    (mock as IMock<ClassToMock> & ITestDouble<ClassToMock>).init(
      original,
      this.getAllFunctionNames(original),
    );

    // Attach all of the original's properties to the mock
    this.addOriginalProperties<IMock<ClassToMock>>(original, mock);

    // Attach all of the original's functions to the mock
    this.getAllFunctionNames(original).forEach((method: string) => {
      this.#addOriginalMethod(
        original,
        mock,
        method,
      );
    });

    return mock as ClassToMock & IMock<ClassToMock>;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an original object's method to a mock object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param mock - The mock object receiving the method.
   * @param method - The name of the method to mock -- callable via
   * `mock[method](...)`.
   */
  #addOriginalMethod(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    method: string,
  ): void {
    // If this is a native method, then do not do anything fancy. Just add it to
    // the mock.
    if (this.native_methods.indexOf(method as string) !== -1) {
      return this.addOriginalMethodWithoutTracking(
        original,
        mock,
        method,
      );
    }

    this.#addOriginalMethodAsProxy(
      original,
      mock,
      method as keyof ClassToMock,
    );
  }

  /**
   * Adds the original method as a proxy, which can be configured during tests.
   *
   * @param original - The original object containing the method to add.
   * @param mock - The mock object receiving the method.
   * @param method - The name of the method.
   */
  #addOriginalMethodAsProxy(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    method: keyof ClassToMock,
  ): void {
    Object.defineProperty(mock, method, {
      value: (...args: unknown[]) => {
        // Track that this method was called
        mock.calls[method]++;
        // TODO: copy spy approach because we need mock.expected_args

        // Make sure the method calls its original self
        const methodToCall =
          (original[method as keyof ClassToMock] as unknown as (
            ...params: unknown[]
          ) => unknown);

        // We need to check if the method was pre-preprogrammed to return
        // something. If it was, then we make sure that this method we are
        // currently defining returns that pre-programmed value.
        if (methodToCall instanceof PreProgrammedMethod) {
          if (methodToCall.will_throw) {
            throw methodToCall.error;
          }
          return methodToCall.return;
        }

        // When method calls its original self, let the `this` context of the
        // original be the mock. Reason being the mock has tracking and the
        // original does not.
        const bound = methodToCall.bind(mock);

        // Use `return` because the original function could return a value
        return bound(...args);
      },
      writable: true,
    });
  }
}
