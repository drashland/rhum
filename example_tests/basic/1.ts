import { Rhum } from "../../mod.ts";

Rhum.testPlan("test_plan_1", () => {

  Rhum.before(() => {
    console.log("run before all test suite");
  });

  Rhum.after(() => {
    console.log("run after all test suites");
  });

  Rhum.testSuite("test_suite_1a", () => {

    Rhum.beforeEach(() => {
      console.log("run before each test");
    });

    Rhum.afterEach(() => {
      console.log("run after each test");
    });

    Rhum.testCase("test_case_1a1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_1a2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_1a3", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_1b", () => {
    Rhum.testCase("test_case_1b1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_1b2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_1b3", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
