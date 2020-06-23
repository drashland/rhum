import { Rhum } from "../../mod.ts";

class Server {
  public methodThatLogs() {
    console.log("Server running.");
  }
  public methodThatThrows() {
  }
}

Rhum.testPlan("stub_test.ts", () => {

  Rhum.testSuite("stub()", () => {

    Rhum.testCase("can stub", () => {
      const server = new Server();
      Rhum
        .stub(server, "methodThatLogs", () => {
          return "don't run the console.log()";
        });
      Rhum.asserts.assertEquals(
        server.methodThatLogs(),
        "don't run the console.log()"
      );
    });

    Rhum.testCase("can chain multiple stubs", () => {
      const server = new Server();
      Rhum
        .stub(server, "methodThatLogs", () => {
          return "don't run the console.log()";
        })
        .stub(server, "methodThatThrows", () => {
          throw new Error("poop");
        })
      Rhum.asserts.assertEquals(
        server.methodThatLogs(),
        "don't run the console.log()"
      );
      Rhum.asserts.assertThrows((): void => {
        server.methodThatThrows()
      });
    });
  });
});

Rhum.run();
