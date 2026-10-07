// Types mirror the backend /api/certifications/ endpoints (question_bank app)

export type QuestionType = "single" | "multiple" | "true_false"
export type AttemptStatus = "in_progress" | "finished"
export type QuizLanguage = "es" | "en"

export interface ExamChoice {
  id: number
  letter: string
  text_es: string
  text_en: string
}

export interface ExamQuestion {
  id: number
  source_id: number
  type: QuestionType
  num_correct: number
  statement_es: string
  statement_en: string
  choices: ExamChoice[]
}

export interface AttemptSummary {
  id: number
  exam_code: string
  exam_title: string
  status: AttemptStatus
  started_at: string
  finished_at: string | null
  score: string
  correct_count: number
  total: number
  passed: boolean
}

export interface ExamUserStats {
  attempts_count: number
  best_score: string | null
  has_passed: boolean
  last_attempt: AttemptSummary | null
  in_progress_attempt_id: number | null
}

export interface Exam {
  id: number
  code: string
  title: string
  description: string
  passing_score: number
  questions_per_attempt: number | null
  total_questions: number
  user_stats: ExamUserStats | null
}

export interface AttemptAnswer {
  order: number
  question: ExamQuestion
  answered: boolean
  selected_choice_ids: number[]
  /** null until the question is answered or the attempt is finished */
  is_correct: boolean | null
  correct_choice_ids: number[] | null
}

export interface AttemptDetail extends AttemptSummary {
  passing_score: number
  answered_count: number
  answers: AttemptAnswer[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AnswerPayload {
  attemptId: number
  question_id: number
  choice_ids: number[]
}
