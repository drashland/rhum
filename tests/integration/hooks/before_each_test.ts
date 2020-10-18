/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan(() => {
  // This hook should run before each test suite
  Rhum.beforeEach(() => {
    suite_val = "Eric";
  });

  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    // This hook should run before each test case
    Rhum.beforeEach(() => {
      case_val = 2;
    });

    Rhum.testCase("hook in test plan changes suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
    });

    Rhum.testCase("previous test case changes suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Ed");
    });

    Rhum.testCase("hook in test suite changes case_val", () => {
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 22;
    });

    Rhum.testCase(
      "previous test case changes case_val and hook in test suite changes case_val",
      () => {
        Rhum.asserts.assertEquals(case_val, 2);
      },
    );
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    // This hook should run before each test case
    Rhum.beforeEach(() => {
      case_val = 0;
    });

    Rhum.testCase("hook in test plan changes suite_val", async () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
    });

    Rhum.testCase("previous test changes suite_val", async () => {
      Rhum.asserts.assertEquals(suite_val, "Ed");
    });

    Rhum.testCase("hook in test suite changes case_val", () => {
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });

  // Run the third test suite
  Rhum.testSuite("test suite 3", () => {
    let async_case_val = 5;

    // This hook should run before each test case
    Rhum.beforeEach(async () => {
      await new Promise((resolve) => {
        setTimeout(() => resolve((async_case_val = 15)), 1000);
      });
    });

    Rhum.testCase("hook can be async", () => {
      Rhum.asserts.assertEquals(async_case_val, 15);
    });
  });
});
