/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan("before_all_test.ts", () => {
  Rhum.beforeAll(() => {
    suite_val = "Eric";
  });

  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    Rhum.beforeAll(() => {
      case_val = 2;
    });

    Rhum.testCase("hooks properly set suite_val and case_val", () => {
      // Asserting the value has changed
      Rhum.asserts.assertEquals(suite_val, "Eric");
      // Revert it back for the next test that uses it
      suite_val = "Ed";
      // Assert the value has changed from 22 to 2
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 22;
    });
    Rhum.testCase("hooks properly set case_val", () => {
      // Assert the value has changed from 22 to 2 (after setting it to 22 in the above case)
      Rhum.asserts.assertEquals(case_val, 22);
      Rhum.asserts.assertEquals(suite_val, "Ed");
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    Rhum.beforeAll(() => {
      case_val = 0;
    });
    Rhum.testCase("hooks properly set suite_val and case_val", async () => {
      // Asserting the hook should have replaced the name
      Rhum.asserts.assertEquals(suite_val, "Ed");
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });

  Rhum.testSuite("test suite 3", () => {
    let async_case_val = 5;
    Rhum.beforeAll(async () => {
      await new Promise((resolve) => {
        setTimeout(() => resolve((async_case_val = 15)), 1000);
      });
    });
    Rhum.testCase("beforeAll hook can be async", () => {
      Rhum.asserts.assertEquals(suite_val, "Ed");
      Rhum.asserts.assertEquals(async_case_val, 15);
    });
  });
});

Rhum.run();
