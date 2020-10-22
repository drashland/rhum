/**
 * Get an option value given an argument.
 *
 * @param argAndValue - The string containing both the arg and value. For
 * example, --filter-test-case=hello
 * @param arg - The arg alone. For example, --filter-test-case.
 *
 * @returns The value of the arg (if it exists);
 */
export function getOptionValue(
  argAndValue: string,
  arg: string,
): string | null {
  const re = new RegExp(`${arg}.+`, "g");
  const match = argAndValue.match(re);
  if (match) {
    return match[0].split("=")[1];
  }
  return null;
}
