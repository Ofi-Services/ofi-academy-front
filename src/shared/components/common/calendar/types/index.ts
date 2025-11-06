/**
 * Training Calendar Types
 * Generic types for displaying courses, internal trainings, and other training events
 */

// Generic training event types
export enum TrainingEventType {
  COURSE = 'course',
  INTERNAL_TRAINING = 'internal_training',
  WORKSHOP = 'workshop',
  CERTIFICATION = 'certification',
  CONFERENCE = 'conference',
  MENTORING = 'mentoring',
  SELF_STUDY = 'self_study',
}

export enum TrainingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum TrainingCategory {
  TECHNICAL = 'technical',
  LEADERSHIP = 'leadership',
  SOFT_SKILLS = 'soft_skills',
  COMPLIANCE = 'compliance',
  PRODUCT = 'product',
  SALES = 'sales',
  CUSTOMER_SERVICE = 'customer_service',
  OTHER = 'other',
}

// Base training event
export interface TrainingEvent {
  id: string;
  title: string;
  type: TrainingEventType;
  category: TrainingCategory;
  status: TrainingStatus;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string for multi-day events
  duration?: number; // Duration in minutes
  progress?: number; // 0-100 for courses/certifications
  location?: string; // Physical location or 'online'
  instructor?: string;
  description?: string;
  tags?: string[];
}

// Daily summary for calendar view
export interface DayTrainingSummary {
  date: string; // ISO date string (YYYY-MM-DD)
  events: TrainingEvent[];
  totalEvents: number;
  eventsByType: Record<TrainingEventType, number>;
  eventsByCategory: Record<TrainingCategory, number>;
  completedEvents: number;
}

// Category statistics
export interface CategoryStats {
  category: TrainingCategory;
  totalEvents: number;
  completedEvents: number;
  inProgressEvents: number;
  totalHours: number;
  avgProgress: number; // Average progress percentage
}

// Type statistics
export interface TypeStats {
  type: TrainingEventType;
  count: number;
  completedCount: number;
  totalHours: number;
}

// Monthly summary
export interface MonthTrainingSummary {
  year: number;
  month: number; // 0-11
  totalEvents: number;
  completedEvents: number;
  inProgressEvents: number;
  notStartedEvents: number;
  totalHours: number;
  completedHours: number;
  categoriesBreakdown: CategoryStats[];
  typesBreakdown: TypeStats[];
  dailySummaries: Record<string, DayTrainingSummary>; // Keyed by date string
  upcomingDeadlines: TrainingEvent[];
}

// API Request/Response types
export interface GetMonthTrainingRequest {
  year: number;
  month: number; // 0-11
  userId?: string; // Optional if using authenticated user
}

export interface GetMonthTrainingResponse {
  success: boolean;
  data: MonthTrainingSummary;
  message?: string;
}

export interface GetDayTrainingRequest {
  date: string; // ISO date string
  userId?: string;
}

export interface GetDayTrainingResponse {
  success: boolean;
  data: DayTrainingSummary;
  message?: string;
}

// Component props
export interface TrainingCalendarProps {
  userId?: string;
  defaultView?: 'month' | 'week' | 'day';
  onEventClick?: (event: TrainingEvent) => void;
  onDateClick?: (date: string) => void;
}

export interface MonthSummaryProps {
  summary: MonthTrainingSummary;
  isLoading: boolean;
  onCategoryClick?: (category: TrainingCategory) => void;
  onTypeClick?: (type: TrainingEventType) => void;
}

export interface DayDetailProps {
  date: string;
  summary: DayTrainingSummary;
  isLoading: boolean;
  onEventClick?: (event: TrainingEvent) => void;
}

// Calendar day cell data
export interface CalendarDayData {
  day: number;
  date: string; // ISO date string
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  summary?: DayTrainingSummary;
}