const { Dummy, Mock } = require("../../../../lib/cjs/mod");

describe("Dummy()", () => {
  it("can fill parameter lists", () => {
    const mockServiceOne = Mock(ServiceOne).create();
    const dummy3 = Dummy(ServiceThree);

    const resource = new Resource(
      mockServiceOne,
      Dummy(ServiceTwo),
      dummy3,
    );

    resource.callServiceOne();
    expect(mockServiceOne.calls.methodServiceOne).toBe(1);
  });

  it("can be made without specifying constructor args", () => {
    const dummy = Dummy(Resource);
    expect(Object.getPrototypeOf(dummy)).toBe(Resource);
  });
});

class Resource {
  constructor(
    serviceOne,
    serviceTwo,
    serviceThree,
  ) {
    this.service_one = serviceOne;
    this.service_two = serviceTwo;
    this.service_three = serviceThree;
  }

  callServiceOne() {
    this.service_one.methodServiceOne();
  }

  callServiceTwo() {
    this.service_two.methodServiceTwo();
  }

  callServiceThree() {
    this.service_three.methodServiceThree();
  }
}

class ServiceOne {
  methodServiceOne() {
    return "Method from ServiceOne was called.";
  }
}

class ServiceTwo {
  methodServiceTwo() {
    return "Method from ServiceTwo was called.";
  }
}

class ServiceThree {
  methodServiceThree() {
    return "Method from ServiceThree was called.";
  }
}
