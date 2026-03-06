# Implementation Plan: CRM Filtering, Search, and Localization

## Overview

This implementation plan breaks down the feature into incremental coding tasks that build upon each other. The approach follows this sequence:

1. Create shared utilities and hooks for filter management
2. Implement localization infrastructure
3. Add filtering and search to AppealsList page
4. Enhance Monitoring page with filters
5. Localize Dashboard and AppealDetail pages
6. Add URL state management and persistence
7. Implement responsive design and loading states
8. Add property-based tests for correctness validation

Each task includes specific requirements references for traceability.

## Tasks

- [x] 1. Set up localization infrastructure
  - Create localization strings file with all Russian translations
  - Implement date formatting utilities using Russian locale
  - Create helper functions for status label mapping
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ]* 1.1 Write property tests for localization
  - **Property 23: All UI text elements are in Russian**
  - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
  - **Property 24: Month names are in Russian**
  - **Validates: Requirements 9.8**
  - **Property 14: Date formatting uses Russian locale**
  - **Validates: Requirements 5.6, 9.7**

- [ ] 2. Create core filter hooks and utilities
  - [ ] 2.1 Implement useDebounce hook
    - Create hook that debounces value changes with configurable delay
    - Add cleanup on unmount
    - _Requirements: 1.4_
  
  - [ ]* 2.2 Write property test for debounce
    - **Property 4: Search debouncing prevents excessive API calls**
    - **Validates: Requirements 1.4**
  
  - [ ] 2.3 Implement useURLParams hook
    - Create hook to read and write URL query parameters
    - Add serialization/deserialization for filter values
    - Handle parameter validation and sanitization
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 2.4 Write property tests for URL parameter handling
    - **Property 25: Filter state synchronizes with URL**
    - **Validates: Requirements 10.1, 10.2**
    - **Property 26: Filter state persists across page refresh**
    - **Validates: Requirements 10.3**
    - **Property 27: Clearing filters removes URL parameters**
    - **Validates: Requirements 10.5**
  
  - [ ] 2.5 Implement useFilters hook
    - Create hook to manage filter state
    - Integrate with useURLParams for URL synchronization
    - Add session storage fallback
    - Implement hasActiveFilters helper
    - _Requirements: 10.1, 10.2, 10.3, 15.3, 15.4, 15.5_
  
  - [ ]* 2.6 Write property tests for filter state management
    - **Property 48: Filters restore from URL on page load**
    - **Validates: Requirements 15.3**
    - **Property 49: Filters stored in session storage**
    - **Validates: Requirements 15.4**
    - **Property 50: Default filters applied when no stored state**
    - **Validates: Requirements 15.5**

- [ ] 3. Checkpoint - Verify hooks and utilities
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create filter UI components
  - [ ] 4.1 Create SearchInput component
    - Implement text input with search icon and clear button
    - Add proper ARIA labels for accessibility
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ] 4.2 Create StatusFilter component
    - Implement dropdown with all status options
    - Use localized status labels
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ] 4.3 Create CategoryFilter and SubcategoryFilter components
    - Implement category dropdown that loads from API
    - Implement subcategory dropdown that updates based on category selection
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 4.4 Create DepartmentFilter component
    - Implement dropdown with department options
    - Include "not assigned" option
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 4.5 Create DateRangeFilter component
    - Implement start and end date inputs
    - Add date validation (end >= start)
    - Use Russian locale formatting
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 4.6 Write property tests for date validation
    - **Property 13: Date validation prevents invalid ranges**
    - **Validates: Requirements 5.4**
  
  - [ ] 4.7 Create ClearFiltersButton component
    - Implement button that resets all filters
    - Show/hide based on active filter state
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Implement FilterBar component for AppealsList
  - [ ] 5.1 Create FilterBar component structure
    - Compose all filter components into unified bar
    - Implement responsive grid layout
    - Wire up filter change handlers
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_
  
  - [ ] 5.2 Add loading states to FilterBar
    - Disable controls during data fetch
    - Show loading spinner
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ]* 5.3 Write property tests for loading states
    - **Property 28: Loading indicator appears during data fetch**
    - **Validates: Requirements 11.1**
    - **Property 29: Filter controls disabled during loading**
    - **Validates: Requirements 11.2**
    - **Property 30: Loading indicator disappears after fetch completes**
    - **Validates: Requirements 11.3**

