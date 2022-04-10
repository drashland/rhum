import { assertEquals, assertThrows } from "../deps.ts";
import { MockBuilder } from "../../src/mock_builder.ts";

Deno.test("MockBuilder", async (t) => {
  await t.step("create()", async (t) => {
    await t.step({
      name: "creates mock builder",
      fn(): void {
        const mock = new MockBuilder(TestObjectOne);
        assertEquals(mock.constructor.name, "MockBuilder");
      },
    });

    await t.step({
      name: "creates mock without constructor args",
      fn(): void {
        const mock = new MockBuilder(TestObjectTwo)
          .create();
        assertEquals(mock.name, undefined);
        assertEquals(mock.is_mock, true);
      },
    });

    await t.step({
      name: "creates mock with constructor args",
      fn(): void {
        const mock = new MockBuilder(TestObjectTwo)
          .withConstructorArgs("some name")
          .create();
        assertEquals(mock.name, "some name");
        assertEquals(mock.is_mock, true);
      },
    });
  });

  await t.step("method()", async (t) => {
    await t.step({
      name: "allows pre-programming a method",
      fn(): void {
        const mock = new MockBuilder(WillReturnObjectOne).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");

        // Should output "Hello" and make the following calls
        assertEquals(mock.test(), "Hello");
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
      },
    });

    await t.step({
      name: "allows pre-programming a method more than once",
      fn(): void {
        const mock = new MockBuilder(WillReturnObjectOne).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");
        mock.method("test").willReturn("Hello!");

        // Should output "Hello" and make the following calls
        assertEquals(mock.test(), "Hello!");
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
      },
    });

    await t.step({
      name: "causes an error to be thrown if no return value is provided",
      fn(): void {
        const mock = new MockBuilder(WillReturnObjectOne).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        mock.method("test");

        // Should output "Hello" and make the following calls
        try {
          mock.test();
        } catch (error) {
          assertEquals(
            error.message,
            `Pre-programmed method "test" does not have a return value.`,
          );
        }
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
      },
    });
  });
});

// FILE MARKER - DATA //////////////////////////////////////////////////////////

class TestObjectOne {
}

class TestObjectTwo {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class WillReturnObjectOne {
  public hello(): void {
    return;
  }

  public test(): string {
    this.hello();
    this.hello();
    return "World";
  }
}
