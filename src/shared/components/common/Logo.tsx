
import { cn } from "@/shared/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2Zm0 3.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 13.75a7.75 7.75 0 0 1-6.338-3.301c.087-1.97 4.225-3.199 6.338-3.199s6.251 1.23 6.338 3.2A7.75 7.75 0 0 1 12 19.25Z" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-base font-extrabold tracking-tight">ofi academy</div>
        <div className="text-xs text-muted-foreground">Aprende. Crece. Mide.</div>
      </div>
    </div>
  );
}

export default Logo;