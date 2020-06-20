import { asserts } from "./deps.ts";
import { IRhum } from "./src/interfaces/rhum.ts";
import { MockServerRequest } from "./src/mocks/server_request.ts";
import { TestCase } from "./src/test_case.ts";

/**
 * Deno's test runner outputs "test ", which has a length of 5. This module
 * erases the "test " string by backspacing the test plan line and test suite
 * line by that number. For safety, it substracts twice that number. This is how
 * we get the number 10 here.
 */
const extraChars = 10;

/**
 * This testing framework allows the following syntax:
 *
 *     import { Rhum } from "/path/to/rhum/mod.ts";
 *
 *     Rhum.TestPlan("test_plan_1", () => {
 *
 *       Rhum.TestSuite("test_suite_1a", () => {
 *         Rhum.TestCase("test_case_1a1", () => {
 *           Rhum.Asserts.assertEquals(true, true);
 *         });
 *         Rhum.TestCase("test_case_1a2", () => {
 *           Rhum.Asserts.assertEquals(true, true);
 *         });
 *         Rhum.TestCase("test_case_1a3", () => {
 *           Rhum.Asserts.assertEquals(true, true);
 *         });
 *       });
 *
 *       Rhum.TestSuite("test_suite_1b", () => {
 *         Rhum.TestCase("test_case_1b1", () => {
 *           Rhum.Asserts.assertEquals(true, true);
 *         });
 *         Rhum.TestCase("test_case_1b2", () => {
 *           Rhum.Asserts.assertEquals(true, true);
 *         });
 *         Rhum.TestCase("test_case_1b3", () => {
 *           Rhum.Asserts.assertEquals(true, true);
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
  public Asserts: any;
  public Mocks: any = {};

  protected passed_in_test_plan: string = "";
  protected passed_in_test_suite: string = "";
  protected set_up_hook: Function | null = null;
  protected tear_down_hook: Function | null = null;
  protected test_plan_in_progress: string = "";
  protected test_suite_in_progress: string = "";

  // FILE MARKER - METHODS - CONSTRUCTOR ///////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor() {
    this.Asserts = asserts;
    this.Mocks.ServerRequest = MockServerRequest;
  }

  // FILE MARKER - METHODS - PUBLIC ////////////////////////////////////////////

  /**
   * Set up the test plan.
   *
   * @param Function cb
   *     The callback to invoke. The callback should contain all of the
   *     necessary procedures for setting up a test plan.
   *
   * @return void
   */
  public SetUp(cb: Function): void {
    this.set_up_hook = cb;
  }

  /**
   * Skip a test plan, suite, or case.
   *
   * @param Function cb
   *
   * @return void
   */
  public Skip(cb: Function): void {
    // Haaaaaa... you got skipped.
  }

  /**
   * Tear down a test plan.
   *
   * @param Function cb
   *    The callback to invoke. The callback should contain all of the necessary
   *    procedures for tearing down a test plan.
   *
   * @return void
   */
  public TearDown(cb: Function): void {
    this.tear_down_hook = cb;
  }

  /**
   * Define a test case and execute the test function.
   *
   * @param string name
   *     The name of the test case.
   * @param Function testFn
   *     The test to execute.
   *
   * @return void
   */
  public TestCase(name: string, testFn: Function): void {
    const tc = new TestCase(
      name,
      this.formatTestCaseName(name),
      testFn,
    );
    tc.run();
  }

  /**
   * Define a test plan and execute the test plan's test suites.
   *
   * @param string name
   *     The name of the test plan.
   * @param Function testSuites
   *     The test suites to execute.
   *
   * @return void
   */
  public TestPlan(name: string, testSuites: Function): void {
    this.passed_in_test_plan = name;
    testSuites();
  }

  /**
   * Define a test suite and execute the test suite's test cases.
   *
   * @param string name
   *     The name of the test suite.
   * @param Function testSuites
   *     The test cases to execute.
   *
   * @return void
   */
  public TestSuite(name: string, testCases: Function): void {
    this.passed_in_test_suite = name;
    testCases();
  }

  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////

  /**
   * Figure out the name of the test case for output purposes.
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
      newName = `${"\u0008".repeat(name.length + extraChars)}` + // strip "test "
        `${" ".repeat(name.length + extraChars)}` +
        `\n${this.passed_in_test_plan}` +
        `\n    ${this.passed_in_test_suite}` +
        `\n        ${name}`;
    } else {
      if (this.test_suite_in_progress != this.passed_in_test_suite) {
        this.test_suite_in_progress = this.passed_in_test_suite;
        newName = `${"\u0008".repeat(name.length + extraChars)}` +
          `\n    ${this.passed_in_test_suite}` +
          `${" ".repeat(name.length + extraChars)}` +
          `\n        ${name}`;
      } else {
        newName = `${"\u0008".repeat(name.length + extraChars)}` +
          `\n        ${name}`;
      }
    }

    return newName;
  }
}

export const Rhum = new RhumRunner();
