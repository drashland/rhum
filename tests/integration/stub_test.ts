import { Stub } from "../../mod.ts";
import { assertEquals } from "../deps.ts";

class Server {
  public greeting = "hello";

  public methodThatLogs() {
    console.log("Server running.");
  }

  public methodThatThrows() {
  }
}

Deno.test("stub()", async (t) => {
  await t.step("Can stub a property", () => {
    const server = Stub(new Server());
    server.stub("greeting", "you got changed");
    assertEquals(server.greeting, "you got changed");
  });

  await t.step("Can stub a method", () => {
    const server = Stub(new Server());
    server.stub("methodThatLogs", () => {
      return "don't run the console.log()";
    });
    assertEquals(
      server.methodThatLogs(),
      "don't run the console.log()",
    );
    assertEquals(
      server.is_stubbed,
      true,
    );
  });
});
