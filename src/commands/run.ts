import {
  Subcommand,
  walkSync,
} from "../../deps.ts";
import { runTests } from "../test_runner.ts";

const decoder = new TextDecoder();

interface IGetTestFileOptions {
  test_case?: string;
  test_suite?: string;
}

function fileContainsRhumNamespace(contents: string): boolean {
  if (contents.includes("Rhum")) {
    return true;
  }

  return false;
}

/**
 * Get the test files.
 *
 * @param dirOrFile - The directory containing the tests or a test file.
 *
 * @returns An array of test files to execute using Deno.run().
 */
export function getAllTestFiles(
  input: string,
): string[] {
  const testFiles: string[] = [];

  if (input.includes(".ts")) {
    try {
      testFiles.push(validateFile(input));
    } catch (error) {
      console.log("1");
      console.log(error);
      throw new Error(error);
    }

    return testFiles;
  }

  for (const entry of walkSync(input, { includeDirs: false })) {
    if (entry.path.includes(".ts")) {
      try {
        testFiles.push(validateFile(entry.path));
      } catch (error) {
        console.log("2");
        console.log(error);
        throw new Error(error);
      }
    }
  }

  return testFiles;
}

function validateFile(filepath: string) {
  const contents = decoder.decode(Deno.readFileSync(filepath));
  if (!fileContainsRhumNamespace(contents)) {
    throw new Error(`"${filepath}" does not contain any tests.`);
  }

  return filepath;
}

export async function run(this: Subcommand): Promise<void> {
  if (this.hasOptionSpecified("--filter-test-case")) {
    return await runWithOptionFilterTestCase(this);
  }

  if (this.hasOptionSpecified("--filter-test-suite")) {
    return await runWithOptionFilterTestSuite(this);
  }

  await runDefault(this);
}

async function runDefault(
  subcommand: Subcommand,
): Promise<void> {
  let testFiles: string[] = [];

  const filepath = subcommand.user_input.last();

  testFiles = getAllTestFiles(filepath);
  console.log(testFiles);

  if (testFiles.length == 0) {
    subcommand.command.cli.logger.warn(`"${filepath}" does not contain any tests.`);
    Deno.exit(1);
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
  );
}

export async function runWithOptionFilterTestCase(
  subcommand: Subcommand,
): Promise<void> {
  const option = subcommand.options["--filter-test-case"];
  const testCase = option.value;

  const filepath = subcommand.user_input.last();
  const testFiles = filterTestFilesByTestCase(
    getAllTestFiles(filepath),
    testCase,
  );

  if (testFiles.length == 0) {
    const inputType = filepath.includes(".ts") ? "file" : "directory";
    subcommand.command.cli.logger.error(
      `The "${testCase}" test case could not be found in the "${filepath}" ${inputType}.`
    );
    Deno.exit(1);
  }

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_case: testCase },
  );
}

export async function runWithOptionFilterTestSuite(
  subcommand: Subcommand,
): Promise<void> {
  const option = subcommand.options["--filter-test-suite"];
  const testSuite = option.value;

  const filepath = subcommand.user_input.last();
  const testFiles = filterTestFilesByTestSuite(
    getAllTestFiles(filepath),
    testSuite,
  );

  await runTests(
    testFiles,
    subcommand.user_input.getDenoFlagsFromDenoArgs(),
    { test_case: testSuite },
  );
}

function filterTestFilesByTestCase(
  testFiles: string[],
  testCase: string
): string[] {
  let ret: string[] = [];

  for (const filepath of testFiles) {
    const contents = minify(
      decoder.decode(Deno.readFileSync(filepath))
    );
    if (contents.includes(`Rhum.testCase("${testCase}"`)) {
      ret.push(filepath);
    }
  }

  return ret;
}

function filterTestFilesByTestSuite(
  testFiles: string[],
  testSuite: string,
): string[] {

  let ret: string[] = [];

  for (const filepath in testFiles) {
    const contents = minify(
      decoder.decode(Deno.readFileSync(filepath))
    );
    if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
      ret.push(filepath);
    }
  }

  return ret;
}

function minify(input: string): string {
  return input.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
}
