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
    await Deno.test(this.name, async () => {
      Deno.stdout.writeSync(encoder.encode(this.new_name));
      await this.test_fn();
    });
  }
}
