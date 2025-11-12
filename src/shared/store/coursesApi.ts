import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'

// Types
export interface Course {
  id: string
  title: string
  description?: string
  duration?: string
  completed: boolean
  order: number
  link?: string
  due_date: Date | null
}

export interface TrainingTrack {
  id: string
  title: string
  description?: string
  enrolled: boolean
  due_date: Date | null
  progress_percentage: number
  completed_courses: number
  total_courses: number
  platform?: string
  category?: string
  duration?: string
  thumbnail?: string
  courses?: Course[]
}

export interface UserProgress {
  userId: string
  totalCourses: number
  activeCourses: number
  completedCourses: number
  averageProgress: number
  completedModules: number
  hoursSpent: number
}

export interface Schedule {
  id: string
  title: string
  date: string
  time: string
  duration: string
  type: string
  instructor?: string
  location?: string
}

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: 'https://ofiacademy.api.sofiatechnology.ai/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('ofi_token')
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    
    return headers
  },
})

// Base query with reauthentication handling
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // If response is 401 (unauthorized), logout
  if (result.error && result.error.status === 401) {
    localStorage.removeItem('ofi_user')
    localStorage.removeItem('ofi_token')
    window.location.href = '/login'
  }
  
  return result
}

// Create API
export const coursesApi = createApi({
  reducerPath: 'consultantApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Courses', 'Progress', 'Schedule'],
  endpoints: (builder) => ({
    // Get all courses
    getAllCourses: builder.query<TrainingTrack[], void>({
      query: () => '/courses',
      providesTags: ['Courses'],
    }),

    // Get enrolled courses only
    getEnrolledCourses: builder.query<TrainingTrack[], void>({
      query: () => '/training-tracks/',
      transformResponse: (response: TrainingTrack[]) => {
        console.log('[getEnrolledCourses] Raw response:', response)
        return response
      },
      providesTags: ['Courses'],
    }),

    // Get course details with modules
    getCourseDetails: builder.query<TrainingTrack, string>({
      query: (courseId) => `/training-tracks/${courseId}/`,
      providesTags: (result, error, courseId) => [{ type: 'Courses', id: courseId }],
    }),

    // Get user progress
    getUserProgress: builder.query<UserProgress, string>({
      query: (userId) => `/progress/${userId}`,
      providesTags: ['Progress'],
    }),

    // Get schedule
    getSchedule: builder.query<Schedule[], void>({
      query: () => '/schedule',
      providesTags: ['Schedule'],
    }),

    // Enroll in course
    enrollInCourse: builder.mutation<TrainingTrack, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses', 'Progress'],
    }),

    // Update course progress with file upload support
    updateCourseProgress: builder.mutation<TrainingTrack, FormData>({
      query: (formData) => {
        const trackId = formData.get('trackId') as string

        return {
          url: `/training-tracks/${trackId}/`,
          method: 'PATCH',
          body: formData,
        }
      },
      invalidatesTags: (result, error, formData) => {
        const trackId = formData.get('trackId') as string
        return [
          { type: 'Courses', id: trackId },
          'Courses',
          'Progress',
        ]
      },
    }),
  }),
})

// Export hooks
export const {
  useGetAllCoursesQuery,
  useGetEnrolledCoursesQuery,
  useGetCourseDetailsQuery,
  useGetUserProgressQuery,
  useGetScheduleQuery,
  useEnrollInCourseMutation,
  useUpdateCourseProgressMutation,
} = coursesApi