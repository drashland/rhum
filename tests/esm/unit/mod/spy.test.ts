import { Fake, Spy } from "../../../../lib/esm/mod";
import { assertEquals } from "../../jest_assertions";

class Resource {
  public greeting = "hello";

  public methodThatLogs() {
    return "Resource is running!";
  }

  // This method will be stubbed to return "spy-stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatGets() {
    this.methodThatLogs();
    return "Do GET";
  }

  // This method will be stubbed to return "spy-stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatPosts() {
    this.methodThatLogs();
    return "Do POST";
  }
}

class ResourceParameterized {
  public greeting = "hello";

  public methodThatLogs(message: string) {
    return message;
  }

  // This method will be stubbed to return "spy-stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatGets(_paramString1: string, _paramString2: string) {
    this.methodThatLogs("Handle GET");
    return "Do GET";
  }

  // This method will be stubbed to return "spy-stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatPosts(
    _paramBool1: boolean,
    _paramBool2: boolean,
    _paramArray: string[],
  ) {
    this.methodThatLogs("Handle POSt");
    return "Do POST";
  }
}

describe("Spy()", () => {
  describe("can spy on a class", () => {
    it("adds is_spy", () => {
      const spy = Spy(Resource);
      assertEquals(spy.is_spy, true);
    });

    it(
      'stubs all data members with "spy-stubbed" return value',
      () => {
        const spy = Spy(Resource);
        assertEquals(spy.methodThatLogs(), "spy-stubbed");
        assertEquals(spy.methodThatGets(), "spy-stubbed");
        assertEquals(spy.methodThatPosts(), "spy-stubbed");
        const spy2 = Spy(Resource);
        const stubbedReturnValue = spy2.methodThatLogs(); // We called it, ...
        spy2.verify("methodThatLogs").toBeCalled(); // ... so we can verify it was called ...
        assertEquals(stubbedReturnValue, "spy-stubbed");
      },
    );

    it("can verify calls for non-parameterized methods", () => {
      const spy = Spy(Resource);
      // Verify that `methodThatLogs` was called once (because we called it here)
      const stubbedRetVal1 = spy.methodThatLogs();
      assertEquals(stubbedRetVal1, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatGets()` is stubbed
      const stubbedRetVal2 = spy.methodThatGets();
      assertEquals(stubbedRetVal2, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatPosts()` is stubbed
      const stubbedRetVal3 = spy.methodThatPosts();
      assertEquals(stubbedRetVal3, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);
    });

    it("can verify calls for parameterized methods", () => {
      const spy = Spy(ResourceParameterized);
      // Verify that `methodThatLogs` was called once (because we called it here)
      const stubbedRetVal1 = spy.methodThatLogs("hello");
      assertEquals(stubbedRetVal1, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatGets()` is stubbed
      const stubbedRetVal2 = spy.methodThatGets("hello", "world");
      assertEquals(stubbedRetVal2, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");
      spy.verify("methodThatGets")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello", "world");

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatPosts()` is stubbed
      const stubbedRetVal3 = spy.methodThatPosts(true, false, ["test"]);
      assertEquals(stubbedRetVal3, "spy-stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");
      spy.verify("methodThatPosts")
        .toBeCalled(1)
        .toBeCalledWithArgs(true, false, ["test"]);
    });
  });

  describe("can spy on a class method", () => {
    it("can stub the class method", () => {
      const resource = new Resource();
      Spy(resource, "methodThatPosts");
      assertEquals(resource.methodThatPosts(), "spy-stubbed");
    });

    it(
      "can stub the class method (with stubbed return value)",
      () => {
        const resource = new Resource();
        Spy(resource, "methodThatPosts", "hello");
        assertEquals(resource.methodThatPosts(), "hello");
      },
    );

    it("can spy on a class method (non-parameterized)", () => {
      // First we create a fake, which has working implementations
      const resource = new Resource();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "spy-stubbed"
      const spyMethod = Spy(
        resource,
        "methodThatGets",
      );

      // Fake's have working implementations, so we expect a real call
      assertEquals(resource.methodThatGets(), "spy-stubbed");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify().toBeCalled(1).toBeCalledWithoutArgs();
    });

    it(
      "can spy on a class method (non-parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const resource = new Resource();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "spy-stubbed"
        const spyMethod = Spy(
          resource,
          "methodThatGets",
          { stubbed: "return", value: "here" },
        );

        // Fake's have working implementations, so we expect a real call
        assertEquals(resource.methodThatGets(), {
          stubbed: "return",
          value: "here",
        });

        // However, since we are spying on the `methodThatGets()` method,
        // we can verify that it was called
        spyMethod.verify().toBeCalled(1).toBeCalledWithoutArgs();
      },
    );

    it("can spy on a class method (parameterized)", () => {
      // First we create a fake, which has working implementations
      const resource = new ResourceParameterized();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "spy-stubbed"
      const spyMethod = Spy(
        resource,
        "methodThatGets",
        resource.methodThatGets("param1", "param2"),
      );

      // Fake's have working implementations, so we expect a real call
      assertEquals(resource.methodThatGets("param1", "param2"), "Do GET");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify()
        .toBeCalled(1)
        .toBeCalledWithArgs("param1", "param2");

      // Also, you can call it again and do further verification. Since we are calling the same method again, the call count should be incremented by 1.
      assertEquals(
        resource.methodThatGets("anotherParam1", "anotherParam2"),
        "Do GET",
      );
      spyMethod.verify()
        .toBeCalled(2)
        .toBeCalledWithArgs(
          "anotherParam1",
          "anotherParam2",
        );
    });

    it(
      "can spy on a class method (parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const resource = new ResourceParameterized();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "spy-stubbed"
        const spyMethod = Spy(
          resource,
          "methodThatGets",
          { hello: "world" },
        );

        // Fake's have working implementations, so we expect a real call
        assertEquals(resource.methodThatGets("param1", "param2"), {
          hello: "world",
        });

        // However, since we are spying on the `methodThatGets()` method,
        // we can verify that it was called
        spyMethod.verify()
          .toBeCalled(1)
          .toBeCalledWithArgs("param1", "param2");

        // Also, you can call it again and do further verification. Since we are calling the same method again, the call count should be incremented by 1.
        assertEquals(
          resource.methodThatGets("anotherParam1", "anotherParam2"),
          { hello: "world" },
        );
        spyMethod.verify()
          .toBeCalled(2)
          .toBeCalledWithArgs(
            "anotherParam1",
            "anotherParam2",
          );
      },
    );

    it("can spy on a fakes's method (non-parameterized)", () => {
      // First we create a fake, which has working implementations
      const fake = Fake(Resource).create();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "spy-stubbed"
      const spyMethod = Spy(fake, "methodThatGets", fake.methodThatGets());

      // Fake's have working implementations, so we expect a real call
      assertEquals(fake.methodThatGets(), "Do GET");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify().toBeCalled(1).toBeCalledWithoutArgs();
    });

    it(
      "can spy on a fakes's method (non-parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const fake = Fake(Resource).create();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "spy-stubbed"
        const spyMethod = Spy(
          fake,
          "methodThatGets",
          { hello: "world" },
        );

        // Fake's have working implementations, so we expect a real call
        assertEquals(fake.methodThatGets(), {
          hello: "world",
        });

        // However, since we are spying on the `methodThatGets()` method,
        // we can verify that it was called
        spyMethod.verify()
          .toBeCalled(1)
          .toBeCalledWithoutArgs();

        // Also, you can call it again and do further verification. Since we are calling the same method again, the call count should be incremented by 1.
        assertEquals(
          fake.methodThatGets(),
          { hello: "world" },
        );
        spyMethod.verify()
          .toBeCalled(2)
          .toBeCalledWithoutArgs();
      },
    );

    it("can spy on a fakes's method (parameterized)", () => {
      // First we create a fake, which has working implementations
      const fake = Fake(ResourceParameterized).create();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "spy-stubbed"
      const spyMethod = Spy(
        fake,
        "methodThatGets",
        fake.methodThatGets("param1", "param2"),
      );

      // Fake's have working implementations, so we expect a real call
      assertEquals(fake.methodThatGets("param1", "param2"), "Do GET");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify()
        .toBeCalled(1)
        .toBeCalledWithArgs("param1", "param2");

      // Also, you can call it again and do further verification. Since we are calling the same method again, the call count should be incremented by 1.
      assertEquals(
        fake.methodThatGets("anotherParam1", "anotherParam2"),
        "Do GET",
      );
      spyMethod.verify()
        .toBeCalled(2)
        .toBeCalledWithArgs(
          "anotherParam1",
          "anotherParam2",
        );
    });

    it(
      "can spy on a fakes's method (parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const fake = Fake(ResourceParameterized).create();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "spy-stubbed"
        const spyMethod = Spy(
          fake,
          "methodThatGets",
          { hello: "world" },
        );

        // Fake's have working implementations, so we expect a real call
        assertEquals(fake.methodThatGets("param1", "param2"), {
          hello: "world",
        });

        // However, since we are spying on the `methodThatGets()` method,
        // we can verify that it was called
        spyMethod.verify()
          .toBeCalled(1)
          .toBeCalledWithArgs("param1", "param2");

        // Also, you can call it again and do further verification. Since we are calling the same method again, the call count should be incremented by 1.
        assertEquals(
          fake.methodThatGets("anotherParam1", "anotherParam2"),
          { hello: "world" },
        );
        spyMethod.verify()
          .toBeCalled(2)
          .toBeCalledWithArgs(
            "anotherParam1",
            "anotherParam2",
          );
      },
    );

    it("can spy on a function expression (non-parameterized)", () => {
      const hello = (): { some: string } => {
        return {
          some: "value",
        };
      };

      let spyHello = Spy(hello);

      // Create a function to call the spy to see if the spy works when not
      // directly called
      function thingThatCallsTheSpy() {
        spyHello();
      }

      thingThatCallsTheSpy(); // Call 1
      spyHello.verify().toBeCalled(1);

      thingThatCallsTheSpy(); // Call 2
      thingThatCallsTheSpy(); // Call 3
      spyHello.verify().toBeCalled(3);

      // Since no return value was specified, the default "spy-stubbed" should
      // be used
      assertEquals(spyHello(), "spy-stubbed");

      // Here we give `hello` a new return value. The return value must be of
      // the same return type.
      spyHello = Spy(hello, { some: "other return value" });

      // Assert that the specified return value is actually returned
      assertEquals(spyHello(), { some: "other return value" });

      // Since we reassigned `spyHello`, its calls should be reset to 0 and we
      // should expect the number of calls to be 1 because we called it above.
      // Also, we called it without args.
      spyHello.verify().toBeCalled().toBeCalledWithoutArgs();
    });

    it("can spy on a function expression (parameterized)", () => {
      const hello = (param1: string, param2: boolean): {
        param1Val: string;
        param2Val: boolean;
      } => {
        return {
          param1Val: param1,
          param2Val: param2,
        };
      };

      let spyHello = Spy(hello);

      // Create a function to call the spy to see if the spy works when not
      // directly called
      function thingThatCallsTheSpy() {
        spyHello("doth mother know you weareth her drapes", true);
      }

      thingThatCallsTheSpy(); // Call 1
      spyHello.verify().toBeCalled(1);

      thingThatCallsTheSpy(); // Call 2
      thingThatCallsTheSpy(); // Call 3
      spyHello.verify().toBeCalled(3);

      // Since no return value was specified, the default "spy-stubbed" should
      // be used
      assertEquals(
        spyHello("doth mother know you weareth her drapes", true),
        "spy-stubbed",
      );

      // Here we give `hello` a new return value. The return value must be of
      // the same return type.
      spyHello = Spy(hello, {
        param1Val: "YOU GOT CHANGED!",
        param2Val: false,
      });

      // Assert that the specified return value is actually returned
      assertEquals(spyHello("sup", true), {
        param1Val: "YOU GOT CHANGED!",
        param2Val: false,
      });

      // Since we reassigned `spyHello`, its calls should be reset to 0 and we
      // should expect the number of calls to be 1 because we called it above.
      // Also, we called it with args.
      spyHello.verify().toBeCalled().toBeCalledWithArgs("sup", true);
    });
  });
});
