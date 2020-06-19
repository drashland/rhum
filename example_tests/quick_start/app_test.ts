import { Rhum } from "../../mod.ts";

let value = false;

function run() {
  return true;
}

async function close() {
  return value;
}

Rhum.testPlan("app_test.ts", () => {
  // Run the first test suite
  Rhum.testSuite("run()", () => {
    Rhum.testCase("Returns true", () => {
      const result = run();
      Rhum.asserts.assertEquals(true, result);
    });
  });
  // Run the second test suite
  Rhum.testSuite("close()", () => {
    Rhum.testCase("Returns true", async () => {
      const result = await close();
      Rhum.asserts.assertEquals(true, result);
    });
  });
});
