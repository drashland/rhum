/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan(() => {
  Rhum.afterEach(() => {
    suite_val = "Eric";
    case_val = 1;
  });

  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    // This hook should run after each test case
    Rhum.afterEach(() => {
      suite_val = "Breno";
      case_val = 2;
    });

    Rhum.testCase(
      "hook in this test suite doesn't change first test's suite_val",
      () => {
        Rhum.asserts.assertEquals(suite_val, "Ed");
      },
    );

    Rhum.testCase("hook in this test suite changes case_val", () => {
      Rhum.asserts.assertEquals(case_val, 2);
    });

    Rhum.testCase("hook in this test suite changes suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Breno");
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    Rhum.testCase("hook in test plan changes suite_val", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
    });

    Rhum.testCase("hook in test plan changes case_val", () => {
      Rhum.asserts.assertEquals(case_val, 1);
    });
  });

  // Run the third test suite
  Rhum.testSuite("test suite 3", () => {
    let async_case_val = 5;

    // This hook should run after each test case
    Rhum.afterEach(async () => {
      await new Promise((resolve) => {
        setTimeout(() => resolve((async_case_val = 15)), 1000);
      });
    });

    Rhum.testCase(
      "async hook doesn't change first test's async_case_val",
      () => {
        Rhum.asserts.assertEquals(async_case_val, 5);
      },
    );

    Rhum.testCase("async hook changes sync_case_val", () => {
      Rhum.asserts.assertEquals(async_case_val, 15);
    });
  });
});
