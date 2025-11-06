export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CALENDAR_GRID_SIZE = 42; // 6 weeks * 7 days

// Category colors for training tracks
export const CATEGORY_COLORS: { [key: string]: string } = {
  "Frontend Development": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Backend Development": "bg-green-500/10 text-green-600 border-green-500/20",
  "Data Science": "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "Design": "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "DevOps": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Project Management": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "default": "bg-gray-500/10 text-gray-600 border-gray-500/20"
};

// Difficulty colors
export const DIFFICULTY_COLORS: { [key: string]: string } = {
  "beginner": "bg-green-500/10 text-green-600",
  "intermediate": "bg-yellow-500/10 text-yellow-600",
  "advanced": "bg-red-500/10 text-red-600"
};
