import { assertions, asserts } from "./src/rhum_asserts.ts";
import type {
  ITestCase,
  ITestPlan,
  ITestPlanResults,
} from "./src/interfaces.ts";
import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";
import { green, red, yellow } from "https://deno.land/std@0.74.0/fmt/colors.ts";

export const version = "v1.1.4";

const encoder = new TextEncoder();

export type { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";

/**
 * This testing framework allows the following syntax:
 *
 *     import { Rhum } from "/path/to/rhum/mod.ts";
 *
 *     Rhum.testPlan(() => {
*        Rhum.testSuite("test_suite_1a", () => {
*          Rhum.testCase("test_case_1a1", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*          Rhum.testCase("test_case_1a2", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*          Rhum.testCase("test_case_1a3", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*        });
*        Rhum.testSuite("test_suite_1b", () => {
*          Rhum.testCase("test_case_1b1", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*          Rhum.testCase("test_case_1b2", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*          Rhum.testCase("test_case_1b3", () => {
*            Rhum.asserts.assertEquals(true, true);
*          });
*        });
 *     });
 */
export class RhumRunner {
  /**
   * The asserts module from Deno Standard Module's testing module, but attached
   * to Rhum for accessibility.
   *
   *     Rhum.asserts.assertEquals(true, true); // pass
   *     Rhum.asserts.assertEquals(true, false); // fail
   */
  // Reason for this is ignore: deno lint no longer allows `Function` and
  // instead needs us to be explicit: `() => void`, but  because  we couldn't
  // use that to type the properties (we would just be copying Deno's interfaces
  // word for word), we have to deal with `Function
  // deno-lint-ignore ban-types
  public asserts: { [key in assertions]: Function } = asserts;

  /**
   * A property to hold the currently running test suite.
   */
  protected current_test_suite = "";

  /**
   * A property to hold how many test cases are in a test suite. We use this
   * data to keep track of how many test cases have been set up in a test suite.
   */
  protected current_test_suite_num_test_cases = 0;

  /**
   * A property to hold the test plan which contains the test suites and test
   * cases as well as any hooks that need to be executed in each.
   */
  protected test_plan: ITestPlan = {
    suites: {},
    skip: false,
    name: "",
  };

  /**
   * A property to hold the output results of the test plan.
   */
  protected test_plan_results: ITestPlanResults = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: "",
  };

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Add a test suite to the test plan.
   *
   * @param suiteName - The name of the test suite.
   * @param skip - Are we skipping this test suite?
   * @param testCases - The callback function containing the test cases that
   * will be executed.
   */
  public addTestSuiteToTestPlan(
    suiteName: string,
    skip: boolean,
    testCases: () => void,
  ): void {
    // Set the name of the currently running test suite so that other methods
    // know what test suite is running
    this.setCurrentTestSuite(suiteName);

    // If the test suite and its test cases are not yet tracked in the plan
    // object, then add the required data so we can track the test suite and its
    // test cases. We use this data when we call runTestPlan().
    if (!this.test_plan.suites[suiteName]) {
      this.test_plan.suites[suiteName] = {
        cases: [],
        skip: skip,
      };
    }

    // Count how many test cases are in this test suite. We use this data in
    // .skip() to make sure we don't accidentally execute test case .skip()
    // logic on a test suite. We want to make sure we execute test suite .skip()
    // logic on a test suite.
    const matches = testCases.toString().match(/Rhum\.(skip|testCase)/g);
    if (matches && matches.length) {
      this.setCurrentTestSuiteNumTestCases(matches.length);
    }
  }

  /**
   * Used to define a hook that will execute after all test suites or test
   * cases. If this is used inside of a test plan, then it will execute after
   * all test suites. If this is used inside of a test suite, then it will
   * execute after all test cases.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, after all test suites or cases.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.afterAll(() => {
   *         // Runs once after all test suites in this test plan
   *       });
   *       Rhum.testSuite("My Suite 1", () => {
   *         Rhum.afterAll(() => {
   *           // Runs once after all test cases in this test suite
   *         });
   *         Rhum.testCase("My Test Case 1", () => {
   *           ...
   *         });
   *       });
   *     });
   */
  public afterAll(cb: () => void): void {
    // Check if the hook is for test cases inside of a suite
    if (this.getCurrentTestSuite() != "") {
      // is a before all inside a suite for every test case
      this.test_plan.suites[this.getCurrentTestSuite()].after_all_cases_hook =
        cb;
    } else if (this.getCurrentTestSuite() == "") {
      // before all hooks for the suites
      this.test_plan.after_all_suites_hook = cb;
    }
  }

  /**
   * Used to define a hook that will execute after each test suite or test case.
   * If this is used inside of a test plan, then it will execute after each test
   * suite. If this is used inside of a test suite, then it will execute after
   * each test case.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, after each test suite or case.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.afterEach(() => {
   *         // Runs after each test suite in this test plan
   *       });
   *       Rhum.testSuite("My Suite 1", () => {
   *         Rhum.afterEach(() => {
   *           // Runs after each test case in this test suite
   *         });
   *         Rhum.testCase("My Test Case 1", () => {
   *           ...
   *         });
   *       });
   *     });
   */
  public afterEach(cb: () => void): void {
    // Check if the hook is for test cases inside of a suite
    if (this.getCurrentTestSuite() != "") {
      // is a after each inside a suite for every test case
      this.test_plan.suites![this.getCurrentTestSuite()].after_each_case_hook =
        cb;
    } else if (this.getCurrentTestSuite() == "") {
      // after each hooks for the suites
      this.test_plan.after_each_suite_hook = cb;
    }
  }

  /**
   * Used to define a hook that will execute before all test suites or test
   * cases. If this is used inside of a test plan, then it will execute before
   * all test suites. If this is used inside of a test suite, then it will
   * execute before all test cases.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, before all test suites or cases.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.beforeAll(() => {
   *         // Runs once before all test suites in this test plan
   *       });
   *       Rhum.testSuite("My Suite 1", () => {
   *         Rhum.beforeAll(() => {
   *           // Runs once before all test cases in this test suite
   *         });
   *         Rhum.testCase("My Test Case 1", () => {
   *           ...
   *         });
   *       });
   *     });
   */
  public beforeAll(cb: () => void): void {
    // Check if the hook is for test cases inside of a suite
    if (this.getCurrentTestSuite() != "") {
      // is a before all inside a suite for every test case
      this.test_plan.suites[this.getCurrentTestSuite()].before_all_cases_hook =
        cb;
    } else if (this.getCurrentTestSuite() == "") {
      // before all hooks for the suites
      this.test_plan.before_all_suites_hook = cb;
    }
  }

  /**
   * Used to define a hook that will execute before each test suite or test
   * case. If this is used inside of a test plan, then it will execute before
   * each test suite. If this is used inside of a test suite, then it will
   * execute before each test case.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, before each test suite or case.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.beforeEach(() => {
   *         // Runs before each test suite in this test plan
   *       });
   *       Rhum.testSuite("My Suite 1", () => {
   *         Rhum.beforeEach(() => {
   *           // Runs before each test case in this test suite
   *         });
   *         Rhum.testCase("My Test Case 1", () => {
   *           ...
   *         });
   *       });
   *     });
   */
  public beforeEach(cb: () => void): void {
    // Check if the hook is for test cases inside of a suite
    if (this.getCurrentTestSuite() != "") {
      // is a before each inside a suite for every test case
      this.test_plan.suites![this.getCurrentTestSuite()].before_each_case_hook =
        cb;
    } else if (this.getCurrentTestSuite() == "") {
      // before each hooks for the suites
      this.test_plan.before_each_suite_hook = cb;
    }
  }

  // public only(cb: Function): void {
  //   // Do something
  // }

  /**
   * Get the current test suite.
   *
   * @returns The current test suite.
   */
  public getCurrentTestSuite(): string {
    return this.current_test_suite;
  }

  /**
   * Get the current number of test cases in the current test suite.
   *
   * @returns The number of test cases in the current test suite.
   */
  public getCurrentTestSuiteNumTestCases(): number {
    return this.current_test_suite_num_test_cases;
  }

  /**
   * Get the current test plan.
   *
   * @returns The test plan.
   */
  public getTestPlan(): ITestPlan {
    return this.test_plan;
  }

  /**
   * Get the mock builder to mock classes.
   *
   * @param constructorFn - The constructor function of the object to mock.
   *
   * Returns an instance of the MockBuilder class.
   *
   *     class ToBeMocked { ... }
   *
   *     const mock = Rhum
   *       .mock(ToBeMocked)
   *       .withConstructorArgs("someArg") // if the class to be mocked has a constructor and it requires args
   *       .create();
   */
  public mock<T>(constructorFn: Constructor<T>): MockBuilder<T> {
    return new MockBuilder(constructorFn);
  }

  /**
   * Run the test plan.
   */
  public async runTestPlan(): Promise<void> {
    const filters = Deno.args;
    const filterTestCase = filters[0];
    const filterTestSuite = filters[1];

    if (filterTestCase != "undefined") {
      return await this.runCaseFiltered(filterTestCase);
    }

    if (filterTestSuite != "undefined") {
      return await this.runSuiteFiltered(filterTestSuite);
    }

    await this.runAllSuitesAndCases();
  }

  /**
   * Set the current test suite.
   *
   * @param val - The name of the test suite.
   */
  public setCurrentTestSuite(val: string): void {
    this.current_test_suite = val;
  }

  /**
   * Set the current test suites number of test cases.
   *
   * @param val - The number of test cases.
   */
  public setCurrentTestSuiteNumTestCases(val: number): void {
    this.current_test_suite_num_test_cases = val;
  }

  /**
   * Allows a test plan, suite, or case to be skipped when the tests run.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.skip("My Suite 1", () => { // will not run this block
   *         Rhum.testCase("My Test Case In Suite 1", () => {});
   *       });
   *       Rhum.testSuite("My Suite 2", () => {
   *         Rhum.testCase("My Test Case In Suite 2", () => {});
   *         Rhum.skip("My Other Test Case In Suite 2", () => {}); // will not run this block
   *       });
   *     });
   *
   *     Rhum.skip(() => { // will not run this block
   *       Rhum.testSuite("My SUite 1", () => {
   *         Rhum.testCase("My Test Case In Suite 1", () => {});
   *       });
   *     });
   */
  public skip(name: string | (() => void), cb: () => void = () => {}): void {
    // If the name is a function, then we know we're skipping an entire test
    // plan
    if (typeof name == "function") {
      // Execute the test plan's test suites, which is the `name` param
      this.skipTestPlan(name);
      return;
    }

    // If there is no current test suite, then we know we know this .skip() call
    // is attached to a test suite
    if (this.getCurrentTestSuite() == "") {
      this.skipTestSuite(name, cb);
      // Otherwise, if there is a current test suite, then we know this .skip()
      // call is attached to a test case
    } else {
      // If all of the test cases in a test suite have been set up, then this
      // .skip() call is for a test suite. Soooo recursion...
      if (this.getCurrentTestSuiteNumTestCases() <= 0) {
        this.setCurrentTestSuite("");
        this.skip(name, cb);
        return;
      }

      this.skipTestCase(name, cb);
    }
  }

  /**
   * Stub a member of an object.
   *
   * @param obj -The object containing the member to stub.
   * @param member -The member to stub.
   * @param value - The return value of the stubbed member.
   *
   * Returns the object in question as a Stubbed type. Being a Stubbed type
   * means it has access to a `.stub()` method for stubbing properties and
   * methods.
   *
   *     class MyObject {
   *       public some_property = "someValue";
   *     }
   *
   *     // Define the object that will have stubbed members as a stubbed object
   *     const myStubbedObject = Rhum.stub(new MyObject());
   *
   *     // Stub the object's some_property property to a certain value
   *     myStubbedObject.stub("some_property", "this property is now stubbed");
   *
   *     // Assert that the property was stubbed
   *     Rhum.asserts.assertEquals(
   *       myStubbedObject.some_property,
   *       "this property is now stubbed"
   *     );
   */
  public stub<T>(obj: T): Stubbed<T> {
    (obj as unknown as { [key: string]: boolean }).is_stubbed = true;
    (obj as unknown as {
      [key: string]: (property: string, value: unknown) => void;
    }).stub = function (
      property: string,
      value: unknown,
    ): void {
      Object.defineProperty(obj, property, {
        value: value,
      });
    };

    return obj as Stubbed<T>;
  }

  /**
   * A test case is grouped by a test suite and it is what makes the assertions
   * - it is the test. You can define multiple test cases under a test suite.
   * Test cases can also be asynchronous. Test cases can only be defined inside
   * of a test suite.
   *
   * @param name - The name of the test case.
   * @param testFn - The test to execute.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.testSuite("My Suite 1", () => {
   *         Rhum.testCase("My Test Case 1", () => {
   *           Rhum.assert.assertEquals(something, true);
   *         });
   *         Rhum.testCase("My Test Case 2", () => {
   *           Rhum.assert.assertEquals(something, false);
   *         });
   *       });
   *     });
   */
  public testCase(name: string, testFn: () => void): void {
    this.addTestCaseToTestSuite(
      name,
      testFn,
      this.test_plan.skip ||
        this.test_plan.suites[this.getCurrentTestSuite()].skip,
      this.getCurrentTestSuite(),
    );
  }

  /**
   * Groups up test suites to describe a test plan. Usually, a test plan is per
   * file and contains the tests suites and test cases for a single file. Test
   * plans are required in order to define a test suite with test cases.
   *
   * @param name - The name of the test plan.
   * @param testSuites - The test suites to execute.
   *
   *     Rhum.testPlan(() => {
   *       ...
   *     });
   */
  public async testPlan(testSuites: () => void): Promise<void> {
    this.test_plan.name = Deno.args[2];
    await testSuites();
    await this.runTestPlan();
  }

  /**
   * A test suite usually describes a method or property name and groups up all
   * test cases for that method or property. You can define multiple test suites
   * under a test plan. Test suites can only be defined inside of a test plan.
   *
   * @param name - The name of the test suite.
   * @param testCases - The callback function containing the test cases that
   * will be executed.
   *
   *     Rhum.testPlan(() => {
   *       Rhum.testSuite("My Suite 1", () => {
   *         ...
   *       });
   *       Rhum.testSuite("My Suite 2", () => {
   *         ...
   *       });
   *     });
   */
  public async testSuite(name: string, testCases: () => void): Promise<void> {
    this.addTestSuiteToTestPlan(
      name,
      this.test_plan.skip,
      testCases,
    );

    // Execute the test cases in this test suite
    await testCases();
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * Add a test case to a test suite.
   *
   * @param caseName - The name of the test case.
   * @param testFn - The test to execute.
   * @param skip - Are we skipping this test?
   * @param suiteName - The name of the test suite this test case belongs to.
   */
  protected addTestCaseToTestSuite(
    caseName: string,
    testFn: () => void,
    skip: boolean,
    suiteName: string,
  ): void {
    this.test_plan.suites[suiteName].cases.push({
      name: caseName,
      test_fn: testFn,
      skip: skip,
    });

    // Track that this case is ready to be executed
    const numTestCases = this.getCurrentTestSuiteNumTestCases();
    if (numTestCases > 0) {
      this.setCurrentTestSuiteNumTestCases(numTestCases - 1);
    }
  }

  /**
   * Run a test case.
   *
   * @param testCase - The test case object that contains the name of the test
   * and the test function to execute.
   * @param suiteName - The name of the test suite this test case belongs to.
   */
  public async runCase(testCase: ITestCase, suiteName: string): Promise<void> {
    // SKIP THAT SHIT
    if (testCase.skip) {
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + yellow("SKIP") + " " + testCase.name + "\n",
        ),
      );
      this.test_plan_results.skipped++;
      return;
    }

    // Execute .beforeEach() hook before each test case if it exists
    if (this.test_plan.suites[suiteName].before_each_case_hook) {
      await this.test_plan.suites[suiteName].before_each_case_hook!();
    }

    // Execute the test
    try {
      await testCase.test_fn();
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + green("PASS") + " " + testCase.name + "\n",
        ),
      );
      this.test_plan_results.passed++;
    } catch (error) {
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + red("FAIL") + " " + testCase.name + "\n",
        ),
      );
      this.test_plan_results.failed++;
      let stack = error.stack.match(/test_fn.*/g);
      if (stack) {
        stack = stack[0].replace(/\(|\)/g, "")
          .replace(/test_fn/g, "")
          .replace(Deno.cwd(), "")
          .replace("file:\/\/\/", "./");
        const errorMessage = `\n${error}\nThe above assertion error occurred in:\n\n  ${stack}\n\n`
        this.test_plan_results.errors += errorMessage;
      } else {
        this.test_plan_results.errors += ("\n" + error.stack + "\n");
      }
    }

    // Execute .afterEach() hook after each test case if it exists
    if (this.test_plan.suites[suiteName].after_each_case_hook) {
      await this.test_plan.suites[suiteName].after_each_case_hook!();
    }
  }

  /**
   * Run a test suite with the --filter-test-case option being specified.
   *
   * @param filterVal - The name specified as the filter's value.
   */
  public async runCaseFiltered(filterVal: string): Promise<void> {
    await this.runHooksBeforeSuites();

    for (const suiteName in this.test_plan.suites) {
      await this.runHooksBeforeSuitesAndCases(suiteName);
      await this.runSuite(suiteName, filterVal);
      await this.runHooksAfterSuitesAndCases(suiteName);
    }

    await this.runHooksAfterSuites();
    this.outputResults();
  }

  /**
   * Output the test plan's results. This data is used by the
   * /path/to/rhum/src/test_runner.ts.
   */
  protected outputResults(): void {
    Deno.stdout.writeSync(
      encoder.encode(JSON.stringify(this.test_plan_results)),
    );
  }

  /**
   * Run all test suites and test cases in the test plan.
   */
  public async runAllSuitesAndCases(): Promise<void> {
    await this.runHooksBeforeSuites();
    for (const suiteName in this.test_plan.suites) {
      await this.runSuite(suiteName);
    }
    await this.runHooksAfterSuites();
    this.outputResults();
  }

  /**
   * Run hooks after all test suites.
   */
  protected async runHooksAfterSuites(): Promise<void> {
    // Execute .afterAll() hook after all test suites
    if (this.test_plan.after_all_suites_hook) {
      await this.test_plan.after_all_suites_hook();
    }
  }

  /**
   * Run hooks after all test suites and test cases.
   */
  protected async runHooksAfterSuitesAndCases(
    suiteName: string,
  ): Promise<void> {
    // Execute .afterAll() hook after all test cases
    if (this.test_plan.suites[suiteName].after_all_cases_hook) {
      await this.test_plan.suites[suiteName].after_all_cases_hook!();
    }

    // Execute .afterEach() hook after each test suite if it exists
    if (this.test_plan.after_each_suite_hook) {
      await this.test_plan.after_each_suite_hook();
    }
  }

  /**
   * Run hooks before all test suites.
   */
  protected async runHooksBeforeSuites(): Promise<void> {
    // Execute .beforeAll() hook before all test suites
    if (this.test_plan.before_all_suites_hook) {
      await this.test_plan.before_all_suites_hook();
    }
  }

  /**
   * Run hooks before each test suite or before each test case.
   */
  protected async runHooksBeforeSuitesAndCases(
    suiteName: string,
  ): Promise<void> {
    // Execute .beforeEach() hook before each test suite if it exists
    if (this.test_plan.before_each_suite_hook) {
      await this.test_plan.before_each_suite_hook();
    }

    // Execute .beforeAll() hook before all test cases
    if (this.test_plan.suites[suiteName].before_all_cases_hook) {
      await this.test_plan.suites[suiteName].before_all_cases_hook!();
    }
  }

  /**
   * Run a test suite.
   *
   * @param suiteName - The name of the suite.
   * @param filterValTestCase - (optional) Are we filtering out a test case?
   */
  public async runSuite(
    suiteName: string,
    filterValTestCase?: string,
  ): Promise<void> {
    if (!filterValTestCase || filterValTestCase == "undefined") {
      Deno.stdout.writeSync(encoder.encode("    " + suiteName + "\n"));
    }

    await this.runHooksBeforeSuitesAndCases(suiteName);

    for (const testCase of this.test_plan.suites[suiteName].cases) {
      if (filterValTestCase) {
        if (testCase.name != filterValTestCase) {
          continue;
        }
        Deno.stdout.writeSync(encoder.encode("    " + suiteName + "\n"));
      }
      await this.runCase(testCase, suiteName);
    }

    await this.runHooksAfterSuitesAndCases(suiteName);
  }

  /**
   * Run a test suite with the --filter-test-suite option being specified.
   *
   * @param filterVal - The name specified as the filter's value.
   */
  public async runSuiteFiltered(filterVal: string): Promise<void> {
    await this.runHooksBeforeSuites();

    for (const suiteName in this.test_plan.suites) {
      if (suiteName == filterVal) {
        await this.runSuite(suiteName);
      }
    }

    await this.runHooksAfterSuites();
    this.outputResults();
  }

  /**
   * Skip a test case.
   *
   * @param name - The name of the test case.
   * @param testFn - The test to execute.
   */
  protected skipTestCase(
    name: string,
    testFn: () => void,
  ): void {
    this.addTestCaseToTestSuite(name, testFn, true, this.getCurrentTestSuite());
  }

  protected async skipTestPlan(testSuites: () => void): Promise<void> {
    this.test_plan.skip = true;
    await testSuites();
    await this.runTestPlan();
  }

  /**
   * Skip a test suite.
   *
   * @param name - The name of the test suite.
   * @param testCases - The callback function containing the test cases that
   * will be executed.
   */
  protected async skipTestSuite(
    name: string,
    testCases: () => void,
  ): Promise<void> {
    this.addTestSuiteToTestPlan(name, true, testCases);

    // Execute the test cases in this test suite
    await testCases();
  }
}

/**
 * An instance of the RhumRunner.
 *
 *     const Rhum = new RhumRunner();
 */
export const Rhum = new RhumRunner();
