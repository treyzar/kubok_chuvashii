# Requirements Document

## Introduction

This document specifies requirements for improving filtering, search functionality, and localization across CRM pages in a citizen appeals management system. The system currently has four main pages (Dashboard, AppealsList, AppealDetail, Monitoring) that load data from an API but lack comprehensive filtering, search capabilities, and complete Russian localization. This feature will enhance user experience by enabling efficient data discovery, proper filtering mechanisms, and ensuring all UI elements are properly localized to Russian.

## Glossary

- **System**: The CRM web application for managing citizen appeals
- **AppealsList_Page**: The page displaying a list of all citizen appeals
- **Monitoring_Page**: The page showing performance metrics and overdue tickets
- **Dashboard_Page**: The page displaying summary statistics and charts
- **AppealDetail_Page**: The page showing detailed information about a single appeal
- **Filter_Control**: A UI component that allows users to narrow down displayed data
- **Search_Input**: A text input field for searching through data
- **Status**: The current state of a ticket (init, open, closed, rejected)
- **Category**: The primary classification of an appeal
- **Subcategory**: The secondary classification within a category
- **Department**: The organizational unit responsible for handling an appeal
- **Date_Range**: A pair of start and end dates for filtering
- **Query_Parameter**: A URL parameter that stores filter state
- **Localization**: The process of adapting UI text to Russian language
- **Loading_State**: A visual indicator shown while data is being fetched

## Requirements

### Requirement 1: AppealsList Search Functionality

**User Story:** As a CRM operator, I want to search for appeals by ticket description or ID, so that I can quickly find specific appeals without scrolling through the entire list.

#### Acceptance Criteria

1. WHEN a user types text into the search input, THE System SHALL filter the displayed tickets to show only those whose description contains the search text
2. WHEN a user types a ticket ID into the search input, THE System SHALL filter the displayed tickets to show only the ticket matching that ID
3. WHEN the search input is empty, THE System SHALL display all tickets according to other active filters
4. WHEN a user types in the search input, THE System SHALL perform the search with a debounce delay of 300ms to avoid excessive API calls
5. THE System SHALL perform case-insensitive search matching

### Requirement 2: AppealsList Status Filter

**User Story:** As a CRM operator, I want to filter appeals by status, so that I can focus on tickets in specific states.

#### Acceptance Criteria

1. WHEN a user selects a status from the status filter dropdown, THE System SHALL display only tickets with that status
2. THE System SHALL provide filter options for all status values: init, open, closed, rejected
3. WHEN the "Все статусы" (All statuses) option is selected, THE System SHALL display tickets of all statuses
4. THE System SHALL display status labels in Russian: "Новое" for init, "В работе" for open, "Решено" for closed, "Отклонено" for rejected
5. WHEN a status filter is applied, THE System SHALL update the URL query parameters to reflect the selected status

### Requirement 3: AppealsList Category and Subcategory Filters

**User Story:** As a CRM operator, I want to filter appeals by category and subcategory, so that I can view tickets related to specific problem types.

#### Acceptance Criteria

1. WHEN a user selects a category from the category filter dropdown, THE System SHALL display only tickets belonging to that category
2. WHEN a category is selected, THE System SHALL populate the subcategory dropdown with subcategories belonging to the selected category
3. WHEN a subcategory is selected, THE System SHALL display only tickets belonging to that subcategory
4. WHEN the "Все категории" (All categories) option is selected, THE System SHALL display tickets of all categories
5. THE System SHALL load category and subcategory options from the API endpoint /api/v1/public/categories
6. WHEN category or subcategory filters are applied, THE System SHALL update the URL query parameters

### Requirement 4: AppealsList Department Filter

**User Story:** As a CRM operator, I want to filter appeals by department, so that I can view tickets assigned to specific organizational units.

#### Acceptance Criteria

1. WHEN a user selects a department from the department filter dropdown, THE System SHALL display only tickets assigned to that department
2. THE System SHALL include an option to show tickets that are not assigned to any department
3. WHEN the "Все департаменты" (All departments) option is selected, THE System SHALL display tickets from all departments
4. THE System SHALL load department options from available ticket data
5. WHEN a department filter is applied, THE System SHALL update the URL query parameters

### Requirement 5: AppealsList Date Range Filter

**User Story:** As a CRM operator, I want to filter appeals by date range, so that I can view tickets created within a specific time period.

#### Acceptance Criteria

1. WHEN a user selects a start date, THE System SHALL display only tickets created on or after that date
2. WHEN a user selects an end date, THE System SHALL display only tickets created on or before that date
3. WHEN both start and end dates are selected, THE System SHALL display only tickets created within that date range (inclusive)
4. THE System SHALL validate that the end date is not before the start date
5. WHEN date range filters are applied, THE System SHALL update the URL query parameters
6. THE System SHALL format date inputs using Russian locale (DD.MM.YYYY)

### Requirement 6: AppealsList Clear Filters Button

**User Story:** As a CRM operator, I want to clear all active filters with one click, so that I can quickly return to viewing all appeals.

#### Acceptance Criteria

1. WHEN a user clicks the clear filters button, THE System SHALL reset all filter controls to their default values
2. WHEN filters are cleared, THE System SHALL remove all filter-related query parameters from the URL
3. WHEN filters are cleared, THE System SHALL reload the ticket list with no filters applied
4. THE System SHALL display the clear filters button only when at least one filter is active
5. THE System SHALL label the clear filters button in Russian as "Очистить фильтры"

### Requirement 7: Monitoring Page Department Filter

**User Story:** As a CRM manager, I want to filter monitoring data by department, so that I can view performance metrics for specific organizational units.

#### Acceptance Criteria

