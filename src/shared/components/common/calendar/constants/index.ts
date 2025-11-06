/**
 * Training Calendar Constants
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

// Category display configuration
export const CATEGORY_CONFIG = {
  technical: {
    label: 'Technical',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300',
  },
  leadership: {
    label: 'Leadership',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-300',
  },
  soft_skills: {
    label: 'Soft Skills',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300',
  },
  compliance: {
    label: 'Compliance',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
  },
  product: {
    label: 'Product',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-300',
  },
  sales: {
    label: 'Sales',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-300',
  },
  customer_service: {
    label: 'Customer Service',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-300',
  },
  other: {
    label: 'Other',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
} as const;

// Event type display configuration
export const EVENT_TYPE_CONFIG = {
  course: {
    label: 'Course',
    color: 'text-blue-600',
    icon: 'BookOpen',
  },
  internal_training: {
    label: 'Internal Training',
    color: 'text-purple-600',
    icon: 'Users',
  },
  workshop: {
    label: 'Workshop',
    color: 'text-green-600',
    icon: 'Wrench',
  },
  certification: {
    label: 'Certification',
    color: 'text-yellow-600',
    icon: 'Award',
  },
  conference: {
    label: 'Conference',
    color: 'text-red-600',
    icon: 'Presentation',
  },
  mentoring: {
    label: 'Mentoring',
    color: 'text-indigo-600',
    icon: 'UserCheck',
  },
  self_study: {
    label: 'Self Study',
    color: 'text-cyan-600',
    icon: 'Book',
  },
} as const;

// Status display configuration
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
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  overdue: {
    label: 'Overdue',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
} as const;