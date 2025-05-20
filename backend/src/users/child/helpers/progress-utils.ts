/**
 * Utility functions for the progress service
 */

/**
 * Safely convert minutes to hours with specified precision
 */
export function minutesToHours(minutes: any, precision = 1): number {
  if (minutes === null || minutes === undefined) {
    return 0;
  }
  
  const minutesNum = Number(minutes);
  if (isNaN(minutesNum)) {
    return 0;
  }
  
  const factor = Math.pow(10, precision);
  return Math.round((minutesNum / 60) * factor) / factor;
}

/**
 * Safely get a subject name from an object
 */
export function getSubjectName(obj: any): string {
  if (!obj || !obj.subject) {
    return 'Unknown Subject';
  }
  
  return obj.subject.name || 'Unknown Subject';
}
