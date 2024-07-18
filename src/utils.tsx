/** A promise that resolves after 'ms' milliseconds */
export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns only the digit chars of a string */
export function getOnlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
