
import { TrainingCourse, MonthTrainingSummary, DayTraining } from '../types';

// Mock courses data
export const mockCourses: TrainingCourse[] = [
  {
    id: "1",
    title: "React Fundamentals",
    description: "Learn the basics of React including components, props, and state management",
    enrolled: true,
    progress: 75,
    completedLessons: 8,
    totalLessons: 10,
    instructor: "María González",
    category: "Frontend Development",
    duration: "8 hours",
    difficulty: "beginner",
    tags: ["React", "JavaScript", "Web Development"],
    scheduledDates: ["2025-11-05", "2025-11-12", "2025-11-19"]
  },
  {
    id: "2",
    title: "Advanced TypeScript",
    description: "Master TypeScript with advanced types, generics, and best practices",
    enrolled: true,
    progress: 45,
    completedLessons: 5,
    totalLessons: 12,
    instructor: "Carlos Ruiz",
    category: "Frontend Development",
    duration: "15 hours",
    difficulty: "advanced",
    tags: ["TypeScript", "JavaScript", "Types"],
    scheduledDates: ["2025-11-03", "2025-11-10", "2025-11-17", "2025-11-24"]
  },
  {
    id: "3",
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js and Express",
    enrolled: true,
    progress: 60,
    completedLessons: 9,
    totalLessons: 15,
    instructor: "Ana Martínez",
    category: "Backend Development",
    duration: "20 hours",
    difficulty: "intermediate",
    tags: ["Node.js", "Express", "Backend"],
    scheduledDates: ["2025-11-06", "2025-11-13", "2025-11-20", "2025-11-27"]
  },
  {
    id: "4",
    title: "Python for Data Science",
    description: "Learn Python programming for data analysis and machine learning",
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 18,
    instructor: "Roberto Silva",
    category: "Data Science",
    duration: "25 hours",
    difficulty: "intermediate",
    tags: ["Python", "Data Science", "ML"],
    scheduledDates: ["2025-11-08", "2025-11-15", "2025-11-22", "2025-11-29"]
  },
  {
    id: "5",
    title: "UI/UX Design Principles",
    description: "Master the fundamentals of user interface and experience design",
    enrolled: true,
    progress: 90,
    completedLessons: 9,
    totalLessons: 10,
    instructor: "Laura Pérez",
    category: "Design",
    duration: "12 hours",
    difficulty: "beginner",
    tags: ["UI/UX", "Design", "Figma"],
    scheduledDates: ["2025-11-04", "2025-11-11", "2025-11-18"]
  },
  {
    id: "6",
    title: "Docker & Kubernetes",
    description: "Container orchestration and deployment with Docker and K8s",
    enrolled: true,
    progress: 30,
    completedLessons: 3,
    totalLessons: 10,
    instructor: "Miguel Torres",
    category: "DevOps",
    duration: "16 hours",
    difficulty: "advanced",
    tags: ["Docker", "Kubernetes", "DevOps"],
    scheduledDates: ["2025-11-07", "2025-11-14", "2025-11-21", "2025-11-28"]
  },
  {
    id: "7",
    title: "SQL Database Design",
    description: "Learn database design, normalization, and SQL optimization",
    enrolled: true,
    progress: 55,
    completedLessons: 6,
    totalLessons: 11,
    instructor: "Patricia Gómez",
    category: "Backend Development",
    duration: "14 hours",
    difficulty: "intermediate",
    tags: ["SQL", "Database", "PostgreSQL"],
    scheduledDates: ["2025-11-09", "2025-11-16", "2025-11-23"]
  },
  {
    id: "8",
    title: "Agile Project Management",
    description: "Master Scrum, Kanban, and agile methodologies",
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    totalLessons: 8,
    instructor: "Juan Rodríguez",
    category: "Project Management",
    duration: "10 hours",
    difficulty: "beginner",
    tags: ["Agile", "Scrum", "Management"],
    scheduledDates: ["2025-11-05", "2025-11-12", "2025-11-19", "2025-11-26"]
  }
];

// Generate mock month summary for November 2025
export const mockMonthSummary: MonthTrainingSummary = {
  month: 10, // November (0-indexed)
  year: 2025,
  totalCourses: 8,
  totalEnrolled: 6,
  averageProgress: 54.2,
  categoriesBreakdown: [
    {
      category: "Frontend Development",
      count: 2,
      enrolled: 2,
      avgProgress: 60
    },
    {
      category: "Backend Development",
      count: 2,
      enrolled: 2,
      avgProgress: 57.5
    },
    {
      category: "Data Science",
      count: 1,
      enrolled: 0,
      avgProgress: 0
    },
    {
      category: "Design",
      count: 1,
      enrolled: 1,
      avgProgress: 90
    },
    {
      category: "DevOps",
      count: 1,
      enrolled: 1,
      avgProgress: 30
    },
    {
      category: "Project Management",
      count: 1,
      enrolled: 0,
      avgProgress: 0
    }
  ],
  topInstructors: [
    { name: "María González", coursesCount: 1 },
    { name: "Carlos Ruiz", coursesCount: 1 },
    { name: "Ana Martínez", coursesCount: 1 },
    { name: "Roberto Silva", coursesCount: 1 },
    { name: "Laura Pérez", coursesCount: 1 }
  ],
  dailySummary: [
    { day: 3, coursesCount: 1, categories: { "Frontend Development": 1 } },
    { day: 4, coursesCount: 1, categories: { "Design": 1 } },
    { day: 5, coursesCount: 2, categories: { "Frontend Development": 1, "Project Management": 1 } },
    { day: 6, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 7, coursesCount: 1, categories: { "DevOps": 1 } },
    { day: 8, coursesCount: 1, categories: { "Data Science": 1 } },
    { day: 9, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 10, coursesCount: 1, categories: { "Frontend Development": 1 } },
    { day: 11, coursesCount: 2, categories: { "Design": 1, "Project Management": 1 } },
    { day: 12, coursesCount: 2, categories: { "Frontend Development": 2 } },
    { day: 13, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 14, coursesCount: 1, categories: { "DevOps": 1 } },
    { day: 15, coursesCount: 1, categories: { "Data Science": 1 } },
    { day: 16, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 17, coursesCount: 1, categories: { "Frontend Development": 1 } },
    { day: 18, coursesCount: 2, categories: { "Frontend Development": 1, "Design": 1 } },
    { day: 19, coursesCount: 2, categories: { "Frontend Development": 1, "Project Management": 1 } },
    { day: 20, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 21, coursesCount: 1, categories: { "DevOps": 1 } },
    { day: 22, coursesCount: 1, categories: { "Data Science": 1 } },
    { day: 23, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 24, coursesCount: 1, categories: { "Frontend Development": 1 } },
    { day: 26, coursesCount: 1, categories: { "Project Management": 1 } },
    { day: 27, coursesCount: 1, categories: { "Backend Development": 1 } },
    { day: 28, coursesCount: 1, categories: { "DevOps": 1 } },
    { day: 29, coursesCount: 1, categories: { "Data Science": 1 } }
  ]
};

// Helper function to get courses for a specific day
export const getCoursesForDay = (date: string): DayTraining => {
  const coursesForDay = mockCourses.filter(course => 
    course.scheduledDates?.includes(date)
  );

  const categories: { [key: string]: number } = {};
  coursesForDay.forEach(course => {
    categories[course.category] = (categories[course.category] || 0) + 1;
  });

  return {
    date,
    courses: coursesForDay,
    totalCourses: coursesForDay.length,
    categories
  };
};

// Helper to get course count for a specific day
export const getCourseCountForDay = (day: number, month: number, year: number): number => {
  const date = new Date(year, month, day).toISOString().split('T')[0];
  const daySummary = mockMonthSummary.dailySummary.find(d => d.day === day);
  return daySummary?.coursesCount || 0;
};

// Helper to get categories for a specific day
export const getCategoriesForDay = (day: number): { [key: string]: number } => {
  const daySummary = mockMonthSummary.dailySummary.find(d => d.day === day);
  return daySummary?.categories || {};
};
