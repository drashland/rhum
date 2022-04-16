const { Stub } = require("../../../../lib/cjs/mod");

class Server {
  greeting = "hello";

  methodThatLogs() {
    return "server is running!";
  }
}

describe("Stub()", () => {
  it("can stub a class property", () => {
    const server = new Server();
    expect(server.greeting).toBe("hello");
    Stub(server, "greeting", "you got changed");
    expect(server.greeting).toBe("you got changed");
    Stub(server, "greeting", null);
    expect(server.greeting).toBe(null);
    Stub(server, "greeting", true);
    expect(server.greeting).toBe(true);
    const obj = { test: "hello" };
    Stub(server, "greeting", obj);
    expect(server.greeting).toBe(obj);
  });

  it("can stub a class method", () => {
    const server = new Server();
    expect(server.methodThatLogs()).toBe("server is running!");
    Stub(server, "methodThatLogs");
    expect(server.methodThatLogs()).toBe("stubbed");
    Stub(server, "methodThatLogs", null);
    expect(server.methodThatLogs()).toBe(null);
    Stub(server, "methodThatLogs", true);
    expect(server.methodThatLogs()).toBe(true);
    const obj = { test: "hello" };
    Stub(server, "methodThatLogs", obj);
    expect(server.methodThatLogs()).toBe(obj);
  });

  it("can return a stubbed function", () => {
    const stub = Stub();
    expect(stub()).toBe("stubbed");
  });
});
