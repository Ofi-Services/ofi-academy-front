import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog"
import { Award, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/shared/hooks/use-auth"
import { formatDate, formatScore } from "../hooks/useQuizLanguage"

export interface CertificateData {
  examTitle: string
  score: string | null
  issuedAt: string | null
  attemptId: number | null
}

interface CertificateModalProps {
  certificate: CertificateData | null
  isOpen: boolean
  onClose: () => void
}

/** Certificate of completion for a passed practice exam, built from the user's real attempt data. */
export default function CertificateModal({ certificate, isOpen, onClose }: CertificateModalProps) {
  const { user } = useAuth()

  if (!certificate) return null

  const credentialId = certificate.attemptId
    ? `OFI-${certificate.attemptId.toString().padStart(6, "0")}`
    : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Award className="h-5 w-5 text-amber-500" />
            Certificate of completion
          </DialogTitle>
          {credentialId && <p className="text-xs text-muted-foreground">Credential ID: {credentialId}</p>}
        </DialogHeader>

        <div className="relative mt-4 overflow-hidden rounded-2xl border-4 border-amber-500/30 bg-gradient-to-br from-card via-card/90 to-amber-500/5 p-8 text-center shadow-2xl">
          <div className="pointer-events-none absolute -right-16 -top-16 opacity-5">
            <Award className="h-80 w-80 text-foreground" />
          </div>

          <div className="mb-8 space-y-2">
            <div className="mb-2 flex items-center justify-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-xl font-black uppercase tracking-widest text-transparent">
                OFI Academy
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Certification Training
            </p>
          </div>

          <div className="my-6 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">This certifies that</p>
            <h2 className="text-3xl font-extrabold tracking-tight underline decoration-amber-500/40 decoration-2 underline-offset-8 sm:text-4xl">
              {user?.name || user?.email}
            </h2>
          </div>

          <div className="mx-auto my-6 max-w-xl space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>has successfully passed the practice exam</p>
            <div className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-lg font-bold text-foreground">{certificate.examTitle}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Score: {formatScore(certificate.score)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 items-end border-t border-border/80 pt-8 text-xs text-muted-foreground">
            <div className="space-y-1">
              <div className="mx-auto mb-2 h-0.5 w-28 bg-foreground/30" />
              <p className="font-semibold text-foreground">Academic Direction</p>
              <p className="text-[11px]">OFI Services Academy</p>
            </div>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-amber-500/60 bg-amber-500/10">
                <div className="text-center">
                  <Award className="mx-auto h-7 w-7 text-amber-500" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter text-amber-500">Passed</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="mx-auto mb-2 h-0.5 w-28 bg-foreground/30" />
              <p className="font-semibold text-foreground">Issued on</p>
              <p className="text-[11px]">{formatDate(certificate.issuedAt)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
