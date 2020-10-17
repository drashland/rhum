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

for (const entry of walkSync("./tests", { includeDirs: false })) {
  if (
    entry.path.includes("mock_builder_test")
    || entry.path.includes("basic_test")
  ) {
    continue;
  }
  tests.push(entry.path);
}

console.log("\nRunning tests ...");

for await (const path of tests) {
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
  const results = JSON.parse(stdout);
  plans[path] = results;
}

let suites: any = {};
for (const planName in plans) {
  console.log("\n" + planName);
  const results = plans[planName];
  for (const result of results) {
    if (!suites.hasOwnProperty(result.suite)) {
      suites[result.suite] = result;
    }
  }

  for (const suiteName in suites) {
    console.log("    " + suiteName);
    const testCase = suites[suiteName];
    if (testCase.pass) {
      stats.passed++;
      console.log("        " + green(testCase.name));
    } else {
      stats.failed++;
      console.log("        " + red(testCase.name));
      stats.errors += testCase.error;
    }
  }
}

console.log();
console.log(stats.errors);

console.log(`\nTest Results: ${green(stats.passed.toString())} passed; ${red(stats.failed.toString())} failed; ${yellow(stats.skipped.toString())} skipped`);
