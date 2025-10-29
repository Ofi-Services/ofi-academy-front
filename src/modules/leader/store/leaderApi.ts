
import { baseApi } from "@/core/api/baseApi"

// Types
export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  progress: number
  completedCourses: number
  activeCourses: number
  status: "excellent" | "on_track" | "at_risk"
  lastActivity: string
  avatar?: string
}

export interface TeamProgress {
  totalMembers: number
  averageProgress: number
  atRiskMembers: number
  topPerformers: number
  completedCourses: number
  activeCourses: number
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

// Leader API endpoints
export const leaderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get team members
    getTeamMembers: builder.query<TeamMember[], void>({
      query: () => "/leader/team/members",
      providesTags: ["TeamMembers"],
    }),
    
    // Get team progress overview
    getTeamProgress: builder.query<TeamProgress, void>({
      query: () => "/leader/team/progress",
      providesTags: ["TeamProgress"],
    }),
    
    // Get specific team member details
    getTeamMemberDetails: builder.query<TeamMember, string>({
      query: (memberId) => `/leader/team/members/${memberId}`,
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
    
    // Assign course to team member
    assignCourse: builder.mutation<
      void,
      { memberId: string; courseId: string }
    >({
      query: ({ memberId, courseId }) => ({
        url: `/leader/team/members/${memberId}/assign-course`,
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["TeamMembers", "TeamProgress"],
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
  useGetTeamProgressQuery,
  useGetTeamMemberDetailsQuery,
  useGetTeamReportsQuery,
  useGetTeamCertificatesQuery,
  useAssignCourseMutation,
  useSendTeamMessageMutation,
} = leaderApi