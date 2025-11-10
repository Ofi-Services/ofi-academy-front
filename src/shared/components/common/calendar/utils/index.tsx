/**
 * Training Calendar Utilities
 * Updated for Training Tracks
 */

import {
  BookOpen,
  Code,
  GraduationCap,
  Laptop,
  Database,
  Cloud,
  Shield,
  Smartphone,
  TrendingUp,
  } from 'lucide-react';
import { TrainingTrack, DayTrainingSummary } from '../types';
import { getCategoryColor, getPlatformColor } from '../constants';

/**
 * Get icon component for a category (dynamic based on category name)
 */
export const getCategoryIcon = (category: string, className: string = 'w-4 h-4') => {
  const iconMap: Record<string, any> = {
    'DevOps': Cloud,
    'Frontend Development': Code,
    'Backend Development': Database,
    'Data Science': TrendingUp,
    'Machine Learning': TrendingUp,
    'Cloud Computing': Cloud,
    'Security': Shield,
    'Database': Database,
    'Mobile Development': Smartphone,
    'Leadership': GraduationCap,
    'Soft Skills': BookOpen,
  };

  const Icon = iconMap[category] || BookOpen;
  const config = getCategoryColor(category);

  return <Icon className={`${className} ${config.color}`} />;
};

/**
 * Get icon component for a platform
 */
export const getPlatformIcon = (platform: string, className: string = 'w-4 h-4') => {
  const iconMap: Record<string, any> = {
    'Celonis': Laptop,
    'Udemy': BookOpen,
    'Coursera': GraduationCap,
    'LinkedIn': Code,
    'Pluralsight': Code,
  };

  const Icon = iconMap[platform] || BookOpen;
  const config = getPlatformColor(platform);

  return <Icon className={`${className} ${config.color}`} />;
};

/**
 * Get the dominant category for a day based on track count
 */
export const getDominantCategory = (
  tracksByCategory: Record<string, number>
): string | null => {
  const entries = Object.entries(tracksByCategory);
  if (entries.length === 0) return null;

  return entries.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
};

/**
 * Get the dominant platform for a day based on track count
 */
export const getDominantPlatform = (
  tracksByPlatform: Record<string, number>
): string | null => {
  const entries = Object.entries(tracksByPlatform);
  if (entries.length === 0) return null;

  return entries.reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev))[0];
};

/**
 * Calculate completion percentage
 */
export const calculateCompletionPercentage = (
  completed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Calculate completion rate (for display)
 */
export const calculateCompletionRate = (
  completed: number,
  total: number
): number => {
  return calculateCompletionPercentage(completed, total);
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
  const day = new Date(date + 'T00:00:00').getDay();
  return day === 0 || day === 6;
};

/**
 * Get date string in ISO format (YYYY-MM-DD)
 */
export const getDateString = (year: number, month: number, day: number): string => {
  const date = new Date(year, month, day);
  return date.toISOString().split('T')[0];
};

/**
 * Parse ISO date string to date components
 */
export const parseDateString = (dateString: string): { year: number; month: number; day: number } => {
  const date = new Date(dateString + 'T00:00:00');
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
 * Sort day summaries by date
 */
export const sortDaySummaries = (summaries: DayTrainingSummary[]): DayTrainingSummary[] => {
  return [...summaries].sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Get category label (formatted nicely)
 */
export const getCategoryLabel = (category: string): string => {
  return category;
};

/**
 * Get platform label
 */
export const getPlatformLabel = (platform: string): string => {
  return platform;
};

/**
 * Format track progress as text
 */
export const formatTrackProgress = (track: TrainingTrack): string => {
  return `${track.completed_courses}/${track.total_courses} courses`;
};

/**
 * Check if track is completed
 */
export const isTrackCompleted = (track: TrainingTrack): boolean => {
  return track.completed_courses === track.total_courses;
};

/**
 * Check if track is in progress
 */
export const isTrackInProgress = (track: TrainingTrack): boolean => {
  return track.completed_courses > 0 && track.completed_courses < track.total_courses;
};

/**
 * Check if track is overdue
 */
export const isTrackOverdue = (track: TrainingTrack): boolean => {
  const dueDate = new Date(track.due_date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && !isTrackCompleted(track);
};

/**
 * Get days until due date
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format due date as relative string
 */
export const formatDueDateRelative = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);
  
  if (days < 0) {
    return `${Math.abs(days)} days overdue`;
  } else if (days === 0) {
    return 'Due today';
  } else if (days === 1) {
    return 'Due tomorrow';
  } else if (days <= 7) {
    return `Due in ${days} days`;
  } else {
    return new Date(dueDate + 'T00:00:00').toLocaleDateString();
  }
};

/**
 * Get status badge variant based on track status
 */
export const getStatusBadgeVariant = (
  track: TrainingTrack
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (isTrackCompleted(track)) return 'default';
  if (isTrackOverdue(track)) return 'destructive';
  if (isTrackInProgress(track)) return 'secondary';
  return 'outline';
};