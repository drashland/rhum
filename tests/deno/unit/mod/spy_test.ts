import { Spy } from "../../../../mod.ts";
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
  await t.step("can turn a class into a spy", () => {
    const spy = Spy(Resource);
    assertEquals(spy.is_spy, true);
  });

  await t.step("stubs all data members", () => {
    const spy = Spy(Resource);
    assertEquals(spy.methodThatLogs(), "stubbed");
    assertEquals(spy.methodThatGets(), "stubbed");
    assertEquals(spy.methodThatPosts(), "stubbed");
  });

  await t.step("can verify calls for non-parameterized methods", () => {
    const spy = Spy(Resource);
    // Verify that `methodThatLogs` was called once (because we called it here)
    spy.methodThatLogs();
    spy.verify("methodThatLogs").toBeCalled(1);

    // Verify that `methodThatLogs()` was still only called once since
    // `methodThatGets()` is stubbed
    spy.methodThatGets();
    spy.verify("methodThatLogs").toBeCalled(1);

    // Verify that `methodThatLogs()` was still only called once since
    // `methodThatPosts()` is stubbed
    spy.methodThatPosts();
    spy.verify("methodThatLogs").toBeCalled(1);
  });

  await t.step("can verify calls for parameterized methods", () => {
    const spy = Spy(ResourceParameterized);
    // Verify that `methodThatLogs` was called once (because we called it here)
    spy.methodThatLogs("hello");
    spy.verify("methodThatLogs")
      .toBeCalled(1)
      .toBeCalledWith("hello");

    // Verify that `methodThatLogs()` was still only called once since
    // `methodThatGets()` is stubbed
    spy.methodThatGets("hello", "world");
    spy.verify("methodThatLogs")
      .toBeCalled(1)
      .toBeCalledWith("hello");
    spy.verify("methodThatGets")
      .toBeCalled(1)
      .toBeCalledWith("hello", "world");

    // Verify that `methodThatLogs()` was still only called once since
    // `methodThatPosts()` is stubbed
    spy.methodThatPosts(true, false, ["test"]);
    spy.verify("methodThatLogs")
      .toBeCalled(1)
      .toBeCalledWith("hello");
    spy.verify("methodThatPosts")
      .toBeCalled(1)
      .toBeCalledWith(true, false, ["test"]);
  });
});
