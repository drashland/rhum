import { asserts } from "../../deps.ts";
import { TestCase } from "../../src/test_case.ts";

Deno.test({
  name: "Unit | TestCase | run() | Runs the test without failing",
  async fn(): Promise<void> {
    const plan = {
      "suite_1": {
        cases: [{
          name: "case_1",
          new_name: "123 case_1",
          testFn: function () {
            asserts.assertEquals(true, true);
          },
        }],
      },
    };
    const testCase = new TestCase(plan);
    await testCase.run();
  },
});
