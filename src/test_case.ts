const encoder = new TextEncoder();
import type { ITestCase, ITestPlan } from "./interfaces.ts";

/**
 * A class to help create uniform test case objects.
 */
export class TestCase {
  /**
   * The whole test plan for a given test
   */
  protected plan: ITestPlan;

  /**
   * @param plan - The test plan for a given test
   */
  constructor(plan: ITestPlan) {
    this.plan = plan;
  }

  /**
   * Runs the test plan and each test and hook
   */
  public async run() {
    // deno-lint-ignore no-prototype-builtins, eslint-ignore-next-line no-prototype-builtins
    if (this.plan.hasOwnProperty("suites") === false) {
      return;
    }

    // Track the execution of hooks
    let executedBeforeAllSuiteHook = false;
    let executedAfterAllSuiteHook = false;

    Object.keys(this.plan.suites).forEach((suiteName, suiteIndex) => {
      // Track the execution of hooks
      let executedBeforeEachSuiteHook = false;
      let executedAfterEachSuiteHook = false;
      let executedBeforeAllCaseHook = false;
      let executedAfterAllCaseHook = false;

      // Run cases
      this.plan!.suites[suiteName].cases!.forEach(
        async (c: ITestCase, caseIndex) => {
          // Run the case - required to run like this because the
          // hooks need to be ran inside the Deno.test call. Deno.test seems to queue
          // the tests, meaning all hooks are ran, and **then** the tests are ran
          const hookAttachedTestFn = async () => {
            if (
              this.plan.before_all_suite_hook && !executedBeforeAllSuiteHook
            ) {
              await this.plan.before_all_suite_hook();
              executedBeforeAllSuiteHook = true;
            }
            if (
              this.plan.before_each_suite_hook && !executedBeforeEachSuiteHook
            ) {
              await this.plan.before_each_suite_hook();
              executedBeforeEachSuiteHook = true;
            }
            if (
              this.plan.suites[suiteName].before_all_case_hook &&
              !executedBeforeAllCaseHook
            ) {
              await this.plan.suites[suiteName].before_all_case_hook!();
              executedBeforeAllCaseHook = true;
            }
            if (this.plan.suites[suiteName].before_each_case_hook) {
              await this.plan.suites[suiteName].before_each_case_hook!();
            }

            await c.testFn();

            if (this.plan.suites[suiteName].after_each_case_hook) {
              await this.plan.suites[suiteName].after_each_case_hook!();
            }
            const isLastCase =
              (this.plan!.suites[suiteName].cases!.length - 1) == caseIndex;
            if (
              this.plan.suites[suiteName].after_all_case_hook &&
              !executedAfterAllCaseHook && isLastCase
            ) {
              await this.plan.suites[suiteName].after_all_case_hook!();
              executedAfterAllCaseHook = true;
            }
            if (
              this.plan.after_each_suite_hook && !executedAfterEachSuiteHook
            ) {
              await this.plan.after_each_suite_hook();
              executedAfterEachSuiteHook = true;
            }
            const isLastSuite =
              (Object.keys(this.plan!.suites).length - 1) == suiteIndex;
            if (
              this.plan.after_all_suite_hook && !executedAfterAllSuiteHook &&
              isLastSuite
            ) {
              await this.plan.after_all_suite_hook();
              executedAfterAllSuiteHook = true;
            }
          };
          // (ebebbington) To stop the output of test running being horrible
          // in the CI, we will only display the new name which should be
          // "plan | suite " case", as opposed to the "super saiyan"
          // version. This name is generated differently inside `formatTestCaseName`
          // based on if the tests are being ran inside a CI job
          if (Deno.env.get("CI") === "true") {
            await Deno.test(c.new_name, async () => {
              await hookAttachedTestFn();
            });
          } else {
            await Deno.test(c.name, async () => {
              Deno.stdout.writeSync(encoder.encode(c.new_name));
              await hookAttachedTestFn();
            });
          }
        },
      );
    });
  }
}
