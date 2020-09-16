import type { MockServerRequestFn } from "./mocks/server_request.ts";

/**
 * @remarks
 * suites
 *     An object of objects matching the ITestSuite interface.
 *
 * after_all_suite_hook?
 *     A callback function to execute after all test suites.
 *
 * after_each_suite_hook?
 *     A callback function to execute after each test suite.
 *
 * before_all_suite_hook?
 *     A callback function to execute before all test suites.
 *
 * before_each_suite_hook?
 *     A callback function to execute before each test suite.
 *
 * Example below ...
 *
 *     {
 *       suites: {
 *         "My Suite": {
 *           cases: [
 *             {
 *               name: "My Case",
 *               new_name: this.formatTestCaseName(name),
 *               testFn: Function
 *             },
 *             ...
 *           ],
 *           after_all_case_hook: Function,
 *           after_each_case_hook: Function,
 *           before_all_case_hook: Function,
 *           before_each_case_hook: Function
 *         },
 *         ... // More suites allowed
 *       },
 *       after_all_suite_hook: Function;
 *       after_each_suite_hook: Function;
 *       before_all_suite_hook: Function;
 *       before_each_suite_hook: Function;
 *     }
 *
 * ... or ...
 *
 *     {
 *       suites: {
 *         run(): {
 *           cases: [Array],
 *           after_all_case_hook: [Function],
 *           before_all_case_hook: [Function],
 *           before_each_case_hook: [Function],
 *           after_each_case_hook: [Function]
 *         },
 *         close(): {
 *           cases: [Array],
 *           after_all_case_hook: [Function],
 *           before_all_case_hook: [Function],
 *           before_each_case_hook: [Function],
 *           after_each_case_hook: [Function]
 *         }
 *       },
 *       before_each_suite_hook: [Function],
 *       after_each_suite_hook: [Function],
 *       after_all_suite_hook: [Function],
 *       before_all_suite_hook: [Function]
 *     }
 */
export interface ITestPlan {
  suites: {
    [key: string]: ITestSuite; // "key" is the suite name
  };
  after_all_suite_hook?: () => void;
  after_each_suite_hook?: () => void;
  before_all_suite_hook?: () => void;
  before_each_suite_hook?: () => void;
}

/**
 * cases?
 *     An array of objects matching the ITestCase interface.
 *
 * after_all_case_hook?
 *     A callback function to execute after all test cases.
 *
 * after_each_case_hook?
 *     A callback function to execute after each test case.
 *
 * before_all_case_hook?
 *     A callback function to execute before all test cases.
 *
 * before_each_case_hook?
 *     A callback function to execute before each test case.
 */
export interface ITestSuite {
  cases?: ITestCase[];
  after_all_case_hook?: () => void;
  after_each_case_hook?: () => void;
  before_all_case_hook?: () => void;
  before_each_case_hook?: () => void;
}

/**
 * name
 *     The name of the test case.
 *
 * new_name
 *     The new name of the test. This is strictly for outputting purposes.
 *     Deno's test runner outputs "test name of test" and we want to
 *     overwrite that text. This new_name string helps us do that. See
 *     formatTestCaseName() in mod.ts for more information.
 *
 * testFn
 *     The test function. Ultimately, this gets passed as the second
 *     argument of Deno.test().
 */
export interface ITestCase {
  name: string;
  new_name: string;
  testFn: () => void;
}

/**
 * ServerRequest
 *     Type for the ServerRequest on the `Rhum.mocks` property
 */
export interface RhumMocks {
  ServerRequest: typeof MockServerRequestFn;
}
