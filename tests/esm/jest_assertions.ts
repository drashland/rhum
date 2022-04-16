export function assertEquals(actual: unknown, expected: unknown): void {
  expect(actual).toStrictEqual(expected);
}

export function assertThrows(
  actual: () => unknown,
  expected: new (message?: string) => Error,
  message: string,
): void {
  expect(actual).toThrow(new expected(message));
}
