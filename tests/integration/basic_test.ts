import { asserts } from "../../deps.ts"

/**
 * To be clear, we are making sure that when a user runs their tests using Bourbon, that everything works correctly,
 * and the output is correct
 */

Deno.test({
  name: "Integration | basic_test.ts | Tests correctly pass and display the correct output",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: ["deno", "test", "--allow-run", "example_tests/basic/tests_pass.ts"],
      stdout: "piped",
      stderr: "piped",
    })
    const status = await p.status();
    p.close()
    const stdout = new TextDecoder("utf-8").decode(await p.output())
    const stderr = new TextDecoder().decode(await p.stderrOutput())
    asserts.assertEquals(status.success, true)
    asserts.assertEquals(status.code, 0)
    /**
     * Due to the nature of this testing (running tests that run tests), the stderr is showing "Compiling .../.deno.ts.ts" -
     * there doesn't seem be a way around it (yet), so what we are doing is just asserting it only contains that line,
     * that way we can get these tests to work, and make sure no errors are thrown
     */
    const splitStderr = stderr.split("\n"); // ["compiling ...", ""]
    asserts.assertEquals(splitStderr.length, 2)
    asserts.assertEquals(splitStderr[1], "")
    /**
     * Because the timing each for test is dynamic, we can't really test it ("... ok (3ms)"), so strip all that out
     */
    const newStdout = stdout.replace(/\(\d+ms\)/g, "")
    asserts.assertEquals(newStdout,
        "running 22 tests\n" +
        "\ntest_plan_1" +
        "\n    test_suite_1a" +
        "\n        test_case_1a1 ... ok " +
        "\n        test_case_1a2 ... ok \n" +
        "        test_case_1a3 ... ok \n" +
        "    test_suite_1b\n" +
        "        test_case_1b1 ... ok \n" +
        "        test_case_1b2 ... ok \n" +
        "        test_case_1b3 ... ok \n" +
        "\n" +
        "test_plan_2\n" +
        "    test_suite_2a\n" +
        "        test_case_2a1 ... ok \n" +
        "        test_case_2a2 ... ok \n" +
        "        test_case_2a3 ... ok \n" +
        "    test_suite_2b\n" +
        "        test_case_2b1 ... ok \n" +
        "        test_case_2b2 ... ok \n" +
        "    test_suite_2c\n" +
        "        test_case_2c1 ... ok \n" +
        "        test_case_2c2 ... ok \n" +
        "        test_case_2c3 ... ok \n" +
        "    test_suite_2d\n" +
        "        test_case_2d1 ... ok \n" +
        "        test_case_2d2 ... ok \n" +
        "\n" +
        "test_plan_3\n" +
        "    test_suite_3a\n" +
        "        test_case_3a1 ... ok \n" +
        "        test_case_3a2 ... ok \n" +
        "    test_suite_3b\n" +
        "        test_case_3b1 ... ok \n" +
        "        test_case_3b2 ... ok \n" +
        "    test_suite_3c\n" +
        "        test_case_3c1 ... ok \n" +
        "        test_case_3c2 ... ok \n" +
        "test result: ok. 22 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out \n"
        )
  }
});

Deno.test({
  name: "Integration | basic_test.ts | Tests correctly fail and display the correct output",
  async fn(): Promise<void> {
    const p = await Deno.run({
      cmd: ["deno", "test", "--allow-run", "example_tests/basic/tests_fail.ts"],
      stdout: "piped",
      stderr: "piped"
    })
    const status = await p.status();
    p.close()
    const stdout = new TextDecoder().decode(await p.output())
    const stderr = new TextDecoder().decode(await p.stderrOutput())
    asserts.assertEquals(status.success, false)
    asserts.assertEquals(status.code, 1)
    /**
     * Due to the nature of this testing (running tests that run tests), the stderr is showing "Compiling .../.deno.ts.ts" -
     * there doesn't seem be a way around it (yet), so what we are doing is just asserting it only contains that line,
     * that way we can get these tests to work, and make sure no errors are thrown
     */
    const splitStderr = stderr.split("\n"); // ["compiling ...", ""]
    asserts.assertEquals(splitStderr.length, 2)
    asserts.assertEquals(splitStderr[1], "")
    // TODO(any) The same expectation as the above test but should account for failing
    asserts.assertEquals(stdout,
        ""
    )
  }
})