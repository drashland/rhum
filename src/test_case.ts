const encoder = new TextEncoder();

/**
 * A class to help create uniform test case objects.
 */
export class TestCase {
  protected name: string;
  protected new_name: string;
  protected test_fn: Function;

  constructor(
    name: string,
    newName: string,
    testFn: Function,
  ) {
    this.name = name;
    this.new_name = newName;
    this.test_fn = testFn;
  }

  public async run() {
    const testFn = this.test_fn;
    const name = this.new_name;
    await Deno.test({
      name: name,
      async fn(): Promise<void> {
        await testFn();
      },
    });
  }
}
