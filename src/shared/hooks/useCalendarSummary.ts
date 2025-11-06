// hooks/useCalendarSummary.ts
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/shared/hooks/use-toast";

// Types for API responses
export interface DaySummary {
  day: number;
  Total: number;
  Calls: number;
  Email: number;
  Legal: number;
}

export interface CalendarSummaryResponse {
  days: DaySummary[];
}

export interface ActionItem {
  id: string;
  title: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  description: string;
  invoice_id?: number;
}

export interface DayActionsResponse {
  emails: ActionItem[];
  calls: ActionItem[];
  legal_actions: ActionItem[];
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (January = 0)
  summary: DaySummary[];
}

interface UseCalendarSummaryState {
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedDateActions: DayActionsResponse | null;
  isLoadingActions: boolean;
  isUpdatingAction: string | null; // ID of action being updated
  isTriggeringActions: boolean;
}

interface UseCalendarSummaryReturn {
  // States
  currentMonth: CalendarMonth | null;
  isLoading: boolean;
  selectedDate: string | null;
  selectedDateActions: DayActionsResponse | null;
  isLoadingActions: boolean;
  isUpdatingAction: string | null;
  isTriggeringActions: boolean;
  
  // Actions
  loadMonthSummary: (year: number, month: number) => Promise<void>;
  selectDate: (date: string) => Promise<void>;
  updateActionStatus: (actionId: string, invoiceId: number, status: string) => Promise<void>;
  triggerScheduledActions: (date: string) => Promise<void>;
  
  // Navigation
  goToNextMonth: () => Promise<void>;
  goToPreviousMonth: () => Promise<void>;
  goToToday: () => Promise<void>;
  
  // Utilities
  getSummaryForDay: (day: number) => DaySummary | null;
  getScheduledActionsCount: () => number;
  reset: () => void;
}

