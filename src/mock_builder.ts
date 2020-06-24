export class MockBuilder {
  protected properties: string[] = [];
  protected functions: string[] = [];
  protected constructor_fn: any;
  protected constructor_args: any[] = [];

  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor(constructorFn: any) {
    this.constructor_fn = constructorFn;
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Create the mock object.
   *
   * @return any
   */
  public create(): any {
    let mock: any = {
      calls: {},
      is_mock: true,
    };
    let original: any;

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
          return original[method]();
        };
      } else {
        mock[method] = original[method];
      }
    });

    return mock;
  }

  /**
   * @description
   *     Before constructing the mock object, track any constructur function args
   *     that need to be passed in when constructing the mock object.
   *
   * @param any[] ...args
   *     A rest parameter of arguments that will get passed in to the
   *     constructor function of the class being mocked.
   *
   * @return this
   *     Return this so that methods in this class can be chained.
   */
  public withConstructorArgs(...args: any[]): this {
    this.constructor_args = args;
    return this;
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * @description
   *     Get all properties--public, protected, private--from the object that
   *     will be mocked.
   *
   * @param any constructorFn
   *     The object that will be mocked.
   *
   * @return string[]
   *     Returns an array of the object's properties.
   */
  protected getAllProperties(constructorFn: any): string[] {
    let functions: string[] = [];
    let clone = constructorFn;
    console.log(clone);
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (clone = Object.getPrototypeOf(clone));

    return functions.sort().filter(function (e: any, i: number, arr: any[]) {
      if (
        e != arr[i + 1] && typeof constructorFn[e] != "function"
      ) {
        return true;
      }
    });
  }

  /**
   * @description
   *     Get all functions--public, protected, private--from the object that
   *     will be mocked.
   *
   * @param any constructorFn
   *     The object that will be mocked.
   *
   * @return string[]
   *     Returns an array of the object's functions.
   */
  protected getAllFunctions(constructorFn: any): string[] {
    let functions: string[] = [];
    let clone = constructorFn;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (clone = Object.getPrototypeOf(clone));

    return functions.sort().filter(function (e: any, i: number, arr: any[]) {
      if (
        e != arr[i + 1] && typeof constructorFn[e] == "function"
      ) {
        return true;
      }
    });
  }
}
