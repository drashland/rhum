import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";

export type { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";
/**
 * Create an object that can be passed around, but never actually used. A dummy
 * is usually just used to fill a parameter.
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
}

/**
 * Get the builder to help you create mocked objects.
 *
 * @param constructorFn - The constructor function of the object to mock.
 *
 * @returns Instance of `MockBuilder`.
 */
export const Mock = <T>(constructorFn: Constructor<T>): MockBuilder<T> => {
  return new MockBuilder(constructorFn);
};

/**
 * Stub a member of an object.
 *
 * @param obj -The object containing the member to stub.
 */
export const Stub = <T>(obj: T): Stubbed<T> => {
  (obj as unknown as { [key: string]: boolean }).is_stubbed = true;
  (obj as unknown as {
    [key: string]: (property: string, value: unknown) => void;
  }).stub = function (
    property: string,
    value: unknown,
  ): void {
    Object.defineProperty(obj, property, {
      value: value,
    });
  };

  return obj as Stubbed<T>;
};
