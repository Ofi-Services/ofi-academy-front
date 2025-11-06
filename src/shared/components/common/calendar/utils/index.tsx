/**
 * Training Calendar Utilities
 */

import {
  BookOpen,
  Users,
  Wrench,
  Award,
  Presentation,
  UserCheck,
  Book,
  Code,
  Heart,
  Shield,
  Package,
  TrendingUp,
  Headphones,
  MoreHorizontal,
} from 'lucide-react';
import { TrainingCategory, TrainingEventType, DayTrainingSummary } from '../types';
import { CATEGORY_CONFIG, EVENT_TYPE_CONFIG } from '../constants';

/**
 * Get icon component for a training category
 */
export const getCategoryIcon = (category: TrainingCategory, className: string = 'w-4 h-4') => {
  const iconMap = {
    technical: Code,
    leadership: Users,
    soft_skills: Heart,
    compliance: Shield,
    product: Package,
    sales: TrendingUp,
    customer_service: Headphones,
    other: MoreHorizontal,
  };

  const Icon = iconMap[category] || MoreHorizontal;
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;

  return <Icon className={`${className} ${config.color}`} />;
};

/**
 * Get icon component for a training event type
 */
export const getEventTypeIcon = (type: TrainingEventType, className: string = 'w-4 h-4') => {
  const iconMap = {
    course: BookOpen,
    internal_training: Users,
    workshop: Wrench,
    certification: Award,
    conference: Presentation,
    mentoring: UserCheck,
    self_study: Book,
  };

  const Icon = iconMap[type] || BookOpen;
  const config = EVENT_TYPE_CONFIG[type] || EVENT_TYPE_CONFIG.course;

  return <Icon className={`${className} ${config.color}`} />;
};

/**
 * Get the dominant category for a day based on event count
 */
export const getDominantCategory = (
  eventsByCategory: Record<TrainingCategory, number>
): TrainingCategory | null => {
  const entries = Object.entries(eventsByCategory) as [TrainingCategory, number][];
  if (entries.length === 0) return null;

  return entries.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
};

/**
 * Get the dominant event type for a day based on event count
 */
export const getDominantEventType = (
  eventsByType: Record<TrainingEventType, number>
): TrainingEventType | null => {
  const entries = Object.entries(eventsByType) as [TrainingEventType, number][];
  if (entries.length === 0) return null;

  return entries.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
};

/**
 * Format duration from minutes to human-readable string
 */
export const formatDuration = (minutes?: number): string => {
  if (!minutes) return '—';
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Calculate total hours from minutes
 */
export const minutesToHours = (minutes: number): number => {
  return Math.round((minutes / 60) * 10) / 10;
};

/**
 * Check if a date is today
 */
export const isToday = (date: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
};

/**
 * Check if a date is a weekend
 */
export const isWeekend = (date: string): boolean => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

/**
 * Get date string in ISO format (YYYY-MM-DD)
 */
export const getDateString = (year: number, month: number, day: number): string => {
  return new Date(year, month, day).toISOString().split('T')[0];
};

/**
 * Parse ISO date string to date components
 */
export const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
};

/**
 * Get color class for progress percentage
 */
export const getProgressColor = (progress: number): string => {
  if (progress === 100) return 'text-green-600';
  if (progress >= 75) return 'text-blue-600';
  if (progress >= 50) return 'text-yellow-600';
  if (progress >= 25) return 'text-orange-600';
  return 'text-red-600';
};

/**
 * Calculate completion rate
 */
export const calculateCompletionRate = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Sort day summaries by date
 */
export const sortDaySummaries = (summaries: DayTrainingSummary[]): DayTrainingSummary[] => {
  return [...summaries].sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get category label
 */
export const getCategoryLabel = (category: TrainingCategory): string => {
  return CATEGORY_CONFIG[category]?.label || category;
};

/**
 * Get event type label
 */
export const getEventTypeLabel = (type: TrainingEventType): string => {
  return EVENT_TYPE_CONFIG[type]?.label || type;
};