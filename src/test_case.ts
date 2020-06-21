const encoder = new TextEncoder();

/**
 * A class to help create uniform test case objects.
 */
export class TestCase {
  protected plan: any; // TODO(ebebbington Use Plan interface

  constructor(plan: any) { // TODO(ebebbington) Use Plan interface
    this.plan = plan;
  }

  public async run() {
    // Run before all hooks for suites
    if (this.plan.before_all_suite_hook) {
      this.plan.before_all_suite_hook()
    }
    Object.keys(this.plan.suites).forEach(suiteName => {
      // Run before each hooks for suites
      if (this.plan.before_each_suite_hook) {
        this.plan.before_each_suite_hook()
      }
      // Run before all hooks for cases
      if (this.plan.suites[suiteName].before_all_case_hook) {
        this.plan.suites[suiteName].before_all_case_hook()
      }
      // Run cases
      this.plan.suites[suiteName].cases.forEach(async (c: any) => {
        // Run before each hooks for cases
        if (this.plan.suites[suiteName].before_each_case_hook) {
          this.plan.suites[suiteName].before_each_case_hook()
        }

        // Run the case
        await Deno.test(c.name, async () => {
          Deno.stdout.writeSync(encoder.encode(c.new_name));
          await c.testFn();
        });

        // Run after each hooks for cases
        if (this.plan.suites[suiteName].after_each_case_hook) {
          this.plan.suites[suiteName].after_each_case_hook()
        }
      });
      // Run after all hooks for cases
      if (this.plan.suites[suiteName].after_all_case_hook) {
        this.plan.suites[suiteName].after_all_case_hook()
      }
      // Run after each hooks for suites
      if (this.plan.after_each_suite_hook) {
        this.plan.after_each_suite_hook()
      }
    });
    // Run after all hooks for suites
    if (this.plan.after_all_suite_hook) {
      this.plan.after_all_suite_hook()
    }
  }
}
