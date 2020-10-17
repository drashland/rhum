import { showHelp } from "./src/options/help.ts";
import { runTests } from "./src/test_runner.ts";

const dirOrFile = Deno.args[Deno.args.length - 1];

if (!dirOrFile || isOption(dirOrFile)) {
  showHelp();
  Deno.exit(0);
}

if (Deno.args.length > 1) {
  Deno.args.forEach((arg: string) => {
    if (arg.includes("--filter-test-case")) {
    }
    if (arg.includes("--filter-test-suite")) {
    }
    if (arg.includes("--version")) {
    }
    if (arg.includes("--help")) {
      showHelp();
      Deno.exit(0);
    }
  });
}

function isOption(input: string) {
  if (input.includes("--")) {
    return true;
  }

  return false;
}

runTests(dirOrFile);
