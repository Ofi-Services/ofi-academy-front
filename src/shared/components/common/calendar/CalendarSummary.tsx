import React, { useState } from 'react';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { cn } from '@/shared/lib/utils';
import { MONTH_NAMES, DAY_NAMES, CALENDAR_GRID_SIZE } from './constants';
import { MonthSummary } from './MonthSummary';
import { 
  getCategoryIcon, 
  getDominantCategory, 
  getDateString, 
  isWeekend,
  calculateCompletionRate,
  isTrackOverdue,
} from './utils';
import { useGetMonthTrainingQuery } from './store/TrainingCalendarApi';
import type { 
  CalendarDayData, 
  TrainingCalendarProps 
} from './types';

/**
 * Training Calendar Component with RTK Query
 * Updated for Training Tracks with Nullable Fields Support
 */
const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ 
  userId,
  onTrackClick,
  onDateClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Fetch month data using RTK Query
  const { 
    data: monthSummary, 
    isLoading, 
    error,
    refetch 
  } = useGetMonthTrainingQuery({
    year: currentYear,
    month: currentMonth,
    userId,
  });

  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Generate calendar grid
  const generateCalendarDays = (): CalendarDayData[] => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date().toISOString().split('T')[0];

    const calendarDays: CalendarDayData[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = currentMonth - 1;
      const year = prevMonth < 0 ? currentYear - 1 : currentYear;
      const month = prevMonth < 0 ? 11 : prevMonth;
      const date = getDateString(year, month, day);

      calendarDays.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: date === today,
        isWeekend: isWeekend(date),
        summary: undefined,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = getDateString(currentYear, currentMonth, day);
      const daySummary = monthSummary?.dailySummaries[date];

      calendarDays.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: date === today,
        isWeekend: isWeekend(date),
        summary: daySummary,
      });
    }

    // Next month days to fill grid
    const remainingDays = CALENDAR_GRID_SIZE - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = currentMonth + 1;
      const year = nextMonth > 11 ? currentYear + 1 : currentYear;
      const month = nextMonth > 11 ? 0 : nextMonth;
      const date = getDateString(year, month, day);

      calendarDays.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: date === today,
        isWeekend: isWeekend(date),
        summary: undefined,
      });
    }

    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  const handleDateClick = (dayData: CalendarDayData) => {
    if (!dayData.isCurrentMonth) return;
    
    setSelectedDate(dayData.date);
    
    if (onDateClick) {
      onDateClick(dayData.date);
    }
  };

  // Get top categories for header display
  const topCategories = monthSummary?.categoriesBreakdown
    ? [...monthSummary.categoriesBreakdown]
        .sort((a, b) => b.totalTracks - a.totalTracks)
        .slice(0, 3)
    : [];

  // Handle error state
  const errorMessage = error 
    ? 'data' in error 
      ? (error.data as any)?.message || 'Failed to load training data'
      : 'Failed to load training data'
    : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-6 px-6 pt-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={isLoading}
            className="glass-card"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <h1 className="text-2xl font-bold text-foreground">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h1>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={isLoading}
            className="glass-card"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            disabled={isLoading}
            className="glass-card"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="glass-card"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>

          {monthSummary && !error && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {topCategories.map(cat => (
                <div key={cat.category} className="flex items-center gap-1">
                  {getCategoryIcon(cat.category, 'w-3 h-3')}
                  <span>{cat.category} ({cat.totalTracks})</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-primary" />
                <span className="font-medium">Total ({monthSummary.totalTracks})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="px-6 mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden px-6 pb-6">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            <div className="grid grid-cols-7 gap-1 h-full overflow-auto">
              {/* Day headers */}
              {DAY_NAMES.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border flex-shrink-0 sticky top-0 bg-background z-10"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((dayData, index) => {
                const dominantCategory = dayData.summary 
                  ? getDominantCategory(dayData.summary.tracksByCategory)
                  : null;
                
                const completionRate = dayData.summary
                  ? calculateCompletionRate(dayData.summary.completedTracks, dayData.summary.totalTracks)
                  : 0;

                const hasOverdueTracks = dayData.summary?.tracks.some(isTrackOverdue) || false;
                const hasDueDateTracks = dayData.summary?.tracks?.some(track => !!track.due_date);

                return (
                  <div
                    key={`${dayData.date}-${index}`}
                    className={cn(
                      "p-2 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors min-h-[80px] relative overflow-hidden",
                      !dayData.isCurrentMonth && "text-muted-foreground bg-muted/30",
                      dayData.isToday && "bg-primary/10 border-primary/30 font-semibold",
                      selectedDate === dayData.date && "bg-primary/20 border-primary ring-2 ring-primary/50",
                      dayData.isWeekend && dayData.isCurrentMonth && "bg-accent/20",
                      hasDueDateTracks && "bg-warning/20 border-warning/40 dark:bg-warning/15"
                    )}
                    onClick={() => handleDateClick(dayData)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-sm font-medium",
                        dayData.isToday && "text-primary font-bold"
                      )}>
                        {dayData.day}
                      </span>
                      {dayData.summary && dayData.summary.totalTracks > 0 && (
                        <Badge 
                          variant={hasOverdueTracks ? "destructive" : "secondary"} 
                          className="text-xs h-5"
                        >
                          {dayData.summary.totalTracks}
                        </Badge>
                      )}
                    </div>

                    {/* Category indicators */}
                    {dayData.isCurrentMonth && dayData.summary && (
                      <div className="space-y-1">
                        {Object.entries(dayData.summary.tracksByCategory)
                          .slice(0, 2)
                          .map(([category, count]) => (
                            <div key={category} className="flex items-center gap-1 text-xs">
                              {getCategoryIcon(category, 'w-3 h-3')}
                              <span className="truncate text-muted-foreground">{count}</span>
                            </div>
                          ))}
                        {dayData.summary.completedTracks > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            ✓ {dayData.summary.completedTracks}
                          </div>
                        )}
                        {completionRate > 0 && completionRate < 100 && (
                          <div className="text-xs text-blue-600 font-medium">
                            {completionRate}%
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="w-96 border-l border-border pl-6 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Monthly Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Training statistics for {MONTH_NAMES[currentMonth]}
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {monthSummary ? (
              <MonthSummary 
                summary={monthSummary} 
                isLoading={isLoading}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <p className="text-sm text-muted-foreground">No data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCalendar;