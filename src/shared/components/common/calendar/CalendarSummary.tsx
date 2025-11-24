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
import { MonthSummary } from './components/MonthSummary';
import { DayHoverCard } from './components/DayHoverCard';
import { 
  getCategoryIcon, 
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
 * Protected against string overflow
 * NOW WITH HOVER CARDS!
 */
const TrainingCalendar: React.FC<TrainingCalendarProps> = ({ 
  userId,
  //onTrackClick,
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
      <div className="flex-shrink-0 flex items-center justify-between mb-6 px-6 pt-6 gap-4 min-w-0">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={isLoading}
            className="glass-card"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">
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

        <div className="flex items-center gap-4 min-w-0 flex-1 justify-end overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            disabled={isLoading}
            className="glass-card flex-shrink-0"
          >
            Today
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="glass-card flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>

          {monthSummary && !error && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground overflow-hidden flex-shrink min-w-0">
              {topCategories.map(cat => (
                <div 
                  key={cat.category} 
                  className="flex items-center gap-1 flex-shrink-0 min-w-0"
                  title={`${cat.category}: ${cat.totalTracks} tracks`}
                >
                  {getCategoryIcon(cat.category, 'w-3 h-3 flex-shrink-0')}
                  <span className="truncate max-w-[120px]">
                    {cat.category} ({cat.totalTracks})
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1 flex-shrink-0">
                <CalendarIcon className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  Total ({monthSummary.totalTracks})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="px-6 mb-4 flex-shrink-0">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <AlertDescription className="break-words">{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden px-6 pb-6 min-h-0">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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
                
                const completionRate = dayData.summary
                  ? calculateCompletionRate(dayData.summary.completedTracks, dayData.summary.totalTracks)
                  : 0;

                const hasOverdueTracks = dayData.summary?.tracks.some(isTrackOverdue) || false;
                const hasDueDateTracks = dayData.summary?.tracks?.some(track => !!track.due_date);
                const hasTracks = dayData.summary && dayData.summary.totalTracks > 0;

                return (
                  <DayHoverCard 
                    key={`${dayData.date}-${index}`}
                    daySummary={dayData.summary}
                    date={dayData.date}
                  >
                    <div
                      className={cn(
                        "p-2 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors h-full relative",
                        !dayData.isCurrentMonth && "text-muted-foreground bg-border/40",
                        // Días con tracks en color verde suave
                        dayData.isCurrentMonth && hasTracks && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50",
                        dayData.isWeekend && dayData.isCurrentMonth && !hasTracks && "bg-accent/20",
                        // Días con due dates en amarillo (sobrescribe verde)
                        hasDueDateTracks && "bg-secondary/10 border-warning/40 dark:bg-warning/15",
                        // Today destaca más (sobrescribe otros)
                        dayData.isToday && "bg-primary/10 border-primary/30 font-semibold ring-1 ring-primary/30",
                        // Seleccionado destaca más aún
                        selectedDate === dayData.date && "bg-primary/20 border-primary ring-2 ring-primary/50"
                      )}
                      onClick={() => handleDateClick(dayData)}
                    >
                      <div className="flex items-center justify-between mb-2 gap-1 min-w-0">
                        <span className={cn(
                          "text-sm font-medium flex-shrink-0",
                          dayData.isToday && "text-primary font-bold"
                        )}>
                          {dayData.day}
                        </span>
                        {dayData.summary && dayData.summary.totalTracks > 0 && (
                          <Badge 
                            variant={hasOverdueTracks ? "destructive" : "outline"} 
                            className="text-xs h-5 flex-shrink-0"
                          >
                            {dayData.summary.totalTracks}
                          </Badge>
                        )}
                      </div>

                      {/* Category indicators */}
                      {dayData.isCurrentMonth && dayData.summary && (
                        <div className="space-y-1 overflow-hidden">
                          {Object.entries(dayData.summary.tracksByCategory)
                            .slice(0, 2)
                            .map(([category, count]) => (
                              <div 
                                key={category} 
                                className="flex items-center gap-1 text-xs min-w-0"
                                title={`${category}: ${count} tracks`}
                              >
                                {getCategoryIcon(category, 'w-3 h-3 flex-shrink-0')}
                                <span className="truncate text-muted-foreground">{category}</span>
                                <span className="text-muted-foreground flex-shrink-0">({count})</span>
                              </div>
                            ))}
                          {dayData.summary.completedTracks > 0 && (
                            <div className="text-xs text-green-600 font-medium whitespace-nowrap">
                              ✓ {dayData.summary.completedTracks}
                            </div>
                          )}
                          {completionRate > 0 && completionRate < 100 && (
                            <div className="text-xs text-blue-600 font-medium whitespace-nowrap">
                              {completionRate}%
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </DayHoverCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="w-96 border-l border-border pl-6 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex-shrink-0 mb-4 overflow-hidden">
            <h2 className="text-lg font-semibold text-foreground truncate">
              Monthly Overview
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              Training statistics for {MONTH_NAMES[currentMonth]}
            </p>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
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