import { Mocked, constructorFn } from "./interfaces.ts";

export class MockBuilder<T> {
  protected properties: string[] = [];
  protected functions: string[] = [];
  protected constructor_fn: constructorFn<T>;
  protected constructor_args: unknown[] = [];

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor(constructorFn: constructorFn<T>) {
    this.constructor_fn = constructorFn;
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Create the mock object.
   *
   * @return Mocked<T>
   */
  public create(): Mocked<T> {
    // deno-lint-ignore no-explicit-any, eslint-ignore-next-line no-explicit-any
    let mock: Mocked<any> = {
      calls: {},
      is_mock: true,
    };
    let original: T;

    // Construct an object of the class to be mocked
    if (this.constructor_args.length > 0) {
      original = new this.constructor_fn(...this.constructor_args);
    } else {
      original = new this.constructor_fn();
    }

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
        if (!mock.calls[method]) {
          mock.calls[method] = 0;
        }
        mock[method] = function () {
          mock.calls[method]++;
          return (original[method as keyof T] as unknown as Function)();
        };
      } else {
        // copy nativeMethod directly without mocking
        mock[method] = original[method as keyof T];
      }
    });

    return mock;
  }

  /**
   * @description
   *     Before constructing the mock object, track any constructur function args
   *     that need to be passed in when constructing the mock object.
   *
   * @param unknown[] ...args
   *     A rest parameter of arguments that will get passed in to the
   *     constructor function of the class being mocked.
   *
   * @return this
   *     Return this so that methods in this class can be chained.
   */
  public withConstructorArgs(...args: unknown[]): this {
    this.constructor_args = args;
    return this;
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * @description
   *     Get all properties--public, protected, private--from the object that
   *     will be mocked.
   *
   * @param T obj
   *     The object that will be mocked.
   *
   * @return string[]
   *     Returns an array of the object's properties.
   */
  protected getAllProperties(obj: T): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (!!(clone = Object.getPrototypeOf(clone)));

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
   * @description
   *     Get all functions--public, protected, private--from the object that
   *     will be mocked.
   *
   * @param T obj
   *     The object that will be mocked.
   *
   * @return string[]
   *     Returns an array of the object's functions.
   */
  protected getAllFunctions(obj: T): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (!!(clone = Object.getPrototypeOf(clone)));

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
