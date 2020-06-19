import { asserts } from "../../deps.ts";

/**
 * To be clear, we are making sure that when a user runs their tests using Rhum, that everything works correctly,
 * and the output is correct
 */

Deno.test({
  name:
    "Integration | basic_test.ts | Tests correctly pass and display the correct output",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: [
        "deno cache example_tests/basic/tests_pass.ts && deno test --allow-run example_tests/basic/tests_pass.ts",
      ],
      stdout: "piped",
      stderr: "piped",
      cwd: ".",
    });
    const status = await p.status();
    p.close();
    const stdout = new TextDecoder().decode(await p.output());
    const stderr = new TextDecoder().decode(await p.stderrOutput());
    asserts.assertEquals(status.success, true);
    asserts.assertEquals(status.code, 0);
    asserts.assertEquals(stderr, "TODO");
    asserts.assertEquals(stdout, "TODO");
  },
});

Deno.test({
  name:
    "Integration | basic_test.ts | Tests correctly fail and display the correct output",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: ["deno", "test", "--allow-run", "example_tests/basic/tests_fail.ts"],
      stdout: "piped",
      stderr: "piped",
    });
    const status = await p.status();
    p.close();
    const stdout = new TextDecoder().decode(await p.output());
    const stderr = new TextDecoder().decode(await p.stderrOutput());
    asserts.assertEquals(status.success, false);
    asserts.assertEquals(status.code, 1);
    asserts.assertEquals(stderr, "");
    asserts.assertEquals(stdout, "");
  },
});
