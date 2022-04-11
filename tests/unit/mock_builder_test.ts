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
        const mock = new MockBuilder(TestObjectThree).create();
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
        const mock = new MockBuilder(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Change original to return "Hello"
        mock.method("test").willReturn("Hello");
        mock.method("test").willReturn("Hello!");

        assertEquals(mock.test(), "Hello!");
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
      },
    });

    await t.step({
      name: "causes an error to be thrown if no return value is provided",
      fn(): void {
        const mock = new MockBuilder(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        mock.method("test");

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

    await t.step({
      name: ".willReturn() returns specified value",
      fn(): void {
        const mock = new MockBuilder(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        mock
          .method("test")
          .willReturn({
            name: "something"
          });

        assertEquals(mock.test(), {name: "something"});
        assertEquals(mock.calls.test, 2);
        assertEquals(mock.calls.hello, 2);
      },
    });

    await t.step({
      name: ".willReturn(mock) returns the mock object (basic)",
      fn(): void {
        const mock = new MockBuilder(TestObjectFourBuilder).create();
        assertEquals(mock.is_mock, true);

        // mock
        //   .method("someComplexMethod")
        //   .willReturn(mock)

        assertEquals(mock.someComplexMethod(), mock);
        assertEquals(mock.calls.someComplexMethod, 1);
      },
    });

    await t.step({
      name: ".willThrow() causes throwing RandomError (with constructor)",
      fn(): void {
        const mock = new MockBuilder(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError("Random error message."))

        assertThrows(
          () => mock.test(),
          RandomError,
          "Random error message."
        );
        assertEquals(mock.calls.test, 2);
      },
    });

    await t.step({
      name: ".willThrow() causes throwing RandomError2 (no constructor)",
      fn(): void {
        const mock = new MockBuilder(TestObjectThree).create();
        assertEquals(mock.is_mock, true);

        // Original returns "World"
        assertEquals(mock.test(), "World");

        // Make the original method throw RandomError
        mock
          .method("test")
          .willThrow(new RandomError2())

        assertThrows(
          () => mock.test(),
          RandomError2,
          "Some message not by the constructor."
        );
        assertEquals(mock.calls.test, 2);
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

class TestObjectThree {
  public hello(): void {
    return;
  }

  public test(): string {
    this.hello();
    this.hello();
    return "World";
  }
}

class TestObjectFourBuilder {
  #something_one?: string;
  #something_two?: string;

  get something_one(): string | undefined {
    return this.#something_one;
  }

  get something_two(): string | undefined {
    return this.#something_two;
  }

  someComplexMethod(): this {
    this.#setSomethingOne();
    this.#setSomethingTwo();
    return this;
  }

  #setSomethingOne(): void {
    this.#something_one = "one";
  }

  #setSomethingTwo(): void {
    this.#something_two = "two";
  }
}

class RandomError extends Error {}
class RandomError2 extends Error {
  public name = "RandomError2Name"
  public message = "Some message not by the constructor."
}