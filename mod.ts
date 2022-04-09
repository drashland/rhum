import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";

export type { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";

/**
 * Get the mock builder to mock classes.
 *
 * @param constructorFn - The constructor function of the object to mock.
 *
 * Returns an instance of the MockBuilder class.
 *
 *     class ToBeMocked { ... }
 *
 *     const mock = Rhum
 *       .mock(ToBeMocked)
 *       .withConstructorArgs("someArg") // if the class to be mocked has a constructor and it requires args
 *       .create();
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
 *
 * Returns the object in question as a Stubbed type. Being a Stubbed type
 * means it has access to a `.stub()` method for stubbing properties and
 * methods.
 *
 *     class MyObject {
 *       public some_property = "someValue";
 *     }
 *
 *     // Define the object that will have stubbed members as a stubbed object
 *     const myStubbedObject = Rhum.stubbed(new MyObject());
 *
 *     // Stub the object's some_property property to a certain value
 *     myStubbedObject.stub("some_property", "this property is now stubbed");
 *
 *     // Assert that the property was stubbed
 *     Rhum.asserts.assertEquals(myStubbedObject.some_property, "this property is now stubbed");
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
