/**
 * cases?
 *     An array of objects matching the ICase interface.
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
export interface ISuite {
  cases: ICase[];
  after_all_cases_hook?: () => void;
  after_each_case_hook?: () => void;
  before_all_cases_hook?: () => void;
  before_each_case_hook?: () => void;
}

/**
 * name
 *     The name of the test case.
 *
 * testFn
 *     The test function. Ultimately, this gets passed as the second
 *     argument of Deno.test().
 */
export interface ICase {
  name: string;
  test_fn: () => void;
  skip: boolean;
}

export interface IPlan {
  suites: {
    [key: string]: ISuite;
  };
  after_all_suites_hook?: () => void;
  after_each_suite_hook?: () => void;
  before_all_suites_hook?: () => void;
  before_each_suite_hook?: () => void;
}

export interface ICaseResult {
  name: string;
  pass: boolean;
  suite: string;
  errors?: string;
}

export interface IStats {
  passed: number;
  failed: number;
  skipped: number;
  errors: string;
}

export interface IFilters {
  test_case?: string;
  test_suite?: string;
}
