export interface IRhum {
  // Properties - public
  asserts: any;
  mocks: any;
  // Properties - protected
  passed_in_test_plan: string;
  passed_in_test_suite: string;
  set_up_hook: Function | null;
  tear_down_hook: Function | null;
  test_plan_in_progress: string;
  test_suite_in_progress: string;
  // Methods - public
  afterAll: Function;
  beforeAll: Function;
  only: Function;
  skip: Function;
  testCase: Function;
  testPlan: Function;
  testSuite: Function;
}
