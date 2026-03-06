# Design Document: CRM Filtering, Search, and Localization

## Overview

This design describes the implementation of comprehensive filtering, search functionality, and complete Russian localization across all CRM pages (AppealsList, Monitoring, Dashboard, AppealDetail). The solution will enhance the existing React/TypeScript frontend by adding:

1. **Filtering System**: A unified approach to filtering data by status, category, subcategory, department, and date ranges
2. **Search Functionality**: Text-based search with debouncing for efficient API usage
3. **URL State Management**: Query parameters for shareable filtered views
4. **Complete Localization**: All UI text, dates, and labels in Russian
5. **Responsive Design**: Mobile-friendly filter controls

The design follows React best practices using hooks for state management, custom hooks for reusable logic, and proper TypeScript typing throughout.

## Architecture

### Component Structure

```
AppealsList
├── FilterBar (new component)
│   ├── SearchInput
│   ├── StatusFilter
│   ├── CategoryFilter
│   ├── SubcategoryFilter
│   ├── DepartmentFilter
│   ├── DateRangeFilter
│   └── ClearFiltersButton
├── TicketList (existing, enhanced)
└── LoadingSpinner

Monitoring
├── MonitoringFilters (new component)
│   ├── PeriodFilter
│   ├── DepartmentFilter
│   └── OverdueSearch
├── KPICards (existing, localized)
├── DepartmentTable (existing, localized)
└── OverdueTicketsList (existing, enhanced)

Dashboard
├── StatCards (existing, localized)
└── Charts (existing, localized)

AppealDetail
├── StatusControl (existing, enhanced)
├── DepartmentControl (existing, enhanced)
└── DetailContent (existing, localized)
```

### State Management Strategy

- **Local Component State**: For UI-only state (dropdown open/closed, input focus)
- **URL Query Parameters**: For filter state (shareable, persistent)
- **Custom Hooks**: For reusable filter logic and API calls
- **React Query / SWR**: For API data caching and synchronization (optional enhancement)

### Data Flow

```
User Action → Update URL Params → Parse Params → API Call → Update UI
     ↓                                                          ↑
  Update Local State ------------------------------------------|
```

## Components and Interfaces

### 1. FilterBar Component

**Purpose**: Unified filter controls for AppealsList page

**Props Interface**:
```typescript
interface FilterBarProps {
  onFiltersChange: (filters: AppealFilters) => void;
  initialFilters?: AppealFilters;
  isLoading?: boolean;
}

interface AppealFilters {
  search?: string;
  status?: string;
  category?: number;
  subcategory?: number;
  department?: number;
  startDate?: string;
  endDate?: string;
}
```

**Behavior**:
- Renders all filter controls in a responsive grid
- Manages local state for each filter
- Debounces search input (300ms)
- Calls `onFiltersChange` when any filter changes
- Shows/hides clear button based on active filters
- Disables controls when `isLoading` is true

### 2. useFilters Hook

**Purpose**: Manage filter state and URL synchronization

**Interface**:
```typescript
function useFilters(defaultFilters?: AppealFilters): {
  filters: AppealFilters;
  setFilter: (key: keyof AppealFilters, value: any) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}
```

**Implementation Details**:
- Reads initial state from URL query parameters
- Updates URL when filters change (using `useSearchParams` from react-router-dom)
- Provides helper to check if any filters are active
- Serializes/deserializes filter values for URL

### 3. useDebounce Hook

**Purpose**: Debounce search input to reduce API calls

**Interface**:
```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Implementation**:
- Returns debounced value after specified delay
- Cleans up timeout on unmount or value change

### 4. SearchInput Component

**Props Interface**:
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}
```

**Features**:
- Search icon on the left
- Clear button (X) on the right when text is present
- Accessible (proper labels, keyboard navigation)

### 5. DateRangeFilter Component

**Props Interface**:
```typescript
interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  disabled?: boolean;
}
```

**Features**:
- Two date inputs (start and end)
- Validation: end date cannot be before start date
- Russian locale formatting (DD.MM.YYYY)
- Clear buttons for each date

### 6. LocalizationProvider

**Purpose**: Centralized localization strings and date formatting

**Interface**:
```typescript
interface LocalizationStrings {
  common: {
    all: string;
    clear: string;
    search: string;
    loading: string;
    error: string;
  };
  status: {
    init: string;
    open: string;
    closed: string;
    rejected: string;
  };
  filters: {
    allStatuses: string;
    allCategories: string;
    allDepartments: string;
    clearFilters: string;
    dateFrom: string;
    dateTo: string;
  };
  // ... more sections
}

const localization: LocalizationStrings;

function formatDate(date: Date | string, format: 'short' | 'long'): string;
```

