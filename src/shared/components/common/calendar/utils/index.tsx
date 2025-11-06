
import { BookOpen, Code, Database, Palette, Server, Briefcase } from "lucide-react";
import { CATEGORY_COLORS, DIFFICULTY_COLORS } from '../constants';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Frontend Development':
      return <Code className="w-4 h-4" />;
    case 'Backend Development':
      return <Server className="w-4 h-4" />;
    case 'Data Science':
      return <Database className="w-4 h-4" />;
    case 'Design':
      return <Palette className="w-4 h-4" />;
    case 'DevOps':
      return <Server className="w-4 h-4" />;
    case 'Project Management':
      return <Briefcase className="w-4 h-4" />;
    default:
      return <BookOpen className="w-4 h-4" />;
  }
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
};

export const getDifficultyColor = (difficulty: string): string => {
  return DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.beginner;
};

export const formatDifficulty = (difficulty: string): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export const getProgressColor = (progress: number): string => {
  if (progress === 0) return 'bg-gray-200';
  if (progress < 25) return 'bg-red-500';
  if (progress < 50) return 'bg-orange-500';
  if (progress < 75) return 'bg-yellow-500';
  if (progress < 100) return 'bg-blue-500';
  return 'bg-green-500';
};

export const getProgressLabel = (progress: number): string => {
  if (progress === 0) return 'Not Started';
  if (progress === 100) return 'Completed';
  return `${progress}% Complete`;
};

// Get dominant category for a day (most courses)
export const getDominantCategory = (categories: { [key: string]: number }): string | null => {
  const entries = Object.entries(categories);
  if (entries.length === 0) return null;
  
  const sorted = entries.sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
};
