import { useCallback, useState } from "react"
import type { ExamChoice, ExamQuestion, QuizLanguage } from "../types"

const STORAGE_KEY = "ofi_quiz_language"

function readStoredLanguage(): QuizLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "en" ? "en" : "es"
  } catch {
    return "es"
  }
}

/** Language used to display question content. Remembered per browser. */
export function useQuizLanguage() {
  const [language, setLanguageState] = useState<QuizLanguage>(readStoredLanguage)

  const setLanguage = useCallback((next: QuizLanguage) => {
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage unavailable: keep the in-memory choice only
    }
  }, [])

  return { language, setLanguage }
}

export const statementOf = (q: ExamQuestion, lang: QuizLanguage) =>
  (lang === "es" ? q.statement_es : q.statement_en) || q.statement_en || q.statement_es

export const choiceTextOf = (c: ExamChoice, lang: QuizLanguage) =>
  (lang === "es" ? c.text_es : c.text_en) || c.text_en || c.text_es

export const formatScore = (score: string | number | null | undefined) => {
  if (score === null || score === undefined) return "—"
  const n = typeof score === "number" ? score : parseFloat(score)
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`
}

export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
    : "—"

export const questionTypeLabel = (q: ExamQuestion) =>
  q.type === "multiple"
    ? `Select ${q.num_correct}`
    : q.type === "true_false"
      ? "True / False"
      : "Single choice"
