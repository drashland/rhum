export class MockBuilder {
  protected properties: string[] = [];
  protected functions: string[] = [];
  protected constructor_fn: any;
  protected constructor_args: any[] = [];

  constructor(constructorFn: any) {
    this.constructor_fn = constructorFn;
  }

  public withConstructorArgs(...args: any[]): this {
    this.constructor_args = args;
    return this;
  }

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
        '__defineGetter__',
        '__defineSetter__',
        '__lookupGetter__',
        '__lookupSetter__',
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf',
      ];

      if (nativeMethods.indexOf(method) == -1) {
        if (!mock.calls[method]) {
          mock.calls[method] = 0;
        }
        mock[method] = function() {
          mock.calls[method]++;
          return original[method]();
        };
      } else {
        mock[method] = original[method];
      }

    });

    return mock;
  }

  protected getAllProperties(inputObj: any): string[] {
    let functions: string[] = [];
    let clone = inputObj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (clone = Object.getPrototypeOf(clone));

    return functions.sort().filter(function (e: any, i: number, arr: any[]) {
      if (e != arr[i + 1] && typeof inputObj[e] != "function") return true;
    });
  }

  protected getAllFunctions(inputObj: any): string[] {
    let functions: string[] = [];
    let clone = inputObj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while (clone = Object.getPrototypeOf(clone));

    return functions.sort().filter(function (e: any, i: number, arr: any[]) {
      if (e != arr[i + 1] && typeof inputObj[e] == "function") return true;
    });
  }
}
