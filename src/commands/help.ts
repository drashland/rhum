import { CliService } from "../../../deps.ts";
import { version } from "../../../mod.ts";

export function help() {
  const menu = CliService.createHelpMenu({
    description: `Rhum ${version} - A lightweight testing framework for Deno.`,
    usage: [
      "rhum [subcommand] [options] [directory|file]",
    ],
    subcommands: {
      "make [file]": "Make a test file.",
      "test [options] [directory|file]":
        "Run tests by specifying a test directory or test file.",
      "help, --help": "Display the help menu.",
      "version, --version": "Display Rhum version.",
    },
    options: {
      "test": {
        "--filter-test-case":
          "Execute the matching test case in the file(s) being tested. This option cannot be used with --filter-test-suite.",
        "--filter-test-suite":
          "Execute the matching test suite in the file(s) being tested. This option cannot be used with --filter-test-case.",
        "--ignore": "Ignore a set of directories or files.",
      },
    },
    example_usage: [
      {
        description:
          "Execute the matching test case in the file(s) being tested.",
        examples: [
          `rhum test --filter-test-case="my test case" test_file.ts`,
          `rhum test --filter-test-case="my test case" some_dir/`,
        ],
      },
      {
        description:
          "Execute the matching test case in the file(s) being tested.",
        examples: [
          `rhum test --filter-test-suite="my test suite" test_file.ts`,
          `rhum test --filter-test-suite="my test suite" some_dir/`,
        ],
      },
      {
        description: "Execute all tests, but ignore directories/files.",
        examples: [
          `rhum test --ignore=./tests/data tests/`,
          `rhum test --ignore=./tests/data,./tests/ignore tests/`,
          `rhum test --ignore=./tests/test_1.ts tests/`,
          `rhum test --ignore=./tests/test_1.ts,./tests/test_2.ts tests/`,
        ],
      },
      {
        description: "Make a test file at /my/project/tests/my_test.ts",
        examples: [
          "rhum make /my/project/tests/my_test.ts",
        ],
      },
      {
        description: "Display the help menu.",
        examples: [
          "rhum help",
        ],
      },
      {
        description: "Display the Rhum version.",
        examples: [
          "rhum version",
        ],
      },
    ],
  });

  console.log(menu);
}
