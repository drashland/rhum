import { walkSync } from "https://deno.land/std@0.74.0/fs/walk.ts";
import { green, red, yellow } from "https://deno.land/std@0.74.0/fmt/colors.ts";
const decoder = new TextDecoder();

let stats: {
  passed: number,
  failed: number,
  skipped: number,
  errors: string
} = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: "",
};

let tests = [];

let plans: {
  [key: string]: {name: string, pass: boolean, suite: string}[]
} = {};

console.log("\nStarting Rhum ...");

console.log("\nGathering test files ...");

const dirOrFile = Deno.args[0];

if (!dirOrFile.includes(".ts")) {
  for (const entry of walkSync(dirOrFile, { includeDirs: false })) {
    if (
      entry.path.includes("mock_builder_test")
      || entry.path.includes("basic_test")
    ) {
      continue;
    }
    tests.push(entry.path);
  }
} else {
  tests.push(dirOrFile);
}

console.log("\nRunning tests ...\n");

let errors: string = "";

for await (const path of tests) {
  console.log(path);
  const p = Deno.run({
    cmd: [
      "deno",
      "run",
      "-A",
      Deno.realPathSync("./" + path)
    ],
    stdout: "piped",
    stderr: "piped",
  });
  const stdout = decoder.decode(await p.output());
  const stderr = decoder.decode(await p.stderrOutput());
  if (stderr) {
    errors += stderr + "\n";
  }
  const statsString = new RegExp(/\{\"passed.*/, "g");

  console.log(stdout.replace(statsString, ""));

  const testPlanResults = JSON.parse(stdout.match(statsString)![0]);
  stats.passed += testPlanResults.passed;
  stats.failed += testPlanResults.failed;
  stats.skipped += testPlanResults.skipped;
  stats.errors += testPlanResults.errors;
}

// Output the errors

console.log(stats.errors);

// Output the overall results

console.log(`\nTest Results: ${green(stats.passed.toString())} passed; ${red(stats.failed.toString())} failed; ${yellow(stats.skipped.toString())} skipped`);
