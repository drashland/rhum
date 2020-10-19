import { Rhum } from "../../mod.ts";

// This file should have 5 passed tests
// This file should have 0 failed tests
// This file should have 10 skipped tests

Rhum.testPlan(() => {
  Rhum.skip("testSuite 1: skipped", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.skip("testSuite 2: skipped", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite 3", () => {
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite 4", () => {
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite 5", () => {
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.skip("testSuite 6: skipped", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite 7", () => {
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});

