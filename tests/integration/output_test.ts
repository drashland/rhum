import { Rhum } from "../../mod.ts";
import { colors } from "../../deps.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("output", () => {
    Rhum.testCase("output shows as expected", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          "example_tests/test.ts",
        ],
        stdout: "piped",
      });
      const stdout = new TextDecoder().decode(await p.output());

      // When we assert the output below, we want to strip out anything that is
      // filesystem related. For example, we want to strip the following out:
      //
      //     at Object.assertEquals (asserts.ts:196:9)
      //     at Object.test_fn (file:///private/var/src/drashland/rhum/example_tests/test.ts:43:12)
      //     at RhumRunner.runCase (file:///private/var/src/drashland/rhum/mod.ts:172:3)
      //     at RhumRunner.runSuite (file:///private/var/src/drashland/rhum/mod.ts:248:8)
      //     at async RhumRunner.runAllSuitesAndCases (file:///private/var/src/drashland/rhum/mod.ts:202:51)
      //     at async RhumRunner.runTestPlan (file:///private/var/src/drashland/rhum/mod.ts:97:3)
      //     at async RhumRunner.testPlan (file:///private/var/src/drashland/rhum/mod.ts:139:3)
      //
      // This information would be difficult to manage between a CI environment
      // and a local environment. Therefore, we strip it out of the tests
      // beacuse we don't really care about that stuff. We care about the
      // output: PASS, FAIL, SKIP, and the Actual / Expected data.
      Rhum.asserts.assertEquals(
        stdout.replace(/\n.+at.*\)/g, ""),
        output,
      );
    });
  });
});

const output = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)


example_tests/test.ts
    testSuite 1: skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite 2: skipped
        ${colors.yellow("SKIP")} skipped
    testSuite 3
        ${colors.green("PASS")} testCase
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite 4
        ${colors.yellow("SKIP")} skipped
        ${colors.green("PASS")} testCase
    testSuite 5
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.green("PASS")} testCase
    testSuite 6: skipped
        ${colors.yellow("SKIP")} skipped
    testSuite 7
        ${colors.green("PASS")} testCase
        ${colors.yellow("SKIP")} skipped
        ${colors.red("FAIL")} fail

AssertionError: Values are not equal:


    ${colors.gray(colors.bold("[Diff]"))} ${
  colors.red(colors.bold("Actual"))
} / ${colors.green(colors.bold("Expected"))}


${colors.red(colors.bold("-   false"))}
${colors.green(colors.bold("+   true"))}



Test Results: ${colors.green("4")} passed; ${colors.red("1")} failed; ${
  colors.yellow("10")
} skipped
`;
