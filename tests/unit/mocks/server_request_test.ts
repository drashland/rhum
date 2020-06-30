import { asserts } from "../../../deps.ts";
import { MockServerRequestFn } from "../../../src/mocks/server_request.ts";

Deno.test({
  name: "Unit | mocks | ServerRequest | Returns a valid request object",
  async fn(): Promise<void> {
    const mockReq = MockServerRequestFn("https://google.com", "get", {
      headers: {
        a: "Hi",
      },
    });
    asserts.assertEquals(mockReq.url === "https://google.com", true);
    asserts.assertEquals(mockReq.method === "get", true);
    asserts.assertEquals(mockReq.headers.get("a"), "Hi");
    await mockReq.respond({ status: 200 });
  },
});
