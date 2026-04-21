
import { StatusConfig } from "../types"

export const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "excellent":
      return {
        variant: "default" as const,
        label: "Excellent",
        className: "bg-[#13608b] hover:bg-[#13608b]/90"
      }
    case "on_track":
      return {
        variant: "secondary" as const,
        label: "On Track",
        className: ""
      }
    default:
      return {
        variant: "default" as const,
        label: "At Risk",
        className: "bg-[#848484] hover:bg-[#848484]/90"
      }
  }
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}