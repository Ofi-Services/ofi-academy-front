import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Loader2, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { MonthSummaryProps } from './types';
import { getCategoryIcon } from './utils';

export const ConsultantMonthSummary: React.FC<MonthSummaryProps> = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const completedPercentage = summary.totalCourses > 0 
    ? Math.round((summary.totalCourses / summary.totalCourses) * 100)
    : 0;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-4">
        
        {/* Overall Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Monthly Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Assigned</p>
                <p className="text-xl font-bold">{summary.totalCourses}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-xl font-bold text-green-600">{summary.completedCourses}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-yellow-600">
                  {summary.totalCourses - summary.completedCourses}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{completedPercentage}%</span>
              </div>
              <Progress value={completedPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        {summary.categoriesBreakdown.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Your Course Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.categoriesBreakdown.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getCategoryIcon(cat.category)}
                      <span className="text-sm truncate">{cat.category}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {cat.enrolled}/{cat.count}
                    </Badge>
                  </div>
                  <Progress value={cat.avgProgress} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Monthly Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Month’s Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Days Active</span>
              <span className="font-medium">{summary.dailySummary.length} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Most Active Category</span>
              <Badge variant="outline" className="text-xs">
                {summary.categoriesBreakdown
                  .reduce((prev, curr) => (prev.enrolled > curr.enrolled ? prev : curr))
                  .category}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
