import { Mock } from "../../mod.ts";
import { assertEquals } from "../deps.ts";

class MathService {
  public add(
    num1: number,
    num2: number,
    useNestedAdd = false,
  ): number {
    if (useNestedAdd) {
      return this.nestedAdd(num1, num2);
    }
    return num1 + num2;
  }

  public nestedAdd(num1: number, num2: number): number {
    return num1 + num2;
  }
}

class TestObject {
  public name: string;
  #age = 0;
  protected math_service: MathService;
  protected protected_property = "I AM PROTECTED PROPERTY.";
  constructor(name: string, mathService: MathService) {
    this.math_service = mathService;
    this.name = name;
  }
  public sum(
    num1: number,
    num2: number,
    useNestedAdd = false,
  ): number {
    const sum = this.math_service.add(num1, num2, useNestedAdd);
    return sum;
  }
  protected protectedMethod() {
    return "I AM A PROTECTED METHOD.";
  }

  public get age() {
    return this.#age;
  }

  public set age(val: number) {
    this.#age = val;
  }
}

class TestRequestHandler {
  // deno-lint-ignore require-await
  async handle(request: Request): Promise<string | Error> {
    const method = request.method.toLowerCase();
    const contentType = request.headers.get("Content-Type");

    if (method !== "post") {
      return "Method is not post";
    }

    if (contentType !== "application/json") {
      return "Content-Type is incorrect";
    }

    return "posted";
  }
}

Deno.test("mock()", async (t) => {
  await t.step({
    name: "can mock an object",
    fn() {
      const mock = Mock(TestObject)
        .create();
      assertEquals(mock.constructor.name, "TestObject");
      assertEquals(mock.is_mock, true);
    },
  });

  await t.step("Can mock an object with constructor args", () => {
    const mock = Mock(TestObject)
      .withConstructorArgs("my server", new MathService())
      .create();
    assertEquals(mock.constructor.name, "TestObject");
    assertEquals(mock.is_mock, true);
    assertEquals(mock.name, "my server");
  });

  await t.step("can access protected property", () => {
    const mock = Mock(TestObject)
      .create();
    assertEquals(
      (mock as unknown as { [key: string]: string }).protected_property,
      "I AM PROTECTED PROPERTY.",
    );
  });

  await t.step("Can access protected method", () => {
    const mock = Mock(TestObject)
      .create();
    assertEquals(
      (mock as unknown as { [key: string]: () => string }).protectedMethod(),
      "I AM A PROTECTED METHOD.",
    );
  });

  await t.step("has mocked math service", () => {
    const mockMathService = Mock(MathService)
      .create();
    const mockTestObject = Mock(TestObject)
      .withConstructorArgs("has mocked math service", mockMathService)
      .create();
    assertEquals(mockMathService.calls.add, 0);
    mockTestObject.sum(1, 1);
    assertEquals(mockMathService.calls.add, 1);
  });

  await t.step("call count for outside nested function is increased", () => {
    const mockMathService = Mock(MathService)
      .create();
    const mockTestObject = Mock(TestObject)
      .withConstructorArgs("has mocked math service", mockMathService)
      .create();
    assertEquals(mockMathService.calls.add, 0);
    assertEquals(mockMathService.calls.nestedAdd, 0);
    mockTestObject.sum(1, 1, true);
    assertEquals(mockMathService.calls.add, 1);
    assertEquals(mockMathService.calls.nestedAdd, 1);
  });

  await t.step("can mock getters and setters", () => {
    const mock = Mock(TestObject)
      .create();
    mock.age = 999;
    assertEquals(mock.age, 999);
  });

  await t.step("Native request mock", async () => {
    const router = Mock(TestRequestHandler).create();

    const reqPost = new Request("https://google.com", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
    });
    assertEquals(router.calls.handle, 0);
    assertEquals(await router.handle(reqPost), "posted");
    assertEquals(router.calls.handle, 1);

    const reqPostNotJson = new Request("https://google.com", {
      method: "post",
    });
    assertEquals(router.calls.handle, 1);
    assertEquals(
      await router.handle(reqPostNotJson),
      "Content-Type is incorrect",
    );
    assertEquals(router.calls.handle, 2);

    const reqGet = new Request("https://google.com", {
      method: "get",
    });
    assertEquals(router.calls.handle, 2);
    assertEquals(
      await router.handle(reqGet),
      "Method is not post",
    );
    assertEquals(router.calls.handle, 3);
  });
});
