import { Rhum } from "../../mod.ts";

Rhum.TestPlan("test_plan_2", () => {
  Rhum.TestSuite("test_suite_2a", () => {
    Rhum.TestCase("test_case_2a1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2a2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2a3", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });

  Rhum.TestSuite("test_suite_2b", () => {
    Rhum.TestCase("test_case_2b1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2b2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });
});
