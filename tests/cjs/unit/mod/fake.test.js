const { Fake } = require("../../../../lib/cjs/mod");

describe("Fake()", () => {
  it("creates fake builder", () => {
    const fake = Fake(TestObjectOne);
    expect(fake.constructor.name).toBe("FakeBuilder");
  });

  describe(".create()", () => {
    it("creates fake object", () => {
      const fake = Fake(TestObjectTwo).create();
      expect(fake.name).toBe(undefined);
      expect(fake.is_fake).toBe(true);
    });
  });

  describe(".withConstructorArgs(...)", () => {
    it("can take 1 arg", () => {
      const fake = Fake(TestObjectTwo)
        .withConstructorArgs("some name")
        .create();
      expect(fake.name).toBe("some name");
      expect(fake.is_fake).toBe(true);
    });

    it("can take more than 1 arg", () => {
      const fake = Fake(TestObjectTwoMore)
        .withConstructorArgs("some name", ["hello"])
        .create();
      expect(fake.name).toBe("some name");
      expect(fake.array).toStrictEqual(["hello"]);
      expect(fake.is_fake).toBe(true);
    });
  });

  describe(".method(...)", () => {
    it("requires .willReturn(...) or .willThrow(...) to be chained", () => {
      const fake = Fake(TestObjectThree).create();
      expect(fake.is_fake).toBe(true);

      // Original returns "World"
      expect(fake.test()).toBe("World");

      // Don't fully pre-program the method. This should cause an error during assertions.
      fake.method("test");

      try {
        fake.test();
      } catch (error) {
        expect(error.message).toBe(`Pre-programmed method "test" does not have a return value.`);
      }
    });

    it(".willReturn(...) does not call original method and returns given value", () => {
      // Assert that a fake can make a class take a shortcut
      const fakeServiceDoingShortcut = Fake(Repository).create();
      fakeServiceDoingShortcut.method("findAllUsers").willReturn("shortcut");
      const resourceWithShortcut = new Resource(
        fakeServiceDoingShortcut,
      );
      resourceWithShortcut.getUsers();
      expect(fakeServiceDoingShortcut.anotha_one_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_else_called).toBe(false);

      // Assert that the fake service can call original implementations
      const fakeServiceNotDoingShortcut = Fake(Repository).create();
      const resourceWithoutShortcut = new Resource(
        fakeServiceNotDoingShortcut,
      );
      resourceWithoutShortcut.getUsers();
      expect(fakeServiceNotDoingShortcut.anotha_one_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_else_called).toBe(true);
    });

    it(".willReturn(...) can be performed more than once", () => {
      // Assert that a fake can make a class take a shortcut
      const fakeServiceDoingShortcut = Fake(Repository).create();
      fakeServiceDoingShortcut.method("findUserById").willReturn("shortcut");
      fakeServiceDoingShortcut.method("findUserById").willReturn("shortcut2");
      const resourceWithShortcut = new Resource(
        fakeServiceDoingShortcut,
      );
      resourceWithShortcut.getUser(1);
      expect(fakeServiceDoingShortcut.anotha_one_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_else_called).toBe(false);

      // Assert that the fake service can call original implementations
      const fakeServiceNotDoingShortcut = Fake(Repository).create();
      const resourceWithoutShortcut = new Resource(
        fakeServiceNotDoingShortcut,
      );
      resourceWithoutShortcut.getUser(1);
      expect(fakeServiceNotDoingShortcut.anotha_one_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_else_called).toBe(true);
    });

    it(".willThrow(...) does not call original method and throws error", () => {
      // Assert that a fake can make a class take a shortcut
      const fakeServiceDoingShortcut = Fake(Repository).create();
      fakeServiceDoingShortcut.method("findAllUsers").willReturn("shortcut");
      const resourceWithShortcut = new Resource(
        fakeServiceDoingShortcut,
      );
      resourceWithShortcut.getUsers();
      expect(fakeServiceDoingShortcut.anotha_one_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_called).toBe(false);
      expect(fakeServiceDoingShortcut.do_something_else_called).toBe(false);

      // Assert that the fake service can call original implementations
      const fakeServiceNotDoingShortcut = Fake(Repository).create();
      const resourceWithoutShortcut = new Resource(
        fakeServiceNotDoingShortcut,
      );
      resourceWithoutShortcut.getUsers();
      expect(fakeServiceNotDoingShortcut.anotha_one_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_called).toBe(true);
      expect(fakeServiceNotDoingShortcut.do_something_else_called).toBe(true);
    });

    it(".willReturn(fake) returns the fake object (basic)", () => {
      const fake = Fake(TestObjectFourBuilder).create();
      expect(fake.is_fake).toBe(true);

      fake
        .method("someComplexMethod")
        .willReturn(fake);

      expect(fake.someComplexMethod()).toBe(fake);
    });

    it(".willReturn(fake) returns the fake object (extra)", () => {
      // Assert that the original implementation sets properties
      const fake1 = Fake(TestObjectFourBuilder).create();
      expect(fake1.is_fake).toBe(true);
      fake1.someComplexMethod();
      expect(fake1.something_one).toBe("one");
      expect(fake1.something_two).toBe("two");

      // Assert that the fake implementation will not set properties
      const fake2 = Fake(TestObjectFourBuilder).create();
      expect(fake2.is_fake).toBe(true);
      fake2
        .method("someComplexMethod")
        .willReturn(fake2);

      expect(fake2.someComplexMethod()).toBe(fake2);
      expect(fake2.something_one).toBe(undefined);
      expect(fake2.something_two).toBe(undefined);

      // Assert that we can also use setters
      const fake3 = Fake(TestObjectFourBuilder).create();
      expect(fake3.is_fake).toBe(true);
      fake3.someComplexMethod();
      expect(fake3.something_one).toBe("one");
      expect(fake3.something_two).toBe("two");
      fake3.something_one = "you got changed";
      expect(fake3.something_one).toBe("you got changed");
    });

    it(".willThrow() causes throwing RandomError (with constructor)", () => {
      const fake = Fake(TestObjectThree).create();
      expect(fake.is_fake).toBe(true);

      // Original returns "World"
      expect(fake.test()).toBe("World");

      // Make the original method throw RandomError
      fake
        .method("test")
        .willThrow(new RandomError("Random error message."));

      expect(() => fake.test()).toThrow(new RandomError("Random error message."));
    });

    it(".willThrow() causes throwing RandomError2 (no constructor)", () => {
      const fake = Fake(TestObjectThree).create();
      expect(fake.is_fake).toBe(true);

      // Original returns "World"
      expect(fake.test()).toBe("World");

      // Make the original method throw RandomError
      fake
        .method("test")
        .willThrow(new RandomError2());

      expect(() => fake.test()).toThrow(new RandomError2("Some message not by the constructor."));
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
// FILE MARKER - DATA //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

class TestObjectOne {
}

class TestObjectTwo {
  constructor(name) {
    this.name = name;
  }
}

class TestObjectTwoMore {
  constructor(name, array) {
    this.name = name;
    this.array = array;
  }
}

class TestObjectThree {
  hello() {
    return;
  }

  test() {
    this.hello();
    this.hello();
    return "World";
  }
}

class Resource {
  constructor(
    serviceOne,
  ) {
    this.repository = serviceOne;
  }

  getUsers() {
    this.repository.findAllUsers();
  }

  getUser(id) {
    this.repository.findUserById(id);
  }
}

class TestObjectFourBuilder {
  someComplexMethod()  {
    this.setSomethingOne();
    this.setSomethingTwo();
    return this;
  }

  setSomethingOne() {
    this.something_one = "one";
  }

  setSomethingTwo() {
    this.something_two = "two";
  }
}

class Repository {
  constructor() {
    this.anotha_one_called = false;
    this.do_something_called = false;
    this.do_something_else_called = false;
  }

  findAllUsers() {
    this.doSomething();
    this.doSomethingElse();
    this.anothaOne();
    return "Finding all users";
  }

  findUserById(id) {
    this.doSomething();
    this.doSomethingElse();
    this.anothaOne();
    return `Finding user by id #${id}`;
  }

  anothaOne() {
    this.anotha_one_called = true;
  }

  doSomething() {
    this.do_something_called = true;
  }

  doSomethingElse() {
    this.do_something_else_called = true;
  }
}

class RandomError extends Error {}
class RandomError2 extends Error {
  name = "RandomError2Name";
  message = "Some message not by the constructor.";
}

