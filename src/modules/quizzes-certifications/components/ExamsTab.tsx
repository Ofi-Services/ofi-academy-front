import { useMemo, useState } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/Input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Award, BookOpenCheck, Clock3, Search, TrendingUp } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Exam } from "../types"
import ExamCard from "./ExamCard"
import { formatScore } from "../hooks/useQuizLanguage"

interface ExamsTabProps {
  exams: Exam[]
  isLoading: boolean
  startingCode: string | null
  onStart: (exam: Exam) => void
  onResume: (attemptId: number) => void
  onRestart: (exam: Exam) => void
  onViewCertificate: (exam: Exam) => void
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string | number; hint: string; icon: LucideIcon; tone: string }) {
  return (
    <Card className="border-border bg-card/70 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold leading-tight">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExamsTab({ exams, isLoading, startingCode, ...handlers }: ExamsTabProps) {
  const [search, setSearch] = useState("")

  const metrics = useMemo(() => {
    const passed = exams.filter((e) => e.user_stats?.has_passed).length
    const inProgress = exams.filter((e) => e.user_stats?.in_progress_attempt_id).length
    const attempts = exams.reduce((acc, e) => acc + (e.user_stats?.attempts_count ?? 0), 0)
    const bests = exams
      .map((e) => e.user_stats?.best_score)
      .filter((s): s is string => s !== null && s !== undefined)
      .map(parseFloat)
    const avgBest = bests.length ? bests.reduce((a, b) => a + b, 0) / bests.length : null
    return { passed, inProgress, attempts, avgBest }
  }, [exams])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return exams
    return exams.filter((e) => `${e.title} ${e.description} ${e.code}`.toLowerCase().includes(term))
  }, [exams, search])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Available exams" value={exams.length} hint="Certification practice exams" icon={BookOpenCheck} tone="bg-primary/10 text-primary" />
        <MetricCard label="Passed" value={metrics.passed} hint="Exams you have passed" icon={Award} tone="bg-emerald-500/10 text-emerald-500" />
        <MetricCard label="In progress" value={metrics.inProgress} hint="Attempts waiting for you" icon={Clock3} tone="bg-sky-500/10 text-sky-500" />
        <MetricCard
          label="Average best"
          value={formatScore(metrics.avgBest)}
          hint={`${metrics.attempts} finished attempt${metrics.attempts === 1 ? "" : "s"}`}
          icon={TrendingUp}
          tone="bg-amber-500/10 text-amber-500"
        />
      </div>

      {exams.length > 3 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 pl-9" />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40 py-16 text-center">
          <BookOpenCheck className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-base font-semibold">{exams.length === 0 ? "No exams available yet" : "No exams match your search"}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {exams.length === 0
              ? "Certification exams will appear here once they are published."
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exam) => (
            <ExamCard key={exam.id} exam={exam} isStarting={startingCode === exam.code} {...handlers} />
          ))}
        </div>
      )}
    </div>
  )
}
