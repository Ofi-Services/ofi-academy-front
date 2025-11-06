import { BookOpen, Calendar, HelpCircle, Settings, MessageSquare, Users2, BarChart3, FileText, Target, Award } from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  icon: LucideIcon
  path: string
  active?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const CONSULTANT_NAV: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "My Progress", icon: BookOpen, path: "/dashboard", active: true },
      { label: "Training Schedule", icon: Calendar, path: "/schedule" },
      //{ label: "Course Resources", icon: BookOpen, path: "/resources" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "Discussion Forums", icon: MessageSquare, path: "/forums" },
      { label: "Help & Support", icon: HelpCircle, path: "/support" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
]

export const LEADER_NAV: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "My Progress", icon: BookOpen, path: "/dashboard", active: true },
      { label: "Team Overview", icon: Users2, path: "/leader/dashboard" },
      { label: "Performance Reports", icon: BarChart3, path: "/leader/reports" },
      { label: "Training Plans", icon: Target, path: "/leader/plans" },
      { label: "Certificates", icon: Award, path: "/leader/certificates" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "Team Messages", icon: MessageSquare, path: "/leader/messages" },
      { label: "Resources", icon: FileText, path: "/leader/resources" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
]

export const SUPERUSER_NAV: NavSection[] = [
  {
    title: "Administration",
    items: [
      { label: "Dashboard", icon: BarChart3, path: "/superuser/dashboard", active: true },
      { label: "User Management", icon: Users2, path: "/superuser/users" },
      { label: "Course Management", icon: BookOpen, path: "/superuser/courses" },
      { label: "Reports & Analytics", icon: FileText, path: "/superuser/reports" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "System Settings", icon: Settings, path: "/superuser/settings" },
      { label: "Help & Support", icon: HelpCircle, path: "/support" },
    ],
  },
]