import { Rhum } from "../../mod.ts";

Rhum.TestPlan("test_plan_2", () => {
  Rhum.TestSuite("test_suite_2c", () => {
    Rhum.TestCase("test_case_2c1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2c2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2c3", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });

  Rhum.TestSuite("test_suite_2d", () => {
    Rhum.TestCase("test_case_2d1", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
    Rhum.TestCase("test_case_2d2", () => {
      Rhum.Asserts.assertEquals(true, true);
    });
  });
});
