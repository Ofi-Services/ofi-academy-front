/**
 * Training Calendar Types - Updated for Training Tracks with Nullable Fields
 */

// ============================================================================
// Training Track Types (from Backend)
// ============================================================================

export interface TrainingTrack {
  id: number;
  title: string;
  platform: string;
  link?: string | null;
  category: string | null;
  due_date: string | null; // ISO date string (YYYY-MM-DD)
  completion_date?: string | null; // ISO date string (YYYY-MM-DD)
  total_courses: number;
  completed_courses: number;
}

// ============================================================================
// Calendar Display Types
// ============================================================================

export interface DayTrainingSummary {
  date: string;
  totalTracks: number;
  completedTracks: number;
  inProgressTracks: number;
  totalCourses: number;
  completedCourses: number;
  tracksByCategory: Record<string, number>;
  tracksByPlatform: Record<string, number>;
  tracks: TrainingTrack[];
}

export interface CategoryBreakdown {
  category: string;
  totalTracks: number;
  completedTracks: number;
  totalCourses: number;
  completedCourses: number;
}

export interface PlatformBreakdown {
  platform: string;
  totalTracks: number;
  completedTracks: number;
  totalCourses: number;
  completedCourses: number;
}

export interface MonthTrainingSummary {
  year: number;
  month: number;
  totalTracks: number;
  completedTracks: number;
  inProgressTracks: number;
  totalCourses: number;
  completedCourses: number;
  dailySummaries: Record<string, DayTrainingSummary>;
  categoriesBreakdown: CategoryBreakdown[];
  platformsBreakdown: PlatformBreakdown[];
  upcomingDeadlines: TrainingTrack[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface TrainingCalendarProps {
  userId?: string;
  onTrackClick?: (track: TrainingTrack) => void;
  onDateClick?: (date: string) => void;
}

export interface CalendarDayData {
  day: number;
  date: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  summary?: DayTrainingSummary;
}

export interface MonthSummaryProps {
  summary: MonthTrainingSummary;
  isLoading?: boolean;
  onCategoryClick?: (category: string) => void;
  onPlatformClick?: (platform: string) => void;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetCalendarRequest {
  year?: number;
  month?: number;
  userId?: string;
}

export interface GetCalendarResponse {
  data: TrainingTrack[];
  success: boolean;
  message?: string;
}