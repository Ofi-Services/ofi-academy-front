import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Types
export interface CourseModule {
  id: string
  title: string
  description?: string
  duration?: string
  completed: boolean
  order: number
}

export interface Course {
  id: string
  title: string
  description?: string
  enrolled: boolean
  progress: number
  completedLessons: number
  totalLessons: number
  instructor?: string
  category?: string
  duration?: string
  thumbnail?: string
  modules?: CourseModule[]
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

export interface UpdateProgressPayload {
  courseId: string
  completedModules: string[]
  progress: number
  completedLessons: number
}

// Create API
export const coursesApi = createApi({
  reducerPath: 'consultantApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/consultant' }),
  tagTypes: ['Courses', 'Progress', 'Schedule'],
  endpoints: (builder) => ({
    // Get all courses
    getAllCourses: builder.query<Course[], void>({
      query: () => '/courses',
      providesTags: ['Courses'],
    }),

    // Get enrolled courses only
    getEnrolledCourses: builder.query<Course[], void>({
      query: () => '/courses/enrolled',
      providesTags: ['Courses'],
    }),

    // Get course details with modules
    getCourseDetails: builder.query<Course, string>({
      query: (courseId) => `/courses/${courseId}`,
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
    enrollInCourse: builder.mutation<Course, string>({
      query: (courseId) => ({
        url: `/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses', 'Progress'],
    }),

    // Update course progress with file upload support
    updateCourseProgress: builder.mutation<Course, FormData>({
      query: (formData) => {
        // Extract courseId from FormData for URL construction
        const courseId = formData.get('courseId') as string

        return {
          url: `/courses/${courseId}/progress`,
          method: 'PATCH',
          body: formData,
          // Don't set Content-Type header - let the browser set it with boundary
          // This is required for proper multipart/form-data handling
        }
      },
      invalidatesTags: (result, error, formData) => {
        const courseId = formData.get('courseId') as string
        return [
          { type: 'Courses', id: courseId },
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