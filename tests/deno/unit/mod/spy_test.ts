import { Fake, Spy } from "../../../../mod.ts";
import { assertEquals } from "../../../deps.ts";

class Resource {
  public greeting = "hello";

  public methodThatLogs() {
    return "Resource is running!";
  }

  // This method will be stubbed to return "stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatGets() {
    this.methodThatLogs();
    return "Do GET";
  }

  // This method will be stubbed to return "stubbed", so during
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

  // This method will be stubbed to return "stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatGets(paramString1: string, paramString2: string) {
    this.methodThatLogs("Handle GET");
    return "Do GET";
  }

  // This method will be stubbed to return "stubbed", so during
  // `spy.verify().toBeCalled()`, `this.methodThatLogs()` should not be expected
  // to be called.
  public methodThatPosts(
    paramBool1: boolean,
    paramBool2: boolean,
    paramArray: string[],
  ) {
    this.methodThatLogs("Handle POSt");
    return "Do POST";
  }
}

Deno.test("Spy()", async (t) => {
  await t.step("can spy on a class", async (t) => {
    await t.step("adds is_spy", () => {
      const spy = Spy(Resource);
      assertEquals(spy.is_spy, true);
    });

    await t.step('stubs all data members with "stubbed" return value', () => {
      const spy = Spy(Resource);
      assertEquals(spy.methodThatLogs(), "stubbed");
      assertEquals(spy.methodThatGets(), "stubbed");
      assertEquals(spy.methodThatPosts(), "stubbed");
      const spy2 = Spy(Resource);
      const stubbedReturnValue = spy2.methodThatLogs(); // We called it, ...
      spy2.verify("methodThatLogs").toBeCalled(); // ... so we can verify it was called ...
    });

    await t.step("can verify calls for non-parameterized methods", () => {
      const spy = Spy(Resource);
      // Verify that `methodThatLogs` was called once (because we called it here)
      const stubbedRetVal1 = spy.methodThatLogs();
      assertEquals(stubbedRetVal1, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatGets()` is stubbed
      const stubbedRetVal2 = spy.methodThatGets();
      assertEquals(stubbedRetVal2, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatPosts()` is stubbed
      const stubbedRetVal3 = spy.methodThatPosts();
      assertEquals(stubbedRetVal3, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs").toBeCalled(1);
    });

    await t.step("can verify calls for parameterized methods", () => {
      const spy = Spy(ResourceParameterized);
      // Verify that `methodThatLogs` was called once (because we called it here)
      const stubbedRetVal1 = spy.methodThatLogs("hello");
      assertEquals(stubbedRetVal1, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatGets()` is stubbed
      const stubbedRetVal2 = spy.methodThatGets("hello", "world");
      assertEquals(stubbedRetVal2, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");
      spy.verify("methodThatGets")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello", "world");

      // Verify that `methodThatLogs()` was still only called once since
      // `methodThatPosts()` is stubbed
      const stubbedRetVal3 = spy.methodThatPosts(true, false, ["test"]);
      assertEquals(stubbedRetVal3, "stubbed"); // All spies have stubbed methods
      spy.verify("methodThatLogs")
        .toBeCalled(1)
        .toBeCalledWithArgs("hello");
      spy.verify("methodThatPosts")
        .toBeCalled(1)
        .toBeCalledWithArgs(true, false, ["test"]);
    });
  });

  await t.step("can spy on a class method", async (t) => {
    await t.step("can stub the class method", () => {
      const resource = new Resource();
      Spy(resource, "methodThatPosts");
      assertEquals(resource.methodThatPosts(), "stubbed");
    });

    await t.step(
      "can stub the class method (with stubbed return value)",
      () => {
        const resource = new Resource();
        Spy(resource, "methodThatPosts", "hello");
        assertEquals(resource.methodThatPosts(), "hello");
      },
    );

    await t.step("can spy on a class method (non-parameterized)", () => {
      // First we create a fake, which has working implementations
      const resource = new Resource();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "stubbed"
      const spyMethod = Spy(
        resource,
        "methodThatGets",
      );

      // Fake's have working implementations, so we expect a real call
      assertEquals(resource.methodThatGets(), "stubbed");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify().toBeCalled(1).toBeCalledWithoutArgs();
    });

    await t.step(
      "can spy on a class method (non-parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const resource = new Resource();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step("can spy on a class method (parameterized)", () => {
      // First we create a fake, which has working implementations
      const resource = new ResourceParameterized();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step(
      "can spy on a class method (parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const resource = new ResourceParameterized();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step("can spy on a fakes's method (non-parameterized)", () => {
      // First we create a fake, which has working implementations
      const fake = Fake(Resource).create();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "stubbed"
      const spyMethod = Spy(fake, "methodThatGets", fake.methodThatGets());

      // Fake's have working implementations, so we expect a real call
      assertEquals(fake.methodThatGets(), "Do GET");

      // However, since we are spying on the `methodThatGets()` method,
      // we can verify that it was called
      spyMethod.verify().toBeCalled(1).toBeCalledWithoutArgs();
    });

    await t.step(
      "can spy on a fakes's method (non-parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const fake = Fake(Resource).create();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step("can spy on a fakes's method (parameterized)", () => {
      // First we create a fake, which has working implementations
      const fake = Fake(ResourceParameterized).create();

      // Now we're going to spy on the fake's `methodThatLogs()` method.
      // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step(
      "can spy on a fakes's method (parameterized with stubbed return value)",
      () => {
        // First we create a fake, which has working implementations
        const fake = Fake(ResourceParameterized).create();

        // Now we're going to spy on the fake's `methodThatLogs()` method.
        // We set the return value to what it would return originally so it does not return "stubbed"
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

    await t.step("can spy on a function expression", () => {
      const hello = (): { some: string } => {
        return {
          some: "value",
        };
      };

      let spyHello = Spy(hello);

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

      // Here we give `hello` a new return value. The return value must have of
      // the same type since we cannot reassign a new type.
      spyHello = Spy(hello, { some: "other return value" });
      assertEquals(spyHello(), { some: "other return value" });
      // Since we reassigned `spyHello`, its calls should be reset to 0 and we
      // should expect the number of calls to be 1 because we called it in the
      // above `assertEquals()` call
      spyHello.verify().toBeCalled(1);
    });
  });
});
