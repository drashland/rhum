import { Rhum } from "../../mod.ts";

class Server {
  public greeting = "hello";

  public methodThatLogs() {
    console.log("Server running.");
  }

  public methodThatThrows() {
  }
}

Rhum.testPlan("stub_test.ts", () => {
  Rhum.testSuite("stub()", () => {
    Rhum.testCase("can stub a property", () => {
      const server = Rhum.stubbed(new Server());
      server.stub("greeting", "you got changed");
      Rhum.asserts.assertEquals(server.greeting, "you got changed");
    });

    Rhum.testCase("can stub a method", () => {
      const server = Rhum.stubbed(new Server());
      server.stub("methodThatLogs", () => {
        return "don't run the console.log()";
      });
      Rhum.asserts.assertEquals(
        server.methodThatLogs(),
        "don't run the console.log()",
      );
      Rhum.asserts.assertEquals(
        server.is_stubbed,
        true,
      );
    });
  });
});

Rhum.run();
