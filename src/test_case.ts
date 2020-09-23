const encoder = new TextEncoder();
import type { ITestPlan, ITestCase } from "./interfaces.ts";

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

    Object.keys(this.plan.suites).forEach((suiteName) => {
      // Run cases
      this.plan!.suites[suiteName].cases!.forEach(async (c: ITestCase) => {
        // Run the case - required to run like this because the
        // hooks need to be ran inside the Deno.test call. Deno.test seems to queue
        // the tests, meaning all hooks are ran, and **then** the tests are ran
        const hookAttachedTestFn = async () => {
          if (this.plan.before_all_suite_hook) {
            await this.plan.before_all_suite_hook();
          }
          if (this.plan.before_each_suite_hook) {
            await this.plan.before_each_suite_hook();
          }
          if (this.plan.suites[suiteName].before_all_case_hook) {
            await this.plan.suites[suiteName].before_all_case_hook!();
          }
          if (this.plan.suites[suiteName].before_each_case_hook) {
            await this.plan.suites[suiteName].before_each_case_hook!();
          }
          await c.testFn();
          if (this.plan.suites[suiteName].after_each_case_hook) {
            await this.plan.suites[suiteName].after_each_case_hook!();
          }
          if (this.plan.suites[suiteName].after_all_case_hook) {
            await this.plan.suites[suiteName].after_all_case_hook!();
          }
          if (this.plan.after_each_suite_hook) {
            await this.plan.after_each_suite_hook();
          }
          if (this.plan.after_all_suite_hook) {
            await this.plan.after_all_suite_hook();
          }
        };

        // Because lengths of test case names vary, for example:
        //
        //   test plan
        //       test suite
        //           test case ... ok
        //           another test case ... ok
        //
        // We are going to make sure the "... ok" parts display in a nice column,
        // by getting the length of the longest test case name, and ensuring each line is a consistent length
        // that would match the total length of the longest test case name (plus any extra spaces), eg
        //
        //   test plan
        //       test suite
        //           test case         ... ok
        //           another test case ... ok
        let longestCaseNameLen = 0;
        for (const s in this.plan.suites) {
          const len = Math.max(
              ...(this.plan.suites[s].cases!.map((c) => c.name.length)),
          );
          if (len > longestCaseNameLen) longestCaseNameLen = len;
        }
        const numberOfExtraSpaces = longestCaseNameLen - c.name.length; // for example, it would be 0 for when it's the test with the longest case name. It's just the character difference between the current case name and longest, telling us how many spaces to add

        const isOnly = this.plan.only || this.plan.suites[suiteName].only || c.only
        await Deno.test({
          name: c.new_name + " ".repeat(numberOfExtraSpaces),
          ignore: isOnly === false,
          async fn(): Promise<void> {
            await hookAttachedTestFn();
          }
        })
      })
    })
  }
}
