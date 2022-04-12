import { Dummy, Mock } from "../../../mod.ts";
import { assertEquals } from "../../deps.ts";

Deno.test("Dummy()", async (t) => {
  await t.step({
    name: "can fill parameter lists",
    fn(): void {
      const mockServiceOne = Mock(ServiceOne).create();
      const dummy3 = Dummy(ServiceThree);

      const resource = new Resource(
        mockServiceOne,
        Dummy(ServiceTwo),
        dummy3,
      );

      resource.callServiceOne();
      assertEquals(mockServiceOne.calls.methodServiceOne, 1);
    },
  });
});

class Resource {
  #service_one: ServiceOne;
  #service_two: ServiceTwo;
  #service_three: ServiceThree;

  constructor(
    serviceOne: ServiceOne,
    serviceTwo: ServiceTwo,
    serviceThree: ServiceThree
  ) {
    this.#service_one = serviceOne;
    this.#service_two = serviceTwo;
    this.#service_three = serviceThree;
  }

  public callServiceOne() {
    this.#service_one.methodServiceOne();
  }

  public callServiceTwo() {
    this.#service_two.methodServiceTwo();
  }

  public callServiceThree() {
    this.#service_three.methodServiceThree();
  }
}

class ServiceOne {
  public methodServiceOne() {
    return "Method from ServiceOne was called.";
  }
}

class ServiceTwo {
  public methodServiceTwo() {
    return "Method from ServiceTwo was called.";
  }
}

class ServiceThree {
  public methodServiceThree() {
    return "Method from ServiceThree was called.";
  }
}