- [ ] 6. Enhance AppealsList page with filtering
  - [ ] 6.1 Integrate FilterBar into AppealsList
    - Add FilterBar component to page
    - Connect filters to useFilters hook
    - Update fetchTickets API call with filter parameters
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  
  - [ ] 6.2 Implement search functionality
    - Connect search input to debounced API calls
    - Handle search by description and ID
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [ ]* 6.3 Write property tests for search functionality
    - **Property 1: Search filters by description content**
    - **Validates: Requirements 1.1, 1.5**
    - **Property 2: Search by ID returns exact match**
    - **Validates: Requirements 1.2**
    - **Property 3: Empty search returns unfiltered results**
    - **Validates: Requirements 1.3**
  
  - [ ] 6.3 Implement status filtering
    - Connect status filter to API calls
    - Update URL parameters on status change
    - _Requirements: 2.1, 2.5_
  
  - [ ]* 6.4 Write property tests for status filtering
    - **Property 5: Status filter returns only matching tickets**
    - **Validates: Requirements 2.1**
  
  - [ ] 6.5 Implement category and subcategory filtering
    - Connect category/subcategory filters to API calls
    - Implement cascading subcategory logic
    - Update URL parameters
    - _Requirements: 3.1, 3.2, 3.3, 3.6_
  
  - [ ]* 6.6 Write property tests for category filtering
    - **Property 6: Category filter returns only matching tickets**
    - **Validates: Requirements 3.1**
    - **Property 7: Subcategory dropdown contains only related subcategories**
    - **Validates: Requirements 3.2**
    - **Property 8: Subcategory filter returns only matching tickets**
    - **Validates: Requirements 3.3**
  
  - [ ] 6.7 Implement department filtering
    - Connect department filter to API calls
    - Update URL parameters
    - _Requirements: 4.1, 4.5_
  
  - [ ]* 6.8 Write property tests for department filtering
    - **Property 9: Department filter returns only matching tickets**
    - **Validates: Requirements 4.1**
  
  - [ ] 6.9 Implement date range filtering
    - Connect date range filter to API calls
    - Update URL parameters
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  
  - [ ]* 6.10 Write property tests for date filtering
    - **Property 10: Start date filter returns only tickets on or after date**
    - **Validates: Requirements 5.1**
    - **Property 11: End date filter returns only tickets on or before date**
    - **Validates: Requirements 5.2**
    - **Property 12: Date range filter returns only tickets within range**
    - **Validates: Requirements 5.3**
  
  - [ ] 6.11 Implement clear filters functionality
    - Connect clear button to filter reset logic
    - Update URL and reload data
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ]* 6.12 Write property tests for clear filters
    - **Property 15: Clear filters resets all controls to defaults**
    - **Validates: Requirements 6.1**
    - **Property 16: Clear filters removes URL parameters**
    - **Validates: Requirements 6.2**
    - **Property 17: Clear filters shows all tickets**
    - **Validates: Requirements 6.3**
    - **Property 18: Clear button visibility matches filter state**
    - **Validates: Requirements 6.4**

- [ ] 7. Checkpoint - Verify AppealsList filtering
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Enhance API functions
  - [ ] 8.1 Update fetchTickets function
    - Add all filter parameters to API call
    - Implement request cancellation with AbortController
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  
  - [ ] 8.2 Create updateTicketStatus function
    - Implement API call to update ticket status
    - Add error handling
    - _Requirements: 13.1_
  
  - [ ] 8.3 Create updateTicketDepartment function
    - Implement API call to update ticket department
    - Add error handling
    - _Requirements: 14.1_
  
  - [ ] 8.4 Update getOverdueTickets function
    - Add search parameter support
    - _Requirements: 8.1, 8.2_

- [ ] 9. Enhance Monitoring page
  - [ ] 9.1 Create MonitoringFilters component
    - Implement period filter dropdown
    - Implement department filter dropdown
    - Implement overdue search input
    - _Requirements: 7.1, 8.1_
  
  - [ ] 9.2 Integrate filters into Monitoring page
    - Connect filters to API calls
    - Update KPI, department efficiency, and overdue tickets based on filters
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 9.3 Write property tests for Monitoring filters
    - **Property 19: Monitoring department filter affects all data**
    - **Validates: Requirements 7.1, 7.2, 7.3**
    - **Property 20: Overdue search filters by description**
    - **Validates: Requirements 8.1, 8.3**
    - **Property 21: Overdue search by ID returns exact match**
    - **Validates: Requirements 8.2**
    - **Property 22: Empty overdue search returns all overdue tickets**
    - **Validates: Requirements 8.4**
  
  - [ ] 9.4 Localize all Monitoring page text
    - Replace all English text with Russian translations
    - Update chart labels and tooltips
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 10. Localize Dashboard page
  - Replace all English text with Russian translations
  - Update chart labels, axis titles, and tooltips
  - Update stat card labels
  - Ensure date formatting uses Russian locale
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7, 9.8_

