export interface IRhum {
  // Properties for public use
  Asserts: any;
  Mocks: any;
  // Properties for internal use
  passed_in_test_plan: string;
  passed_in_test_suite: string;
  set_up_hook: Function | null;
  tear_down_hook: Function | null;
  test_plan_in_progress: string;
  test_suite_in_progress: string;
  // Methods for public use
  SetUp: Function;
  Skip: Function;
  TearDown: Function;
  TestCase: Function;
  TestPlan: Function;
  TestSuite: Function;
}

