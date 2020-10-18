/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;
let async_case_val = 5;

Rhum.testPlan(() => {

  Rhum.afterAll(() => {
    suite_val = "Eric";
  });

  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    Rhum.testCase("hook doesn't change suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Ed");
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {

    // This hook should run after all test cases
    Rhum.afterAll(() => {
      suite_val = "Breno";
      case_val = 0;
    });

    Rhum.testCase("hook doesn't change case_val", async () => {
      Rhum.asserts.assertEquals(case_val, 22);
    });
  });

  // Run the third test suite
  Rhum.testSuite("test suite 3", () => {

    // This hook should run after all test cases
    Rhum.afterAll(async () => {
      await new Promise((resolve) => {
        setTimeout(() => resolve((async_case_val = 15)), 1000);
      });
    });

    Rhum.testCase("hook from previous suite changes case_val", async () => {
      Rhum.asserts.assertEquals(case_val, 0);
    });

    Rhum.testCase("hook from previous suite changes suite_val", async () => {
      Rhum.asserts.assertEquals(suite_val, "Breno");
    });

    Rhum.testCase("Async afterAll hook doesn't change async_case_val", () => {
      Rhum.asserts.assertEquals(async_case_val, 5);
    });
  });

  // Run the fourth test suite
  Rhum.testSuite("test suite 4", () => {
    Rhum.testCase("Async afterAll hook has effect after case", () => {
      Rhum.asserts.assertEquals(async_case_val, 15);
    });
  });
});
