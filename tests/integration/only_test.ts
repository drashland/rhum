import { StdAsserts as asserts, colors } from "../../deps.ts";
import {Rhum} from "../../mod.ts";

/**
 * To be clear, we are making sure that when a user runs their tests using Bourbon, that everything works correctly,
 * and the output is correct
 */

Deno.test({
  name: "Integration | only_test.ts | Only runs the test case that has `Rhum.only`",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: [
        "deno",
        "test",
        "--allow-run",
        "--allow-env",
        "example_tests/only/only_case.ts",
      ],
      stdout: "piped",
      stderr: "piped",
      env: {"NO_COLOR": "false"},
    });
    const status = await p.status();
    p.close();
    console.log(new TextDecoder().decode(await p.stderrOutput()))
    asserts.assertEquals(status.success, true);
    asserts.assertEquals(status.code, 0);
    /**
     * Because the timing for each test is dynamic, we can't really test it ("... ok (3ms)"), so strip all that out
     */
    let stdout = new TextDecoder("utf-8")
        .decode(await p.output())
        .replace(/\(\d+ms\)/g, ""); // (*ms)
    /**
     * There are also some odd empty lines at the end of the stdout... so we just strip those out
     */
    stdout = stdout.substring(0, stdout.indexOf("filtered out") + 12);

    Rhum.asserts.assertEquals(stdout,
        "running 1 tests\n" +
        "                       \n" +
        "test_plan_1\n" +
        "    test_suite_1b\n" +
        "        test_case_1b2 ... ok \n" +
        "\n" +
        "test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out "
    )
  }
})

Deno.test({
  name: "Integration | only_test.ts | Only runs the test suite that has `Rhum.only`",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: [
        "deno",
        "test",
        "--allow-run",
        "--allow-env",
        "example_tests/only/only_suite.ts",
      ],
      stdout: "piped",
      stderr: "piped",
      env: {"NO_COLOR": "false"},
    });
    const status = await p.status();
    p.close();
    asserts.assertEquals(status.success, true);
    asserts.assertEquals(status.code, 0);
    /**
     * Because the timing for each test is dynamic, we can't really test it ("... ok (3ms)"), so strip all that out
     */
    let stdout = new TextDecoder("utf-8")
        .decode(await p.output())
        .replace(/\(\d+ms\)/g, ""); // (*ms)
    /**
     * There are also some odd empty lines at the end of the stdout... so we just strip those out
     */
    stdout = stdout.substring(0, stdout.indexOf("filtered out") + 12);

    Rhum.asserts.assertEquals(stdout,
        "running 1 tests\n" +
        "                       \n" +
        "test_plan_1\n" +
        "    test_suite_1b\n" +
        "        test_case_1b1 ... ok \n" +
        "        test_case_1b2 ... ok \n" +
        "        test_case_1b2 ... ok \n" +
        "\n" +
        "test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out "
    )
  }
})