1. WHEN a user selects a department from the department filter dropdown on the Monitoring page, THE System SHALL display KPI metrics filtered by that department
2. WHEN a department filter is applied, THE System SHALL display department efficiency data only for the selected department
3. WHEN a department filter is applied, THE System SHALL display overdue tickets only for the selected department
4. WHEN the "Все департаменты" (All departments) option is selected, THE System SHALL display data for all departments
5. THE System SHALL load department options from the API endpoint /api/v1/monitoring/departments

### Requirement 8: Monitoring Page Overdue Tickets Search

**User Story:** As a CRM manager, I want to search through overdue tickets, so that I can quickly find specific critical appeals.

#### Acceptance Criteria

1. WHEN a user types text into the overdue tickets search input, THE System SHALL filter the displayed overdue tickets to show only those whose description contains the search text
2. WHEN a user types a ticket ID into the overdue tickets search input, THE System SHALL filter the displayed overdue tickets to show only the ticket matching that ID
3. THE System SHALL perform case-insensitive search matching for overdue tickets
4. WHEN the search input is empty, THE System SHALL display all overdue tickets according to other active filters

### Requirement 9: Complete Russian Localization

**User Story:** As a Russian-speaking CRM user, I want all UI text to be in Russian, so that I can use the system without language barriers.

#### Acceptance Criteria

1. THE System SHALL display all button labels in Russian across all CRM pages
2. THE System SHALL display all form labels and placeholders in Russian across all CRM pages
3. THE System SHALL display all chart labels and axis titles in Russian on the Dashboard page
4. THE System SHALL display all tooltip text in Russian across all CRM pages
5. THE System SHALL display all error messages in Russian
6. THE System SHALL display all status labels in Russian: "Новое", "В работе", "Решено", "Отклонено"
7. THE System SHALL format all dates using Russian locale (DD.MM.YYYY HH:MM)
8. THE System SHALL display month names in Russian in charts and date pickers

### Requirement 10: URL Query Parameters for Filters

**User Story:** As a CRM operator, I want filter states to be stored in URL query parameters, so that I can share filtered views with colleagues via links.

#### Acceptance Criteria

1. WHEN a user applies any filter, THE System SHALL update the URL query parameters to reflect the filter state
2. WHEN a user navigates to a URL with query parameters, THE System SHALL apply the filters specified in those parameters
3. THE System SHALL preserve filter state when the user refreshes the page
4. THE System SHALL use descriptive parameter names: status, category, subcategory, department, start_date, end_date, search
5. WHEN a user clears filters, THE System SHALL remove the corresponding query parameters from the URL

### Requirement 11: Loading States for Filters

**User Story:** As a CRM user, I want to see loading indicators when filters are being applied, so that I know the system is processing my request.

#### Acceptance Criteria

1. WHEN a user applies a filter, THE System SHALL display a loading indicator while fetching filtered data
2. WHEN data is being loaded, THE System SHALL disable filter controls to prevent conflicting requests
3. WHEN data loading completes, THE System SHALL hide the loading indicator and re-enable filter controls
4. THE System SHALL display a loading spinner in the ticket list area during data fetch
5. IF a filter request fails, THEN THE System SHALL display an error message in Russian and re-enable filter controls

### Requirement 12: Responsive Filter Controls

**User Story:** As a CRM user on a mobile device, I want filter controls to be usable on small screens, so that I can filter data on any device.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE System SHALL stack filter controls vertically
2. WHEN the viewport width is less than 768px, THE System SHALL make filter dropdowns full-width
3. THE System SHALL ensure all filter controls are touch-friendly with minimum 44px touch targets
4. THE System SHALL ensure filter controls do not overflow the viewport on any screen size
5. WHEN on mobile devices, THE System SHALL provide a collapsible filter panel to save screen space

### Requirement 13: AppealDetail Status Update

**User Story:** As a CRM operator, I want to update the status of an appeal from the detail page, so that I can manage ticket workflow.

#### Acceptance Criteria

1. WHEN a user selects a new status from the status dropdown on AppealDetail page, THE System SHALL send an update request to the API
2. WHEN the status update succeeds, THE System SHALL display the updated status in the UI
3. WHEN the status update succeeds, THE System SHALL add an entry to the ticket history
4. IF the status update fails, THEN THE System SHALL display an error message in Russian and revert the dropdown to the previous value
5. THE System SHALL disable the status dropdown while an update request is in progress

### Requirement 14: AppealDetail Department Assignment

**User Story:** As a CRM operator, I want to assign an appeal to a department from the detail page, so that I can route tickets to the appropriate organizational unit.

#### Acceptance Criteria

1. WHEN a user selects a department from the department dropdown on AppealDetail page, THE System SHALL send an update request to the API
2. WHEN the department assignment succeeds, THE System SHALL display the updated department in the UI
3. WHEN the department assignment succeeds, THE System SHALL add an entry to the ticket history
4. IF the department assignment fails, THEN THE System SHALL display an error message in Russian and revert the dropdown to the previous value
5. THE System SHALL load department options from the API
6. THE System SHALL disable the department dropdown while an update request is in progress

### Requirement 15: Filter Persistence Across Navigation

**User Story:** As a CRM operator, I want my filter selections to persist when I navigate away and return to the AppealsList page, so that I don't have to reapply filters repeatedly.

#### Acceptance Criteria

1. WHEN a user navigates from AppealsList to AppealDetail and then back, THE System SHALL preserve the previously applied filters
2. WHEN a user navigates from AppealsList to another CRM page and then back, THE System SHALL restore filters from URL query parameters
3. THE System SHALL restore filter state from URL query parameters on page load
4. THE System SHALL maintain filter state in the browser's session storage as a fallback
5. WHEN no URL query parameters are present and no session storage exists, THE System SHALL apply default filter values