### 7. API Enhancement

**New/Updated Functions**:

```typescript
// Enhanced fetchTickets with all filter parameters
interface FetchTicketsParams {
  search?: string;
  status_id?: string;
  category_id?: number;
  subcategory_id?: number;
  department_id?: number;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const fetchTickets = async (params?: FetchTicketsParams): Promise<{ tickets: Ticket[], total: number }>;

// New function to update ticket status
export const updateTicketStatus = async (ticketId: string, status: string): Promise<void>;

// New function to update ticket department
export const updateTicketDepartment = async (ticketId: string, departmentId: number): Promise<void>;

// Enhanced getOverdueTickets with search
interface GetOverdueParams {
  department_id?: number;
  min_lost_days?: number;
  limit?: number;
  search?: string;
}

export const getOverdueTickets = async (params?: GetOverdueParams): Promise<{ tickets: OverdueTicket[], total: number }>;
```

## Data Models

### Filter State Model

```typescript
interface AppealFilters {
  search?: string;          // Text search query
  status?: string;          // Status ID: 'init' | 'open' | 'closed' | 'rejected'
  category?: number;        // Category ID
  subcategory?: number;     // Subcategory ID
  department?: number;      // Department ID
  startDate?: string;       // ISO date string (YYYY-MM-DD)
  endDate?: string;         // ISO date string (YYYY-MM-DD)
}

interface MonitoringFilters {
  period: 'week' | 'month' | 'year';
  department?: number;
  overdueSearch?: string;
}
```

### URL Query Parameter Mapping

```typescript
// AppealsList URL format:
// /crm/appeals?search=текст&status=open&category=1&subcategory=3&department=2&start_date=2024-01-01&end_date=2024-12-31

const QUERY_PARAM_KEYS = {
  search: 'search',
  status: 'status',
  category: 'category',
  subcategory: 'subcategory',
  department: 'department',
  startDate: 'start_date',
  endDate: 'end_date',
} as const;
```

### Localization Data Model

```typescript
const RU_LOCALIZATION = {
  common: {
    all: 'Все',
    clear: 'Очистить',
    search: 'Поиск',
    loading: 'Загрузка...',
    error: 'Ошибка',
    save: 'Сохранить',
    cancel: 'Отмена',
  },
  status: {
    init: 'Новое',
    open: 'В работе',
    closed: 'Решено',
    rejected: 'Отклонено',
  },
  filters: {
    allStatuses: 'Все статусы',
    allCategories: 'Все категории',
    allDepartments: 'Все департаменты',
    clearFilters: 'Очистить фильтры',
    dateFrom: 'Дата от',
    dateTo: 'Дата до',
    searchPlaceholder: 'Поиск по обращениям, авторам, комментариям...',
  },
  dashboard: {
    totalAppeals: 'Всего обращений',
    resolved: 'Решено',
    inProgress: 'В работе',
    executors: 'Исполнителей',
    dynamicsTitle: 'Динамика обращений',
    categoriesTitle: 'По категориям',
    received: 'Поступило',
    weekTrend: 'за неделю',
  },
  monitoring: {
    title: 'Мониторинг исполнения',
    avgResponseTime: 'Среднее время ответа',
    overdue: 'Просрочено',
    satisfactionIndex: 'Индекс удовлетворенности',
    departmentPerformance: 'Показатели подразделений',
    criticalOverdue: 'Критические просрочки',
    days: 'дня',
    day: 'день',
    viewAll: 'Смотреть все',
  },
  appealDetail: {
    backToList: 'Вернуться к списку',
    hide: 'Скрыть',
    delete: 'Удалить',
    status: 'Статус',
    assignToDepartment: 'Передать подразделению',
    selectDepartment: 'Выберите подразделение',
    internalTags: 'Внутренние теги',
    addTag: 'Добавить тег',
    sender: 'Отправитель',
    appealInfo: 'Информация об обращении',
    category: 'Категория',
    subcategory: 'Подкатегория',
    dateReceived: 'Дата поступления',
    department: 'Подразделение',
    notAssigned: 'Не распределено',
    appealText: 'Текст обращения',
    comments: 'Комментарии и работа',
    writeComment: 'Написать комментарий...',
    attachFile: 'Прикрепить файл',
    send: 'Отправить',
    history: 'История',
    noComments: 'Нет комментариев',
    historyEmpty: 'История пуста',
  },
  errors: {
    loadFailed: 'Не удалось загрузить данные',
    updateFailed: 'Не удалось обновить',
    invalidDateRange: 'Дата окончания не может быть раньше даты начала',
  },
};
```

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Search filters by description content

