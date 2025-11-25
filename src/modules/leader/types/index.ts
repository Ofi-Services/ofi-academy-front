
export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  region: string
  title: string
  status: "excellent" | "on_track" | "at_risk"
  completion_percentage: number
  completed_courses: number
  active_courses: number
  overdue_courses: number
  lastActivity: string
}

export interface TeamStats {
  totalMembers: number
  averageProgress: number
  atRiskMembers: number
  topPerformers: number
}

export interface StatusConfig {
  variant: "default" | "secondary" | "destructive"
  label: string
  className: string
}