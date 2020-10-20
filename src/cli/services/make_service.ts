const encoder = new TextEncoder();

export const testTemplate: Uint8Array= encoder.encode(`import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("my test suite", () => {
    Rhum.testCase("my test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
`);
