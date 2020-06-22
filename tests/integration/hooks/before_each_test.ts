/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan("app_test.ts", () => {
  Rhum.beforeEach(() => {
    suite_val = "Eric";
  });
  // Run the first test suite
  Rhum.testSuite("run()", () => {
    Rhum.beforeEach(() => {
      case_val = 2;
    });
    Rhum.testCase("Returns true", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 22;
    });
    Rhum.testCase("Returns false", () => {
      Rhum.asserts.assertEquals(case_val, 2);
    });
  });

  // Run the second test suite
  Rhum.testSuite("close()", () => {
    Rhum.beforeEach(() => {
      case_val = 0;
    });
    Rhum.testCase("Returns true", async () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });
});

Rhum.run();
