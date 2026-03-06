/**
 * Example usage of localization infrastructure
 * This file demonstrates how to use the localization utilities
 */

import RU_LOCALIZATION, { getStatusLabel, getStatusOptions, getErrorMessage } from '../localization';
import {
  formatDateShort,
  formatDateTime,
  formatDateLong,
  formatDateWithDay,
  formatTime,
  getMonthName,
  getMonthNameGenitive,
  isValidDateRange,
  formatRelativeTime,
  RUSSIAN_MONTHS,
} from '../dateUtils';
import {
  isFilterActive,
  hasActiveFilters,
  countActiveFilters,
  buildSearchParams,
  parseSearchParams,
} from '../filterUtils';

// Example 1: Using localization strings
console.log('=== Localization Strings ===');
console.log('Page title:', RU_LOCALIZATION.appealsList.title);
console.log('Loading text:', RU_LOCALIZATION.common.loading);
console.log('Clear filters:', RU_LOCALIZATION.filters.clearFilters);

// Example 2: Status labels
console.log('\n=== Status Labels ===');
console.log('init status:', getStatusLabel('init')); // "Новое"
console.log('open status:', getStatusLabel('open')); // "В работе"
console.log('closed status:', getStatusLabel('closed')); // "Решено"
console.log('rejected status:', getStatusLabel('rejected')); // "Отклонено"

// Example 3: Status options for dropdown
console.log('\n=== Status Options ===');
const statusOptions = getStatusOptions();
statusOptions.forEach(option => {
  console.log(`${option.value}: ${option.label}`);
});

// Example 4: Error messages
console.log('\n=== Error Messages ===');
console.log('Network error:', getErrorMessage({ request: {} }));
console.log('404 error:', getErrorMessage({ response: { status: 404 } }));
console.log('500 error:', getErrorMessage({ response: { status: 500 } }));

// Example 5: Date formatting
console.log('\n=== Date Formatting ===');
const testDate = '2024-03-15T14:30:45';
console.log('Short format:', formatDateShort(testDate)); // "15.03.2024"
console.log('Date time:', formatDateTime(testDate)); // "15.03.2024 14:30"
console.log('Long format:', formatDateLong(testDate)); // "15 марта 2024"
console.log('With day:', formatDateWithDay(testDate)); // "15.03.2024, Пятница"
console.log('Time only:', formatTime(testDate)); // "14:30"

// Example 6: Russian month names
console.log('\n=== Russian Month Names ===');
console.log('January (nominative):', getMonthName(0)); // "январь"
console.log('January (genitive):', getMonthNameGenitive(0)); // "января"
console.log('All months:', RUSSIAN_MONTHS.join(', '));

// Example 7: Date validation
console.log('\n=== Date Validation ===');
const startDate = '2024-01-01';
const endDate = '2024-12-31';
const invalidEndDate = '2023-12-31';
console.log('Valid range:', isValidDateRange(startDate, endDate)); // true
console.log('Invalid range:', isValidDateRange(startDate, invalidEndDate)); // false

// Example 8: Relative time
console.log('\n=== Relative Time ===');
const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
console.log('5 minutes ago:', formatRelativeTime(fiveMinutesAgo));
console.log('2 days ago:', formatRelativeTime(twoDaysAgo));

// Example 9: Filter utilities
console.log('\n=== Filter Utilities ===');
const filters = {
  search: 'test',
  status: 'open',
  category: null,
  department: '',
};
console.log('Has active filters:', hasActiveFilters(filters)); // true
console.log('Active filter count:', countActiveFilters(filters)); // 2
console.log('Is "test" active:', isFilterActive('test')); // true
console.log('Is null active:', isFilterActive(null)); // false
console.log('Is empty string active:', isFilterActive('')); // false

// Example 10: URL parameter handling
console.log('\n=== URL Parameters ===');
const filterState = {
  search: 'обращение',
  status: 'open',
  category: 5,
  startDate: '2024-01-01',
};
const searchParams = buildSearchParams(filterState);
console.log('URL params:', searchParams.toString());

const schema = {
  search: 'string' as const,
  status: 'string' as const,
  category: 'number' as const,
  startDate: 'date' as const,
};
const parsedFilters = parseSearchParams(searchParams, schema);
console.log('Parsed filters:', parsedFilters);

console.log('\n=== All Examples Complete ===');
