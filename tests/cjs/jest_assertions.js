function assertEquals(actual, expected) {
  expect(actual).toStrictEqual(expected);
}

function assertThrows(
  actual,
  expected,
  message,
) {
  expect(actual).toThrow(new expected(message));
}

module.exports = {
  assertEquals,
  assertThrows,
};