*For any* ticket list and any search query, all returned tickets should have descriptions that contain the search text (case-insensitive).

**Validates: Requirements 1.1, 1.5**

### Property 2: Search by ID returns exact match

*For any* ticket list and any ticket ID, searching by that ID should return exactly the ticket with that ID if it exists in the list, or an empty result if it doesn't exist.

**Validates: Requirements 1.2**

### Property 3: Empty search returns unfiltered results

*For any* ticket list with other filters applied, searching with an empty string should return the same results as applying only those other filters without search.

**Validates: Requirements 1.3**

### Property 4: Search debouncing prevents excessive API calls

*For any* sequence of rapid search input changes within 300ms, only one API call should be triggered after the last input change plus 300ms delay.

**Validates: Requirements 1.4**

### Property 5: Status filter returns only matching tickets

*For any* ticket list and any status value, filtering by that status should return only tickets where ticket.status equals the selected status.

**Validates: Requirements 2.1**

### Property 6: Category filter returns only matching tickets

*For any* ticket list and any category ID, filtering by that category should return only tickets where ticket.category_id equals the selected category.

**Validates: Requirements 3.1**

### Property 7: Subcategory dropdown contains only related subcategories

*For any* category selection, the subcategory dropdown options should contain only subcategories where subcategory.category_id equals the selected category ID.

**Validates: Requirements 3.2**

### Property 8: Subcategory filter returns only matching tickets

*For any* ticket list and any subcategory ID, filtering by that subcategory should return only tickets where ticket.subcategory_id equals the selected subcategory.

**Validates: Requirements 3.3**

### Property 9: Department filter returns only matching tickets

*For any* ticket list and any department ID, filtering by that department should return only tickets where ticket.department_id equals the selected department.

**Validates: Requirements 4.1**

### Property 10: Start date filter returns only tickets on or after date

*For any* ticket list and any start date, filtering by that start date should return only tickets where ticket.created_at >= start date.

**Validates: Requirements 5.1**

### Property 11: End date filter returns only tickets on or before date

*For any* ticket list and any end date, filtering by that end date should return only tickets where ticket.created_at <= end date.

**Validates: Requirements 5.2**

### Property 12: Date range filter returns only tickets within range

*For any* ticket list and any valid date range (start_date, end_date), filtering by that range should return only tickets where start_date <= ticket.created_at <= end_date.

**Validates: Requirements 5.3**

### Property 13: Date validation prevents invalid ranges

*For any* date range input where end_date < start_date, the system should display a validation error and prevent the filter from being applied.

**Validates: Requirements 5.4**

### Property 14: Date formatting uses Russian locale

*For any* date value displayed in the UI, the formatted string should match the pattern DD.MM.YYYY or DD.MM.YYYY HH:MM.

**Validates: Requirements 5.6, 9.7**

### Property 15: Clear filters resets all controls to defaults

*For any* filter state with one or more active filters, clicking the clear filters button should reset all filter controls to their default values (empty/all).

**Validates: Requirements 6.1**

### Property 16: Clear filters removes URL parameters

*For any* URL with filter query parameters, clicking the clear filters button should result in a URL with no filter-related query parameters.

**Validates: Requirements 6.2**

### Property 17: Clear filters shows all tickets

*For any* filtered ticket list, clicking the clear filters button should result in displaying the same tickets as loading the page with no filters.

**Validates: Requirements 6.3**

### Property 18: Clear button visibility matches filter state

*For any* filter state, the clear filters button should be visible if and only if at least one filter has a non-default value.

**Validates: Requirements 6.4**

### Property 19: Monitoring department filter affects all data

*For any* department selection on the Monitoring page, the KPI metrics, department efficiency data, and overdue tickets should all be filtered to show only data for that department.

**Validates: Requirements 7.1, 7.2, 7.3**

### Property 20: Overdue search filters by description

*For any* overdue ticket list and any search query, all returned overdue tickets should have descriptions that contain the search text (case-insensitive).

**Validates: Requirements 8.1, 8.3**

### Property 21: Overdue search by ID returns exact match

