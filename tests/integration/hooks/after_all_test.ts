/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan("app_test.ts", () => {
  Rhum.afterAll(() => {
    suite_val = "Eric";
  });
  // Run the first test suite
  Rhum.testSuite("run()", () => {
    Rhum.afterAll(() => {
      case_val = 2;
    });
    Rhum.testCase("Returns true", () => {
      // Asserting that the suite val should not have been changed by the hook (yet)
      Rhum.asserts.assertEquals(suite_val, "Ed");
      // Revert it back for the next test that uses it
      suite_val = "Ed";
      // Assert the value is kept the same (hook hasn't ran yet)
      Rhum.asserts.assertEquals(case_val, 22);
    });
    Rhum.testCase("Returns false", () => {
      // Assert the value has changes as the hook should have ran
      Rhum.asserts.assertEquals(case_val, 2)
    })
  });

  // Run the second test suite
  Rhum.testSuite("close()", () => {
    Rhum.afterAll(() => {
      case_val = 0;
    });
    Rhum.testCase("Returns true", async () => {
      // Asserting the hook should have replaced the name
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
      // Should be kept the same as the after each hook should have updated the value
      Rhum.asserts.assertEquals(case_val, 2);
    });
  });
});

Rhum.run();