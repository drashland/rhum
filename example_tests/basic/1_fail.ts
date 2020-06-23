import { Rhum } from "../../mod.ts";

Rhum.testPlan("test_plan_1", () => {
  Rhum.testSuite("test_suite_1a", () => {
    Rhum.testCase("test_case_1a1", () => {
      Rhum.asserts.assertEquals(true, false);
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
      Rhum.asserts.assertEquals(true, false);
    });
  });
});

Rhum.run();
