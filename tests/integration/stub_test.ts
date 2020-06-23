import { Rhum } from "../../mod.ts";

class Server {

  public property = "hello";

  public methodThatLogs() {
    console.log("Server running.");
  }

  public methodThatThrows() {
  }
}

Rhum.testPlan("stub_test.ts", () => {
  Rhum.testSuite("stub()", () => {
    Rhum.testCase("can stub a property", () => {
      const server = new Server();
      Rhum
        .stub(server, "property", "you got changed");
      Rhum.asserts.assertEquals(server.property, "you got changed");
    });

    Rhum.testCase("can stub a method", () => {
      const server = new Server();
      Rhum
        .stub(server, "methodThatLogs", () => {
          return "don't run the console.log()";
        });
      Rhum.asserts.assertEquals(
        server.methodThatLogs(),
        "don't run the console.log()",
      );
    });

    Rhum.testCase("can be chained with more stub() calls", () => {
      const server: any = new Server();
      Rhum
        .stub(server, "methodThatLogs", () => {
          return "don't run the console.log()";
        })
        .stub(server, "methodThatThrows", () => {
          throw new Error("poop");
        })
        .stub(server, "property", "you got changed");
      Rhum.asserts.assertEquals(
        server.methodThatLogs(),
        "don't run the console.log()",
      );
      Rhum.asserts.assertEquals(server.calls.methodThatThrows, 0);
      Rhum.asserts.assertThrows((): void => {
        server.methodThatThrows();
      });
      Rhum.asserts.assertEquals(server.property, "you got changed");
      Rhum.asserts.assertEquals(server.calls.methodThatThrows, 1);
    });
  });
});

Rhum.run();
