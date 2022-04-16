import type { Constructor } from "../types.ts";
import type { IMock } from "../interfaces.ts";
import { createMock } from "./mock_mixin.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";

/**
 * Builder to help build a mock object. This does all of the heavy-lifting to
 * create a mock object. Its `create()` method returns an instance of `Mock`,
 * which is basically an original object with added data members for verifying
 * behavior.
 */
export class MockBuilder<ClassToMock> {
  /**
   * The class object passed into the constructor
   */
  #constructor_fn: Constructor<ClassToMock>;

  /**
   * A list of arguments the class constructor takes
   */
  #constructor_args: unknown[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param constructorFn - The constructor function of the object to mock.
   */
  constructor(constructorFn: Constructor<ClassToMock>) {
    this.#constructor_fn = constructorFn;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the mock object.
   *
   * @returns The original object with capabilities from the Mock class.
   */
  public create(): ClassToMock & IMock<ClassToMock> {
    const original = new this.#constructor_fn(...this.#constructor_args);

    const mock = createMock<Constructor<ClassToMock>, ClassToMock>(
      this.#constructor_fn,
    );
    mock.init(original, this.#getAllFunctionNames(original));

    // Attach all of the original's properties to the mock
    this.#getAllPropertyNames(original).forEach((property: string) => {
      this.#addOriginalObjectPropertyToMockObject(
        original,
        mock,
        property,
      );
    });

    // Attach all of the original's functions to the mock
    this.#getAllFunctionNames(original).forEach((method: string) => {
      this.#addOriginalObjectMethodToMockObject(
        original,
        mock,
        method,
      );
    });

    return mock as ClassToMock & IMock<ClassToMock>;
  }

  /**
   * Before constructing the mock object, track any constructor function args
   * that need to be passed in when constructing the mock object.
   *
   * @param args - A rest parameter of arguments that will get passed in to the
   * constructor function of the object being mocked.
   *
   * @returns `this` so that methods in this class can be chained.
   */
  public withConstructorArgs(...args: unknown[]): this {
    this.#constructor_args = args;
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an original object's method to a mock object without doing anything
   * else.
   *
   * @param original - The original object containing the method to mock.
   * @param mock - The mock object receiving the method to mock.
   * @param method - The name of the method to mock -- callable via
   * `mock[method](...)`.
   */
  #addMethodToMockObject(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    method: string,
  ): void {
    Object.defineProperty(mock, method, {
      value: original[method as keyof ClassToMock],
    });
  }

  /**
   * Add an original object's method to a mock object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param mock - The mock object receiving the method.
   * @param method - The name of the method to mock -- callable via
   * `mock[method](...)`.
   */
  #addOriginalObjectMethodToMockObject(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    method: string,
  ): void {
    const nativeMethods = [
      "__defineGetter__",
      "__defineSetter__",
      "__lookupGetter__",
      "__lookupSetter__",
      "constructor",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf",
    ];

    // If this is a native method, then do not do anything fancy. Just add it to
    // the mock.
    if (nativeMethods.indexOf(method as string) !== -1) {
      return this.#addMethodToMockObject(
        original,
        mock,
        method,
      );
    }

    // Otherwise, make the method trackable via `.calls` usage.
    this.#addTrackableMethodToMockObject(
      original,
      mock,
      method as keyof ClassToMock,
    );
  }

  /**
   * Add an original object's property to a mock object.
   *
   * @param original The original object containing the property.
   * @param mock The mock object receiving the property.
   * @param property The name of the property -- retrievable via
   * `mock[property]`.
   */
  #addOriginalObjectPropertyToMockObject(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    property: string,
  ): void {
    const desc = Object.getOwnPropertyDescriptor(original, property) ??
      Object.getOwnPropertyDescriptor(
        this.#constructor_fn.prototype,
        property,
      );

    // If we do not have a desc, then we have no idea what the value should be.
    // Also, we have no idea what we are copying, so we should just not do it.
    if (!desc) {
      return;
    }

    // Basic property (e.g., public test = "hello"). We do not handle get() and
    // set() because those are handled by the mock mixin.
    if (("value" in desc)) {
      Object.defineProperty(mock, property, {
        value: desc.value,
        writable: true,
      });
    }
  }

  /**
   * Add a trackable method to a mock object. A trackable method is one that can
   * be verified using `mock.calls[someMethod]`.
   *
   * @param original - The original object containing the method to add.
   * @param mock - The mock object receiving the method.
   * @param method - The name of the method.
   */
  #addTrackableMethodToMockObject(
    original: ClassToMock,
    mock: IMock<ClassToMock>,
    method: keyof ClassToMock,
  ): void {
    Object.defineProperty(mock, method, {
      value: (...args: unknown[]) => {
        // Track that this method was called
        mock.calls[method]++;

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
    });
  }

  /**
   * Get all properties from the original so they can be added to the mock.
   *
   * @param obj - The object that will be mocked.
   *
   * @returns An array of the object's properties.
   */
  #getAllPropertyNames(obj: ClassToMock): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToMock] != "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Get all functions from the original so they can be added to the mock.
   *
   * @param obj - The object that will be mocked.
   *
   * @returns An array of the object's functions.
   */
  #getAllFunctionNames(obj: ClassToMock): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToMock] == "function"
        ) {
          return true;
        }
      },
    );
  }
}
