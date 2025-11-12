import { baseApi } from "@/core/api/baseApi"

// Types
export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  completion_percentage: number
  completed_courses: number
  overdue_courses: number
  active_courses: number
  status: "excellent" | "on_track" | "at_risk"
  lastActivity: string
}

export interface TeamReport {
  id: string
  title: string
  type: "weekly" | "monthly" | "quarterly"
  generatedAt: string
  summary: string
  metrics: {
    totalProgress: number
    coursesCompleted: number
    averageScore: number
  }
}

export interface Certificate {
  id: string
  userId: string
  userName: string
  courseId: string
  courseName: string
  issuedAt: string
  certificateUrl: string
}

export interface TrainingTrackCourse {
  id: number
  title: string
  has_submission?: boolean
  completed?: boolean
  submission_link?: string
}

export interface TrainingTrack {
  id: number
  title: string
  platform: string
  due_date: string
  category: string | null
  total_courses: number
  courses?: TrainingTrackCourse[]
  progress_percentage: number
  completed_courses: number
  is_completed: boolean
  completion_date: string | null
  is_overdue: boolean
}

export interface TrainingTrackDetail {
  training_track: {
    id: number
    title: string
    platform: string
    due_date: string
    category: string | null
    total_courses: number
  }
  courses: TrainingTrackCourse[]
  assignment: {
    progress_percentage: number
    completed_courses: number
    is_completed: boolean
    completion_date: string | null
  }
}

// Leader API endpoints
export const leaderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all team members with comprehensive training statistics
    getTeamMembers: builder.query<TeamMember[], void>({
      query: () => "/leader/talents/",
      providesTags: ["TeamMembers"],
    }),
    
    // Get specific team member details
    getTeamMemberDetails: builder.query<TeamMember, number>({
      query: (memberId) => `/leader/talents/${memberId}/`,
      providesTags: ["TeamMembers"],
    }),
    
    // Get team reports
    getTeamReports: builder.query<TeamReport[], void>({
      query: () => "/leader/reports",
    }),
    
    // Get team certificates
    getTeamCertificates: builder.query<Certificate[], void>({
      query: () => "/leader/certificates",
      providesTags: ["Certificates"],
    }),
    
    // Get user training tracks
    getUserTrainingTracks: builder.query<TrainingTrack[], number>({
      query: (userId) => `/users/${userId}/training-tracks/`,
    }),
    
    // Get specific training track detail
    getTrainingTrackDetail: builder.query<
      TrainingTrackDetail,
      { userId: number; trackId: number }
    >({
      query: ({ userId, trackId }) => 
        `/users/${userId}/training-tracks/${trackId}/`,
    }),
    
    // Assign course to team member
    assignCourse: builder.mutation<
      void,
      { memberId: number; courseId: string }
    >({
      query: ({ memberId, courseId }) => ({
        url: `/leader/talents/${memberId}/assign-course`,
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["TeamMembers"],
    }),
    
    // Send message to team
    sendTeamMessage: builder.mutation<
      void,
      { subject: string; message: string; recipients: string[] }
    >({
      query: (body) => ({
        url: "/leader/messages/send",
        method: "POST",
        body,
      }),
    }),
  }),
})

// Export hooks
export const {
  useGetTeamMembersQuery,
  useGetTeamMemberDetailsQuery,
  useGetTeamReportsQuery,
  useGetTeamCertificatesQuery,
  useGetUserTrainingTracksQuery,
  useGetTrainingTrackDetailQuery,
  useAssignCourseMutation,
  useSendTeamMessageMutation,
} = leaderApi