import { Rhum } from "../../mod.ts";

class MathService {
  public add(num1: number, num2: number): number {
    return num1 + num2;
  }
}

class TestObject {
  public name: string;
  protected math_service: MathService;
  protected protected_property = "I AM PROTECTED PROPERTY.";
  constructor(name: string, mathService: MathService) {
    this.math_service = mathService;
    this.name = name;
  }
  public sum(num1: number, num2: number): number {
    const sum = this.math_service.add(num1, num2);
    return sum;
  }
  protected protectedMethod() {
    return "I AM A PROTECTED METHOD.";
  }
}

class TestRequestHandler {
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

Rhum.testPlan("mock_test.ts", () => {
  Rhum.testSuite("mock()", () => {
    Rhum.testCase("can mock an object", () => {
      const mock = Rhum
        .mock(TestObject)
        .create();
      Rhum.asserts.assertEquals(mock.constructor.name, "TestObject");
      Rhum.asserts.assertEquals(mock.is_mock, true);
    });

    Rhum.testCase("can mock an object with constructor args", () => {
      const mock = Rhum
        .mock(TestObject)
        .withConstructorArgs("my server", new MathService())
        .create();
      Rhum.asserts.assertEquals(mock.constructor.name, "TestObject");
      Rhum.asserts.assertEquals(mock.is_mock, true);
      Rhum.asserts.assertEquals(mock.name, "my server");
    });

    Rhum.testCase("can access protected property", () => {
      const mock = Rhum
        .mock(TestObject)
        .create();
      Rhum.asserts.assertEquals(
        (mock as unknown as { [key: string]: string }).protected_property,
        "I AM PROTECTED PROPERTY.",
      );
    });

    Rhum.testCase("can access protected method", () => {
      const mock = Rhum
        .mock(TestObject)
        .create();
      Rhum.asserts.assertEquals(
        (mock as unknown as { [key: string]: () => string }).protectedMethod(),
        "I AM A PROTECTED METHOD.",
      );
    });

    Rhum.testCase("call count for outside function is increased", () => {
      const mockMathService = Rhum
        .mock(MathService)
        .create();
      const mockTestObject = Rhum
        .mock(TestObject)
        .withConstructorArgs("has mocked math service", mockMathService)
        .create();
      Rhum.asserts.assertEquals(mockMathService.calls.add, 0);
      mockTestObject.sum(1, 1);
      Rhum.asserts.assertEquals(mockMathService.calls.add, 1);
    });

    Rhum.testCase("Native Request mock", async () => {
      const router = Rhum.mock(TestRequestHandler).create();

      const reqPost = new Request("https://google.com", {
        method: "post",
        headers: {
          "content-type": "application/json",
        },
      });
      Rhum.asserts.assertEquals(router.calls.handle, 0);
      Rhum.asserts.assertEquals(await router.handle(reqPost), "posted");
      Rhum.asserts.assertEquals(router.calls.handle, 1);

      const reqPostNotJson = new Request("https://google.com", {
        method: "post",
      });
      Rhum.asserts.assertEquals(router.calls.handle, 1);
      Rhum.asserts.assertEquals(
        await router.handle(reqPostNotJson),
        "Content-Type is incorrect",
      );
      Rhum.asserts.assertEquals(router.calls.handle, 2);

      const reqGet = new Request("https://google.com", {
        method: "get",
      });
      Rhum.asserts.assertEquals(router.calls.handle, 2);
      Rhum.asserts.assertEquals(
        await router.handle(reqGet),
        "Method is not post",
      );
      Rhum.asserts.assertEquals(router.calls.handle, 3);
    });
  });
});

Rhum.run();
