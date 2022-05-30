import type { Callable, Constructor, MethodOf } from "./src/types.ts";
import { MockBuilder } from "./src/mock/mock_builder.ts";
import { FakeBuilder } from "./src/fake/fake_builder.ts";
import { SpyBuilder } from "./src/spy/spy_builder.ts";
import { SpyStubBuilder } from "./src/spy/spy_stub_builder.ts";
import * as Interfaces from "./src/interfaces.ts";
export * as Types from "./src/types.ts";
export * as Interfaces from "./src/interfaces.ts";

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DUMMY /////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Create a dummy.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Dummy objects are passed
 * around but never actually used.  Usually they are just used to fill parameter
 * lists."
 *
 * @param constructorFn - The constructor function to use to become the
 * prototype of the dummy. Dummy objects should be the same instance as what
 * they are standing in for. For example, if a `SomeClass` parameter needs to be
 * filled with a dummy because it is out of scope for a test, then the dummy
 * should be an instance of `SomeClass`.
 * @returns A dummy object being an instance of the given constructor function.
 */
export function Dummy<T>(constructorFn?: Constructor<T>): T {
  const dummy = Object.create({});
  Object.setPrototypeOf(dummy, constructorFn ?? Object);
  return dummy;
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - FAKE //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Get the builder to create fake objects.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Fake objects actually have
 * working implementations, but usually take some shortcut which makes them not
 * suitable for production (an InMemoryTestDatabase is a good example)."
 *
 * @param constructorFn - The constructor function of the object to fake.
 *
 * @returns Instance of `FakeBuilder`.
 */
export function Fake<T>(constructorFn: Constructor<T>): FakeBuilder<T> {
  return new FakeBuilder(constructorFn);
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - MOCK //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Get the builder to create mocked objects.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Mocks are pre-programmed with
 * expectations which form a specification of the calls they are expected to
 * receive. They can throw an exception if they receive a call they don't expect
 * and are checked during verification to ensure they got all the calls they
 * were expecting."
 *
 * @param constructorFn - The constructor function of the object to mock.
 *
 * @returns Instance of `MockBuilder`.
 */
export function Mock<T>(constructorFn: Constructor<T>): MockBuilder<T> {
  return new MockBuilder(constructorFn);
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - SPY ///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Create a spy out of a function expression.
 *
 * @param functionExpression - The function expression to turn into a spy.
 * @param returnValue - (Optional) The value the spy should return when called.
 * Defaults to "spy-stubbed".
 *
 * @returns The original function expression with spying capabilities.
 */
export function Spy<
  OriginalFunction extends Callable<ReturnValue>,
  ReturnValue,
>(
  functionExpression: OriginalFunction,
  returnValue?: ReturnValue,
): Interfaces.ISpyStubFunctionExpression & OriginalFunction;

/**
 * Create a spy out of an object's method.
 *
 * @param obj - The object containing the method to spy on.
 * @param dataMember - The method to spy on.
 * @param returnValue - (Optional) The value the spy should return when called.
 * Defaults to "spy-stubbed".
 *
 * @returns The original method with spying capabilities.
 */
export function Spy<OriginalObject, ReturnValue>(
  obj: OriginalObject,
  dataMember: MethodOf<OriginalObject>,
  returnValue?: ReturnValue,
): Interfaces.ISpyStubMethod;

/**
 * Create spy out of a class.
 *
 * @param constructorFn - The constructor function of the object to spy on.
 *
 * @returns The original object with spying capabilities.
 */
export function Spy<OriginalClass>(
  constructorFn: Constructor<OriginalClass>,
): Interfaces.ISpy<OriginalClass> & OriginalClass;

/**
 * Create a spy out of a class, class method, or function.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Spies are stubs that also
 * record some information based on how they were called. One form of this might
 * be an email service that records how many messages it was sent."
 *
 * @param original - The original to turn into a spy.
 * @param methodOrReturnValue - (Optional) If creating a spy out of an object's method, then
 * this would be the method name. If creating a spy out of a function
 * expression, then this would be the return value.
 * @param returnValue - (Optional) If creating a spy out of an object's method, then
 * this would be the return value.
 */
export function Spy<OriginalObject, ReturnValue>(
  original: unknown,
  methodOrReturnValue?: unknown,
  returnValue?: unknown,
): unknown {
  if (typeof original === "function") {
    // If the function has the prototype field, the it's a constructor function.
    //
    // Examples:
    //     class Hello { }
    //     function Hello() { }
    //
    if ("prototype" in original) {
      return new SpyBuilder(original as Constructor<OriginalObject>).create();
    }

    // Otherwise, it's just a function.
    //
    // Example:
    //     const hello = () => "world";
    //
    // Not that function declarations (e.g., function hello() { }) will have
    // "prototype" and will go through the SpyBuilder() flow above.
    return new SpyStubBuilder(original as OriginalObject)
      .returnValue(methodOrReturnValue as ReturnValue)
      .createForFunctionExpression();
  }

  // If we get here, then we are not spying on a class or function. We must be
  // spying on an object's method.
  return new SpyStubBuilder(original as OriginalObject)
    .method(methodOrReturnValue as MethodOf<OriginalObject>)
    .returnValue(returnValue as ReturnValue)
    .createForObjectMethod();
}

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - STUB //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Create a stub function that returns "stubbed".
 *
 * @returns A function that returns "stubbed".
 */
export function Stub<OriginalObject>(): () => "stubbed";

/**
 * Take the given object and stub its given data member to return the given
 * return value.
 *
 * @param obj - The object receiving the stub.
 * @param dataMember - The data member on the object to be stubbed.
 * @param returnValue - (optional) What the stub should return. Defaults to
 * "stubbed".
 */
export function Stub<OriginalObject, ReturnValue>(
  obj: OriginalObject,
  dataMember: keyof OriginalObject,
  returnValue?: ReturnValue,
): void;
/**
 * Take the given object and stub its given data member to return the given
 * return value.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Stubs provide canned answers
 * to calls made during the test, usually not responding at all to anything
 * outside what's programmed in for the test."
 *
 * @param obj - (Optional) The object receiving the stub. Defaults to a stub
 * function.
 * @param dataMember - (Optional) The data member on the object to be stubbed.
 * Only used if `obj` is an object.
 * @param returnValue - (Optional) What the stub should return. Defaults to
 * "stubbed" for class properties and a function that returns "stubbed" for
 * class methods. Only used if `object` is an object and `dataMember` is a
 * member of that object.
 */
export function Stub<OriginalObject, ReturnValue>(
  obj?: OriginalObject,
  dataMember?: keyof OriginalObject,
  returnValue?: ReturnValue,
): unknown {
  if (obj === undefined) {
    return function stubbed() {
      return "stubbed";
    };
  }

  // If we get here, then we know for a fact that we are stubbing object
  // properties. Also, we do not care if `returnValue` was passed in here. If it
  // is not passed in, then `returnValue` defaults to "spy-stubbed". Otherwise, use
  // the value of `returnValue`.
  if (typeof obj === "object" && dataMember !== undefined) {
    // If we are stubbing a method, then make sure the method is still callable
    if (typeof obj[dataMember] === "function") {
      Object.defineProperty(obj, dataMember, {
        value: () => returnValue !== undefined ? returnValue : "stubbed",
        writable: true,
      });
    } else {
      // If we are stubbing a property, then just reassign the property
      Object.defineProperty(obj, dataMember, {
        value: returnValue !== undefined ? returnValue : "stubbed",
        writable: true,
      });
    }
  }
}
