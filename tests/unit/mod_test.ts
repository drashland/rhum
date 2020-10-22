import { Rhum } from "../../mod.ts";
const decoder = new TextDecoder();
import { colors } from "../../deps.ts";

Rhum.testPlan(() => {
  Rhum.testSuite("addTestSuiteToTestPlan", () => {
    Rhum.testCase("plan.suites['myRandomTestSuite'] is set", () => {
      Rhum.addTestSuiteToTestPlan("myRandomTestSuite", false, () => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["myRandomTestSuite"],
        "object",
      );
      Rhum.asserts.assertEquals(
        Rhum.getTestPlan().suites["myRandomTestSuite"].skip,
        false,
      );
    });
  });

  Rhum.testSuite("beforeAll", () => {
    Rhum.testCase("before_all_suites_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.beforeAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().before_all_suites_hook,
        "function",
      );
    });

    Rhum.testCase("before_all_cases_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.beforeAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .before_all_cases_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("beforeEach", () => {
    Rhum.testCase("before_each_suite_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.beforeEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
      const plan = Rhum.getTestPlan();
      Rhum.asserts.assertEquals(
        typeof plan.before_each_suite_hook,
        "function",
      );
    });

    Rhum.testCase("before_each_case_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.addTestSuiteToTestPlan("some test suite", false, () => {});
      Rhum.beforeEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "some test suite");
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .before_each_case_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("afterEach", () => {
    Rhum.testCase("after_each_suite_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.afterEach(() => {});
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().after_each_suite_hook,
        "function",
      );
    });

    Rhum.testCase("after_each_case_hook is set", () => {
      Rhum.setCurrentTestSuite("some test test");
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.afterEach(() => {});
      Rhum.asserts.assertEquals(
        Rhum.getCurrentTestSuite(),
        "some test suite",
      );
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .after_each_case_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("afterAll", () => {
    Rhum.testCase("after_all_suites_hook is set", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.afterAll(() => {});
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().after_all_suites_hook,
        "function",
      );
    });

    Rhum.testCase("after_all_cases_hook is set", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.afterAll(() => {});
      Rhum.addTestSuiteToTestPlan(
        "some test suite",
        false,
        () => {},
      );
      Rhum.asserts.assertEquals(
        typeof Rhum.getTestPlan().suites["some test suite"]
          .after_all_cases_hook,
        "function",
      );
    });
  });

  Rhum.testSuite("getCurrentTestSuite", () => {
    Rhum.testCase("current_test_suite is set to ''", () => {
      Rhum.setCurrentTestSuite("");
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "");
    });
    Rhum.testCase("current_test_suite is set to 'some test suite'", () => {
      Rhum.setCurrentTestSuite("some test suite");
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuite(), "some test suite");
    });
  });

  Rhum.testSuite("getCurrentTestSuiteNumTestCases", () => {
    Rhum.testCase("current_test_suite_num_test_cases defaults to 0", () => {
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuiteNumTestCases(), 0);
    });
    Rhum.testCase("current_test_suite_num_test_cases defaults to 0", () => {
      Rhum.setCurrentTestSuiteNumTestCases(1);
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuiteNumTestCases(), 1);
    });
  });

  Rhum.testSuite("getTestPlan", () => {
    Rhum.testCase("test_plan is set", () => {
      Rhum.asserts.assertEquals(
        Object.keys(Rhum.getTestPlan())[0],
        "suites",
      );
    });
  });

  Rhum.testSuite("setCurrentTestSuite", () => {
    Rhum.testCase("current_test_suite is set to 'yo them shits stank'", () => {
      Rhum.setCurrentTestSuite("yo them shits stank");
      Rhum.asserts.assertEquals(
        Rhum.getCurrentTestSuite(),
        "yo them shits stank",
      );
    });
  });

  Rhum.testSuite("setCurrentTestSuiteNumTestCases", () => {
    Rhum.testCase("current_test_suite_num_test_cases is set to 1337", () => {
      Rhum.setCurrentTestSuiteNumTestCases(1337);
      Rhum.asserts.assertEquals(Rhum.getCurrentTestSuiteNumTestCases(), 1337);
    });
  });

  Rhum.testSuite("skip", () => {
    Rhum.testCase("can skip a test plan", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          "tests/integration/skip_test_plan_test.ts",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_skipTestPlan,
      );
    });

    Rhum.testCase("can skip a test suite", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          "tests/integration/skip_test_suite_test.ts",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_skipTestSuite,
      );
    });

    Rhum.testCase("can skip a test case", async () => {
      const p = Deno.run({
        cmd: [
          "rhum",
          "test",
          "tests/integration/skip_test_case_test.ts",
        ],
        stdout: "piped",
      });
      const stdout = decoder.decode(await p.output());
      Rhum.asserts.assertEquals(
        stdout,
        data_skipTestCase,
      );
    });
  });

  Rhum.testSuite("stub", () => {
    Rhum.testCase("can stub an object", () => {
      class MyObj {
        public hello() {
          return false;
        }
      }
      const stubbed = Rhum.stub(new MyObj());
      Rhum.asserts.assertEquals(
        stubbed.is_stubbed,
        true,
      );
      Rhum.asserts.assertEquals(
        stubbed.hello(),
        false,
      );
      stubbed.stub("hello", () => {
        return true;
      });
      Rhum.asserts.assertEquals(
        stubbed.hello(),
        true,
      );
    });
  });

  Rhum.testSuite("mock", () => {
    Rhum.testCase("can mock an object", () => {
      class MyObj {}
      const mock = Rhum.mock(MyObj)
        .create();
      Rhum.asserts.assertEquals(
        mock.is_mock,
        true,
      );
    });

    Rhum.testCase("can mock an object with constructor args", () => {
      class MyObj {
        public arg_1 = "some value";
        constructor(arg1: string) {
          this.arg_1 = arg1;
        }
      }
      const mock = Rhum.mock(MyObj)
        .withConstructorArgs("some new value")
        .create();
      Rhum.asserts.assertEquals(
        mock.is_mock,
        true,
      );
      Rhum.asserts.assertEquals(
        mock.arg_1,
        "some new value",
      );
    });
  });

  Rhum.testSuite("testCase", () => {
    Rhum.testCase("adds a test case to a test suite", () => {
      const cases = Rhum.getTestPlan().suites["testCase"].cases.length;
      Rhum.asserts.assertEquals(
        cases,
        1,
      );
    });
  });

  Rhum.testSuite("testPlan", () => {
    Rhum.testCase("sets the test_plan by name", () => {
      Rhum.asserts.assertEquals(
        Rhum.getTestPlan().name,
        // The test plan name is the name of the test file being tested. In this
        // case, its this file.
        "tests/unit/mod_test.ts",
      );
    });
  });

  Rhum.testSuite("testSuite", () => {
    Rhum.testCase("adds a test suite to the test plan", () => {
      Rhum.asserts.assert(
        Rhum.getTestPlan().suites["testSuite"],
      );
    });
  });
});

////////////////////////////////////////////////////////////////////////////////
// DATA PROVIDERS //////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const data_skipTestPlan = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)


tests/integration/skip_test_plan_test.ts
    testSuite skipped 1
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 2
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 3
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 4
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 5
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 6
        ${colors.yellow("SKIP")} skipped
    testSuite skipped 7
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped


Test Results: ${colors.green("0")} passed; ${colors.red("0")} failed; ${
  colors.yellow("15")
} skipped
`;

const data_skipTestSuite = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)


tests/integration/skip_test_suite_test.ts
    skipped
        ${colors.yellow("SKIP")} skipped
        ${colors.yellow("SKIP")} skipped


Test Results: ${colors.green("0")} passed; ${colors.red("0")} failed; ${
  colors.yellow("2")
} skipped
`;

const data_skipTestCase = `
${colors.blue("INFO")} Starting Rhum
${colors.blue("INFO")} Checking test file(s)
${colors.blue("INFO")} Running test(s)


tests/integration/skip_test_case_test.ts
    testSuite
        ${colors.yellow("SKIP")} skipped
        ${colors.green("PASS")} testCase


Test Results: ${colors.green("1")} passed; ${colors.red("0")} failed; ${
  colors.yellow("1")
} skipped
`;
