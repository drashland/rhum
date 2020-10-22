import { LoggerService } from "../../../deps.ts";

const encoder = new TextEncoder();

const testTemplate: Uint8Array = encoder.encode(
  `import { Rhum } from "https://deno.land/x/rhum@v1.1.4/mod.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("my test suite", () => {
    Rhum.testCase("my test case", () => {
      Rhum.asserts.assertEquals(true, true);
    });
  });
});
`,
);

export function make(args: string[]) {
  const testFileToCreate = args[0];

  if (!testFileToCreate.includes(".ts")) {
    LoggerService.logError(
      `Test files require a .ts extension. You passed in "${testFileToCreate}" as the test file.`,
    );
    Deno.exit(1);
  }

  try {
    // If we can't read the file, then that means it doesn't exist. That also
    // means we can create the file in the catch block below.
    Deno.readFileSync(testFileToCreate);
    LoggerService.logError(`"${testFileToCreate}" already exists`);
  } catch (error) {
    // Try to create the file
    LoggerService.logInfo(`Creating "${testFileToCreate}"`);
    try {
      createFile(testFileToCreate);
    } catch (error) {
      LoggerService.logError(error.stack);
    }
  }
}

function createFile(testFileToCreate: string) {
  const pathToTestFile = testFileToCreate.split("/");
  pathToTestFile.pop();
  Deno.mkdirSync(pathToTestFile.join("/"), { recursive: true });
  Deno.writeFileSync(testFileToCreate, testTemplate);
  LoggerService.logInfo(`Test file "${testFileToCreate} created`);
}
