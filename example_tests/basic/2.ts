import { Rhum } from "../../mod.ts";

Rhum.testPlan("test_plan_2", () => {
  Rhum.testSuite("test_suite_2a", () => {
    Rhum.testCase("test_case_2a1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2a2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2a3", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_2b", () => {
    Rhum.testCase("test_case_2b1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2b2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_2c", () => {
    Rhum.testCase("test_case_2c1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2c2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2c3", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_2d", () => {
    Rhum.testCase("test_case_2d1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_2d2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});

Rhum.run();
