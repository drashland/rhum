import { Rhum } from "../../mod.ts";

class Server {
  public getConfigs() {
    return "configs";
  }
  public run() {
    console.log("Server running.");
  }
}

Rhum.testPlan("stub_test.ts", () => {
  Rhum.testSuite("returns()", () => {
    Rhum.testCase("string", () => {
      const server = new Server();
      server.run = Rhum.stub().returns("running");
      Rhum.asserts.assertEquals(server.run(), "running");
    });
  });
});

Rhum.run();

