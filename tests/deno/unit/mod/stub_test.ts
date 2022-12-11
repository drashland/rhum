import { Stub } from "../../../../mod.ts";
import { assertEquals } from "../../../deps.ts";

class Server {
  public greeting = "hello";

  public methodThatLogs() {
    return "server is running!";
  }
}

Deno.test("Stub()", async (t) => {
  await t.step("can stub a class property", () => {
    const server = new Server();
    assertEquals(server.greeting, "hello");
    Stub(server, "greeting", "you got changed");
    assertEquals(server.greeting, "you got changed");
    Stub(server, "greeting", null);
    assertEquals(server.greeting, null);
    Stub(server, "greeting", true);
    assertEquals(server.greeting as unknown, true);
    const obj = { test: "hello" };
    Stub(server, "greeting", obj);
    assertEquals(server.greeting as unknown, obj);
  });

  await t.step("can stub a class method", () => {
    const server = new Server();
    assertEquals(server.methodThatLogs(), "server is running!");
    Stub(server, "methodThatLogs");
    assertEquals(server.methodThatLogs(), "stubbed");
    Stub(server, "methodThatLogs", null);
    assertEquals(server.methodThatLogs(), null);
    Stub(server, "methodThatLogs", true);
    assertEquals(server.methodThatLogs() as unknown, true);
    const obj = { test: "hello" };
    Stub(server, "methodThatLogs", obj);
    assertEquals(server.methodThatLogs() as unknown, obj);
  });

  await t.step("can return a stubbed function", () => {
    const stub = Stub();
    assertEquals(stub(), "stubbed");
  });
});
