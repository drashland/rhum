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
  });
});

Rhum.run();
