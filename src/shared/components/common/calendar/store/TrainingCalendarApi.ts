/**
 * Training Calendar RTK Query Implementation
 * Adapted for Training Tracks API
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
  MonthTrainingSummary,
  DayTrainingSummary,
  GetCalendarRequest,
  TrainingTrack,
  CategoryBreakdown,
  PlatformBreakdown,
} from '../types';

/**
 * Transform training tracks array into MonthTrainingSummary
 * 
 * @param tracks - Array of training tracks from API
 * @param year - Year (e.g., 2025)
 * @param month - Month in JavaScript format (0-11, where 0 = January)
 */
const transformTracksToMonthSummary = (
  tracks: TrainingTrack[],
  year: number,
  month: number
): MonthTrainingSummary => {
  const dailySummaries: Record<string, DayTrainingSummary> = {};
  const categoryStats: Record<string, CategoryBreakdown> = {};
  const platformStats: Record<string, PlatformBreakdown> = {};

  let totalTracks = 0;
  let completedTracks = 0;
  let inProgressTracks = 0;
  let totalCourses = 0;
  let completedCourses = 0;

  // Filter tracks for the specific month
  // Note: month parameter is 0-11 (JavaScript format)
  // but track.due_date is ISO format (YYYY-MM-DD) which JavaScript parses correctly
  const monthTracks = tracks.filter((track) => {
    const trackDate = new Date(track.due_date);
    return trackDate.getFullYear() === year && trackDate.getMonth() === month;
  });

  // Process each track
  monthTracks.forEach((track) => {
    const date = track.due_date;
    const isCompleted = track.completed_courses === track.total_courses;
    const isInProgress = track.completed_courses > 0 && track.completed_courses < track.total_courses;

    // Update totals
    totalTracks++;
    if (isCompleted) completedTracks++;
    if (isInProgress) inProgressTracks++;
    totalCourses += track.total_courses;
    completedCourses += track.completed_courses;

    // Initialize daily summary if not exists
    if (!dailySummaries[date]) {
      dailySummaries[date] = {
        date,
        totalTracks: 0,
        completedTracks: 0,
        inProgressTracks: 0,
        totalCourses: 0,
        completedCourses: 0,
        tracksByCategory: {},
        tracksByPlatform: {},
        tracks: [],
      };
    }

    // Update daily summary
    const daySummary = dailySummaries[date];
    daySummary.totalTracks++;
    if (isCompleted) daySummary.completedTracks++;
    if (isInProgress) daySummary.inProgressTracks++;
    daySummary.totalCourses += track.total_courses;
    daySummary.completedCourses += track.completed_courses;
    daySummary.tracksByCategory[track.category] = (daySummary.tracksByCategory[track.category] || 0) + 1;
    daySummary.tracksByPlatform[track.platform] = (daySummary.tracksByPlatform[track.platform] || 0) + 1;
    daySummary.tracks.push(track);

    // Update category stats
    if (!categoryStats[track.category]) {
      categoryStats[track.category] = {
        category: track.category,
        totalTracks: 0,
        completedTracks: 0,
        totalCourses: 0,
        completedCourses: 0,
      };
    }
    categoryStats[track.category].totalTracks++;
    if (isCompleted) categoryStats[track.category].completedTracks++;
    categoryStats[track.category].totalCourses += track.total_courses;
    categoryStats[track.category].completedCourses += track.completed_courses;

    // Update platform stats
    if (!platformStats[track.platform]) {
      platformStats[track.platform] = {
        platform: track.platform,
        totalTracks: 0,
        completedTracks: 0,
        totalCourses: 0,
        completedCourses: 0,
      };
    }
    platformStats[track.platform].totalTracks++;
    if (isCompleted) platformStats[track.platform].completedTracks++;
    platformStats[track.platform].totalCourses += track.total_courses;
    platformStats[track.platform].completedCourses += track.completed_courses;
  });

  // Get upcoming deadlines (sorted by due date)
  const upcomingDeadlines = monthTracks
    .filter((track) => track.completed_courses < track.total_courses)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 10);

  return {
    year,
    month,
    totalTracks,
    completedTracks,
    inProgressTracks,
    totalCourses,
    completedCourses,
    dailySummaries,
    categoriesBreakdown: Object.values(categoryStats),
    platformsBreakdown: Object.values(platformStats),
    upcomingDeadlines,
  };
};

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://ofiacademy.api.sofiatechnology.ai/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('ofi_token');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  },
});

// Base query with reauthentication handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  // If response is 401 (unauthorized), logout
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('ofi_user');
    localStorage.removeItem('ofi_token');
    window.location.href = '/login';
  }
  
  return result;
};

// Define the API slice
export const trainingCalendarApi = createApi({
  reducerPath: 'trainingCalendarApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Calendar', 'TrainingTrack'],
  endpoints: (builder) => ({
    // Get month training data
    getMonthTraining: builder.query<MonthTrainingSummary, GetCalendarRequest>({
      query: ({ year, month, userId }) => {
        const params = new URLSearchParams();
        if (year !== undefined) params.append('year', year.toString());
        // API uses 1-12 for months (January = 1), but JavaScript Date uses 0-11
        if (month !== undefined) params.append('month', (month + 1).toString());
        if (userId) params.append('userId', userId);

        return {
          url: `/calendar/?${params.toString()}`,
        };
      },
      transformResponse: (response: TrainingTrack[], meta, arg) => {
        const currentDate = new Date();
        const year = arg.year ?? currentDate.getFullYear();
        const month = arg.month ?? currentDate.getMonth();

        return transformTracksToMonthSummary(response, year, month);
      },
      providesTags: (result, error, { year, month }) => [
        { type: 'Calendar', id: `${year}-${month}` },
        'TrainingTrack',
      ],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    // Get all training tracks (no date filter)
    getAllTracks: builder.query<TrainingTrack[], { userId?: string }>({
      query: ({ userId }) => ({
        url: '/calendar/',
        params: userId ? { userId } : undefined,
      }),
      providesTags: ['TrainingTrack'],
      keepUnusedDataFor: 300,
    }),

    // Optional: Update training track
    updateTrainingTrack: builder.mutation<
      TrainingTrack,
      { trackId: number; updates: Partial<TrainingTrack> }
    >({
      query: ({ trackId, updates }) => ({
        url: `/calendar/${trackId}/`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Calendar', 'TrainingTrack'],
    }),

    // Optional: Create new training track
    createTrainingTrack: builder.mutation<TrainingTrack, Omit<TrainingTrack, 'id'>>({
      query: (newTrack) => ({
        url: '/calendar/',
        method: 'POST',
        body: newTrack,
      }),
      invalidatesTags: ['Calendar', 'TrainingTrack'],
    }),

    // Optional: Delete training track
    deleteTrainingTrack: builder.mutation<void, number>({
      query: (trackId) => ({
        url: `/calendar/${trackId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Calendar', 'TrainingTrack'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetMonthTrainingQuery,
  useGetAllTracksQuery,
  useUpdateTrainingTrackMutation,
  useCreateTrainingTrackMutation,
  useDeleteTrainingTrackMutation,
} = trainingCalendarApi;

// Export the reducer to be included in the store
export default trainingCalendarApi.reducer;