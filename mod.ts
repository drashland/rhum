import type { Constructor, StubReturnValue } from "./src/types.ts";
import { MockBuilder } from "./src/mock/mock_builder.ts";
import { FakeBuilder } from "./src/fake/fake_builder.ts";
export * as Types from "./src/types.ts";
export * as Interfaces from "./src/interfaces.ts";

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

/**
 * Create a stub function that returns "stubbed".
 */
export function Stub<T, R>(): () => "stubbed";
/**
 * Take the given object and stub its given data member to return the given
 * return value.
 *
 * @param obj - The object receiving the stub.
 * @param dataMember - The data member on the object to be stubbed.
 * @param returnValue - (optional) What the stub should return. Defaults to
 * "stubbed".
 */
export function Stub<T, R>(
  obj: T,
  dataMember: keyof T,
  returnValue?: R,
): StubReturnValue<T, R>;
/**
 * Take the given object and stub its given data member to return the given
 * return value.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Stubs provide canned answers
 * to calls made during the test, usually not responding at all to anything
 * outside what's programmed in for the test."
 *
 * @param obj - (optional) The object receiving the stub. Defaults to a stub
 * function.
 * @param dataMember - (optional) The data member on the object to be stubbed.
 * Only used if `obj` is an object.
 * @param returnValue - (optional) What the stub should return. Defaults to
 * "stubbed" for class properties and a function that returns "stubbed" for
 * class methods. Only used if `object` is an object and `dataMember` is a
 * member of that object.
 */
export function Stub<T, R>(
  obj?: T,
  dataMember?: keyof T,
  returnValue?: R,
): unknown {
  if (obj === undefined) {
    return function stubbed() {
      return "stubbed";
    };
  }

  // If we get here, then we know for a fact that we are stubbing object
  // properties. Also, we do not care if `returnValue` was passed in here. If it
  // is not passed in, then `returnValue` defaults to "stubbed". Otherwise, use
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
