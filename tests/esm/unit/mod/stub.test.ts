import { Stub } from "../../../../lib/esm/mod";
import { assertEquals } from "../../jest_assertions";

class Server {
  public greeting = "hello";

  public methodThatLogs() {
    return "server is running!";
  }
}

describe("Stub()", () => {
  it("can stub a class property", () => {
    const server = new Server();
    assertEquals(server.greeting, "hello");
    Stub(server, "greeting", "you got changed");
    assertEquals(server.greeting, "you got changed");
    Stub(server, "greeting", null);
    assertEquals(server.greeting, null);
    Stub(server, "greeting", true);
    assertEquals(server.greeting, true);
    const obj = { test: "hello" };
    Stub(server, "greeting", obj);
    assertEquals(server.greeting, obj);
  });

  it("can stub a class method", () => {
    const server = new Server();
    assertEquals(server.methodThatLogs(), "server is running!");
    Stub(server, "methodThatLogs");
    assertEquals(server.methodThatLogs(), "stubbed");
    Stub(server, "methodThatLogs", null);
    assertEquals(server.methodThatLogs(), null);
    Stub(server, "methodThatLogs", true);
    assertEquals(server.methodThatLogs(), true);
    const obj = { test: "hello" };
    Stub(server, "methodThatLogs", obj);
    assertEquals(server.methodThatLogs(), obj);
  });

  it("can return a stubbed function", () => {
    const stub = Stub();
    assertEquals(stub(), "stubbed");
  });
});
