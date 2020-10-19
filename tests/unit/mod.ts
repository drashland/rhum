import { Rhum } from "../../mod.ts";

let val = 1;

Rhum.testPlan(() => {
  Rhum.testSuite("beforeEach", () => {
    Rhum.testCase("before_each_suite_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.beforeEach(() => {
        val = 0;
      });
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
      const plan = Rhum.getTestPlan();
      Rhum.asserts.assertEquals("function", typeof plan.before_each_suite_hook);
    });

    Rhum.testCase("before_each_case_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.addTestSuiteToTestPlan("some test suite", false, () => {});
      Rhum.beforeEach(() => {
        val = 0;
      });
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "some test suite");
      const plan = Rhum.getTestPlan();
      Rhum.asserts.assertEquals(
        "function",
        typeof plan.suites["some test suite"].before_each_case_hook,
      );
    });
  });
});
