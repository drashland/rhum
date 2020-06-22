/**
 * Purpose of this test is to ensure a test using before_each succeeds
 */

import { Rhum } from "../../../mod.ts";

let suite_val = "Ed";
let case_val = 22;

Rhum.testPlan("before_each_test.ts", () => {

  Rhum.beforeEach(() => {
    suite_val = "Eric";
  });
  // Run the first test suite
  Rhum.testSuite("test suite 1", () => {
    Rhum.beforeEach(() => {
      case_val = 2;
    });
    Rhum.testCase("suite_val is Eric", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
    });
    Rhum.testCase("suite_val is still Eric", () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
    });
    Rhum.testCase("case_val is 2", () => {
      Rhum.asserts.assertEquals(case_val, 2);
      case_val = 22;
    });
    Rhum.testCase("case_val is still 2", () => {
      Rhum.asserts.assertEquals(case_val, 2);
    });
  });

  // Run the second test suite
  Rhum.testSuite("test suite 2", () => {
    Rhum.beforeEach(() => {
      case_val = 0;
    });
    Rhum.testCase("suite_val is Eric", async () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
      suite_val = "Ed";
    });
    Rhum.testCase("suite_val is still Eric", async () => {
      Rhum.asserts.assertEquals(suite_val, "Eric");
    });
    Rhum.testCase("case_val is 0", () => {
      Rhum.asserts.assertEquals(case_val, 0);
    });
  });
});

Rhum.run();
