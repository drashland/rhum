import { asserts } from "./src/rhum_asserts.ts";
import { MockServerRequestFn } from "./src/mocks/server_request.ts";
import { TestCase } from "./src/test_case.ts";
import {
  ITestPlan,
  RhumMocks,
} from "./src/interfaces.ts";
import {
  Constructor,
  Stubbed,
} from "./src/types.ts";
import { MockBuilder } from "./src/mock_builder.ts";

/**
 * Deno's test runner outputs "test ", which has a length of 5. This module
 * erases the "test " string by backspacing the test plan line and test suite
 * line by that number. For safety, it substracts twice that number.  This is
 * how we get the number 10 here.
 */
const extraChars = 10;

/**
 * This testing framework allows the following syntax:
 *
 *     import { Rhum } from "/path/to/rhum/mod.ts";
 *     Rhum.testPlan("test_plan_1", () => {
 *       Rhum.testSuite("test_suite_1a", () => {
 *         Rhum.testCase("test_case_1a1", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *         Rhum.testCase("test_case_1a2", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *         Rhum.testCase("test_case_1a3", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *       });
 *       Rhum.testSuite("test_suite_1b", () => {
 *         Rhum.testCase("test_case_1b1", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *         Rhum.testCase("test_case_1b2", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *         Rhum.testCase("test_case_1b3", () => {
 *           Rhum.asserts.assertEquals(true, true);
 *         });
 *       });
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
  public asserts: asserts;

  public mocks: RhumMocks;

  protected passed_in_test_plan = "";

  protected passed_in_test_suite = "";

  protected test_plan_in_progress = "";

  protected test_suite_in_progress = "";

  protected plan: ITestPlan = { suites: {} };

  // FILE MARKER - METHODS - CONSTRUCTOR ///////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor() {
    this.asserts = asserts;
    this.mocks = { ServerRequest: MockServerRequestFn };
  }

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
   * Example:
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
  public beforeEach(cb: Function): void {
    // Check if the hook is for test cases inside of a suite
    if (this.passed_in_test_plan && this.passed_in_test_suite) {
      // is a before each inside a suite for every test case
      this.plan.suites![this.passed_in_test_suite].before_each_case_hook = cb;
    } else if (this.passed_in_test_plan && !this.passed_in_test_suite) {
      // before each hooks for the suites
      this.plan.before_each_suite_hook = cb;
    }
  }

  /**
   * Register an after each hook.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, after each test suite or case.
   */
  public afterEach(cb: Function): void {
    // Check if the hook is for test cases inside of a suite
    if (this.passed_in_test_plan && this.passed_in_test_suite) {
      // is a after each inside a suite for every test case
      this.plan.suites![this.passed_in_test_suite].after_each_case_hook = cb;
    } else if (this.passed_in_test_plan && !this.passed_in_test_suite) {
      // after each hooks for the suites
      this.plan.after_each_suite_hook = cb;
    }
  }

  /**
   * Register an after all hook.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, after all test suites or cases.
   *
   * @return void
   */
  public afterAll(cb: Function): void {
    // Check if the hook is for test cases inside of a suite
    if (this.passed_in_test_plan && this.passed_in_test_suite) {
      // is a before all inside a suite for every test case
      this.plan.suites![this.passed_in_test_suite].after_all_case_hook = cb;
    } else if (this.passed_in_test_plan && !this.passed_in_test_suite) {
      // before all hooks for the suites
      this.plan.after_all_suite_hook = cb;
    }
  }

  /**
   * Register an before all hook.
   *
   * @param cb - The callback to invoke. Would contain the required logic you
   * need to do what you want, before all test suites or cases.
   */
  public beforeAll(cb: Function): void {
    // Check if the hook is for test cases inside of a suite
    if (this.passed_in_test_plan && this.passed_in_test_suite) {
      // is a before all inside a suite for every test case
      this.plan.suites![this.passed_in_test_suite].before_all_case_hook = cb;
    } else if (this.passed_in_test_plan && !this.passed_in_test_suite) {
      // before all hooks for the suites
      this.plan.before_all_suite_hook = cb;
    }
  }

  public only(cb: Function): void {
    // Do something
  }

  // TODO(ebebbington|crookse) Maybe we could still call run, but pass in {
  // ignore: true } which the Deno.Test will use? just so it displays ignored in
  // the console
  /**
   * Skip a test plan, suite, or case.
   *
   */
  public skip(name: string, cb: Function): void {
    // Haaaaaa... you got skipped.
  }

  /**
   * Stub a member of an object.
   *
   * @param obj -The object containing the member to stub.
   * @param member -The member to stub.
   * @param value - The return value of the stubbed member.
   *
   * @returns this so that stub() calls can be chained.
   */
  public stubbed<T>(obj: T): Stubbed<T> {
    (obj as unknown as { [key: string]: boolean }).is_stubbed = true;
    (obj as unknown as { [key: string]: Function }).stub = function (
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
   * @returns MockBuilder
   */
  public mock<T>(constructorFn: Constructor<T>): MockBuilder<T> {
    return new MockBuilder(constructorFn);
  }

  /**
   * Define a test case and execute the test function.
   *
   * @param name - The name of the test case.
   * @param testFn - The test to execute.
   */
  public testCase(name: string, testFn: Function): void {
    this.plan.suites[this.passed_in_test_suite].cases!.push({
      name,
      new_name: this.formatTestCaseName(name),
      testFn,
    });
  }

  /**
   * Define a test plan and execute the test plan's test suites.
   *
   * @param name - The name of the test plan.
   * @param testSuites - The test suites to execute.
   */
  public testPlan(name: string, testSuites: Function): void {
    this.passed_in_test_suite = ""; // New plan
    this.passed_in_test_plan = name;
    testSuites();
  }

  /**
   * Define a test suite and execute the test suite's test cases.
   *
   * @param name - The name of the test suite.
   * @param testCases - The test cases to execute.
   */
  public testSuite(name: string, testCases: Function): void {
    this.passed_in_test_suite = name;
    this.plan.suites![name] = { cases: [] };
    testCases();
  }

  /**
   * Run the test plan.
   */
  public run(): void {
    const tc = new TestCase(this.plan);
    tc.run();
    this.deconstruct();
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * Figure out the name of the test case for output purposes.
   *
   * @param name - The name of the test case.
   *
   * @returns The new test name for outputting purposes.
   */
  protected formatTestCaseName(name: string): string {
    let newName: string;
    // (ebebbington) Unfortunately, due to the CI not correctly displaying output
    // (it is  all over the place and just  completely unreadable as
    // it doesn't play well with  our control characters), we need to
    // display the test output differently, based on if the tests are
    // being ran inside a CI or not. Nothing will change for the current
    // way of doing things, but if the tests are being ran inside a CI,
    // the format would be:
    //    test <plan> | <suite> | <case> ... ok (2ms)
    //    test <plan> | <suite> | <case> ... ok (2ms)
    // Even if plans and/or suites are the same. I believe this the best
    // way we can display the output
    if (Deno.env.get("CI") === "true") {
      newName =
        `${this.passed_in_test_plan} | ${this.passed_in_test_suite} | ${name}`;
      return newName;
    }
    if (this.test_plan_in_progress != this.passed_in_test_plan) {
      this.test_plan_in_progress = this.passed_in_test_plan;
      this.test_suite_in_progress = this.passed_in_test_suite;
      newName = `${"\u0008".repeat(name.length + extraChars)}` + // strip "test "
        `${" ".repeat(name.length + extraChars)}` +
        `\n${this.passed_in_test_plan}` +
        `\n    ${this.passed_in_test_suite}` +
        `\n        ${name} ... `;
    } else {
      if (this.test_suite_in_progress != this.passed_in_test_suite) {
        this.test_suite_in_progress = this.passed_in_test_suite;
        newName = `${"\u0008".repeat(name.length + extraChars)}` +
          `    ${this.passed_in_test_suite}` +
          `${" ".repeat(name.length + extraChars)}` +
          `\n        ${name} ... `;
      } else {
        newName = `${"\u0008".repeat(name.length + extraChars)}` +
          `        ${name} ... `;
      }
    }

    return newName;
  }

  /**
   * 'Empty' this object. After calling this, Rhum should be ready for another Plan
   */
  protected deconstruct(): void {
    this.passed_in_test_suite = "";
    this.passed_in_test_plan = "";
    this.test_plan_in_progress = "";
    this.test_suite_in_progress = "";
    this.plan = { suites: {} };
  }
}

/**
 * An instance of the RhumRunner.
 */
export const Rhum = new RhumRunner();
