
/**
 * Training Calendar RTK Query Implementation Example
 * This file shows how to integrate the calendar with Redux Toolkit Query
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/shared/store/store';
import {
  MonthTrainingSummary,
  DayTrainingSummary,
  GetMonthTrainingRequest,
  GetMonthTrainingResponse,
  GetDayTrainingRequest,
  GetDayTrainingResponse,
  TrainingEvent,
} from '../types';

// Define the API slice
export const trainingCalendarApi = createApi({
  reducerPath: 'trainingCalendarApi',
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    prepareHeaders: (headers, { getState }) => {
      // Get the authentication token from Redux state
      const token = (getState() as RootState).auth?.token;
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['MonthTraining', 'DayTraining', 'TrainingEvent'],
  endpoints: (builder) => ({
    // Get month training data
    getMonthTraining: builder.query<MonthTrainingSummary, GetMonthTrainingRequest>({
      query: ({ year, month, userId }) => ({
        url: '/training/calendar/month',
        params: { year, month, ...(userId && { userId }) },
      }),
      transformResponse: (response: GetMonthTrainingResponse) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch month training');
        }
        return response.data;
      },
      providesTags: (result, error, { year, month }) => [
        { type: 'MonthTraining', id: `${year}-${month}` },
        'TrainingEvent',
      ],
      // Optional: Keep data fresh for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Get day training data
    getDayTraining: builder.query<DayTrainingSummary, GetDayTrainingRequest>({
      query: ({ date, userId }) => ({
        url: '/training/calendar/day',
        params: { date, ...(userId && { userId }) },
      }),
      transformResponse: (response: GetDayTrainingResponse) => {
        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch day training');
        }
        return response.data;
      },
      providesTags: (result, error, { date }) => [
        { type: 'DayTraining', id: date },
        'TrainingEvent',
      ],
      keepUnusedDataFor: 300,
    }),

    // Optional: Update training event (e.g., mark as completed)
    updateTrainingEvent: builder.mutation<
      TrainingEvent,
      { eventId: string; updates: Partial<TrainingEvent> }
    >({
      query: ({ eventId, updates }) => ({
        url: `/training/events/${eventId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['MonthTraining', 'DayTraining', 'TrainingEvent'],
    }),

    // Optional: Create new training event
    createTrainingEvent: builder.mutation<TrainingEvent, Omit<TrainingEvent, 'id'>>({
      query: (newEvent) => ({
        url: '/training/events',
        method: 'POST',
        body: newEvent,
      }),
      invalidatesTags: ['MonthTraining', 'DayTraining', 'TrainingEvent'],
    }),

    // Optional: Delete training event
    deleteTrainingEvent: builder.mutation<void, string>({
      query: (eventId) => ({
        url: `/training/events/${eventId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MonthTraining', 'DayTraining', 'TrainingEvent'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetMonthTrainingQuery,
  useGetDayTrainingQuery,
  useUpdateTrainingEventMutation,
  useCreateTrainingEventMutation,
  useDeleteTrainingEventMutation,
} = trainingCalendarApi;

// Export the reducer to be included in the store
export default trainingCalendarApi.reducer;