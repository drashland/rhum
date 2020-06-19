import { Rhum } from "../../mod.ts";

Rhum.TestPlan("test_plan_3", () => {
  Rhum.TestSuite("test_suite_3a", () => {
    Rhum.TestCase("test_case_3a1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_3a2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });

  Rhum.TestSuite("test_suite_3b", () => {
    Rhum.TestCase("test_case_3b1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_3b2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });

  Rhum.TestSuite("test_suite_3c", () => {
    Rhum.TestCase("test_case_3c1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_3c2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });
});
