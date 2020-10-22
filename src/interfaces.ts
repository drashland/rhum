/**
 * cases?
 *     An array of objects matching the ITestCase interface.
 *
 * after_all_cases_hook?
 *     A callback function to execute after all test cases.
 *
 * after_each_case_hook?
 *     A callback function to execute after each test case.
 *
 * before_all_cases_hook?
 *     A callback function to execute before all test cases.
 *
 * before_each_case_hook?
 *     A callback function to execute before each test case.
 */
export interface ITestSuite {
  cases: ITestCase[];
  after_all_cases_hook?: () => void;
  after_each_case_hook?: () => void;
  before_all_cases_hook?: () => void;
  before_each_case_hook?: () => void;
  skip: boolean;
}

/**
 * name
 *     The name of the test case.
 *
 * testFn
 *     The test function. Ultimately, this gets passed as the second
 *     argument of Deno.test().
 */
export interface ITestCase {
  name: string;
  test_fn: () => void;
  skip: boolean;
}

export interface ITestPlan {
  suites: {
    [key: string]: ITestSuite;
  };
  after_all_suites_hook?: () => void;
  after_each_suite_hook?: () => void;
  before_all_suites_hook?: () => void;
  before_each_suite_hook?: () => void;
  skip: boolean;
  name: string;
}

export interface ITestPlanResults {
  passed: number;
  failed: number;
  skipped: number;
  errors: string;
}

export interface IOptions {
  test_case?: string | null;
  test_suite?: string | null;
  ignore?: string | null;
}
