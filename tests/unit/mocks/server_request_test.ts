import { asserts } from "../../../deps.ts";
import { MockServerRequest } from "../../../src/mocks/server_request.ts";

Deno.test({
  name: "Unit | mocks | ServerRequest | Returns a valid request object",
  async fn(): Promise<void> {
    const mockReq = MockServerRequest("https://google.com", "get", {
      headers: {
        a: "Hi",
      },
    });
    asserts.assertEquals(mockReq.url === "https://google.com", true);
    asserts.assertEquals(mockReq.method === "get", true);
    asserts.assertEquals(mockReq.headers.get("a"), "Hi");
    const res = mockReq.respond({ status: 200 });
    asserts.assertEquals(res.status, 200);
    asserts.assertEquals(typeof res.send === "function", true);
  },
});

Deno.test({
  name:
    "Unit | mocks | ServerRequest | Correctly sets content length for strings",
  async fn(): Promise<void> {
    const mockReq = MockServerRequest("https://google.com", "get", {
      body: JSON.stringify({ name: "Edward" }),
    });
    asserts.assertEquals(mockReq.headers.get("Content-Length"), "17");
  },
});

Deno.test({
  name:
    "Unit | mocks | ServerRequest | Correctly sets content length for FormData",
  async fn(): Promise<void> {
    const formData = new FormData();
    formData.append("fs", "dd");
    formData.append(
      "image",
      new Blob([
        new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 137, 1, 25]),
      ], { type: "image/png" }),
      "some-image.png",
    );
    const mockReq = MockServerRequest("https://google.com", "get", {
      body: formData,
    });
    asserts.assertEquals(mockReq.headers.get("Content-Length"), "13");
  },
});
