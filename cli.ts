import { showHelp } from "./src/options/help.ts";
import { runTests } from "./src/test_runner.ts";

const dirOrFile = Deno.args[0];

if (!dirOrFile) {
  showHelp();
  Deno.exit(0);
}

runTests(dirOrFile);
