import { Fake } from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Fake()", async (t) => {
  await t.step({
    name: "can cause shortcuts",
    fn(): void {
      // Assert that a fake can make a class take a shortcut
      const fakeServiceDoingShortcut = Fake(Repository).create();
      fakeServiceDoingShortcut.method("findAllUsers").willReturn("shortcut");
      const resourceWithShortcut = new Resource(
        fakeServiceDoingShortcut,
      );
      resourceWithShortcut.getUsers();
      assertEquals(fakeServiceDoingShortcut.anotha_one_called, false);
      assertEquals(fakeServiceDoingShortcut.do_something_called, false);
      assertEquals(fakeServiceDoingShortcut.do_something_else_called, false);

      // Assert that the fake service is not yet doing a shortcut
      const fakeServiceNotDoingShortcut = Fake(Repository).create();
      const resourceWithoutShortcut = new Resource(
        fakeServiceNotDoingShortcut,
      );
      resourceWithoutShortcut.getUsers();
      assertEquals(fakeServiceNotDoingShortcut.anotha_one_called, true);
      assertEquals(fakeServiceNotDoingShortcut.do_something_called, true);
      assertEquals(fakeServiceNotDoingShortcut.do_something_else_called, true);
    },
  });
});

class Resource {
  #repository: Repository;

  constructor(
    serviceOne: Repository,
  ) {
    this.#repository = serviceOne;
  }

  public getUsers() {
    this.#repository.findAllUsers();
  }

  public getUser(id: number) {
    this.#repository.findUserById(id);
  }
}

class Repository {
  public anotha_one_called = false;
  public do_something_called = false;
  public do_something_else_called = false;

  public findAllUsers(): string {
    this.#doSomething();
    this.#doSomethingElse();
    this.#anothaOne();
    return "Finding all users";
  }

  public findUserById(id: number): string {
    return `Finding user by id #${id}`;
  }

  #anothaOne() {
    this.anotha_one_called = true;
  }

  #doSomething() {
    this.do_something_called = true;
  }

  #doSomethingElse() {
    this.do_something_else_called = true;
  }
}
