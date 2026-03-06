


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


export function countActiveFilters(filters: Record<string, any>): number {
  return Object.values(filters).filter(isFilterActive).length;
}


export function hasActiveFilters(filters: Record<string, any>): boolean {
  return countActiveFilters(filters) > 0;
}


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
    return value.toISOString().split('T')[0]; 
  }
  
  return String(value);
}


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


export function sanitizeFilterValue(value: any): any {
  if (typeof value !== 'string') {
    return value;
  }
  
  
  return value
    .replace(/[<>]/g, '') 
    .replace(/javascript:/gi, '') 
    .replace(/on\w+=/gi, '') 
    .trim();
}


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


export function resetFilters(defaults: Record<string, any> = {}): Record<string, any> {
  return { ...defaults };
}


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
