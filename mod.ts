import { assertions, asserts } from "./src/rhum_asserts.ts";
import type { ICase, IPlan, IStats } from "./src/interfaces.ts";
import type { Constructor, Stubbed } from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";
import { green, red, yellow } from "https://deno.land/std@0.74.0/fmt/colors.ts";

export const version = "v1.1.4";

const encoder = new TextEncoder();

const skipped: string[] = [];

const stats: IStats = {
  passed: 0,
  failed: 0,
  skipped: 0,
  errors: "",
};

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
   * The asserts module from https://deno.land/std/testing, but attached to Rhum
   * for accessibility.
   *
   *     Rhum.asserts.assertEquals(true, true); // pass
   *     Rhum.asserts.assertEquals(true, false); // fail
   */
  // deno-lint-ignore ban-types Reason for this is, deno lint no longer allows `Function` and instead needs us to be explicit: `() => void`, but  because  we couldn't use that to  type the properties (we would just be copying Deno's interfaces word for word), we have to deal with `Function
  public asserts: { [key in assertions]: Function } = asserts;

  protected plan: IPlan = {
    suites: {},
  };

  protected current_test_suite = "";
  protected skip_current_test_suite = true;

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Used to define a hook that will execute before each test suite or test
   * case. If this is used inside of a test plan, then it will execute before
   * each test suite. If this is used inside of a test suite, then it will
   * execute before each test case.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, before each test suite or case.
   *
   *     Rhum.testPlan("My Plan", () => {
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
    if (this.current_test_suite != "") {
      // is a before each inside a suite for every test case
      this.plan.suites![this.current_test_suite].before_each_case_hook = cb;
    } else if (this.current_test_suite == "") {
      // before each hooks for the suites
      this.plan.before_each_suite_hook = cb;
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
   *     Rhum.testPlan("My Plan", () => {
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
    if (this.current_test_suite != "") {
      // is a after each inside a suite for every test case
      this.plan.suites![this.current_test_suite].after_each_case_hook = cb;
    } else if (this.current_test_suite == "") {
      // after each hooks for the suites
      this.plan.after_each_suite_hook = cb;
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
   *     Rhum.testPlan("My Plan", () => {
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
    if (this.current_test_suite != "") {
      // is a before all inside a suite for every test case
      this.plan.suites[this.current_test_suite].after_all_cases_hook = cb;
    } else if (this.current_test_suite == "") {
      // before all hooks for the suites
      this.plan.after_all_suites_hook = cb;
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
   *     Rhum.testPlan("My Plan", () => {
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
    if (this.current_test_suite != "") {
      // is a before all inside a suite for every test case
      this.plan.suites[this.current_test_suite].before_all_cases_hook = cb;
    } else if (this.current_test_suite == "") {
      // before all hooks for the suites
      this.plan.before_all_suites_hook = cb;
    }
  }

  // public only(cb: Function): void {
  //   // Do something
  // }

  /**
   * Allows a test plan, suite, or case to be skipped when the tests run.
   *
   *     Rhum.testPlan("My Plan", () => {
   *       Rhum.skip("My Suite 1", () => { // will not run this block
   *         Rhum.testCase("My Test Case In Suite 1", () => {
   *           ...
   *         });
   *       });
   *       Rhum.testSuite("My Suite 2", () => {
   *         Rhum.testCase("My Test Case In Suite 2", () => {
   *           ...
   *         });
   *         Rhum.skip("My Other Test Case In Suite 2", () => { // will not run this block
   *           ...
   *         });
   *       });
   *     });
   */
  public skip(name: string, cb: () => void): void {
    if (this.current_test_suite == "") {
      this.skip_current_test_suite = true;
      this.current_test_suite = name;
      this.plan.suites[name] = {
        cases: [],
      };

      cb();
    } else {
      this.plan.suites[this.current_test_suite].cases.push({
        name,
        test_fn: cb,
        skip: true,
      });
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
   *     const myStubbedObject = Rhum.stubbed(new MyObject());
   *
   *     // Stub the object's some_property property to a certain value
   *     myStubbedObject.stub("some_property", "this property is now stubbed");
   *
   *     // Assert that the property was stubbed
   *     Rhum.asserts.assertEquals(myStubbedObject.some_property, "this property is now stubbed");
   */
  public stubbed<T>(obj: T): Stubbed<T> {
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
   * A test case is grouped by a test suite and it is what makes the assertions
   * - it is the test. You can define multiple test cases under a test suite.
   * Test cases can also be asynchronous. Test cases can only be defined inside
   * of a test suite.
   *
   * @param name - The name of the test case.
   * @param testFn - The test to execute.
   *
   *     Rhum.testPlan("My Plan", () => {
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
    if (this.skip_current_test_suite) {
      this.plan.suites[this.current_test_suite].cases.push({
        name,
        test_fn: testFn,
        skip: true,
      });
    } else {
      this.plan.suites[this.current_test_suite].cases.push({
        name,
        test_fn: testFn,
        skip: false,
      });
    }
  }

  /**
   * Groups up test suites to describe a test plan. Usually, a test plan is per
   * file and contains the tests suites and test cases for a single file. Test
   * plans are required in order to define a test suite with test cases.
   *
   * @param name - The name of the test plan.
   * @param testSuites - The test suites to execute.
   *
   *     Rhum.testPlan("My Plan", () => {
   *       ...
   *     });
   */
  public async testPlan(testSuites: () => void): Promise<void> {
    await testSuites();
    await this.runTestPlan();
  }

  /**
   * A test suite usually describes a method or property name and groups up all
   * test cases for that method or property. You can define multiple test suites
   * under a test plan. Test suites can only be defined inside of a test plan.
   *
   * @param name - The name of the test suite.
   * @param testCases - The test cases to execute.
   *
   *     Rhum.testPlan("My Plan", () => {
   *       Rhum.testSuite("My Suite 1", () => {
   *         ...
   *       });
   *       Rhum.testSuite("My Suite 2", () => {
   *         ...
   *       });
   *     });
   */
  public async testSuite(name: string, testCases: () => void): Promise<void> {
    this.skip_current_test_suite = false;
    this.current_test_suite = name;

    if (!this.plan.suites[name]) {
      this.plan.suites[name] = {
        cases: [],
      };
    }

    await testCases();

    this.current_test_suite = "";
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
   * Run all test suites and test cases in the test plan.
   */
  public async runAllSuitesAndCases(): Promise<void> {
    await this.runHooksBeforeSuites();
    for (const suiteName in this.plan.suites) {
      await this.runSuite(suiteName);
    }
    await this.runHooksAfterSuites();
    this.sendStats();
  }

  /**
   * Run a test case.
   *
   * @param testCase - The test case object that contains the name of the test
   * and the test function to execute.
   * @param suiteName - The name of the test suite this test case belongs to.
   */
  public async runCase(testCase: ICase, suiteName: string): Promise<void> {
    if (testCase.skip) {
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + yellow("SKIP") + " " + testCase.name + "\n",
        ),
      );
      stats.skipped++;
      return;
    }

    // Execute .beforeEach() hook before each test case if it exists
    if (this.plan.suites[suiteName].before_each_case_hook) {
      await this.plan.suites[suiteName].before_each_case_hook!();
    }

    // Execute the test
    try {
      await testCase.test_fn();
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + green("PASS") + " " + testCase.name + "\n",
        ),
      );
      stats.passed++;
    } catch (error) {
      Deno.stdout.writeSync(
        encoder.encode(
          "        " + red("FAIL") + " " + testCase.name + "\n",
        ),
      );
      stats.failed++;
      stats.errors += ("\n" + error.stack + "\n");
    }

    // Execute .afterEach() hook after each test case if it exists
    if (this.plan.suites[suiteName].after_each_case_hook) {
      await this.plan.suites[suiteName].after_each_case_hook!();
    }
  }

  /**
   * Run a test suite with the --filter-test-case option being specified.
   *
   * @param filterVal - The name specified as the filter's value.
   */
  public async runCaseFiltered(filterVal: string): Promise<void> {
    await this.runHooksBeforeSuites();

    for (const suiteName in this.plan.suites) {
      await this.runHooksBeforeSuitesAndCases(suiteName);
      await this.runSuite(suiteName, filterVal);
      await this.runHooksAfterSuitesAndCases(suiteName);
    }

    await this.runHooksAfterSuites();
    this.sendStats();
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

    for (const testCase of this.plan.suites[suiteName].cases) {
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

    for (const suiteName in this.plan.suites) {
      if (suiteName == filterVal) {
        await this.runSuite(suiteName);
      }
    }

    await this.runHooksAfterSuites();
    this.sendStats();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  protected async runHooksAfterSuites(): Promise<void> {
    // Execute .afterAll() hook after all test suites
    if (this.plan.after_all_suites_hook) {
      await this.plan.after_all_suites_hook();
    }
  }

  protected async runHooksAfterSuitesAndCases(
    suiteName: string,
  ): Promise<void> {
    // Execute .afterAll() hook after all test cases
    if (this.plan.suites[suiteName].after_all_cases_hook) {
      await this.plan.suites[suiteName].after_all_cases_hook!();
    }

    // Execute .afterEach() hook after each test suite if it exists
    if (this.plan.after_each_suite_hook) {
      await this.plan.after_each_suite_hook();
    }
  }

  protected async runHooksBeforeSuites(): Promise<void> {
    // Execute .beforeAll() hook before all test suites
    if (this.plan.before_all_suites_hook) {
      await this.plan.before_all_suites_hook();
    }
  }

  protected async runHooksBeforeSuitesAndCases(
    suiteName: string,
  ): Promise<void> {
    // Execute .beforeEach() hook before each test suite if it exists
    if (this.plan.before_each_suite_hook) {
      await this.plan.before_each_suite_hook();
    }

    // Execute .beforeAll() hook before all test cases
    if (this.plan.suites[suiteName].before_all_cases_hook) {
      await this.plan.suites[suiteName].before_all_cases_hook!();
    }
  }

  protected sendStats(): void {
    Deno.stdout.writeSync(encoder.encode(JSON.stringify(stats)));
  }
}

/**
 * An instance of the RhumRunner.
 *
 *     const Rhum = new RhumRunner();
 */
export const Rhum = new RhumRunner();
