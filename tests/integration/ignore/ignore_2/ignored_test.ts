import { Rhum } from "../../../../mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("testSuite: ignored", () => {
    Rhum.testCase("testCase: ignored", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
