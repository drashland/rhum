export function showHelp() {
  console.log(`
Rhum - A lightweight testing framework for Deno.

USAGE

    rhum [OPTIONS] [DIRECTORY|FILE]

OPTIONS

    --filter-test-case
        Execute the matching test case in the file(s) being tested.

    --filter-test-suite
        Execute the matching test suite in the file(s) being tested.

    --help
        Show the help menu.

    --version
        Show Rhum version.

EXAMPLE USAGE

    Execute the matching test case in the file(s) being tested.
        rhum --filter-test-case myTestCase test_file.ts

    Execute the matching test suite in the file(s) being tested.
        rhum --filter-test-suite myTestSuite test_file.ts

    Show the help menu.
        rhum --help

    Show the Rhum version.
        rhum --version

`);
}
