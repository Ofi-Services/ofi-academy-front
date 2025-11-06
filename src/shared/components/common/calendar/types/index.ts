
// Types for Training Calendar

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  enrolled: boolean;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  instructor: string;
  category: string;
  duration: string; // e.g., "8 hours"
  thumbnail?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  scheduledDates?: string[]; // Array of ISO dates when lessons are scheduled
}

export interface DayTraining {
  date: string; // ISO date
  courses: TrainingCourse[];
  totalCourses: number;
  categories: {
    [category: string]: number; // category name -> count
  };
}

export interface MonthTrainingSummary {
  month: number; // 0-11
  year: number;
  totalCourses: number;
  totalEnrolled: number;
  averageProgress: number;
  categoriesBreakdown: {
    category: string;
    count: number;
    enrolled: number;
    avgProgress: number;
  }[];
  topInstructors: {
    name: string;
    coursesCount: number;
  }[];
  dailySummary: {
    day: number; // 1-31
    coursesCount: number;
    categories: {
      [category: string]: number;
    };
  }[];
}

// Props interfaces
export interface TrainingCardProps {
  course: TrainingCourse;
  compact?: boolean;
}

export interface MonthSummaryProps {
  summary: MonthTrainingSummary;
  isLoading: boolean;
}

export interface CategoryBadgeProps {
  category: string;
  count: number;
}

// API Response types (what backend should return)
export interface GetMonthTrainingRequest {
  month: number; // 0-11
  year: number;
}

export interface GetMonthTrainingResponse {
  success: boolean;
  data: MonthTrainingSummary;
}

export interface GetDayTrainingRequest {
  date: string; // ISO date
}

export interface GetDayTrainingResponse {
  success: boolean;
  data: DayTraining;
}
