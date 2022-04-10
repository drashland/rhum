import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";

export type { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";

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
 * @param member -The member to stub.
 * @param value - The return value of the stubbed member.
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
