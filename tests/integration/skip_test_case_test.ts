import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("testSuite", () => {
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
