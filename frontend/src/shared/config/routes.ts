export const ROUTES = {
  PUBLIC_FORM: '/',
  CRM_LOGIN: '/crm/login',
  CRM: '/crm',
  CRM_DASHBOARD: '/crm/dashboard',
  CRM_APPEALS: '/crm/appeals',
  CRM_APPEAL_DETAIL: (id: number | string) => `/crm/appeals/${id}`,
  CRM_MONITORING: '/crm/monitoring',
  CRM_HEATMAP: '/crm/heatmap',
  CRM_ADMIN: '/crm/admin',
} as const
