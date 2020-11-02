import { Rhum } from "../../mod.ts";
import { colors } from "../../deps.ts";

const decoder = new TextDecoder();

Rhum.testPlan(() => {
  Rhum.testSuite("ignore", () => {
    Rhum.testCase("can ignore a test file", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          `--ignore=ignored_test.ts`,
          "tests/integration/ignore/ignore_1",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_ignoreFile,
      );
    });

    Rhum.testCase("can ignore a multiple test files", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          `--ignore=ignore_1/ignored_test.ts,ignore_2/ignored_test.ts`,
          "tests/integration/ignore/",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_ignoreMultipleFiles,
      );
    });

    Rhum.testCase("can ignore a directory", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          `--ignore=ignore_1`,
          "tests/integration/ignore/",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_ignoreDirectory,
      );
    });

    Rhum.testCase("can ignore multiple directories", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          `--ignore=ignore/ignore_1/,ignore/ignore_2`,
          "tests/integration/ignore/",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_ignoreMultipleDirectories,
      );
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
// DATA PROVIDERS //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const data_ignoreFile = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)



Test Results: ${colors.green("0")} passed; ${colors.red("0")} failed; ${
  colors.yellow("0")
} skipped

${colors.blue("INFO")} Ignored files and/or directories

- ignored_test.ts
`;

const data_ignoreMultipleFiles = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)



Test Results: ${colors.green("0")} passed; ${colors.red("0")} failed; ${
  colors.yellow("0")
} skipped

${colors.blue("INFO")} Ignored files and/or directories

- ignore_1/ignored_test.ts
- ignore_2/ignored_test.ts
`;

const data_ignoreDirectory = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)


tests/integration/ignore/ignore_2/ignored_test.ts
    testSuite: ignored
        ${colors.green("PASS")} testCase: ignored


Test Results: ${colors.green("1")} passed; ${colors.red("0")} failed; ${
  colors.yellow("0")
} skipped

${colors.blue("INFO")} Ignored files and/or directories

- ignore_1
`;

const data_ignoreMultipleDirectories = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)



Test Results: ${colors.green("0")} passed; ${colors.red("0")} failed; ${
  colors.yellow("0")
} skipped

${colors.blue("INFO")} Ignored files and/or directories

- ignore/ignore_1/
- ignore/ignore_2
`;
