import { Constructor } from "./src/types.ts";
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
export const Dummy = <T>(constructorFn?: Constructor<T>): T => {
  const dummy = Object.create({});
  Object.setPrototypeOf(dummy, constructorFn ?? Object);
  return dummy;
};

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
export const Fake = <T>(constructorFn: Constructor<T>): FakeBuilder<T> => {
  return new FakeBuilder(constructorFn);
};

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
export const Mock = <T>(constructorFn: Constructor<T>): MockBuilder<T> => {
  return new MockBuilder(constructorFn);
};

/**
 * Create a stub.
 *
 * Per Martin Fowler (based on Gerard Meszaros), "Stubs provide canned answers
 * to calls made during the test, usually not responding at all to anything
 * outside what's programmed in for the test."
 *
 * @param obj -The object containing the member to stub.
 */
export const Stub = <T>(
  obj: T,
  dataMember: string,
  returnValue?: unknown,
): void => {
  Object.defineProperty(obj, "is_stubbed", {
    value: true,
  });

  const dataMemberToStub = obj[dataMember as keyof T];

  if (typeof dataMemberToStub === "function") {
    Object.defineProperty(obj, dataMember, {
      value: () => returnValue ?? null,
    });

    return;
  }

  Object.defineProperty(obj, dataMember, {
    value: returnValue ?? null,
  });
};
