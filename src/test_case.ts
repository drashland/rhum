const encoder = new TextEncoder();

/**
 * A class to help create uniform test case objects.
 */
export class TestCase {
  protected plan: any; // TODO(ebebbington) Use Plan interface

  constructor(plan: any) { // TODO(ebebbington) Use Plan interface
    this.plan = plan;
  }

  public async run() {
    Object.keys(this.plan.suites).forEach((suiteName) => {
      // Run cases
      this.plan.suites[suiteName].cases.forEach(async (c: any) => {
        // Run the case - required to run like this because the
        // hooks need to be ran inside the Deno.test call. Deno.test seems to queue
        // the tests, meaning all hooks are ran, and **then** the tests are ran
        const hookAttachedTestFn = async () => {
          if (this.plan.before_all_suite_hook) {
            this.plan.before_all_suite_hook();
          }
          if (this.plan.before_each_suite_hook) {
            this.plan.before_each_suite_hook();
          }
          if (this.plan.suites[suiteName].before_all_case_hook) {
            this.plan.suites[suiteName].before_all_case_hook();
          }
          if (this.plan.suites[suiteName].before_each_case_hook) {
            this.plan.suites[suiteName].before_each_case_hook();
          }
          await c.testFn()
          if (this.plan.suites[suiteName].after_each_case_hook) {
            this.plan.suites[suiteName].after_each_case_hook();
          }
          if (this.plan.suites[suiteName].after_all_case_hook) {
            this.plan.suites[suiteName].after_all_case_hook();
          }
          if (this.plan.after_each_suite_hook) {
            this.plan.after_each_suite_hook();
          }
          if (this.plan.after_all_suite_hook) {
            this.plan.after_all_suite_hook();
          }
        }
        await Deno.test(c.name, async () => {
          Deno.stdout.writeSync(encoder.encode(c.new_name));
          await hookAttachedTestFn()
        });
      });
    });
  }
}
