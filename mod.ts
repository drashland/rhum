import { asserts } from "./deps.ts";
import { MockServerRequest } from "./src/mocks/server_request.ts";
import { TestCase } from "./src/test_case.ts";

/**
 * @description
 *     Deno's test runner outputs "test ", which has a length of 5. This module
 *     erases the "test " string by backspacing the test plan line and test
 *     suite line by that number. For safety, it substracts twice that number.
 *     This is how we get the number 10 here.
 */
const extraChars = 10;

/**
 * This testing framework allows the following syntax:
 *
 *     import { Rhum } from "/path/to/rhum/mod.ts";
 *
 *     Rhum.testPlan("test_plan_1", () => {
 *
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
 *
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
 *
 *     });
 *
 * Special thanks to
 *     @crookse (https://github.com/crookse)
 *     @ebebbington (https://github.com/ebebbington)
 */
export class RhumRunner {
  public asserts: any;
  public mocks: any = {};

  protected passed_in_test_plan: string = "";
  protected passed_in_test_suite: string = "";
  protected before_all_hook: Function | null = null;
  protected after_all_hook: Function | null = null;
  protected test_plan_in_progress: string = "";
  protected test_suite_in_progress: string = "";

  // FILE MARKER - METHODS - CONSTRUCTOR ///////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor() {
    this.asserts = asserts;
    this.mocks.ServerRequest = MockServerRequest;
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * @description
   *     Tear down a test plan.
   *
   * @param Function cb
   *    The callback to invoke. The callback should contain all of the necessary
   *    procedures for tearing down a test plan.
   *
   * @return void
   */
  public afterAll(cb: Function): void {
    this.after_all_hook = cb;
  }

  /**
   * @description
   *     Set up the test plan.
   *
   * @param Function cb
   *     The callback to invoke. The callback should contain all of the
   *     necessary procedures for setting up a test plan.
   *
   * @return void
   */
  public beforeAll(cb: Function): void {
    this.before_all_hook = cb;
  }

  /**
   * @description
   * @param Function cb
   *
   * @return void
   */
  public only(cb: Function): void {
    // Do something
  }

  /**
   * @description
   *     Skip a test plan, suite, or case.
   *
   * @param Function cb
   *
   * @return void
   */
  public skip(cb: Function): void {
    // Haaaaaa... you got skipped.
  }

  /**
   * @description
   *     Define a test case and execute the test function.
   *
   * @param string name
   *     The name of the test case.
   * @param Function testFn
   *     The test to execute.
   *
   * @return void
   */
  public testCase(name: string, testFn: Function): void {
    const tc = new TestCase(
      name,
      this.formatTestCaseName(name),
      testFn,
    );
    tc.run();
  }

  /**
   * @description
   *     Define a test plan and execute the test plan's test suites.
   *
   * @param string name
   *     The name of the test plan.
   * @param Function testSuites
   *     The test suites to execute.
   *
   * @return void
   */
  public testPlan(name: string, testSuites: Function): void {
    this.passed_in_test_plan = name;
    testSuites();
  }

  /**
   * @description
   *     Define a test suite and execute the test suite's test cases.
   *
   * @param string name
   *     The name of the test suite.
   * @param Function testSuites
   *     The test cases to execute.
   *
   * @return void
   */
  public testSuite(name: string, testCases: Function): void {
    this.passed_in_test_suite = name;
    testCases();
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * @description
   *     Figure out the name of the test case for output purposes.
   *
   * @param string name
   *     The name of the test case.
   *
   * @return string
   */
  protected formatTestCaseName(name: string): string {
    let newName: string;
    if (this.test_plan_in_progress != this.passed_in_test_plan) {
      this.test_plan_in_progress = this.passed_in_test_plan;
      this.test_suite_in_progress = this.passed_in_test_suite;
      newName = `${"\u0008".repeat(name.length + extraChars)}` +
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
}

export const Rhum = new RhumRunner();
