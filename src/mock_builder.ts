import type { Constructor, Mocked } from "./types.ts";

export class MockBuilder<T> {
  /**
   * Properties of the class that is passed in
   */
  protected properties: string[] = [];

  /**
   * Functions of the class passed in
   */
  protected functions: string[] = [];

  /**
   * The class object passed into the constructor
   */
  protected constructor_fn: Constructor<T>;

  /**
   * A list of arguments the class constructor takes
   */
  protected constructor_args: unknown[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param constructorFn - The object's constructor function to instantiate.
   */
  constructor(constructorFn: Constructor<T>) {
    this.constructor_fn = constructorFn;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the mock object.
   *
   * @returns A mocked object.
   */
  public create(): Mocked<T> {
    // deno-lint-ignore no-explicit-any
    const mock: Mocked<any> = {
      methods: {},
      is_mock: true,
    };
    const original = new this.constructor_fn(...this.constructor_args);

    // Attach all of the original's properties to the mock
    this.getAllProperties(original).forEach((property: string) => {
      const desc = Object.getOwnPropertyDescriptor(original, property);
      mock[property] = desc!.value;
    });

    // Attach all of the original's functions to the mock
    this.getAllFunctions(original).forEach((method: string) => {
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

      if (nativeMethods.indexOf(method) == -1) {

        // Define an object to track data for assertions
        if (!mock.methods[method]) {
          mock.methods[method] = {
            num_calls: 0,
            wasCalledTimes: function (input: number) {
              return input == this.num_calls;
            }
          }
        }

        mock[method] = function (...args: unknown[]) {

          // Count how many times this method was called
          mock.methods[method].num_calls++;

          // Track the last arguments that this method was called with
          mock.methods[method].wasLastCalledWith = function (input: unknown[]) {
            const i = JSON.stringify(input);
            const a = JSON.stringify(args);
            return i == a;
          }

          const ret = (original[method as keyof T] as unknown as (
            ...params: unknown[]
          ) => unknown)(...args);

          // Track what this method last returned
          mock.methods[method].lastReturned = function (input: unknown) {
            return input == ret;
          }

          return ret;
        };
      } else {
        // copy nativeMethod directly without mocking
        mock[method] = original[method as keyof T];
      }
    });

    return mock;
  }

  /**
   * Before constructing the mock object, track any constructur function args
   * that need to be passed in when constructing the mock object.
   *
   * @param args - A rest parameter of arguments that will get passed in to
   * the constructor function of the class being mocked.
   *
   * @returns `this` so that methods in this class can be chained.
   */
  public withConstructorArgs(...args: unknown[]): this {
    this.constructor_args = args;
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Get all properties--public, protected, private--from the object that will
   * be mocked.
   *
   * @param obj - The object that will be mocked.
   *
   * @returns An array of the object's properties.
   */
  protected getAllProperties(obj: T): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof T] != "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Get all functions--public, protected, private--from the object that will be
   * mocked.
   *
   * @param obj - The object that will be mocked.
   *
   * @returns An array of the object's functions.
   */
  protected getAllFunctions(obj: T): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof T] == "function"
        ) {
          return true;
        }
      },
    );
  }
}
