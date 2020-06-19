import { asserts } from "../../deps.ts";
import { TestCase } from "../../src/test_case.ts";

Deno.test({
  name: "Unit | TestCase | run() | Runs the test",
  async fn(): Promise<void> {
    const testCase = new TestCase("Returns true", "Case: Returns true", () => {
      asserts.assertEquals(true, true);
    });
    await testCase.run();
  },
});
