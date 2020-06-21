import { Rhum } from "../../mod.ts";

Rhum.testPlan("test_plan_3", () => {
  Rhum.testSuite("test_suite_3a", () => {
    Rhum.testCase("test_case_3a1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_3a2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_3b", () => {
    Rhum.testCase("test_case_3b1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_3b2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test_suite_3c", () => {
    Rhum.testCase("test_case_3c1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("test_case_3c2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});

Rhum.run();