*For any* overdue ticket list and any ticket ID, searching by that ID should return exactly the overdue ticket with that ID if it exists.

**Validates: Requirements 8.2**

### Property 22: Empty overdue search returns all overdue tickets

*For any* overdue ticket list with other filters applied, searching with an empty string should return all overdue tickets matching those other filters.

**Validates: Requirements 8.4**

### Property 23: All UI text elements are in Russian

*For any* page in the CRM application, all button labels, form labels, placeholders, chart labels, tooltips, and error messages should contain only Russian text (Cyrillic characters and standard punctuation).

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 24: Month names are in Russian

*For any* date display in charts or date pickers that includes month names, the month names should be in Russian (январь, февраль, март, etc.).

**Validates: Requirements 9.8**

### Property 25: Filter state synchronizes with URL

*For any* filter change, the URL query parameters should immediately reflect the current filter state, and vice versa - loading a URL with parameters should apply those filters.

**Validates: Requirements 10.1, 10.2**

### Property 26: Filter state persists across page refresh

*For any* filter state, refreshing the page should result in the same filters being applied after the page reloads.

**Validates: Requirements 10.3**

### Property 27: Clearing filters removes URL parameters

*For any* filter state, clearing all filters should result in removing all filter-related query parameters from the URL.

**Validates: Requirements 10.5**

### Property 28: Loading indicator appears during data fetch

*For any* filter application that triggers a data fetch, a loading indicator should be visible from the moment the fetch starts until it completes or fails.

**Validates: Requirements 11.1**

### Property 29: Filter controls disabled during loading

*For any* data fetch operation, all filter controls should be disabled from the moment the fetch starts until it completes or fails.

**Validates: Requirements 11.2**

### Property 30: Loading indicator disappears after fetch completes

*For any* data fetch operation, the loading indicator should be hidden and filter controls should be re-enabled after the fetch completes successfully or fails.

**Validates: Requirements 11.3**

### Property 31: Failed requests show error and re-enable controls

*For any* filter request that fails, an error message in Russian should be displayed and all filter controls should be re-enabled.

**Validates: Requirements 11.5**

### Property 32: Mobile viewport stacks filters vertically

*For any* viewport width less than 768px, filter controls should be arranged in a vertical stack (flex-direction: column).

**Validates: Requirements 12.1**

### Property 33: Mobile viewport makes dropdowns full-width

*For any* viewport width less than 768px, all filter dropdown elements should have width: 100%.

**Validates: Requirements 12.2**

### Property 34: Touch targets meet minimum size

*For any* interactive filter control element, the touch target size should be at least 44px in both width and height.

**Validates: Requirements 12.3**

### Property 35: Filter controls fit within viewport

*For any* viewport size, filter controls should not cause horizontal scrolling (overflow-x should not occur).

**Validates: Requirements 12.4**

### Property 36: Mobile devices show collapsible filter panel

*For any* viewport width less than 768px, the filter panel should be collapsible (expandable/collapsible state).

**Validates: Requirements 12.5**

### Property 37: Status update triggers API call

*For any* status change on the AppealDetail page, an API request should be sent to update the ticket status.

**Validates: Requirements 13.1**

### Property 38: Successful status update reflects in UI

*For any* successful status update API response, the displayed status in the UI should match the new status value.

**Validates: Requirements 13.2**

### Property 39: Successful status update adds history entry

*For any* successful status update, a new entry should appear in the ticket history with the status change action.

**Validates: Requirements 13.3**

### Property 40: Failed status update shows error and reverts

*For any* failed status update API request, an error message in Russian should be displayed and the status dropdown should revert to the previous value.

**Validates: Requirements 13.4**

### Property 41: Status dropdown disabled during update

*For any* status update API request in progress, the status dropdown should be disabled.

**Validates: Requirements 13.5**

### Property 42: Department assignment triggers API call

*For any* department change on the AppealDetail page, an API request should be sent to update the ticket department.

**Validates: Requirements 14.1**

### Property 43: Successful department assignment reflects in UI

*For any* successful department assignment API response, the displayed department in the UI should match the new department value.

**Validates: Requirements 14.2**

### Property 44: Successful department assignment adds history entry

*For any* successful department assignment, a new entry should appear in the ticket history with the department assignment action.

**Validates: Requirements 14.3**

### Property 45: Failed department assignment shows error and reverts

*For any* failed department assignment API request, an error message in Russian should be displayed and the department dropdown should revert to the previous value.

**Validates: Requirements 14.4**

