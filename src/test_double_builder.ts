import type { Constructor } from "./types.ts";

/**
 * This class contains the methods to help build most of what a test double
 * needs.
 */
export class TestDoubleBuilder<OriginalClass> {
  /**
   * The constructor function of the objet to create a test double out of.
   */
  protected constructor_fn: Constructor<OriginalClass>;

  /**
   * A list of arguments the class constructor takes. This is used to
   * instantiate the original with arguments (if needed).
   */
  protected constructor_args: unknown[] = [];

  /**
   * A list of native methods on an original object that should not be modified.
   * When adding an original's methods to a test double, the copying process
   * uses this array to skip adding these native methods with tracking. There is
   * no reason to track these methods.
   */
  protected native_methods = [
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

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - CONSTRUCTOR ///////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param constructorFn - See this#constructor_fn.
   */
  constructor(constructorFn: Constructor<OriginalClass>) {
    this.constructor_fn = constructorFn;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Before constructing the fake object, track any constructor function args
   * that need to be passed in when constructing the fake object.
   *
   * @param args - A rest parameter of arguments that will get passed in to the
   * constructor function of the object being faked.
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
   * Get all functions from the original so they can be added to the test
   * double.
   *
   * @param obj - The object that will be a test double.
   *
   * @returns An array of the object's functions.
   */
  protected getAllFunctionNames(obj: OriginalClass): string[] {
    let functions: string[] = [];
    let clone = obj;

    // This do-while loop iterates over all of the parent classes of the
    // original object (if any). It gets all of the functions from the parent
    // class currently being iterated over, adds them to the `functions` array
    // variable, and repeats this process until it reaches the top-level parent.
    // An example is below:
    //
    //     class A {}
    //     class B extends A {}
    //     class C extends B {}
    //     class D extends C {}
    //
    //     let clone = new D();
    //
    //     do {
    //       functions = functions.concat(Object.getOwnPropertyNames(clone));
    //       // Iteration 1 ---> D {} // Adds all functions
    //       // Iteration 2 ---> D {} // Adds all functions
    //       // Iteration 3 ---> C {} // Adds all functions
    //       // Iteration 4 ---> B {} // Adds all functions
    //       // Iteration 5 ---> A {} // Adds all functions
    //       // Iteration 6 ---> {}   // Adss all functions and stops here
    //     } while ((clone = Object.getPrototypeOf(clone)));
    //
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof OriginalClass] == "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Get all properties from the original so they can be added to the test
   * double.
   *
   * @param obj - The object that will be a test double.
   *
   * @returns An array of the object's properties.
   */
  protected getAllPropertyNames(obj: OriginalClass): string[] {
    let properties: string[] = [];
    let clone = obj;

    // This do-while loop iterates over all of the parent classes of the
    // original object (if any). It gets all of the properties from the parent
    // class currently being iterated over, adds them to the `properties` array
    // variable, and repeats this process until it reaches the top-level parent.
    // An example is below:
    //
    //     class A {}
    //     class B extends A {}
    //     class C extends B {}
    //     class D extends C {}
    //
    //     let clone = new D();
    //
    //     do {
    //       properties = properties.concat(Object.getOwnPropertyNames(clone));
    //       // Iteration 1 ---> D {} // Adds all properties
    //       // Iteration 2 ---> D {} // Adds all properties
    //       // Iteration 3 ---> C {} // Adds all properties
    //       // Iteration 4 ---> B {} // Adds all properties
    //       // Iteration 5 ---> A {} // Adds all properties
    //       // Iteration 6 ---> {}   // Adss all properties and stops here
    //     } while ((clone = Object.getPrototypeOf(clone)));
    //
    do {
      properties = properties.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return properties.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof OriginalClass] != "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Add an original object's method to a a test double without doing anything
   * else.
   *
   * @param original - The original object containing the method.
   * @param testDouble - The test double object receiving the method.
   * @param method - The name of the method to fake -- callable via
   * `testDouble[method](...)`.
   */
  protected addOriginalMethodWithoutTracking<TestDoubleInterface>(
    original: OriginalClass,
    testDouble: TestDoubleInterface,
    method: string,
  ): void {
    Object.defineProperty(testDouble, method, {
      value: original[method as keyof OriginalClass],
    });
  }

  /**
   * Add an original object's properties to the test double.
   *
   * @param original The original object containing the property.
   * @param testDouble The test double object receiving the property.
   */
  protected addOriginalProperties<TestDoubleInterface>(
    original: OriginalClass,
    testDouble: TestDoubleInterface,
  ): void {
    this.getAllPropertyNames(original).forEach((property: string) => {
      this.addOriginalProperty<TestDoubleInterface>(
        original,
        testDouble,
        property,
      );
    });
  }

  /**
   * Add an original object's property to the test double.
   *
   * @param original The original object containing the property.
   * @param testDouble The test double object receiving the property.
   * @param property The name of the property -- retrievable via
   * `testDouble[property]`.
   */
  protected addOriginalProperty<TestDoubleInterface>(
    original: OriginalClass,
    testDouble: TestDoubleInterface,
    property: string,
  ): void {
    const desc = Object.getOwnPropertyDescriptor(original, property) ??
      Object.getOwnPropertyDescriptor(
        this.constructor_fn.prototype,
        property,
      );

    // If we do not have a desc, then we have no idea what the value should be.
    // Also, we have no idea what we are copying, so we should just not do it.
    if (!desc) {
      return;
    }

    // Basic property (e.g., public test = "hello"). We do not handle get() and
    // set() because those are handled by the test double mixin.
    if (("value" in desc)) {
      Object.defineProperty(testDouble, property, {
        value: desc.value,
        writable: true,
      });
    }
  }
}
