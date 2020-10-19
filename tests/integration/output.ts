import { Rhum } from "../../mod.ts";
import { colors } from "../../deps.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("output", () => {
    Rhum.testCase("output shows as expected", async () => {
      const p = Deno.run({
        cmd: [
          "rhum", "example_tests/test.ts"
        ],
        stdout: "piped"
      });
      const stdout = new TextDecoder().decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout.replace(/.+at.*\)/g, ""),
        output
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


    ${colors.gray(colors.bold("[Diff]"))} ${colors.red(colors.bold("Actual"))} / ${colors.green(colors.bold("Expected"))}


${colors.red(colors.bold("-   false"))}
${colors.green(colors.bold("+   true"))}










Test Results: ${colors.green("4")} passed; ${colors.red("1")} failed; ${colors.yellow("10")} skipped
`;
