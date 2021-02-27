import { runTests } from "../test_runner.ts";
import { mimeDb } from "../mime_db.ts";
import { Subcommand, SubcommandOption, walkSync } from "../../deps.ts";

class FilterTestCase extends SubcommandOption {
  public signature = "--filter-test-case [test case name]";
  public description = "Run only test cases that match the value of this option.";
}

const decoder = new TextDecoder();

export class RunSubcommand extends Subcommand {
  public name = "run";
  public signature = "run [directory|file]";
  public description = "Run tests.";
  public options = [
    FilterTestCase
  ];

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  public async handle(): Promise<void> {
    if (this.getOption("--filter-test-case")) {
      console.log("test");
      return;
    }

    await this.run();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Run this command.
   */
  protected async run(): Promise<void> {
    const filepath = this.getArgument("[directory|file]");

    if (!filepath) {
      return this.showHelp();
    }

    const testFiles = this.getTestFiles(filepath);

    await runTests(
      testFiles,
      this.getDenoFlags()
    )
  }

  /**
   * Is the Rhum namespace present in the specified file contents?
   *
   * @param contents - The contents of the file.
   *
   * @returns True if yes, false if no.
   */
  protected contentsContainRhumNamespace(contents: string): boolean {
    if (contents.includes("Rhum")) {
      if (contents.includes(".skip")) {
        return true;
      } else {
        if (contents.includes(".testPlan")) {
          return true;
        }
        if (contents.includes(".testSuite")) {
          return true;
        }
        if (contents.includes(".testCase")) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Filter the specified test files by test case.
   *
   * @param testFiles - The test files to search.
   * @param testCase - The test case to use as a filter.
   *
   * @returns A filtered set of test files.
   */
  protected filterTestFilesByTestCase(
    testFiles: string[],
    testCase: string,
  ): string[] {
    const ret: string[] = [];

    for (const filepath of testFiles) {
      const contents = this.minify(
        decoder.decode(Deno.readFileSync(filepath)),
      );
      if (contents.includes(`Rhum.testCase("${testCase}"`)) {
        ret.push(filepath);
      }
    }

    return ret;
  }

  /**
   * Filter the specified test files by test suite.
   *
   * @param testFiles - The test files to search.
   * @param testSuite - The test suite to use as a filter.
   *
   * @returns A filtered set of test files.
   */
  protected filterTestFilesByTestSuite(
    testFiles: string[],
    testSuite: string,
  ): string[] {
    const ret: string[] = [];

    for (const filepath in testFiles) {
      const contents = this.minify(
        decoder.decode(Deno.readFileSync(filepath)),
      );
      if (contents.includes(`Rhum.testSuite("${testSuite}"`)) {
        ret.push(filepath);
      }
    }

    return ret;
  }

  /**
   * Get all of the test files.
   *
   * @param input - The directory or file containing tests.
   *
   * @returns An array of test files containing tests.
   */
  protected getTestFiles(
    input: string,
  ): string[] {
    const testFiles: string[] = [];

    if (this.isFile(input)) {
      try {
        if (this.validateFile(input)) {
          testFiles.push(input);
        }
      } catch (error) {
        throw new Error(`Error reading "${input}" file. See error stack below:\n${error.stack}`);
      }

      testFiles.push(input);
      return testFiles;
    }

    this.validateDirectory(input);

    for (const entry of walkSync(input, { includeDirs: false })) {
      if (this.isFile(entry.path)) {
        try {
          if (this.validateFile(entry.path)) {
            testFiles.push(entry.path);
          }
        } catch (error) {
          throw new Error(`Error reading "${input}" file. See error stack below:\n${error.stack}`);
        }
      }
    }

    return testFiles;
  }

  /**
   * Get all of the test files containing the test case.
   *
   * @param filepath - The filepath containing the test case.
   * @param testCase - The test case to find.
   *
   * @returns Test files containing the test case.
   */
  protected getTestFilesWithTestCase(
    filepath: string,
    testCase: string,
  ): string[] {
    let testFiles: string[] = [];

    try {
      testFiles = this.getTestFiles(filepath);
    } catch (error) {
      const inputType = filepath.includes(".ts") ? "file" : "directory";
      throw new Error(
        `Could not get tests using "${filepath}" as the ${inputType}. See error stack below.\n${error.stack}`,
      );
    }

    testFiles = this.filterTestFilesByTestCase(
      testFiles,
      testCase,
    );

    return testFiles;
  }

  /**
   * Get all of the test files containing the test suite.
   *
   * @param filepath - The filepath containing the test suite.
   * @param testCase - The test suite to find.
   *
   * @returns Test files containing the test suite.
   */
  protected getTestFilesWithTestSuite(
    filepath: string,
    testSuite: string,
  ): string[] {
    let testFiles: string[] = [];

    try {
      testFiles = this.getTestFiles(filepath);
    } catch (error) {
      const inputType = filepath.includes(".ts") ? "file" : "directory";
      throw new Error(
        `Could not get tests using "${filepath}" as the ${inputType}. See error stack below.\n${error.stack}`,
      );
    }

    testFiles = this.filterTestFilesByTestSuite(
      testFiles,
      testSuite,
    );

    return testFiles;
  }

  /**
   * Is the filepath in question a file.
   *
   * @param filepath - The filepath in question.
   *
   * @returns True if yes, false if no.
   */
  protected isFile(filepath: string): boolean {
    const split = filepath.split(".");
    return this.isFileExtension(split[split.length - 1]);
  }

  /**
   * Is the extension in question a file extension?
   *
   * @param extension - The extension in question.
   *
   * @returns True if yes, false if no.
   */
  protected isFileExtension(extension: string): boolean {
    let fileExtensions: string[] = [];

    for (const mediaType in mimeDb) {
      const mediaTypeObj = mimeDb[mediaType];
      if (mediaTypeObj.extensions) {
        fileExtensions = fileExtensions.concat(mediaTypeObj.extensions);
      }
    }

    return fileExtensions.indexOf(extension) != -1;
  }

  /**
   * Minify the input string -- removing new lines and whitespace.
   *
   * @param input - The string to minify.
   *
   * @returns A minified string.
   */
  protected minify(input: string): string {
    return input.replace(/\n\s/g, "").replace(/\(\s+/g, "(");
  }

  /**
   * Run the run subcommand with the --filter-test-suite option.
   *
   * @param subcommand - The subcommand object.
   */
  // protected async runWithOptionFilterTestSuite(): Promise<void> {
  //   const option = this.options["--filter-test-suite"];
  //   const testSuite = option.value;
  //   const filepath = this.user_input.last();
  //   const testFiles = this.getTestFilesWithTestSuite(
  //     filepath,
  //     testSuite,
  //   );

  //   if (testFiles.length == 0) {
  //     const inputType = filepath.includes(".ts") ? "file" : "directory";
  //     this.cli.logger.error(
  //       `The "${testSuite}" test suite could not be found in the "${filepath}" ${inputType}.`,
  //     );
  //     Deno.exit(1);
  //   }

  //   await runTests(
  //     testFiles,
  //     this.user_input.getDenoFlagsFromDenoArgs(),
  //     { test_suite: testSuite },
  //   );
  // }

  /**
   * Validate the filepath in question.
   *
   * @param filepath - The filepath in question.
   */
  protected validateDirectory(filepath: string): void {
    try {
      Deno.readDirSync(filepath);
    } catch (error) {
      throw new Error(`Error reading "${filepath}" directory. See error stack below:\n${error.stack}`);
    }
  }

  /**
   * Validate the filepath in question.
   *
   * @param filepath - The filepath in question.
   */
  protected validateFile(filepath: string): boolean {
    const contents = Deno.readFileSync(filepath);
    if (!contents) {
      return false;
    }

    const decoded = decoder.decode(contents);
    if (!this.contentsContainRhumNamespace(decoded)) {
      return false;
    }

    return true;
  }
}
