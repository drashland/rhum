import { Stub } from "../../mod.ts";
import { assertEquals } from "../deps.ts";

class Server {
  public greeting = "hello";

  public methodThatLogs() {
    console.log("Server running.");
  }
}

Deno.test("Stub()", async (t) => {
  await t.step("can stub a property", () => {
    const server = new Server();
    Stub(server, "greeting", "you got changed");
    assertEquals(server.greeting, "you got changed");
    // `is_stubbed` should be added when stubbing an object
    assertEquals("is_stubbed" in server, true);
  });

  await t.step("can stub a function", () => {
    const server = new Server();
    Stub(server, "methodThatLogs");
    assertEquals(server.methodThatLogs(), null);
    // `is_stubbed` should be added when stubbing an object
    assertEquals("is_stubbed" in server, true);
  });

  // await t.step("Can stub a method", () => {
  //   const server = Stub(new Server());
  //   server.stub("methodThatLogs", () => {
  //     return "don't run the console.log()";
  //   });
  //   assertEquals(
  //     server.methodThatLogs(),
  //     "don't run the console.log()",
  //   );
  //   assertEquals(
  //     server.is_stubbed,
  //     true,
  //   );
  // });
});
