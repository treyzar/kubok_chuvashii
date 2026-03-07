import { format, parseISO, isValid, parse } from 'date-fns';
import { ru } from 'date-fns/locale';

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

export const RUSSIAN_DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const RUSSIAN_DAYS_FULL = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

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

export function getMonthName(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) {
    return '';
  }
  return RUSSIAN_MONTHS[monthIndex];
}

export function getMonthNameGenitive(monthIndex: number): string {
  if (monthIndex < 0 || monthIndex > 11) {
    return '';
  }
  return RUSSIAN_MONTHS_GENITIVE[monthIndex];
}

export function parseDateShort(dateString: string): Date | null {
  try {
    const parsed = parse(dateString, 'dd.MM.yyyy', new Date(), { locale: ru });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

export function parseDateTime(dateTimeString: string): Date | null {
  try {
    const parsed = parse(dateTimeString, 'dd.MM.yyyy HH:mm', new Date(), { locale: ru });
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date time:', error);
    return null;
  }
}

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
