import { BufReader, ServerRequest } from "../../deps.ts";

/**
 * Contains options for a server request
 *
 * @remarks
 * headers: {[key: string]: string}
 *
 *     The headers for the request
 *
 * body?: Deno.Buffer
 *
 *     The body of the request before sending
 */
export interface MockServerRequestOptions {
  headers: { [key: string]: string };
  body?: Deno.Buffer;
}

// TODO remove lint ignore when extended and add tsdoc block
// deno-lint-ignore no-empty-interface, eslint-ignore-next-line no-empty-interface
export interface MockServerRequest extends ServerRequest {
}

/**
 * Constructs a server request object
 *
 * @example
 * ```ts
 * const request = MockServerRequestFn("/", "get", { ... });
 * ```
 *
 * @param url - Url to make the request to
 * @param method - The method of the request
 * @param options - HTTP request options, such as headers and body
 */
export const MockServerRequestFn = function (
  url = "/",
  method = "get",
  options?: MockServerRequestOptions,
): MockServerRequest {
  const request: MockServerRequest = new ServerRequest();
  request.url = url;
  request.method = method;
  request.headers = new Headers();
  if (options) {
    if (options.headers) {
      for (const key in options.headers) {
        request.headers.set(key, options.headers[key]);
      }
    }
    if (options.body) {
      request.headers.set("Content-Length", options.body.length.toString());
      request.r = new BufReader(options.body);
    }
  }

  return request;
};