### Property 46: Department dropdown disabled during update

*For any* department assignment API request in progress, the department dropdown should be disabled.

**Validates: Requirements 14.6**

### Property 47: Filters persist across navigation

*For any* filter state on AppealsList, navigating to AppealDetail and back should preserve the same filter state.

**Validates: Requirements 15.1, 15.2**

### Property 48: Filters restore from URL on page load

*For any* URL with filter query parameters, loading that URL should apply the filters specified in the parameters.

**Validates: Requirements 15.3**

### Property 49: Filters stored in session storage

*For any* filter state change, the filter values should be stored in the browser's session storage.

**Validates: Requirements 15.4**

### Property 50: Default filters applied when no stored state

*For any* page load with no URL parameters and no session storage, the default filter values (all/empty) should be applied.

**Validates: Requirements 15.5**

## Error Handling

### Client-Side Errors

1. **Network Failures**
   - Display user-friendly error message in Russian: "Не удалось загрузить данные. Проверьте подключение к интернету."
   - Re-enable all filter controls
   - Provide retry button
   - Log error details to console for debugging

2. **Invalid Filter Combinations**
   - Validate date ranges before sending API request
   - Show inline validation error: "Дата окончания не может быть раньше даты начала"
   - Prevent API call until validation passes

3. **API Response Errors**
   - Handle 400 Bad Request: Show specific validation error from API
   - Handle 401 Unauthorized: Redirect to login page
   - Handle 403 Forbidden: Show "Недостаточно прав доступа"
   - Handle 404 Not Found: Show "Данные не найдены"
   - Handle 500 Server Error: Show "Ошибка сервера. Попробуйте позже."

4. **Update Failures (Status/Department)**
   - Revert UI to previous state
   - Show error toast notification
   - Keep error visible for 5 seconds
   - Allow user to retry

### Edge Cases

1. **Empty Results**
   - Show message: "Список обращений пуст" or "Нет результатов по заданным фильтрам"
   - Suggest clearing filters if filters are active

2. **Slow Network**
   - Show loading indicator after 200ms delay (avoid flash for fast responses)
   - Show "Загрузка занимает больше времени, чем обычно..." after 5 seconds

3. **Concurrent Filter Changes**
   - Cancel previous API request when new filter is applied
   - Use AbortController to cancel in-flight requests
   - Only show results from the most recent request

4. **Invalid URL Parameters**
   - Validate and sanitize URL parameters on page load
   - Ignore invalid parameters
   - Apply defaults for invalid values

## Testing Strategy

### Unit Testing

**Focus Areas**:
- Filter state management logic (useFilters hook)
- Debounce functionality (useDebounce hook)
- URL parameter serialization/deserialization
- Date validation logic
- Localization string lookups
- Date formatting functions

**Example Unit Tests**:
```typescript
describe('useFilters', () => {
  it('should initialize filters from URL parameters', () => {
    // Test URL parsing
  });
  
  it('should update URL when filter changes', () => {
    // Test URL synchronization
  });
  
  it('should clear all filters', () => {
    // Test clear functionality
  });
});

describe('date validation', () => {
  it('should reject end date before start date', () => {
    // Test validation logic
  });
});

describe('localization', () => {
  it('should return Russian status labels', () => {
    expect(getStatusLabel('init')).toBe('Новое');
    expect(getStatusLabel('open')).toBe('В работе');
  });
});
```

### Property-Based Testing

**Configuration**:
- Use `fast-check` library for TypeScript/JavaScript
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number

**Property Test Examples**:

