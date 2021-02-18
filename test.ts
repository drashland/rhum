import { Rhum } from "https://deno.land/x/rhum@v2.0.0/mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("my test suite", () => {
    Rhum.testCase("my test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
