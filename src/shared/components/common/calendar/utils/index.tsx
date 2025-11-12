/**
 * Training Calendar Utility Functions
 * Updated to handle nullable fields
 */

import { 
  BookOpen, 
  Code, 
  Briefcase, 
  Users, 
  Target,
  Globe,
  Laptop,
  Award,
} from 'lucide-react';
import { TrainingTrack } from '../types';

// ============================================================================
// Constants
// ============================================================================

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CALENDAR_GRID_SIZE = 42; // 6 weeks * 7 days

// ============================================================================
// Category Utilities
// ============================================================================

/**
 * Get icon component for a category (handles null categories)
 */
export const getCategoryIcon = (
  category: string | null, 
  className?: string
)=> {
  const iconProps = { className };
  
  // Handle null or undefined category
  if (!category) {
    return <Target {...iconProps} />;
  }
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('technical') || categoryLower.includes('tech')) {
    return <Code {...iconProps} />;
  }
  if (categoryLower.includes('business') || categoryLower.includes('management')) {
    return <Briefcase {...iconProps} />;
  }
  if (categoryLower.includes('leadership') || categoryLower.includes('soft')) {
    return <Users {...iconProps} />;
  }
  if (categoryLower.includes('certification') || categoryLower.includes('cert')) {
    return <Award {...iconProps} />;
  }
  if (categoryLower.includes('language') || categoryLower.includes('communication')) {
    return <Globe {...iconProps} />;
  }
  
  return <BookOpen {...iconProps} />;
};

/**
 * Get display label for a category (handles null categories)
 */
export const getCategoryLabel = (category: string | null): string => {
  if (!category) return 'Uncategorized';
  
  // Capitalize first letter of each word
  return category
    .split(/[-_\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get the dominant category from a category breakdown
 */
export const getDominantCategory = (
  tracksByCategory: Record<string, number>
): string | null => {
  const entries = Object.entries(tracksByCategory);
  if (entries.length === 0) return null;
  
  return entries.reduce((max, [category, count]) => 
    count > (tracksByCategory[max] || 0) ? category : max
  , entries[0][0]);
};

// ============================================================================
// Platform Utilities
// ============================================================================

/**
 * Get icon component for a platform
 */
export const getPlatformIcon = (
  platform: string, 
  className?: string
) => {
  const iconProps = { className };
  
  const platformLower = platform.toLowerCase();
  
  if (platformLower.includes('udemy') || platformLower.includes('coursera') || platformLower.includes('pluralsight')) {
    return <Laptop {...iconProps} />;
  }
  if (platformLower.includes('linkedin')) {
    return <Users {...iconProps} />;
  }
  
  return <Globe {...iconProps} />;
};

/**
 * Get display label for a platform
 */
export const getPlatformLabel = (platform: string): string => {
  // Keep original casing for known platforms
  const knownPlatforms: Record<string, string> = {
    'linkedin': 'LinkedIn Learning',
    'udemy': 'Udemy',
    'coursera': 'Coursera',
    'pluralsight': 'Pluralsight',
    'edx': 'edX',
  };
  
  const platformLower = platform.toLowerCase();
  if (knownPlatforms[platformLower]) {
    return knownPlatforms[platformLower];
  }
  
  // Capitalize first letter
  return platform.charAt(0).toUpperCase() + platform.slice(1);
};

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Get date string in YYYY-MM-DD format
 */
export const getDateString = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

/**
 * Check if a date is a weekend
 */
export const isWeekend = (dateString: string): boolean => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Check if a track is overdue (handles null due_date)
 */
export const isTrackOverdue = (track: TrainingTrack): boolean => {
  // If no due date, it can't be overdue
  if (!track.due_date) return false;
  
  // If already completed, not overdue
  if (track.completed_courses >= track.total_courses) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(track.due_date);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
};

/**
 * Format due date as relative time (handles null due_date)
 */
export const formatDueDateRelative = (dueDate: string | null): string => {
  if (!dueDate) return 'No due date';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Due tomorrow';
  }
  if (diffDays <= 7) {
    return `Due in ${diffDays} days`;
  }
  if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Due in ${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  
  const months = Math.floor(diffDays / 30);
  return `Due in ${months} month${months !== 1 ? 's' : ''}`;
};

/**
 * Format completion date as readable string (handles null completion_date)
 */
export const formatCompletionDate = (completionDate: string | null): string => {
  if (!completionDate) return 'Not completed';
  
  const date = new Date(completionDate);
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
};

// ============================================================================
// Progress Utilities
// ============================================================================

/**
 * Calculate completion rate as percentage
 */
export const calculateCompletionRate = (
  completed: number, 
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get progress status text
 */
export const getProgressStatus = (
  completedCourses: number,
  totalCourses: number
): string => {
  if (completedCourses === 0) return 'Not started';
  if (completedCourses === totalCourses) return 'Completed';
  return 'In progress';
};

/**
 * Get progress color based on completion rate
 */
export const getProgressColor = (completionRate: number): string => {
  if (completionRate === 100) return 'text-green-600';
  if (completionRate >= 50) return 'text-blue-600';
  if (completionRate > 0) return 'text-amber-600';
  return 'text-muted-foreground';
};