```typescript
import fc from 'fast-check';

// Feature: crm-filtering-search-localization, Property 1: Search filters by description content
describe('Property 1: Search filters by description content', () => {
  it('should return only tickets containing search text', () => {
    fc.assert(
      fc.property(
        fc.array(ticketArbitrary),
        fc.string({ minLength: 1, maxLength: 50 }),
        (tickets, searchQuery) => {
          const filtered = filterTicketsBySearch(tickets, searchQuery);
          return filtered.every(ticket => 
            ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: crm-filtering-search-localization, Property 5: Status filter returns only matching tickets
describe('Property 5: Status filter returns only matching tickets', () => {
  it('should return only tickets with selected status', () => {
    fc.assert(
      fc.property(
        fc.array(ticketArbitrary),
        fc.constantFrom('init', 'open', 'closed', 'rejected'),
        (tickets, status) => {
          const filtered = filterTicketsByStatus(tickets, status);
          return filtered.every(ticket => ticket.status === status);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: crm-filtering-search-localization, Property 12: Date range filter returns only tickets within range
describe('Property 12: Date range filter returns only tickets within range', () => {
  it('should return only tickets within date range', () => {
    fc.assert(
      fc.property(
        fc.array(ticketArbitrary),
        fc.date(),
        fc.date(),
        (tickets, date1, date2) => {
          const startDate = date1 < date2 ? date1 : date2;
          const endDate = date1 < date2 ? date2 : date1;
          
          const filtered = filterTicketsByDateRange(tickets, startDate, endDate);
          return filtered.every(ticket => {
            const createdAt = new Date(ticket.created_at);
            return createdAt >= startDate && createdAt <= endDate;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: crm-filtering-search-localization, Property 25: Filter state synchronizes with URL
describe('Property 25: Filter state synchronizes with URL', () => {
  it('should keep URL in sync with filter state', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary,
        (filterState) => {
          const url = serializeFiltersToURL(filterState);
          const parsed = parseFiltersFromURL(url);
          return deepEqual(parsed, filterState);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Arbitraries for Property Tests**:

```typescript
const ticketArbitrary = fc.record({
  id: fc.uuid(),
  status: fc.constantFrom('init', 'open', 'closed', 'rejected'),
  description: fc.string({ minLength: 10, maxLength: 200 }),
  category_id: fc.integer({ min: 1, max: 10 }),
  subcategory_id: fc.integer({ min: 1, max: 50 }),
  department_id: fc.option(fc.integer({ min: 1, max: 20 }), { nil: null }),
  created_at: fc.date().map(d => d.toISOString()),
});

const filterStateArbitrary = fc.record({
  search: fc.option(fc.string({ maxLength: 100 })),
  status: fc.option(fc.constantFrom('init', 'open', 'closed', 'rejected')),
  category: fc.option(fc.integer({ min: 1, max: 10 })),
  subcategory: fc.option(fc.integer({ min: 1, max: 50 })),
  department: fc.option(fc.integer({ min: 1, max: 20 })),
  startDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0])),
  endDate: fc.option(fc.date().map(d => d.toISOString().split('T')[0])),
});
```

### Integration Testing

**Focus Areas**:
- Filter interactions with API
- URL parameter handling across navigation
- Component integration (FilterBar + TicketList)
- Status/Department update flows

**Testing Tools**:
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking
- Playwright or Cypress for E2E tests

### Accessibility Testing

- Keyboard navigation through all filter controls
- Screen reader compatibility (ARIA labels)
- Focus management
- Color contrast for error messages

### Performance Testing

- Debounce effectiveness (measure API call frequency)
- Large dataset rendering (1000+ tickets)
- Filter application speed
- Memory leaks during repeated filtering

## Implementation Notes

### Technology Stack

- **React 18+**: Component framework
- **TypeScript**: Type safety
- **React Router v6**: Navigation and URL management
- **Axios**: HTTP client (already in use)
- **date-fns**: Date manipulation and formatting
- **fast-check**: Property-based testing
- **Vitest**: Unit testing framework
- **React Testing Library**: Component testing

### File Structure

```
frontend/src/
├── components/
│   ├── filters/
│   │   ├── FilterBar.tsx
│   │   ├── SearchInput.tsx
│   │   ├── StatusFilter.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SubcategoryFilter.tsx
│   │   ├── DepartmentFilter.tsx
│   │   ├── DateRangeFilter.tsx
│   │   └── ClearFiltersButton.tsx
│   └── ui/ (existing)
├── hooks/
│   ├── useFilters.ts
│   ├── useDebounce.ts
│   └── useURLParams.ts
├── lib/
│   ├── localization.ts
│   ├── dateUtils.ts
│   └── filterUtils.ts
├── api/
│   └── tickets.ts (enhanced)
└── pages/crm/ (enhanced)
```

### Performance Considerations

1. **Debouncing**: 300ms delay for search input prevents excessive API calls
2. **Request Cancellation**: Cancel previous requests when new filters applied
3. **Memoization**: Use React.memo for filter components to prevent unnecessary re-renders
4. **Lazy Loading**: Consider pagination for large result sets
5. **Caching**: Consider implementing client-side cache for filter options (categories, departments)

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge) - last 2 versions
- Mobile browsers (iOS Safari, Chrome Mobile)
- No IE11 support required

### Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- ARIA labels for all interactive elements
- Error messages associated with form controls
