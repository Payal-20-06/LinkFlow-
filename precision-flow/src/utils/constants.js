export const ROUTES = {
  HOME:            '/',
  LOGIN:           '/login',
  REGISTER:        '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD:  '/reset-password',
  DASHBOARD:       '/dashboard',
  URLS:            '/dashboard/urls',
  ANALYTICS:       '/dashboard/analytics',
  SETTINGS:        '/dashboard/settings',
  PROFILE:         '/dashboard/profile',
  NOT_FOUND:       '/404',
};

export const API_ENDPOINTS = {
  LOGIN:           '/auth/login',
  REGISTER:        '/auth/register',
  LOGOUT:          '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD:  '/auth/reset-password',
  PROFILE:         '/user/profile',
  URLS:            '/urls',
  URLS_CREATE:     '/urls/create',
  ANALYTICS_DASH:  '/analytics/dashboard',
};

export const MOCK_STATS = {
  totalUrls:   142,
  totalClicks: 28_341,
  avgCtr:      '64.2%',
  activeLinks: 98,
};

// Chart range options
export const DATE_RANGES = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year',  value: '1y' },
];

// Table page sizes
export const PAGE_SIZES = [10, 25, 50, 100];
