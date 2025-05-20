/**
 * Type utility functions for safely handling database results
 */

/**
 * Safely converts a value to a number, handling null/undefined
 * @param value The value to convert
 * @returns Number or 0 if conversion fails
 */
export function safeNumber(value: any): number {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
}

/**
 * Safely formats minutes to hours with decimal precision
 * @param minutes Minutes (can be null/undefined)
 * @param precision Decimal precision (default: 1)
 * @returns Hours with specified precision
 */
export function minutesToHours(minutes: any, precision: number = 1): number {
  const mins = safeNumber(minutes);
  const factor = Math.pow(10, precision);
  return Math.round((mins / 60) * factor) / factor;
}

/**
 * Safely gets a property from a nested object
 * @param obj The object to get property from
 * @param path Property path (e.g., "subject.name")
 * @param defaultValue Default value if property doesn't exist
 * @returns Property value or default value
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return (result === undefined || result === null) ? defaultValue : result as T;
  } catch (err) {
    return defaultValue;
  }
}
