/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan("app_test.ts", () => {
  Rhum.beforeAll(() => {
    suite_val = "Eric";
  });
  // Run the first test suite
  Rhum.testSuite("run()", () => {
    Rhum.beforeAll(() => {
      case_val = 2;
    });
    Rhum.testCase("Returns true", () => {
      // Asserting the value has changed
      Rhum.asserts.assertEquals(suite_val, "Eric");
      // Revert it back for the next test that uses it
      suite_val = "Ed";
      // Assert the value has changed from 22 to 2
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 22;
    });
    Rhum.testCase("Returns false", () => {
      // Assert the value has changed from 22 to 2 (after setting it to 22 in the above case)
      Rhum.asserts.assertEquals(case_val, 2);
    });
  });

  // Run the second test suite
  Rhum.testSuite("close()", () => {
    Rhum.beforeAll(() => {
      case_val = 0;
    });
    Rhum.testCase("Returns true", async () => {
      // Asserting the hook should have replaced the name
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });
});

Rhum.run();
