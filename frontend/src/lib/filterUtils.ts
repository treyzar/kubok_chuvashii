/**
 * Filter utilities for managing filter state and URL parameters
 */

/**
 * Check if a filter value is considered "active" (non-default)
 * @param value - Filter value to check
 * @returns true if the filter is active (has a non-default value)
 */
export function isFilterActive(value: any): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  
  if (typeof value === 'string' && (value === 'none' || value === 'all')) {
    return false;
  }
  
  if (typeof value === 'number' && value === 0) {
    return false;
  }
  
  return true;
}

/**
 * Count the number of active filters in a filter object
 * @param filters - Object containing filter values
 * @returns Number of active filters
 */
export function countActiveFilters(filters: Record<string, any>): number {
  return Object.values(filters).filter(isFilterActive).length;
}

/**
 * Check if any filters are active
 * @param filters - Object containing filter values
 * @returns true if at least one filter is active
 */
export function hasActiveFilters(filters: Record<string, any>): boolean {
  return countActiveFilters(filters) > 0;
}

/**
 * Serialize filter value for URL parameter
 * @param value - Filter value to serialize
 * @returns Serialized string value or null
 */
export function serializeFilterValue(value: any): string | null {
  if (!isFilterActive(value)) {
    return null;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number') {
    return value.toString();
  }
  
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0]; // YYYY-MM-DD
  }
  
  return String(value);
}

/**
 * Deserialize filter value from URL parameter
 * @param value - URL parameter value
 * @param type - Expected type ('string', 'number', 'boolean', 'date')
 * @returns Deserialized value
 */
export function deserializeFilterValue(
  value: string | null,
  type: 'string' | 'number' | 'boolean' | 'date' = 'string'
): any {
  if (!value) {
    return null;
  }
  
  switch (type) {
    case 'number':
      const num = parseInt(value, 10);
      return isNaN(num) ? null : num;
      
    case 'boolean':
      return value === '1' || value === 'true';
      
    case 'date':
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : value;
      } catch {
        return null;
      }
      
    case 'string':
    default:
      return value;
  }
}

/**
 * Build URL search params from filter object
 * @param filters - Object containing filter values
 * @returns URLSearchParams object
 */
export function buildSearchParams(filters: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    const serialized = serializeFilterValue(value);
    if (serialized !== null) {
      params.set(key, serialized);
    }
  });
  
  return params;
}

/**
 * Parse filters from URL search params
 * @param searchParams - URLSearchParams object
 * @param schema - Schema defining expected filter types
 * @returns Object containing parsed filter values
 */
export function parseSearchParams(
  searchParams: URLSearchParams,
  schema: Record<string, 'string' | 'number' | 'boolean' | 'date'>
): Record<string, any> {
  const filters: Record<string, any> = {};
  
  Object.entries(schema).forEach(([key, type]) => {
    const value = searchParams.get(key);
    if (value !== null) {
      filters[key] = deserializeFilterValue(value, type);
    }
  });
  
  return filters;
}

/**
 * Sanitize filter value to prevent XSS and injection attacks
 * @param value - Filter value to sanitize
 * @returns Sanitized value
 */
export function sanitizeFilterValue(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }
  
  // Remove potentially dangerous characters
  return value
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate filter values against constraints
 * @param filters - Object containing filter values
 * @param constraints - Object defining validation rules
 * @returns Object with validation results
 */
export function validateFilters(
  filters: Record<string, any>,
  constraints: Record<string, (value: any) => boolean>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  Object.entries(constraints).forEach(([key, validator]) => {
    const value = filters[key];
    if (isFilterActive(value) && !validator(value)) {
      errors[key] = `Invalid value for ${key}`;
    }
  });
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Merge filter objects, with later objects taking precedence
 * @param filters - Array of filter objects to merge
 * @returns Merged filter object
 */
export function mergeFilters(...filters: Record<string, any>[]): Record<string, any> {
  return filters.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      if (isFilterActive(value)) {
        acc[key] = value;
      }
    });
    return acc;
  }, {});
}

/**
 * Reset filters to default values
 * @param defaults - Object containing default filter values
 * @returns Object with default values
 */
export function resetFilters(defaults: Record<string, any> = {}): Record<string, any> {
  return { ...defaults };
}

/**
 * Compare two filter objects for equality
 * @param filters1 - First filter object
 * @param filters2 - Second filter object
 * @returns true if filters are equal
 */
export function areFiltersEqual(
  filters1: Record<string, any>,
  filters2: Record<string, any>
): boolean {
  const keys1 = Object.keys(filters1).filter(key => isFilterActive(filters1[key]));
  const keys2 = Object.keys(filters2).filter(key => isFilterActive(filters2[key]));
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  return keys1.every(key => filters1[key] === filters2[key]);
}
