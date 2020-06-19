import { Rhum } from "../../mod.ts";

Rhum.TestPlan("test_plan_1", () => {
  Rhum.TestSuite("test_suite_1a", () => {
    Rhum.TestCase("test_case_1a1", () => {
      Rhum.Asserts.assertEquals(true, false);
    });
    Rhum.TestCase("test_case_1a2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_1a3", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });

  Rhum.TestSuite("test_suite_1b", () => {
    Rhum.TestCase("test_case_1b1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_1b2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_1b3", () => {
      Rhum.Asserts.assertEquals(true, false);
    });
  });
});
