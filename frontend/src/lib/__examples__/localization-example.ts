

import RU_LOCALIZATION, { getStatusLabel, getStatusOptions, getErrorMessage } from '@/shared/lib/localization';
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
} from '@/shared/lib/date-utils';
import {
  isFilterActive,
  hasActiveFilters,
  countActiveFilters,
  buildSearchParams,
  parseSearchParams,
} from '@/shared/lib/filter-utils';


console.log('=== Localization Strings ===');
console.log('Page title:', RU_LOCALIZATION.appealsList.title);
console.log('Loading text:', RU_LOCALIZATION.common.loading);
console.log('Clear filters:', RU_LOCALIZATION.filters.clearFilters);


console.log('\n=== Status Labels ===');
console.log('init status:', getStatusLabel('init')); 
console.log('open status:', getStatusLabel('open')); 
console.log('closed status:', getStatusLabel('closed')); 
console.log('rejected status:', getStatusLabel('rejected')); 


console.log('\n=== Status Options ===');
const statusOptions = getStatusOptions();
statusOptions.forEach(option => {
  console.log(`${option.value}: ${option.label}`);
});


console.log('\n=== Error Messages ===');
console.log('Network error:', getErrorMessage({ request: {} }));
console.log('404 error:', getErrorMessage({ response: { status: 404 } }));
console.log('500 error:', getErrorMessage({ response: { status: 500 } }));


console.log('\n=== Date Formatting ===');
const testDate = '2024-03-15T14:30:45';
console.log('Short format:', formatDateShort(testDate)); 
console.log('Date time:', formatDateTime(testDate)); 
console.log('Long format:', formatDateLong(testDate)); 
console.log('With day:', formatDateWithDay(testDate)); 
console.log('Time only:', formatTime(testDate)); 


console.log('\n=== Russian Month Names ===');
console.log('January (nominative):', getMonthName(0)); 
console.log('January (genitive):', getMonthNameGenitive(0)); 
console.log('All months:', RUSSIAN_MONTHS.join(', '));


console.log('\n=== Date Validation ===');
const startDate = '2024-01-01';
const endDate = '2024-12-31';
const invalidEndDate = '2023-12-31';
console.log('Valid range:', isValidDateRange(startDate, endDate)); 
console.log('Invalid range:', isValidDateRange(startDate, invalidEndDate)); 


console.log('\n=== Relative Time ===');
const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
console.log('5 minutes ago:', formatRelativeTime(fiveMinutesAgo));
console.log('2 days ago:', formatRelativeTime(twoDaysAgo));


console.log('\n=== Filter Utilities ===');
const filters = {
  search: 'test',
  status: 'open',
  category: null,
  department: '',
};
console.log('Has active filters:', hasActiveFilters(filters)); 
console.log('Active filter count:', countActiveFilters(filters)); 
console.log('Is "test" active:', isFilterActive('test')); 
console.log('Is null active:', isFilterActive(null)); 
console.log('Is empty string active:', isFilterActive('')); 


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
