import { BookOpen, Calendar, HelpCircle, Settings, Users2, Target, MessageSquare } from "lucide-react"
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
      { label: "My Progress", icon: BookOpen, path: "/courses", active: true },
      { label: "Training Schedule", icon: Calendar, path: "/schedule" },
      //{ label: "Course Resources", icon: BookOpen, path: "/resources" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "Chat", icon: MessageSquare, path: "/teams" },
      //{ label: "Discussion Forums", icon: MessageSquare, path: "/forums" },
      //{ label: "Help & Support", icon: HelpCircle, path: "/support" },
      //{ label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
]

export const LEADER_NAV: NavSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "My Progress", icon: BookOpen, path: "/courses", active: true },
      { label: "Team Overview", icon: Users2, path: "/leader/dashboard" },
      //{ label: "Performance Reports", icon: BarChart3, path: "/leader/reports" },
      { label: "Calendar", icon: Target, path: "/leader/plans" },
      //{ label: "Certificates", icon: Award, path: "/leader/certificates" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "Chat", icon: MessageSquare, path: "/teams" },
      //{ label: "Team Messages", icon: MessageSquare, path: "/leader/messages" },
      //{ label: "Resources", icon: FileText, path: "/leader/resources" },
      //{ label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
]

export const HR_NAV: NavSection[] = [
  {
    title: "HR",
    items: [
      { label: "My Progress", icon: BookOpen, path: "/courses", active: true },
      { label: "Team Overview", icon: Users2, path: "/hr/dashboard" },
      //{ label: "Performance Reports", icon: BarChart3, path: "/leader/reports" },
      { label: "Calendar", icon: Target, path: "/hr/plans" },
      //{ label: "Certificates", icon: Award, path: "/leader/certificates" },
    ],
  },
  {
    title: "Quick Links",
    items: [
      { label: "System Settings", icon: Settings, path: "/superuser/settings" },
      { label: "Help & Support", icon: HelpCircle, path: "/support" },
      { label: "Chat", icon: MessageSquare, path: "/teams" },
    ],
  },
]