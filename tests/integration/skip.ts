import { Rhum } from "../../mod.ts";

// This file should have 5 passed tests
// This file should have 0 failed tests
// This file should have 10 skipped tests

Rhum.testPlan(() => {
  Rhum.skip("testSuite skipped 1", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.skip("testSuite skipped 2", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite not skipped 3", () => {
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

  Rhum.testSuite("testSuite not skipped 4", () => {
    Rhum.skip("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("testCase", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite not skipped 5", () => {
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

  Rhum.skip("testSuite skipped 6", () => {
    Rhum.testCase("skipped", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });

  Rhum.testSuite("testSuite not skipped 7", () => {
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
