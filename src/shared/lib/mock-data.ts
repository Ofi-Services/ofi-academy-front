export interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: string
  level: "Principiante" | "Intermedio" | "Avanzado"
  instructor: string
  thumbnail: string
  progress?: number
  enrolled?: boolean
  completedLessons?: number
  totalLessons?: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  coursesCompleted: number
  coursesInProgress: number
  totalHours: number
  lastActive: string
}

export const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Fundamentos de Consultoría Estratégica",
    description: "Aprende las bases de la consultoría estratégica y cómo aplicarlas en proyectos reales.",
    category: "Estrategia",
    duration: "8 horas",
    level: "Principiante",
    instructor: "María López",
    thumbnail: "/business-strategy-consulting.png",
    progress: 65,
    enrolled: true,
    completedLessons: 13,
    totalLessons: 20,
  },
  {
    id: "2",
    title: "Análisis de Datos con Python",
    description: "Domina Python para análisis de datos y visualización avanzada.",
    category: "Tecnología",
    duration: "12 horas",
    level: "Intermedio",
    instructor: "Carlos Mendoza",
    thumbnail: "/python-data-analysis-code.jpg",
    progress: 30,
    enrolled: true,
    completedLessons: 6,
    totalLessons: 18,
  },
  {
    id: "3",
    title: "Liderazgo Transformacional",
    description: "Desarrolla habilidades de liderazgo para transformar equipos y organizaciones.",
    category: "Liderazgo",
    duration: "6 horas",
    level: "Avanzado",
    instructor: "Ana Martínez",
    thumbnail: "/leadership-team-management.jpg",
    progress: 100,
    enrolled: true,
    completedLessons: 15,
    totalLessons: 15,
  },
  {
    id: "4",
    title: "Gestión de Proyectos Ágiles",
    description: "Implementa metodologías ágiles en tus proyectos de consultoría.",
    category: "Gestión",
    duration: "10 horas",
    level: "Intermedio",
    instructor: "Roberto Silva",
    thumbnail: "/agile-project-management-scrum.jpg",
    enrolled: false,
  },
  {
    id: "5",
    title: "Comunicación Efectiva para Consultores",
    description: "Mejora tus habilidades de comunicación y presentación ante clientes.",
    category: "Soft Skills",
    duration: "5 horas",
    level: "Principiante",
    instructor: "Laura Fernández",
    thumbnail: "/business-presentation-communication.jpg",
    enrolled: false,
  },
  {
    id: "6",
    title: "Inteligencia Artificial para Negocios",
    description: "Entiende cómo la IA puede transformar los modelos de negocio.",
    category: "Tecnología",
    duration: "15 horas",
    level: "Avanzado",
    instructor: "Diego Ramírez",
    thumbnail: "/artificial-intelligence-business-technology.jpg",
    enrolled: false,
  },
]

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Ana García",
    email: "ana@ofi.com",
    avatar: "/professional-woman-consultant.png",
    coursesCompleted: 3,
    coursesInProgress: 2,
    totalHours: 45,
    lastActive: "Hace 2 horas",
  },
  {
    id: "2",
    name: "Pedro Sánchez",
    email: "pedro@ofi.com",
    avatar: "/professional-man-consultant.png",
    coursesCompleted: 5,
    coursesInProgress: 1,
    totalHours: 68,
    lastActive: "Hace 1 día",
  },
  {
    id: "3",
    name: "Lucía Torres",
    email: "lucia@ofi.com",
    avatar: "/professional-business-woman.png",
    coursesCompleted: 2,
    coursesInProgress: 3,
    totalHours: 32,
    lastActive: "Hace 3 horas",
  },
  {
    id: "4",
    name: "Miguel Ángel Ruiz",
    email: "miguel@ofi.com",
    avatar: "/professional-man-business.png",
    coursesCompleted: 4,
    coursesInProgress: 2,
    totalHours: 56,
    lastActive: "Hace 5 horas",
  },
]
