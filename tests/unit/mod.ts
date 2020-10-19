import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("addTestSuiteToTestPlan", () => {
    Rhum.testCase("plan.suites['myRandomTestSuite'] is set", () => {
      Rhum.addTestSuiteToTestPlan("myRandomTestSuite", false, () => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["myRandomTestSuite"],
        "object",
      );
      Rhum.asserts.assertEquals(
        Rhum.getTestPlan().suites["myRandomTestSuite"].skip,
        false,
      );
    });
  });

  Rhum.testSuite("beforeAll", () => {
    Rhum.testCase("before_all_suites_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.beforeAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().before_all_suites_hook,
        "function",
      );
    });

    Rhum.testCase("before_all_cases_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.beforeAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .before_all_cases_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("beforeEach", () => {
    Rhum.testCase("before_each_suite_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.beforeEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
      const plan = Rhum.getTestPlan();
      Rhum.asserts.assertEquals(
        typeof plan.before_each_suite_hook,
        "function",
      );
    });

    Rhum.testCase("before_each_case_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.addTestSuiteToTestPlan("some test suite", false, () => {});
      Rhum.beforeEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "some test suite");
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .before_each_case_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("afterEach", () => {
    Rhum.testCase("after_each_suite_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.afterEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().after_each_suite_hook,
        "function",
      );
    });

    Rhum.testCase("after_each_case_hook is set", () => {
      Rhum.setCurrentTestSuite("some test test");
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.afterEach(() => {});
      Rhum.asserts.assertEquals(
        Rhum.getCurrentTestSuite(),
        "some test suite",
      );
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .after_each_case_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("afterAll", () => {
    Rhum.testCase("after_all_suites_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.afterAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().after_all_suites_hook,
        "function",
      );
    });

    Rhum.testCase("after_all_cases_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.afterAll(() => {});
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .after_all_cases_hook,
        "function",
      );
    });
  });
});
