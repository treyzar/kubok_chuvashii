/**
 * Date formatting utilities using Russian locale
 * Uses date-fns library for consistent date handling
 */

import { format, parseISO, isValid, parse } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Russian month names (nominative case)
 */
export const RUSSIAN_MONTHS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
];

/**
 * Russian month names (genitive case - used with dates)
 */
export const RUSSIAN_MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

/**
 * Russian day names (short form)
 */
export const RUSSIAN_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * Russian day names (full form)
 */
export const RUSSIAN_DAYS_FULL = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

/**
 * Format date in short format (DD.MM.YYYY)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD.MM.YYYY format
 * @example formatDateShort('2024-03-15') => '15.03.2024'
 */
export function formatDateShort(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'dd.MM.yyyy', { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format date with time (DD.MM.YYYY HH:MM)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD.MM.YYYY HH:MM format
 * @example formatDateTime('2024-03-15T14:30:00') => '15.03.2024 14:30'
 */
export function formatDateTime(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return '';
  }
}

/**
 * Format date with full time including seconds (DD.MM.YYYY HH:MM:SS)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in DD.MM.YYYY HH:MM:SS format
 * @example formatDateTimeFull('2024-03-15T14:30:45') => '15.03.2024 14:30:45'
 */
export function formatDateTimeFull(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'dd.MM.yyyy HH:mm:ss', { locale: ru });
  } catch (error) {
    console.error('Error formatting date time full:', error);
    return '';
  }
}

/**
 * Format date in long format with Russian month name (D MMMM YYYY)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string with Russian month name
 * @example formatDateLong('2024-03-15') => '15 марта 2024'
 */
export function formatDateLong(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'd MMMM yyyy', { locale: ru });
  } catch (error) {
    console.error('Error formatting date long:', error);
    return '';
  }
}

/**
 * Format date with day of week (DD.MM.YYYY, День недели)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string with day of week
 * @example formatDateWithDay('2024-03-15') => '15.03.2024, Пятница'
 */
export function formatDateWithDay(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'dd.MM.yyyy, EEEE', { locale: ru });
  } catch (error) {
    console.error('Error formatting date with day:', error);
    return '';
  }
}

/**
 * Format time only (HH:MM)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted time string in HH:MM format
 * @example formatTime('2024-03-15T14:30:00') => '14:30'
 */
export function formatTime(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'HH:mm', { locale: ru });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

/**
 * Get Russian month name (nominative case)
 * @param monthIndex - Month index (0-11)
 * @returns Russian month name
 * @example getMonthName(0) => 'январь'
 */
export function getMonthName(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) {
    return '';
  }
  return RUSSIAN_MONTHS[monthIndex];
}

/**
 * Get Russian month name in genitive case (used with dates)
 * @param monthIndex - Month index (0-11)
 * @returns Russian month name in genitive case
 * @example getMonthNameGenitive(0) => 'января'
 */
export function getMonthNameGenitive(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) {
    return '';
  }
  return RUSSIAN_MONTHS_GENITIVE[monthIndex];
}

/**
 * Parse date from DD.MM.YYYY format
 * @param dateString - Date string in DD.MM.YYYY format
 * @returns Date object or null if invalid
 * @example parseDateShort('15.03.2024') => Date object
 */
export function parseDateShort(dateString: string): Date | null {
  try {
    const parsed = parse(dateString, 'dd.MM.yyyy', new Date(), { locale: ru });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Parse date time from DD.MM.YYYY HH:MM format
 * @param dateTimeString - Date time string in DD.MM.YYYY HH:MM format
 * @returns Date object or null if invalid
 * @example parseDateTime('15.03.2024 14:30') => Date object
 */
export function parseDateTime(dateTimeString: string): Date | null {
  try {
    const parsed = parse(dateTimeString, 'dd.MM.yyyy HH:mm', new Date(), { locale: ru });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date time:', error);
    return null;
  }
}

/**
 * Format date for input[type="date"] (YYYY-MM-DD)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in YYYY-MM-DD format
 * @example formatDateForInput('2024-03-15T14:30:00') => '2024-03-15'
 */
export function formatDateForInput(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

/**
 * Validate date range (end date must be >= start date)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns true if valid, false otherwise
 */
export function isValidDateRange(
  startDate: string | Date | number,
  endDate: string | Date | number
): boolean {
  try {
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? parseISO(endDate) : new Date(endDate);
    
    if (!isValid(start) || !isValid(end)) {
      return false;
    }
    
    return end >= start;
  } catch (error) {
    console.error('Error validating date range:', error);
    return false;
  }
}

/**
 * Format relative time in Russian (e.g., "2 дня назад")
 * @param date - Date string, Date object, or timestamp
 * @returns Relative time string in Russian
 */
export function formatRelativeTime(date: string | Date | number): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) {
      return '';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
      return 'только что';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} ${pluralizeMinutes(diffMinutes)} назад`;
    } else if (diffHours < 24) {
      return `${diffHours} ${pluralizeHours(diffHours)} назад`;
    } else if (diffDays < 7) {
      return `${diffDays} ${pluralizeDays(diffDays)} назад`;
    } else {
      return formatDateShort(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
}

/**
 * Pluralize minutes in Russian
 */
function pluralizeMinutes(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'минут';
  }
  if (lastDigit === 1) {
    return 'минуту';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'минуты';
  }
  return 'минут';
}

/**
 * Pluralize hours in Russian
 */
function pluralizeHours(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'часов';
  }
  if (lastDigit === 1) {
    return 'час';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'часа';
  }
  return 'часов';
}

/**
 * Pluralize days in Russian
 */
function pluralizeDays(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'дней';
  }
  if (lastDigit === 1) {
    return 'день';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }
  return 'дней';
}
