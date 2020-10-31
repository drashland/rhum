import { Rhum } from "../../mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("Deno std asserts", () => {
    Rhum.testCase("asserts", () => {
      Rhum.asserts.assert(true);
    });
    Rhum.testCase("assertEquals", () => {
      Rhum.asserts.assertEquals(true, true);
    });
    Rhum.testCase("assertNotEquals", () => {
      Rhum.asserts.assertNotEquals(true, false);
      Rhum.asserts.assertNotEquals("1", 1);
    });
    Rhum.testCase("assertStrictEquals", () => {
      Rhum.asserts.assertStrictEquals(true, true);
      const a = {};
      const b = a;
      Rhum.asserts.assertStrictEquals(a, b);
    });
    Rhum.testCase("assertStringIncludes", () => {
      Rhum.asserts.assertStringIncludes("Test hello", "hello");
    });
    Rhum.testCase("assertMatch", () => {
      Rhum.asserts.assertMatch("Test hello", /hello/g);
    });
    Rhum.testCase("assertArrayIncludes", () => {
      Rhum.asserts.assertArrayIncludes(["t", "e", "s", "t"], ["t", "e"]);
    });
    Rhum.testCase("assertThrows", () => {
      Rhum.asserts.assertThrows(() => {
        throw new Error("test");
      });
    });
    Rhum.testCase("assertThrowsAsync", () => {
      Rhum.asserts.assertThrowsAsync(() => {
        return Rhum.asserts.assertThrowsAsync(() => {
          return Promise.reject("Panic!");
        });
      });
    });
  });
});
