import { Fake } from "../../../../mod.ts";
import { assertEquals, assertThrows } from "../../../deps.ts";

Deno.test("Fake()", async (t) => {
  await t.step({
    name: "creates fake builder",
    fn(): void {
      const fake = Fake(TestObjectOne);
      assertEquals(fake.constructor.name, "FakeBuilder");
    },
  });

  await t.step(".create()", async (t) => {
    await t.step({
      name: "creates fake object",
      fn(): void {
        const fake = Fake(TestObjectTwo).create();
        assertEquals(fake.name, undefined);
        assertEquals(fake.is_fake, true);
      },
    });
  });

  await t.step(".withConstructorArgs(...)", async (t) => {
    await t.step({
      name: "can take 1 arg",
      fn(): void {
        const fake = Fake(TestObjectTwo)
          .withConstructorArgs("some name")
          .create();
        assertEquals(fake.name, "some name");
        assertEquals(fake.is_fake, true);
      },
    });

    await t.step({
      name: "can take more than 1 arg",
      fn(): void {
        const fake = Fake(TestObjectTwoMore)
          .withConstructorArgs("some name", ["hello"])
          .create();
        assertEquals(fake.name, "some name");
        assertEquals(fake.array, ["hello"]);
        assertEquals(fake.is_fake, true);
      },
    });
  });

  await t.step(".method(...)", async (t) => {
    await t.step({
      name: "requires .willReturn(...) or .willThrow(...) to be chained",
      fn(): void {
        const fake = Fake(TestObjectThree).create();
        assertEquals(fake.is_fake, true);

        // Original returns "World"
        assertEquals(fake.test(), "World");

        // Don't fully pre-program the method. This should cause an error during assertions.
        fake.method("test");

        try {
          fake.test();
        } catch (error) {
          assertEquals(
            error.message,
            `Pre-programmed method "test" does not have a return value.`,
          );
        }
      },
    });

    await t.step({
      name:
        ".willReturn(...) does not call original method and returns given value",
      fn(): void {
        // Assert that a fake can make a class take a shortcut
        const fakeServiceDoingShortcut = Fake(Repository).create();
        fakeServiceDoingShortcut.method("findAllUsers").willReturn("shortcut");
        const resourceWithShortcut = new Resource(
          fakeServiceDoingShortcut,
        );
        resourceWithShortcut.getUsers();
        assertEquals(fakeServiceDoingShortcut.anotha_one_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_else_called, false);

        // Assert that the fake service can call original implementations
        const fakeServiceNotDoingShortcut = Fake(Repository).create();
        const resourceWithoutShortcut = new Resource(
          fakeServiceNotDoingShortcut,
        );
        resourceWithoutShortcut.getUsers();
        assertEquals(fakeServiceNotDoingShortcut.anotha_one_called, true);
        assertEquals(fakeServiceNotDoingShortcut.do_something_called, true);
        assertEquals(
          fakeServiceNotDoingShortcut.do_something_else_called,
          true,
        );
      },
    });

    await t.step({
      name: ".willReturn(...) can be performed more than once",
      fn(): void {
        // Assert that a fake can make a class take a shortcut
        const fakeServiceDoingShortcut = Fake(Repository).create();
        fakeServiceDoingShortcut.method("findUserById").willReturn("shortcut");
        fakeServiceDoingShortcut.method("findUserById").willReturn("shortcut2");
        const resourceWithShortcut = new Resource(
          fakeServiceDoingShortcut,
        );
        resourceWithShortcut.getUser(1);
        assertEquals(fakeServiceDoingShortcut.anotha_one_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_else_called, false);

        // Assert that the fake service can call original implementations
        const fakeServiceNotDoingShortcut = Fake(Repository).create();
        const resourceWithoutShortcut = new Resource(
          fakeServiceNotDoingShortcut,
        );
        resourceWithoutShortcut.getUser(1);
        assertEquals(fakeServiceNotDoingShortcut.anotha_one_called, true);
        assertEquals(fakeServiceNotDoingShortcut.do_something_called, true);
        assertEquals(
          fakeServiceNotDoingShortcut.do_something_else_called,
          true,
        );
      },
    });

    await t.step({
      name: ".willThrow(...) does not call original method and throws error",
      fn(): void {
        // Assert that a fake can make a class take a shortcut
        const fakeServiceDoingShortcut = Fake(Repository).create();
        fakeServiceDoingShortcut.method("findAllUsers").willReturn("shortcut");
        const resourceWithShortcut = new Resource(
          fakeServiceDoingShortcut,
        );
        resourceWithShortcut.getUsers();
        assertEquals(fakeServiceDoingShortcut.anotha_one_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_called, false);
        assertEquals(fakeServiceDoingShortcut.do_something_else_called, false);

        // Assert that the fake service can call original implementations
        const fakeServiceNotDoingShortcut = Fake(Repository).create();
        const resourceWithoutShortcut = new Resource(
          fakeServiceNotDoingShortcut,
        );
        resourceWithoutShortcut.getUsers();
        assertEquals(fakeServiceNotDoingShortcut.anotha_one_called, true);
        assertEquals(fakeServiceNotDoingShortcut.do_something_called, true);
        assertEquals(
          fakeServiceNotDoingShortcut.do_something_else_called,
          true,
        );
      },
    });

    await t.step({
      name: ".willReturn(fake) returns the fake object (basic)",
      fn(): void {
        const fake = Fake(TestObjectFourBuilder).create();
        assertEquals(fake.is_fake, true);

        fake
          .method("someComplexMethod")
          .willReturn(fake);

        assertEquals(fake.someComplexMethod(), fake);
      },
    });

    await t.step({
      name: ".willReturn(fake) returns the fake object (extra)",
      fn(): void {
        // Assert that the original implementation sets properties
        const fake1 = Fake(TestObjectFourBuilder).create();
        assertEquals(fake1.is_fake, true);
        fake1.someComplexMethod();
        assertEquals(fake1.something_one, "one");
        assertEquals(fake1.something_two, "two");

        // Assert that the fake implementation will not set properties
        const fake2 = Fake(TestObjectFourBuilder).create();
        assertEquals(fake2.is_fake, true);
        fake2
          .method("someComplexMethod")
          .willReturn(fake2);

        assertEquals(fake2.someComplexMethod(), fake2);
        assertEquals(fake2.something_one, undefined);
        assertEquals(fake2.something_two, undefined);

        // Assert that we can also use setters
        const fake3 = Fake(TestObjectFourBuilder).create();
        assertEquals(fake3.is_fake, true);
        fake3.someComplexMethod();
        assertEquals(fake3.something_one, "one");
        assertEquals(fake3.something_two, "two");
        fake3.something_one = "you got changed";
        assertEquals(fake3.something_one, "you got changed");
      },
    });

    await t.step({
      name: ".willThrow() causes throwing RandomError (with constructor)",
      fn(): void {
        const fake = Fake(TestObjectThree).create();
        assertEquals(fake.is_fake, true);

        // Original returns "World"
        assertEquals(fake.test(), "World");

        // Make the original method throw RandomError
        fake
          .method("test")
          .willThrow(new RandomError("Random error message."));

        assertThrows(
          () => fake.test(),
          RandomError,
          "Random error message.",
        );
      },
    });

    await t.step({
      name: ".willThrow() causes throwing RandomError2 (no constructor)",
      fn(): void {
        const fake = Fake(TestObjectThree).create();
        assertEquals(fake.is_fake, true);

        // Original returns "World"
        assertEquals(fake.test(), "World");

        // Make the original method throw RandomError
        fake
          .method("test")
          .willThrow(new RandomError2());

        assertThrows(
          () => fake.test(),
          RandomError2,
          "Some message not by the constructor.",
        );
      },
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class TestObjectOne {
}

class TestObjectTwo {
  public name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class TestObjectTwoMore {
  public name: string;
  public array: string[];
  constructor(name: string, array: string[]) {
    this.name = name;
    this.array = array;
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

class Resource {
  #repository: Repository;

  constructor(
    serviceOne: Repository,
  ) {
    this.#repository = serviceOne;
  }

  public getUsers() {
    this.#repository.findAllUsers();
  }

  public getUser(id: number) {
    this.#repository.findUserById(id);
  }
}

class TestObjectFourBuilder {
  #something_one?: string;
  #something_two?: string;

  get something_one(): string | undefined {
    return this.#something_one;
  }

  set something_one(value: string | undefined) {
    this.#something_one = value;
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

class Repository {
  public anotha_one_called = false;
  public do_something_called = false;
  public do_something_else_called = false;

  public findAllUsers(): string {
    this.#doSomething();
    this.#doSomethingElse();
    this.#anothaOne();
    return "Finding all users";
  }

  public findUserById(id: number): string {
    this.#doSomething();
    this.#doSomethingElse();
    this.#anothaOne();
    return `Finding user by id #${id}`;
  }

  #anothaOne() {
    this.anotha_one_called = true;
  }

  #doSomething() {
    this.do_something_called = true;
  }

  #doSomethingElse() {
    this.do_something_else_called = true;
  }
}

class RandomError extends Error {}
class RandomError2 extends Error {
  public name = "RandomError2Name";
  public message = "Some message not by the constructor.";
}
