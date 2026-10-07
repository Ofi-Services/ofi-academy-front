import { baseApi } from "@/core/api/baseApi"
import type {
  AnswerPayload,
  AttemptAnswer,
  AttemptDetail,
  AttemptSummary,
  Exam,
  PaginatedResponse,
} from "../types"

export const certificationsApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["CertificationExams", "CertificationAttempts"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getExams: builder.query<Exam[], void>({
        query: () => "/certifications/exams/",
        providesTags: ["CertificationExams"],
      }),

      getAttempts: builder.query<AttemptSummary[], { exam?: string } | void>({
        query: (params) => ({
          url: "/certifications/attempts/",
          params: { status: "finished", page_size: 100, ...(params ?? {}) },
        }),
        transformResponse: (response: PaginatedResponse<AttemptSummary> | AttemptSummary[]) =>
          Array.isArray(response) ? response : response.results,
        providesTags: ["CertificationAttempts"],
      }),

      getAttempt: builder.query<AttemptDetail, number>({
        query: (id) => `/certifications/attempts/${id}/`,
        providesTags: (_result, _error, id) => [{ type: "CertificationAttempts", id }],
      }),

      startAttempt: builder.mutation<AttemptDetail, { code: string; restart?: boolean }>({
        query: ({ code, restart = false }) => ({
          url: `/certifications/exams/${code}/attempts/`,
          method: "POST",
          body: { restart, shuffle: true },
        }),
        invalidatesTags: ["CertificationExams"],
        async onQueryStarted(_args, { dispatch, queryFulfilled }) {
          const { data } = await queryFulfilled
          dispatch(certificationsApi.util.upsertQueryData("getAttempt", data.id, data))
        },
      }),

      answerQuestion: builder.mutation<AttemptAnswer, AnswerPayload>({
        query: ({ attemptId, ...body }) => ({
          url: `/certifications/attempts/${attemptId}/answer/`,
          method: "POST",
          body,
        }),
        // Merge the graded answer into the cached attempt so the UI updates instantly
        async onQueryStarted({ attemptId }, { dispatch, queryFulfilled }) {
          const { data } = await queryFulfilled
          dispatch(
            certificationsApi.util.updateQueryData("getAttempt", attemptId, (draft) => {
              const idx = draft.answers.findIndex((a) => a.question.id === data.question.id)
              if (idx >= 0) {
                if (!draft.answers[idx].answered) draft.answered_count += 1
                draft.answers[idx] = data
              }
            })
          )
        },
      }),

      submitAttempt: builder.mutation<AttemptDetail, number>({
        query: (attemptId) => ({
          url: `/certifications/attempts/${attemptId}/submit/`,
          method: "POST",
          body: {},
        }),
        invalidatesTags: ["CertificationExams", "CertificationAttempts"],
        async onQueryStarted(attemptId, { dispatch, queryFulfilled }) {
          const { data } = await queryFulfilled
          dispatch(certificationsApi.util.upsertQueryData("getAttempt", attemptId, data))
        },
      }),
    }),
  })

export const {
  useGetExamsQuery,
  useGetAttemptsQuery,
  useGetAttemptQuery,
  useStartAttemptMutation,
  useAnswerQuestionMutation,
  useSubmitAttemptMutation,
} = certificationsApi

/** Extracts the `detail` message DRF returns on errors. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data
    if (data && typeof data === "object" && "detail" in data) {
      return String((data as { detail: unknown }).detail)
    }
  }
  return fallback
}
