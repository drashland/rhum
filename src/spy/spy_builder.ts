import type { Constructor } from "../types.ts";
import type { ISpy, ITestDouble } from "../interfaces.ts";
import { createSpy } from "./spy_mixin.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";

/**
 * Builder to help build a spy object. This does all of the heavy-lifting to
 * create a spy object. Its `create()` method returns an instance of `Spy`,
 * which is basically an original object with stubbed data members.
 */
export class SpyBuilder<ClassToSpy> {
  /**
   * The class object passed into the constructor
   */
  #constructor_fn: Constructor<ClassToSpy>;

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
   * @param constructorFn - The constructor function of the object to spy.
   */
  constructor(constructorFn: Constructor<ClassToSpy>) {
    this.#constructor_fn = constructorFn;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the spy object.
   *
   * @returns The original object with capabilities from the Spy class.
   */
  public create(): ClassToSpy {
    const original = new this.#constructor_fn(...this.#constructor_args);

    const spy = createSpy<Constructor<ClassToSpy>, ClassToSpy>(
      this.#constructor_fn,
    );
    (spy as ISpy<ClassToSpy> & ITestDouble<ClassToSpy>).init(
      original,
      this.#getAllFunctionNames(original),
    );

    // Attach all of the original's properties to the spy
    this.#getAllPropertyNames(original).forEach((property: string) => {
      this.#addOriginalObjectPropertyToSpyObject(
        original,
        spy,
        property,
      );
    });

    // Attach all of the original's functions to the spy
    this.#getAllFunctionNames(original).forEach((method: string) => {
      this.#addOriginalObjectMethodToSpyObject(
        original,
        spy,
        method,
      );
    });

    return spy as ClassToSpy & ISpy<ClassToSpy>;
  }

  /**
   * Before constructing the spy object, track any constructor function args
   * that need to be passed in when constructing the spy object.
   *
   * @param args - A rest parameter of arguments that will get passed in to the
   * constructor function of the object being spyed.
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
   * Add an original object's method to a spy object without doing anything
   * else.
   *
   * @param original - The original object containing the method to spy.
   * @param spy - The spy object receiving the method to spy.
   * @param method - The name of the method to spy -- callable via
   * `spy[method](...)`.
   */
  #addMethodToSpyObject(
    original: ClassToSpy,
    spy: ISpy<ClassToSpy>,
    method: string,
  ): void {
    Object.defineProperty(spy, method, {
      value: original[method as keyof ClassToSpy],
    });
  }

  /**
   * Add an original object's method to a spy object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param spy - The spy object receiving the method.
   * @param method - The name of the method to spy -- callable via
   * `spy[method](...)`.
   */
  #addOriginalObjectMethodToSpyObject(
    original: ClassToSpy,
    spy: ISpy<ClassToSpy>,
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
    // the spy.
    if (nativeMethods.indexOf(method as string) !== -1) {
      return this.#addMethodToSpyObject(
        original,
        spy,
        method,
      );
    }

    // Otherwise, make the method trackable via `.calls` usage.
    this.#addTrackableMethodToSpyObject(
      original,
      spy,
      method as keyof ClassToSpy,
    );
  }

  /**
   * Add an original object's property to a spy object.
   *
   * @param original The original object containing the property.
   * @param spy The spy object receiving the property.
   * @param property The name of the property -- retrievable via
   * `spy[property]`.
   */
  #addOriginalObjectPropertyToSpyObject(
    original: ClassToSpy,
    spy: ISpy<ClassToSpy>,
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
    // set() because those are handled by the spy mixin.
    if (("value" in desc)) {
      Object.defineProperty(spy, property, {
        value: desc.value,
        writable: true,
      });
    }
  }

  /**
   * Add a trackable method to a spy object. A trackable method is one that can
   * be verified using `spy.calls[someMethod]`.
   *
   * @param original - The original object containing the method to add.
   * @param spy - The spy object receiving the method.
   * @param method - The name of the method.
   */
  #addTrackableMethodToSpyObject(
    original: ClassToSpy,
    spy: ISpy<ClassToSpy>,
    method: keyof ClassToSpy,
  ): void {
    Object.defineProperty(spy, method, {
      value: (...args: unknown[]) => {
        // Track that this method was called
        spy.calls[method]++;

        // Track what arguments were passed in when this method was called
        spy.calls_arguments[method] = args;

        // Make sure the method calls its original self
        const methodToCall =
          (original[method as keyof ClassToSpy] as unknown as (
            ...params: unknown[]
          ) => unknown);

        // When method calls its original self, let the `this` context of the
        // original be the spy. Reason being the spy has tracking and the
        // original does not.
        const bound = methodToCall.bind(spy);

        // Use `return` because the original function could return a value
        return bound(...args);
      },
    });
  }

  /**
   * Get all properties from the original so they can be added to the spy.
   *
   * @param obj - The object that will be spyed.
   *
   * @returns An array of the object's properties.
   */
  #getAllPropertyNames(obj: ClassToSpy): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToSpy] != "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Get all functions from the original so they can be added to the spy.
   *
   * @param obj - The object that will be spyed.
   *
   * @returns An array of the object's functions.
   */
  #getAllFunctionNames(obj: ClassToSpy): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToSpy] == "function"
        ) {
          return true;
        }
      },
    );
  }
}
