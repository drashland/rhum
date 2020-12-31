/**
 * Purpose of this test is to ensure a test using before_all succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = 0;
let case_val = 0;
let async_case_val = 0;
Rhum.testPlan("after_all_test.ts", () => {
  Rhum.afterAll(() => {
    Rhum.asserts.assertEquals(suite_val, 3);
  });
  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    Rhum.afterAll(() => {
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 3;
    });
    Rhum.testCase("hooks properly set suite_val and case_val", () => {
      // Asserting that the suite val should not have been changed by the hook
      Rhum.asserts.assertEquals(suite_val, 0);
      suite_val = 1;
      // Asserting that the case val should not have been changed by the hook
      Rhum.asserts.assertEquals(case_val, 0);
      case_val = 1;
    });
    Rhum.testCase("hooks properly set case_val", () => {
      // Asserting that the suite val should not have been changed by the hook
      Rhum.asserts.assertEquals(suite_val, 1);
      suite_val = 2;
      // Asserting that the case val should not have been changed by the hook
      Rhum.asserts.assertEquals(case_val, 1);
      case_val = 2;
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    Rhum.afterAll(() => {
      Rhum.asserts.assertEquals(case_val, 4);
    });
    Rhum.testCase("hooks properly set suite_val and case_val", async () => {
      // Asserting that the suite val should not have been changed by the hook
      Rhum.asserts.assertEquals(suite_val, 2);
      suite_val = 3;
      // Asserting that the case val has been changed by the hook
      Rhum.asserts.assertEquals(case_val, 3);
      case_val = 4;
    });
  });
  Rhum.testSuite("test suite 3", () => {
    Rhum.afterAll(async () => {
      Rhum.asserts.assertEquals(async_case_val, 1);
      await new Promise((resolve) => {
        setTimeout(() => resolve((async_case_val = 2)), 1000);
      });
    });
    Rhum.testCase("Async afterAll hook has no effect before case", () => {
      Rhum.asserts.assertEquals(async_case_val, 0);
      async_case_val = 1;
    });
  });
  Rhum.testSuite("test suite 4", () => {
    Rhum.testCase("Async afterAll hook has effect after case", () => {
      Rhum.asserts.assertEquals(async_case_val, 2);
    });
  });
});

Rhum.run();
