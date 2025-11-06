import React, { useState, useEffect } from 'react';
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
} from "lucide-react";
import { cn } from '@/shared/lib/utils';
import { MONTH_NAMES, DAY_NAMES, CALENDAR_GRID_SIZE } from './constants';
import { ConsultantMonthSummary } from './MonthSummary';
import { getCategoryIcon, getDominantCategory } from './utils';
import { 
  mockMonthSummary, 
  getCourseCountForDay, 
  getCategoriesForDay 
} from './mock';
import type { MonthTrainingSummary } from './types';

const TrainingCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthSummary, setMonthSummary] = useState<MonthTrainingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Load month data (mock for now)
  useEffect(() => {
    loadMonthData(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const loadMonthData = async (month: number, year: number) => {
    setIsLoading(true);
    
    // TODO: Replace with actual API call
    // const response = await fetch(`/api/training/month?month=${month}&year=${year}`);
    // const data = await response.json();
    // setMonthSummary(data.data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setMonthSummary(mockMonthSummary);
    setIsLoading(false);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar generation
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: Array<{
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    date: string;
    coursesCount: number;
    categories: { [key: string]: number };
  }> = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonth = currentMonth - 1;
    const year = prevMonth < 0 ? currentYear - 1 : currentYear;
    const month = prevMonth < 0 ? 11 : prevMonth;
    const date = new Date(year, month, day).toISOString().split('T')[0];

    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date,
      coursesCount: 0,
      categories: {}
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const coursesCount = getCourseCountForDay(day, currentMonth, currentYear);
    const categories = getCategoriesForDay(day);

    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday: date === today,
      date,
      coursesCount,
      categories
    });
  }

  // Next month days to fill grid
  const remainingDays = CALENDAR_GRID_SIZE - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const nextMonth = currentMonth + 1;
    const year = nextMonth > 11 ? currentYear + 1 : currentYear;
    const month = nextMonth > 11 ? 0 : nextMonth;
    const date = new Date(year, month, day).toISOString().split('T')[0];

    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false,
      date,
      coursesCount: 0,
      categories: {}
    });
  }

  const handleDateClick = (date: string, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    setSelectedDate(date);
    // TODO: You could open a modal or navigate to a detailed view here
    console.log('Selected date:', date);
  };

  // Calculate totals by category for the month
  const categoryTotals = monthSummary?.categoriesBreakdown.reduce(
    (acc, cat) => ({ ...acc, [cat.category]: cat.count }),
    {} as { [key: string]: number }
  ) || {};

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

          {monthSummary && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {monthSummary.categoriesBreakdown.slice(0, 3).map(cat => (
                <div key={cat.category} className="flex items-center gap-1">
                  {getCategoryIcon(cat.category)}
                  <span>{cat.category.split(' ')[0]} ({cat.count})</span>
                </div>
              ))}
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3 text-primary" />
                <span className="font-medium">Total ({monthSummary.totalCourses})</span>
              </div>
            </div>
          )}
        </div>
      </div>

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

            <div className="grid grid-cols-7 gap-1 h-full overflow-hidden">
              {/* Day headers */}
              {DAY_NAMES.map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground border-b border-border flex-shrink-0"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((calDay, index) => {
                const dominantCategory = getDominantCategory(calDay.categories);
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "p-2 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors min-h-[80px] relative overflow-hidden",
                      !calDay.isCurrentMonth && "text-muted-foreground bg-muted/30",
                      calDay.isToday && "bg-primary/10 border-primary/30",
                      selectedDate === calDay.date && "bg-primary/20 border-primary"
                    )}
                    onClick={() => handleDateClick(calDay.date, calDay.isCurrentMonth)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-sm font-medium",
                        calDay.isToday && "text-primary font-bold"
                      )}>
                        {calDay.day}
                      </span>
                      {calDay.coursesCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {calDay.coursesCount}
                        </Badge>
                      )}
                    </div>

                    {/* Category indicators */}
                    {calDay.isCurrentMonth && Object.keys(calDay.categories).length > 0 && (
                      <div className="space-y-1">
                        {Object.entries(calDay.categories).slice(0, 3).map(([category, count]) => (
                          <div key={category} className="flex items-center gap-1 text-xs">
                            {getCategoryIcon(category)}
                            <span className="truncate">{count}</span>
                          </div>
                        ))}
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
              Month Overview
            </h2>
            <p className="text-sm text-muted-foreground">
              Training statistics for {MONTH_NAMES[currentMonth]}
            </p>
          </div>

          <div className="flex-1 overflow-hidden">
            {monthSummary ? (
              <ConsultantMonthSummary summary={monthSummary} isLoading={isLoading} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCalendar;
