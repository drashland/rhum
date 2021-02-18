import {
  ConsoleLogger,
  Input,
  Option,
  Subcommand,
  walkSync
} from "../../deps.ts";
import { runTests } from "../test_runner.ts";

const decoder = new TextDecoder();

/**
 * Get the deno flags (e.g., --allow-all) from the specified input.
 *
 * @param input -  The input containing (if any) Deno flags.
 *
 * @returns An array of Deno flags.
 */
function getDenoFlags(input: Input): string[] {
  let ret: string[] = [];

  if (
    input.hasArg("-A")
    || input.hasArg("--allow-all")
  ) {
    ret.push("--allow-all");
  } else {
    if (input.hasArg("--allow-net")) {
      ret.push("--allow-net");
    }
    if (input.hasArg("--allow-read")) {
      ret.push("--allow-read");
    }
    if (input.hasArg("--allow-run")) {
      ret.push("--allow-run");
    }
    if (input.hasArg("--allow-write")) {
      ret.push("--allow-write");
    }
  }

  return ret;
}

/**
 * Get the test files.
 *
 * @param dirOrFile - The directory containing the tests or a test file.
 *
 * @returns An array of test files to execute using Deno.run().
 */
export function getTestFiles(
  dirOrFile: string
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        const contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `
          );
          Deno.exit(1);
        }
        testFiles.push(entry.path);
      }
    }
  } else {
    if (!Deno.readFileSync(dirOrFile)) {
      throw new Error("Invalid test file.");
    }
    testFiles.push(dirOrFile);
  }

  return testFiles;
}

export function getTestFilesWithTestCase(
  dirOrFile: string,
  testCase: string
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        let contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `
          );
          Deno.exit(1);
        }
        contents = contents.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
        if (contents.includes(`Rhum.testCase("${testCase}"`)) {
          testFiles.push(entry.path);
        }
      }
    }
  } else {
    let contents = decoder.decode(Deno.readFileSync(dirOrFile));
    if (!contents) {
      throw new Error("Invalid test file.");
    }
    contents = contents.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
    if (contents.includes(`Rhum.testCase("${testCase}"`)) {
      testFiles.push(dirOrFile);
    }
  }

  return testFiles;
}

export function getTestFilesWithTestSuite(
  dirOrFile: string,
  testSuite: string
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        let contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `
          );
          Deno.exit(1);
        }
        contents = contents.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
        if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
          testFiles.push(entry.path);
        }
      }
    }
  } else {
    let contents = decoder.decode(Deno.readFileSync(dirOrFile));
    if (!contents) {
      throw new Error("Invalid test file.");
    }
    contents = contents.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
    if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
      testFiles.push(dirOrFile);
    }
  }

  return testFiles;
}

export async function run(this: Subcommand): Promise<void> {
  if (
    this.hasOptionSpecified("--filter-test-case")
    && this.hasOptionSpecified("--filter-test-suite")
  ) {
    ConsoleLogger.error(
      `--filter-test-case and --filter-test-suite cannot be used together.`
    );
    this.showHelp();
    return;
  }

  if (this.hasOptionSpecified("--filter-test-case")) {
    return await runWithOptionFilterTestCase(this);
  }

  if (this.hasOptionSpecified("--filter-test-suite")) {
    return await runWithOptionFilterTestSuite(this);
  }

  await runDefault(this);
}

async function runDefault(
  subcommand: Subcommand
): Promise<void> {
  let testFiles: string[] = [];

  const filepath = subcommand.cli.input.last();

  try {
    testFiles = getTestFiles(filepath);
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    return subcommand.showHelp();
  }

  await runTests(
    testFiles,
    getDenoFlags(subcommand.cli.input)
  );
}

export async function runWithOptionFilterTestSuite(
  subcommand: Subcommand,
): Promise<void> {
  const option = subcommand.getOption("--filter-test-suite")!;

  const testSuite = option.value;

  if (!testSuite) {
    ConsoleLogger.error(`Missing "option value".`);
    return option.showHelp();
  }

  const filepath = option.cli.input.last();

  if (filepath.includes("--filter-test-suite")) {
    return option.showHelp();
  }

  if (!isFilepath(filepath)) {
    ConsoleLogger.error(
      `Error reading [directory|file]. Input "${filepath}" is invalid.`
    );
    return option.showHelp();
  }

  let testFiles: string[] = [];

  try {
    testFiles = getTestFilesWithTestSuite(
      filepath,
      testSuite
    );
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    ConsoleLogger.warn(
      `Test files in "${filepath}" do not contain a "${testSuite}" test case.`
    );
    return;
  }

  await runTests(
    testFiles,
    getDenoFlags(option.cli.input),
    { test_suite: testSuite }
  );
}

export async function runWithOptionFilterTestCase(
  subcommand: Subcommand
): Promise<void> {
  const option = subcommand.getOption("--filter-test-case")!;

  const testCase = option.value;

  if (!testCase) {
    ConsoleLogger.error(`Missing "option value".`);
    return option.showHelp();
  }

  const filepath = option.cli.input.last();

  if (filepath.includes("--filter-test-case")) {
    return option.showHelp();
  }

  if (!isFilepath(filepath)) {
    ConsoleLogger.error(
      `Error reading [directory|file]. Input "${filepath}" is invalid.`
    );
    return option.showHelp();
  }

  let testFiles: string[] = [];

  try {
    testFiles = getTestFilesWithTestCase(
      filepath,
      testCase
    );
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    ConsoleLogger.warn(
      `Test files in "${filepath}" do not contain a "${testCase}" test case.`
    );
    return;
  }

  await runTests(
    testFiles,
    getDenoFlags(option.cli.input),
    { test_case: testCase }
  );
}

function isFilepath(filepath: string): boolean {
  try {
    Deno.readFileSync(filepath);
    return true;
  } catch (error) {
  }

  try {
    Deno.readDirSync(filepath);
    return true;
  } catch (error) {
  }

  return false;
}