// API Service
const CalendarSummaryService = {
  baseUrl: 'https://collection-agent.api.sofiatechnology.ai',
  triggerUrl: 'https://n8n.sofiatechnology.ai/webhook/f246db02-ca28-44ea-b009-e57a5c799e5a',

  // GET /scheduled-actions/calendar?year=YYYY&month=MM
  getMonthSummary: async (year: number, month: number): Promise<CalendarSummaryResponse> => {
    try {
      // Convert month from 0-11 to 1-12 for API
      const apiMonth = month + 1;
      
      const response = await fetch(`${CalendarSummaryService.baseUrl}/scheduled-actions/calendar?year=${year}&month=${apiMonth}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('Error fetching month summary:', error);
      throw new Error(error.message || 'Failed to load calendar summary');
    }
  },

  // GET /scheduled-actions/scheduled_actions/YYYY-MM-DD
  getDayActions: async (date: string): Promise<DayActionsResponse> => {
    try {
      const response = await fetch(`${CalendarSummaryService.baseUrl}/scheduled-actions/scheduled_actions/${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('Error fetching day actions:', error);
      throw new Error(error.message || 'Failed to load day actions');
    }
  },

  // PATCH /scheduled-actions/{invoice_id}/scheduled_action/{action_id}
  updateActionStatus: async (invoiceId: number, actionId: string, status: string): Promise<ActionItem> => {
    try {
      const payload = {
        status: status,
        completed_at: status === 'completed' ? new Date().toISOString() : null
      };

      const response = await fetch(`${CalendarSummaryService.baseUrl}/scheduled-actions/${invoiceId}/scheduled_action/${actionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers as needed
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('Error updating action status:', error);
      throw new Error(error.message || 'Failed to update action status');
    }
  },

  // POST to n8n webhook to trigger scheduled actions
  triggerScheduledActions: async (date: string): Promise<any> => {
    try {
      const response = await fetch(`${CalendarSummaryService.triggerUrl}?date=${date}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error: any) {
      console.error('Error triggering scheduled actions:', error);
      throw new Error(error.message || 'Failed to trigger scheduled actions');
    }
  }
};

export const useCalendarSummary = (): UseCalendarSummaryReturn => {
  const { toast } = useToast();
  
  const [state, setState] = useState<UseCalendarSummaryState>({
    currentMonth: null,
    isLoading: false,
    selectedDate: null,
    selectedDateActions: null,
    isLoadingActions: false,
    isUpdatingAction: null,
    isTriggeringActions: false
  });

  // Load summary for a specific month
  const loadMonthSummary = useCallback(async (year: number, month: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await CalendarSummaryService.getMonthSummary(year, month);
      
      setState(prev => ({
        ...prev,
        currentMonth: {
          year,
          month,
          summary: response.days
        },
        isLoading: false
      }));
      
    } catch (error: any) {
      toast({
        title: "Calendar Error",
        description: error.message || "Could not load calendar summary",
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // Select a specific date and load its actions
  const selectDate = useCallback(async (date: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedDate: date, 
      isLoadingActions: true,
      selectedDateActions: null
    }));
    
    try {
      const response = await CalendarSummaryService.getDayActions(date);
      
      setState(prev => ({
        ...prev,
        selectedDateActions: response,
        isLoadingActions: false
      }));
      
    } catch (error: any) {
      toast({
        title: "Error Loading Actions",
        description: error.message || "Could not load actions for selected date",
        variant: "destructive",
      });
      
      setState(prev => ({ 
        ...prev, 
        selectedDateActions: null,
        isLoadingActions: false 
      }));
    }
  }, [toast]);

  // Update action status
  const updateActionStatus = useCallback(async (actionId: string, invoiceId: number, status: string) => {
    setState(prev => ({ ...prev, isUpdatingAction: actionId }));
    
    try {
      await CalendarSummaryService.updateActionStatus(invoiceId, actionId, status);
      
      // Update local state
      setState(prev => {
        if (!prev.selectedDateActions) return { ...prev, isUpdatingAction: null };
        
        const updateActionsInCategory = (actions: ActionItem[]) =>
          actions.map(action =>
            action.id === actionId
              ? { 
                  ...action, 
                  status: status as 'scheduled' | 'completed' | 'cancelled'
                }
              : action
          );

        const updatedActions = {
          emails: updateActionsInCategory(prev.selectedDateActions.emails),
          calls: updateActionsInCategory(prev.selectedDateActions.calls),
          legal_actions: updateActionsInCategory(prev.selectedDateActions.legal_actions)
        };

        return {
          ...prev,
          selectedDateActions: updatedActions,
          isUpdatingAction: null
        };
      });
      
      toast({
        title: "Status Updated",
        description: `Action status changed to ${status}`,
        variant: "default",
      });
      
    } catch (error: any) {
      toast({
        title: "Update Error",
        description: error.message || "Could not update action status",
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, isUpdatingAction: null }));
    }
  }, [toast]);

  // Trigger scheduled actions for selected date
  const triggerScheduledActions = useCallback(async (date: string) => {
    setState(prev => ({ ...prev, isTriggeringActions: true }));
    
    try {
      await CalendarSummaryService.triggerScheduledActions(date);
      
      toast({
        title: "Actions Triggered",
        description: `Scheduled actions for ${new Date(date).toDateString()} have been triggered successfully`,
        variant: "default",
      });
      
      // Reload the actions for the current date to reflect any changes
      if (state.selectedDate) {
        await selectDate(state.selectedDate);
      }
      
    } catch (error: any) {
      toast({
        title: "Trigger Error",
        description: error.message || "Could not trigger scheduled actions",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isTriggeringActions: false }));
    }
  }, [toast, state.selectedDate, selectDate]);

  // Navigate to next month
  const goToNextMonth = useCallback(async () => {
    if (!state.currentMonth) return;
    
    const nextMonth = state.currentMonth.month + 1;
    const year = nextMonth > 11 ? state.currentMonth.year + 1 : state.currentMonth.year;
    const month = nextMonth > 11 ? 0 : nextMonth;
    
    await loadMonthSummary(year, month);
    
    // Clear selected date when changing months
    setState(prev => ({ 
      ...prev, 
      selectedDate: null, 
      selectedDateActions: null 
    }));
  }, [state.currentMonth, loadMonthSummary]);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(async () => {
    if (!state.currentMonth) return;
    
    const prevMonth = state.currentMonth.month - 1;
    const year = prevMonth < 0 ? state.currentMonth.year - 1 : state.currentMonth.year;
    const month = prevMonth < 0 ? 11 : prevMonth;
    
    await loadMonthSummary(year, month);
    
    // Clear selected date when changing months
    setState(prev => ({ 
      ...prev, 
      selectedDate: null, 
      selectedDateActions: null 
    }));
  }, [state.currentMonth, loadMonthSummary]);

  // Go to current month
  const goToToday = useCallback(async () => {
    const today = new Date();
    await loadMonthSummary(today.getFullYear(), today.getMonth());
    
    // Clear selected date
    setState(prev => ({ 
      ...prev, 
      selectedDate: null, 
      selectedDateActions: null 
    }));
  }, [loadMonthSummary]);

  // Get summary for a specific day
  const getSummaryForDay = useCallback((day: number): DaySummary | null => {
    if (!state.currentMonth) return null;
    
    return state.currentMonth.summary.find(summary => summary.day === day) || null;
  }, [state.currentMonth]);

  // Get count of scheduled actions for selected date
  const getScheduledActionsCount = useCallback((): number => {
    if (!state.selectedDateActions) return 0;
    
    const { emails, calls, legal_actions } = state.selectedDateActions;
    const allActions = [...emails, ...calls, ...legal_actions];
    
    return allActions.filter(action => action.status === 'scheduled').length;
  }, [state.selectedDateActions]);

  // Reset all states
  const reset = useCallback(() => {
    setState({
      currentMonth: null,
      isLoading: false,
      selectedDate: null,
      selectedDateActions: null,
      isLoadingActions: false,
      isUpdatingAction: null,
      isTriggeringActions: false
    });
  }, []);

  // Load current month on mount
  useEffect(() => {
    const today = new Date();
    loadMonthSummary(today.getFullYear(), today.getMonth());
  }, [loadMonthSummary]);

  return {
    // States
    currentMonth: state.currentMonth,
    isLoading: state.isLoading,
    selectedDate: state.selectedDate,
    selectedDateActions: state.selectedDateActions,
    isLoadingActions: state.isLoadingActions,
    isUpdatingAction: state.isUpdatingAction,
    isTriggeringActions: state.isTriggeringActions,
    
    // Actions
    loadMonthSummary,
    selectDate,
    updateActionStatus,
    triggerScheduledActions,
    
    // Navigation
    goToNextMonth,
    goToPreviousMonth,
    goToToday,
    
    // Utilities
    getSummaryForDay,
    getScheduledActionsCount,
    reset
  };
};