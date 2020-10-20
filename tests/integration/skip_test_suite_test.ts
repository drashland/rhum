import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.skip("skipped", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
