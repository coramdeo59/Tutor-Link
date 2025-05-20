/**
 * Helper utilities for ensuring type safety in the progress service
 */

/**
 * Type-safe accessor for potentially undefined array items
 * @param array The array to access
 * @param index The index to access
 * @returns The item at the index or undefined
 */
export function safeArrayAccess<T>(array: T[] | undefined | null, index: number): T | undefined {
  if (!array || array.length <= index) {
    return undefined;
  }
  return array[index];
}

/**
 * Safely unwraps a value that might be undefined and provides a default value
 * @param value The value to unwrap
 * @param defaultValue The default value to use if the value is undefined
 * @returns The unwrapped value or the default value
 */
export function unwrapOrDefault<T>(value: T | undefined | null, defaultValue: T): T {
  return value === undefined || value === null ? defaultValue : value;
}

/**
 * Wraps a potentially throwing operation in a try-catch block
 * @param operation The operation to execute
 * @param defaultValue The default value to return if the operation throws
 * @returns The result of the operation or the default value
 */
export function tryCatch<T>(operation: () => T, defaultValue: T): T {
  try {
    return operation();
  } catch (error) {
    console.error('Error in operation:', error);
    return defaultValue;
  }
}