- [ ] 11. Enhance AppealDetail page
  - [ ] 11.1 Implement status update functionality
    - Connect status dropdown to updateTicketStatus API
    - Add loading state during update
    - Show success/error feedback
    - Update history on success
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ]* 11.2 Write property tests for status updates
    - **Property 37: Status update triggers API call**
    - **Validates: Requirements 13.1**
    - **Property 38: Successful status update reflects in UI**
    - **Validates: Requirements 13.2**
    - **Property 39: Successful status update adds history entry**
    - **Validates: Requirements 13.3**
    - **Property 40: Failed status update shows error and reverts**
    - **Validates: Requirements 13.4**
    - **Property 41: Status dropdown disabled during update**
    - **Validates: Requirements 13.5**
  
  - [ ] 11.3 Implement department assignment functionality
    - Connect department dropdown to updateTicketDepartment API
    - Add loading state during update
    - Show success/error feedback
    - Update history on success
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.6_
  
  - [ ]* 11.4 Write property tests for department assignments
    - **Property 42: Department assignment triggers API call**
    - **Validates: Requirements 14.1**
    - **Property 43: Successful department assignment reflects in UI**
    - **Validates: Requirements 14.2**
    - **Property 44: Successful department assignment adds history entry**
    - **Validates: Requirements 14.3**
    - **Property 45: Failed department assignment shows error and reverts**
    - **Validates: Requirements 14.4**
    - **Property 46: Department dropdown disabled during update**
    - **Validates: Requirements 14.6**
  
  - [ ] 11.5 Localize all AppealDetail page text
    - Replace all English text with Russian translations
    - Update button labels, form labels, and tooltips
    - _Requirements: 9.1, 9.2, 9.4_

- [ ] 12. Checkpoint - Verify all pages are functional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement responsive design
  - [ ] 13.1 Add mobile-responsive styles to FilterBar
    - Implement vertical stacking for mobile viewports
    - Make dropdowns full-width on mobile
    - Ensure minimum touch target sizes (44px)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [ ] 13.2 Add collapsible filter panel for mobile
    - Implement expand/collapse functionality
    - Add toggle button
    - Save panel state in local storage
    - _Requirements: 12.5_
  
  - [ ]* 13.3 Write property tests for responsive design
    - **Property 32: Mobile viewport stacks filters vertically**
    - **Validates: Requirements 12.1**
    - **Property 33: Mobile viewport makes dropdowns full-width**
    - **Validates: Requirements 12.2**
    - **Property 34: Touch targets meet minimum size**
    - **Validates: Requirements 12.3**
    - **Property 35: Filter controls fit within viewport**
    - **Validates: Requirements 12.4**
    - **Property 36: Mobile devices show collapsible filter panel**
    - **Validates: Requirements 12.5**
  
  - [ ] 13.4 Test responsive design on all pages
    - Verify AppealsList, Monitoring, Dashboard, AppealDetail
    - Test on various viewport sizes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 14. Implement error handling
  - [ ] 14.1 Add error handling to filter API calls
    - Implement error message display in Russian
    - Re-enable controls on error
    - Add retry functionality
    - _Requirements: 11.5_
  
  - [ ]* 14.2 Write property test for error handling
    - **Property 31: Failed requests show error and re-enable controls**
    - **Validates: Requirements 11.5**
  
  - [ ] 14.2 Add error handling to status/department updates
    - Show error toast notifications
    - Revert UI on failure
    - _Requirements: 13.4, 14.4_
  
  - [ ] 14.3 Handle edge cases
    - Empty results messaging
    - Slow network indicators
    - Invalid URL parameters
    - _Requirements: 9.5_

- [ ] 15. Implement filter persistence across navigation
  - [ ] 15.1 Add navigation persistence logic
    - Ensure filters persist when navigating to detail and back
    - Use URL parameters as source of truth
    - _Requirements: 15.1, 15.2_
  
  - [ ]* 15.2 Write property tests for filter persistence
    - **Property 47: Filters persist across navigation**
    - **Validates: Requirements 15.1, 15.2**

- [ ] 16. Final integration and testing
  - [ ] 16.1 Verify all localization is complete
    - Check all pages for any remaining English text
    - Verify date formatting across all pages
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_
  
  - [ ] 16.2 Verify URL state management works correctly
    - Test sharing filtered URLs
    - Test page refresh with filters
    - Test browser back/forward buttons
    - _Requirements: 10.1, 10.2, 10.3, 10.5_
  
  - [ ]* 16.3 Run all property-based tests
    - Execute full test suite with 100+ iterations per property
    - Verify all 50 properties pass
    - Fix any failures discovered

- [ ] 17. Final checkpoint - Complete feature verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The implementation follows an incremental approach, building from utilities up to full page integration
- All localization must be complete before considering the feature done
- URL state management is critical for shareable filtered views
