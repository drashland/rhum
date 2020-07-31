import { StdAsserts as asserts } from "../../deps.ts";
import { MockBuilder } from "../../src/mock_builder.ts";

Deno.test({
  name: "Unit | MockBuilder | constructor() | returns a MockBuilder object",
  fn(): void {
    const mock = new MockBuilder(TestObjectOne);
    asserts.assertEquals(mock.constructor.name, "MockBuilder");
  },
});

Deno.test({
  name: "Unit | MockBuilder | create() | creates mock without constructor args",
  fn(): void {
    const mock = new MockBuilder(TestObjectTwo)
      .create();
    asserts.assertEquals(mock.name, undefined);
  },
});

Deno.test({
  name: "Unit | MockBuilder | create() | creates mock with constructor args",
  fn(): void {
    const mock = new MockBuilder(TestObjectTwo)
      .withConstructorArgs("some name")
      .create();
    asserts.assertEquals(mock.name, "some name");
  },
});

// TODO(crookse) Write this test when we can invoke non-public members.
// Deno.test({
//   name: "Unit | MockBuilder | getAllProperties() | gets all properties",
//   fn(): void {
//   },
// });

// TODO(crookse) Write this test when we can invoke non-public members.
// Deno.test({
//   name: "Unit | MockBuilder | getAllFunctions() | gets all functions",
//   fn(): void {
//   },
// });

// FILE MARKER - DATA //////////////////////////////////////////////////////////

class TestObjectOne {
}

class TestObjectTwo {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}
