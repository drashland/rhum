import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.skip("skipped test suite 0", () => {
    Rhum.testCase("skipped because of test suite 0-0", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("skipped because of test suite 0-1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("not skipped test suite 1", () => {
    Rhum.testCase("not skipped test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped test case 1-1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped test case 1-2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("not skipped test suite 2", () => {
    Rhum.skip("skipped test case 2-1", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("not skipped test case 2-2", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.skip("skipped test suite 3", () => {
    Rhum.testCase("skipped because of test suite", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("test suite", () => {
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
