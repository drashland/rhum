import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.skip("skipped test suite", () => {
    Rhum.testCase("skipped because of test suite", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("not skipped test suite", () => {
    Rhum.testCase("not skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("another skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.skip("another skipped test suite", () => {
    Rhum.testCase("not skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("another skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
