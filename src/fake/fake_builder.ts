import type { Constructor } from "../types.ts";
import type { IFake } from "../interfaces.ts";
import { createFake } from "./fake_mixin.ts";
import { PreProgrammedMethod } from "../pre_programmed_method.ts";

/**
 * Builder to help build a fake object. This does all of the heavy-lifting to
 * create a fake object.
 */
export class FakeBuilder<ClassToFake> {
  /**
   * The class to fake (should be constructable).
   */
  #constructor_fn: Constructor<ClassToFake>;

  /**
   * A list of arguments the class constructor takes.
   */
  #constructor_args: unknown[] = [];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - CONSTRUCTOR /////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Construct an object of this class.
   *
   * @param constructorFn - The class to fake (should be constructable).
   */
  constructor(constructorFn: Constructor<ClassToFake>) {
    this.#constructor_fn = constructorFn;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Create the fake object.
   *
   * @returns The original object with capabilities from the fake class.
   */
  public create(): ClassToFake & IFake<ClassToFake> {
    const original = new this.#constructor_fn(...this.#constructor_args);

    const fake = createFake<Constructor<ClassToFake>, ClassToFake>(
      this.#constructor_fn,
    );
    fake.init(original, this.#getAllFunctionNames(original));

    // Attach all of the original's properties to the fake
    this.#getAllPropertyNames(original).forEach((property: string) => {
      this.#addOriginalObjectPropertyToFakeObject(
        original,
        fake,
        property,
      );
    });

    // Attach all of the original's functions to the fake
    this.#getAllFunctionNames(original).forEach((method: string) => {
      this.#addOriginalObjectMethodToFakeObject(
        original,
        fake,
        method,
      );
    });

    return fake as ClassToFake & IFake<ClassToFake>;
  }

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
    this.#constructor_args = args;
    return this;
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PRIVATE ///////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Add an original object's method to a fake object without doing anything
   * else.
   *
   * @param original - The original object containing the method to fake.
   * @param fake - The fake object receiving the method to fake.
   * @param method - The name of the method to fake -- callable via
   * `fake[method](...)`.
   */
  #addMethodToFakeObject(
    original: ClassToFake,
    fake: IFake<ClassToFake>,
    method: string,
  ): void {
    Object.defineProperty(fake, method, {
      value: original[method as keyof ClassToFake],
    });
  }

  /**
   * Add an original object's method to a fake object -- determining whether the
   * method should or should not be trackable.
   *
   * @param original - The original object containing the method to add.
   * @param fake - The fake object receiving the method.
   * @param method - The name of the method to fake -- callable via
   * `fake[method](...)`.
   */
  #addOriginalObjectMethodToFakeObject(
    original: ClassToFake,
    fake: IFake<ClassToFake>,
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
    // the fake.
    if (nativeMethods.includes(method as string)) {
      return this.#addMethodToFakeObject(
        original,
        fake,
        method,
      );
    }

    // Otherwise, make the method trackable via `.calls` usage.
    this.#addTrackableMethodToFakeObject(
      original,
      fake,
      method as keyof ClassToFake,
    );
  }

  /**
   * Add an original object's property to a fake object.
   *
   * @param original The original object containing the property.
   * @param fake The fake object receiving the property.
   * @param property The name of the property -- retrievable via
   * `fake[property]`.
   */
  #addOriginalObjectPropertyToFakeObject(
    original: ClassToFake,
    fake: IFake<ClassToFake>,
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
    // set() because those are handled by the fake mixin.
    if (("value" in desc)) {
      Object.defineProperty(fake, property, {
        value: desc.value,
        writable: true,
      });
    }
  }

  /**
   * Add a trackable method to a fake object. A trackable method is one that can
   * be verified using `fake.calls[someMethod]`.
   *
   * @param original - The original object containing the method to add.
   * @param fake - The fake object receiving the method.
   * @param method - The name of the method.
   */
  #addTrackableMethodToFakeObject(
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
        // original be the fake. Reason being the fake has tracking and the
        // original does not.
        const bound = methodToCall.bind(fake);

        // console.log(`calling bound()`);

        // Use `return` because the original function could return a value
        return bound(...args);
      },
    });
  }

  /**
   * Get all properties from the original so they can be added to the fake.
   *
   * @param obj - The object that will be faked.
   *
   * @returns An array of the object's properties.
   */
  #getAllPropertyNames(obj: ClassToFake): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToFake] != "function"
        ) {
          return true;
        }
      },
    );
  }

  /**
   * Get all functions from the original so they can be added to the fake.
   *
   * @param obj - The object that will be faked.
   *
   * @returns An array of the object's functions.
   */
  #getAllFunctionNames(obj: ClassToFake): string[] {
    let functions: string[] = [];
    let clone = obj;
    do {
      functions = functions.concat(Object.getOwnPropertyNames(clone));
    } while ((clone = Object.getPrototypeOf(clone)));

    return functions.sort().filter(
      function (e: string, i: number, arr: unknown[]) {
        if (
          e != arr[i + 1] && typeof obj[e as keyof ClassToFake] == "function"
        ) {
          return true;
        }
      },
    );
  }
}
