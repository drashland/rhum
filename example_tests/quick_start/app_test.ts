import { Rhum } from "../../mod.ts";

let value = false;

function run() {
  return true;
}

async function close() {
  return value;
}

Rhum.TestPlan("app_test.ts", () => {
  // Run the first test suite
  Rhum.TestSuite("run()", () => {
    Rhum.TestCase("Returns true", () => {
      const result = run();
      Rhum.Asserts.assertEquals(true, result);
    });
  });
  // Run the second test suite
  Rhum.TestSuite("close()", () => {
    Rhum.TestCase("Returns true", async () => {
      const result = await close();
      Rhum.Asserts.assertEquals(true, result);
    });
  });
});
