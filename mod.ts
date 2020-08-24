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

export { Constructor, Stubbed } from "./src/types.ts";
export { MockBuilder } from "./src/mock_builder.ts";

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
 */
export class RhumRunner {
  /**
   * The asserts module from https://deno.land/std/testing, but attached to Rhum
   * for accessibility.
   *
   *     Rhum.asserts.assertEquals(true, true); // pass
   *     Rhum.asserts.assertEquals(true, false); // fail
   */
  public asserts: { [key: string]: Function } = asserts;

  public mocks: RhumMocks;

  protected passed_in_test_plan = "";

  protected passed_in_test_suite = "";

  protected test_plan_in_progress = "";

  protected test_suite_in_progress = "";

  protected plan: ITestPlan = { suites: {}, only: false };

  // FILE MARKER - METHODS - CONSTRUCTOR ///////////////////////////////////////

  /**
   * Construct an object of this class.
   */
  constructor() {
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

  /**
   * Can be used for suites and cases. Will only run that.
   * You can just switch a `Rhum.testSuite(...` to `Rhum,only(...`
   *
   * @param name - The name
   * @param cb - The callback
   */
  public only(name: string, cb: Function): void {
    // FIXME(edward) Any test suite within a plan will a ctually hit this block, if there was a test suite before it. It should not hit this block
    if (this.passed_in_test_plan && this.passed_in_test_suite) { // is a test case being skipped
      this.plan.suites[this.passed_in_test_suite].cases!.push({
        name,
        new_name: this.formatTestCaseName(name),
        testFn: cb,
        only: true
      });
    } else if (this.passed_in_test_plan) { // is a test suite being skipped
      this.passed_in_test_suite = name;
      this.plan.suites![name] = {cases: [], only: true};
      cb();
    }
  }


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
  public skip(name: string, cb: Function): void {
    // TODO(ebebbington|crookse) Maybe we could still call run, but pass in {
    // ignore: true } which the Deno.Test will use? just so it displays ignored
    // in the console
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
  public testCase(name: string, testFn: Function): void {
    this.plan.suites[this.passed_in_test_suite].cases!.push({
      name,
      new_name: this.formatTestCaseName(name),
      testFn,
      only: false
    });
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
  public testPlan(name: string, testSuites: Function): void {
    this.passed_in_test_suite = ""; // New plan
    this.passed_in_test_plan = name;
    testSuites();
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
  public testSuite(name: string, testCases: Function): void {
    this.passed_in_test_suite = name;
    this.plan.suites![name] = { cases: [], only: false };
    testCases();
  }

  /**
   * Run the test plan.
   *
   *     Rhum.testPlan("My Plan", () => {
   *       ...
   *     });
   *
   *     Rhum.run();
   */
  public run(): void {
    const onlySuite: string|undefined = Object.keys(this.plan.suites).filter(suiteName => this.plan.suites[suiteName].only === true)[0]
    const onlyCase: string|undefined = Object.keys(this.plan.suites).filter(suiteName => this.plan.suites[suiteName].cases!.filter(c => c.only === true).length > 0)[0]
    if (onlySuite) {
      this.plan.suites = {
        [onlySuite]: this.plan.suites[onlySuite]
      };
    } else if (onlyCase) {
      // Select that test case
      this.plan.suites = {
        [onlyCase]: this.plan.suites[onlyCase]
      }
      this.plan.suites[onlyCase].cases = this.plan.suites[onlyCase].cases!.filter(c => c.only === true)
      // We need to re-format the name to make it display the plan and suite
      const tmpTestPlanInProgress =  this.test_suite_in_progress
      this.test_plan_in_progress = "";
      this.plan.suites[onlyCase].cases![0].new_name = this.formatTestCaseName(this.plan.suites[onlyCase].cases![0].name);
      this.passed_in_test_suite = tmpTestPlanInProgress
    }
    const tc = new TestCase(this.plan);
    tc.run();
    this.deconstruct();
  }

  //////////////////////////////////////////////////////////////////////////////
  // FILE MARKER - METHODS - PROTECTED /////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Figure out the name of the test case for output purposes.
   *
   * @param name - The name of the test case.
   *
   * Returns the new test name for outputting purposes.
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
   * 'Empty' this object. After calling this, Rhum should be ready for another
   * test plan.
   */
  protected deconstruct(): void {
    this.passed_in_test_suite = "";
    this.passed_in_test_plan = "";
    this.test_plan_in_progress = "";
    this.test_suite_in_progress = "";
    this.plan = { suites: {}, only: false };
  }
}

/**
 * An instance of the RhumRunner.
 *
 *     const Rhum = new RhumRunner();
 */
export const Rhum = new RhumRunner();
