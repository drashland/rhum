/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan(() => {
  // This hook should run before all test suites
  Rhum.beforeAll(() => {
    suite_val = "Eric";
  });

  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    Rhum.testCase("hook changes suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    // This hook should run before all test cases
    Rhum.beforeAll(() => {
      suite_val = "Ed";
      case_val = 0;
    });

    Rhum.testCase("hook changes suite_val", async () => {
      Rhum.asserts.assertEquals(suite_val, "Ed");
    });

    Rhum.testCase("hook changes case_val", async () => {
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });

  // Run the third test suite
  Rhum.testSuite("test suite 3", () => {
    let async_case_val = 5;

    // This hook should run before all test cases
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
