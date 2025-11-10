/**
 * Training Calendar Constants
 * Updated to support dynamic categories from backend
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export const CALENDAR_GRID_SIZE = 42; // 6 rows x 7 days

// Status display configuration (based on completion)
export const STATUS_CONFIG = {
  not_started: {
    label: 'Not Started',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
} as const;

// Platform color mappings (can be extended as needed)
export const PLATFORM_COLORS: Record<string, { color: string; bgColor: string }> = {
  Celonis: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  Udemy: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  Coursera: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  LinkedIn: {
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  },
  Pluralsight: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  Default: {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

// Category color mappings (dynamic - will use these as fallbacks)
// You can add more specific mappings for known categories
export const CATEGORY_COLORS: Record<string, { color: string; bgColor: string }> = {
  'DevOps': {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  'Frontend Development': {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  'Backend Development': {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  'Data Science': {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  'Machine Learning': {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  'Cloud Computing': {
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
  },
  'Security': {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
  'Database': {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  'Mobile Development': {
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  'Leadership': {
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  'Soft Skills': {
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  'Default': {
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
};

// Color palette for dynamic category assignment
const COLOR_PALETTE = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-green-600', bgColor: 'bg-green-100' },
  { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-red-600', bgColor: 'bg-red-100' },
  { color: 'text-sky-600', bgColor: 'bg-sky-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
];

/**
 * Get color configuration for a category
 * Uses predefined colors if available, otherwise assigns from palette
 */
export const getCategoryColor = (category: string): { color: string; bgColor: string } => {
  if (CATEGORY_COLORS[category]) {
    return CATEGORY_COLORS[category];
  }

  // Hash the category name to consistently assign a color
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % COLOR_PALETTE.length;
  return COLOR_PALETTE[colorIndex];
};

/**
 * Get color configuration for a platform
 */
export const getPlatformColor = (platform: string): { color: string; bgColor: string } => {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.Default;
};

/**
 * Get track status based on completion
 */
export const getTrackStatus = (
  completedCourses: number,
  totalCourses: number
): 'not_started' | 'in_progress' | 'completed' => {
  if (completedCourses === 0) return 'not_started';
  if (completedCourses === totalCourses) return 'completed';
  return 'in_progress';
};