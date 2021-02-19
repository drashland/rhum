import { ConsoleLogger, Subcommand } from "../../deps.ts";

const encoder = new TextEncoder();

const testTemplate: Uint8Array = encoder.encode(
  `import { Rhum } from "https://deno.land/x/rhum@v2.0.0/mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("my test suite", () => {
    Rhum.testCase("my test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
`,
);

export function make(
  this: Subcommand,
) {
  const input = this.cli.user_input.last();

  if (input == "make") {
    this.showHelp();
    return;
  }

  if (!input.includes(".ts")) {
    ConsoleLogger.error(
      `Test files require a .ts extension. "${input}" was specified.`,
    );
    return;
  }

  try {
    // If we can't read the file, then that means it doesn't exist. That also
    // means we can create the file in the catch block below.
    Deno.readFileSync(input);
    ConsoleLogger.error(`"${input}" already exists`);
  } catch (error) {
    // Try to create the file
    ConsoleLogger.info(`Creating "${input}"`);
    try {
      createFile(input);
    } catch (error) {
      ConsoleLogger.error(error.stack);
    }
  }
}

function createFile(input: string) {
  const pathToTestFile = input.split("/");
  pathToTestFile.pop();
  Deno.mkdirSync(pathToTestFile.join("/"), { recursive: true });
  Deno.writeFileSync(input, testTemplate);
  ConsoleLogger.info(`Test file "${input} created`);
}
