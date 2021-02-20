import {
  ConsoleLogger,
  Command,
  walkSync,
} from "../../deps.ts";
import { runTests } from "../test_runner.ts";

const decoder = new TextDecoder();

/**
 * Get the test files.
 *
 * @param dirOrFile - The directory containing the tests or a test file.
 *
 * @returns An array of test files to execute using Deno.run().
 */
export function getTestFiles(
  dirOrFile: string,
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        const contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `,
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
  testCase: string,
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        let contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `,
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
  testSuite: string,
): string[] {
  const testFiles: string[] = [];

  if (!dirOrFile.includes(".ts")) {
    for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
      if (entry.path.includes(".ts")) {
        let contents = decoder.decode(Deno.readFileSync(entry.path));
        if (!contents.includes("Rhum")) {
          ConsoleLogger.error(
            `${entry.path} does not contain the Rhum namespace.
            `,
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

export async function run(this: Command): Promise<void> {
  if (this.hasOptionSpecified("--filter-test-case")) {
    return await runWithOptionFilterTestCase(this);
  }

  if (this.hasOptionSpecified("--filter-test-suite")) {
    return await runWithOptionFilterTestSuite(this);
  }

  await runDefault(this);
}

async function runDefault(
  subcommand: Command,
): Promise<void> {
  let testFiles: string[] = [];

  const filepath = subcommand.user_input.last();

  try {
    testFiles = getTestFiles(filepath);
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    return subcommand.showHelp();
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
  );
}

export async function runWithOptionFilterTestSuite(
  subcommand: Command,
): Promise<void> {
  const option = subcommand.options["--filter-test-suite"];

  const testSuite = option.value;

  if (!testSuite) {
    ConsoleLogger.error(`Missing "option value".`);
    return option.showHelp();
  }

  const filepath = option.command.user_input.last();

  if (filepath.includes("--filter-test-suite")) {
    return option.showHelp();
  }

  if (!isFilepath(filepath)) {
    ConsoleLogger.error(
      `Error reading [directory|file]. Input "${filepath}" is invalid.`,
    );
    return option.showHelp();
  }

  let testFiles: string[] = [];

  try {
    testFiles = getTestFilesWithTestSuite(
      filepath,
      testSuite,
    );
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    ConsoleLogger.warn(
      `Test files in "${filepath}" do not contain a "${testSuite}" test case.`,
    );
    return;
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_suite: testSuite },
  );
}

export async function runWithOptionFilterTestCase(
  subcommand: Command,
): Promise<void> {
  const option = subcommand.options["--filter-test-case"];

  const testCase = option.value;

  if (!testCase) {
    ConsoleLogger.error(`Missing "option value".`);
    return option.showHelp();
  }

  const filepath = option.command.user_input.last();

  if (filepath.includes("--filter-test-case")) {
    return option.showHelp();
  }

  if (!isFilepath(filepath)) {
    ConsoleLogger.error(
      `Error reading [directory|file]. Input "${filepath}" is invalid.`,
    );
    return option.showHelp();
  }

  let testFiles: string[] = [];

  try {
    testFiles = getTestFilesWithTestCase(
      filepath,
      testCase,
    );
  } catch (error) {
  }

  if (testFiles.length <= 0) {
    ConsoleLogger.warn(
      `Test files in "${filepath}" do not contain a "${testCase}" test case.`,
    );
    return;
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_case: testCase },
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
