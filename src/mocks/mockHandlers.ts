/*import { http, HttpResponse, delay } from "msw"

// Import mock data
import consultantData from "./mockData/consultant.json"
import leaderData from "./mockData/leader.json"
import superuserData from "./mockData/superuser.json"

const BASE_URL = "/api"

// Simulate network delay
const NETWORK_DELAY = 500*/
export const handlers = [];
/*export const handlers = [
  // ============================================
  // CONSULTANT ENDPOINTS
  // ============================================
  
  // Get all consultant courses
  http.get(`${BASE_URL}/consultant/courses`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(consultantData.courses)
  }),
  
  // Get enrolled courses only
  http.get(`${BASE_URL}/consultant/courses/enrolled`, async () => {
    await delay(NETWORK_DELAY)
    const enrolledCourses = consultantData.courses.filter(c => c.enrolled)
    return HttpResponse.json(enrolledCourses)
  }),

  // Get course details with modules
  http.get(`${BASE_URL}/consultant/courses/:courseId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    const course = consultantData.courses.find(c => c.id === courseId)
    
    if (!course) {
      return HttpResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(course)
  }),
  
  // Get user progress
  http.get(`${BASE_URL}/consultant/progress/:userId`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(consultantData.userProgress)
  }),
  
  // Get schedule
  http.get(`${BASE_URL}/consultant/schedule`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(consultantData.schedule)
  }),
  
  // Enroll in course
  http.post(`${BASE_URL}/consultant/courses/:courseId/enroll`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    const course = consultantData.courses.find(c => c.id === courseId)
    
    if (!course) {
      return HttpResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      ...course,
      enrolled: true,
      progress: 0,
      completedLessons: 0,
    })
  }),
  
  // Update course progress with file upload support (ACTUALIZADO PARA FORMDATA)
  http.patch(`${BASE_URL}/consultant/courses/:courseId/progress`, async ({ params, request }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    
    // Parse FormData instead of JSON
    const formData = await request.formData()
    
    // Extract data from FormData
    const completedModulesStr = formData.get('completedModules') as string
    const progressStr = formData.get('progress') as string
    const completedLessonsStr = formData.get('completedLessons') as string
    const modulesWithFilesStr = formData.get('modulesWithFiles') as string
    
    // Parse JSON strings
    const completedModules = JSON.parse(completedModulesStr) as string[]
    const progress = parseInt(progressStr)
    const completedLessons = parseInt(completedLessonsStr)
    const modulesWithFiles = JSON.parse(modulesWithFilesStr) as { [key: string]: number }
    
    // Extract and log uploaded files
    const uploadedFiles: { [moduleId: string]: Array<{ name: string, size: number, type: string }> } = {}
    
    for (const [key, value] of formData.entries()) {
      // Match pattern: module_<moduleId>_file_<index>
      const match = key.match(/^module_(.+)_file_\d+$/)
      if (match && value instanceof File) {
        const moduleId = match[1]
        
        if (!uploadedFiles[moduleId]) {
          uploadedFiles[moduleId] = []
        }
        
        uploadedFiles[moduleId].push({
          name: value.name,
          size: value.size,
          type: value.type,
        })
        
        console.log(`📁 File uploaded for module ${moduleId}:`, {
          name: value.name,
          size: `${(value.size / 1024).toFixed(2)} KB`,
          type: value.type,
        })
      }
    }
    
    // Log summary
    console.log('📊 Progress Update Summary:', {
      courseId,
      completedModules,
      progress: `${progress}%`,
      completedLessons,
      totalFiles: Object.values(uploadedFiles).flat().length,
      filesByModule: Object.entries(uploadedFiles).map(([moduleId, files]) => ({
        moduleId,
        fileCount: files.length,
      })),
    })
    
    // Find course
    const course = consultantData.courses.find(c => c.id === courseId)
    
    if (!course) {
      return HttpResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Update module completion status
    const updatedModules = course.modules?.map(module => ({
      ...module,
      completed: completedModules.includes(module.id),
      // In a real app, you would save file references here
      files: uploadedFiles[module.id]?.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        url: `/uploads/${courseId}/${module.id}/${f.name}`, // Simulated URL
        uploadedAt: new Date().toISOString(),
      })) || module.files || [],
    })) || []
    
    // Update course
    const updatedCourse = {
      ...course,
      progress,
      completedLessons,
      modules: updatedModules,
    }

    // Simulate successful file upload response
    return HttpResponse.json(updatedCourse)
  }),
  
  // ============================================
  // LEADER ENDPOINTS
  // ============================================
  
  // Get team members
  http.get(`${BASE_URL}/leader/team/members`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(leaderData.teamMembers)
  }),
  
  // Get team progress
  http.get(`${BASE_URL}/leader/team/progress`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(leaderData.teamProgress)
  }),
  
  // Get team member details
  http.get(`${BASE_URL}/leader/team/members/:memberId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { memberId } = params
    const member = leaderData.teamMembers.find(m => m.id === memberId)
    
    if (!member) {
      return HttpResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(member)
  }),
  
  // Get team reports
  http.get(`${BASE_URL}/leader/reports`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(leaderData.reports)
  }),
  
  // Get team certificates
  http.get(`${BASE_URL}/leader/certificates`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(leaderData.certificates)
  }),
  
  // Assign course to team member
  http.post(`${BASE_URL}/leader/team/members/:memberId/assign-course`, async ({ params, request }) => {
    await delay(NETWORK_DELAY)
    const { memberId } = params
    const body = await request.json() as { courseId: string }
    
    console.log(`Assigning course ${body.courseId} to member ${memberId}`)
    
    return HttpResponse.json(
      { success: true, message: "Course assigned successfully" },
      { status: 200 }
    )
  }),
  
  // Send team message
  http.post(`${BASE_URL}/leader/messages/send`, async ({ request }) => {
    await delay(NETWORK_DELAY)
    const body = await request.json() as { subject: string; message: string; recipients: string[] }
    
    console.log(`Sending message to ${body.recipients.length} recipients`)
    
    return HttpResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    )
  }),
  
  // ============================================
  // SUPERUSER ENDPOINTS
  // ============================================
  
  // Get all users
  http.get(`${BASE_URL}/superuser/users`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(superuserData.users)
  }),
  
  // Get user by ID
  http.get(`${BASE_URL}/superuser/users/:userId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { userId } = params
    const user = superuserData.users.find(u => u.id === userId)
    
    if (!user) {
      return HttpResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(user)
  }),
  
  // Create user
  http.post(`${BASE_URL}/superuser/users`, async ({ request }) => {
    await delay(NETWORK_DELAY)
    const body = await request.json()
    
    const newUser = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: "active",
      ...body,
    }
    
    return HttpResponse.json(newUser, { status: 201 })
  }),
  
  // Update user
  http.patch(`${BASE_URL}/superuser/users/:userId`, async ({ params, request }) => {
    await delay(NETWORK_DELAY)
    const { userId } = params
    const body = await request.json()
    
    const user = superuserData.users.find(u => u.id === userId)
    
    if (!user) {
      return HttpResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({ ...user, ...body })
  }),
  
  // Delete user
  http.delete(`${BASE_URL}/superuser/users/:userId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { userId } = params
    
    return HttpResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    )
  }),
  
  // Get all courses
  http.get(`${BASE_URL}/superuser/courses`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(superuserData.courses)
  }),
  
  // Get course by ID
  http.get(`${BASE_URL}/superuser/courses/:courseId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    const course = superuserData.courses.find(c => c.id === courseId)
    
    if (!course) {
      return HttpResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json(course)
  }),
  
  // Create course
  http.post(`${BASE_URL}/superuser/courses`, async ({ request }) => {
    await delay(NETWORK_DELAY)
    const body = await request.json()
    
    const newCourse = {
      id: String(Date.now()),
      enrolledUsers: 0,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    }
    
    return HttpResponse.json(newCourse, { status: 201 })
  }),
  
  // Update course
  http.patch(`${BASE_URL}/superuser/courses/:courseId`, async ({ params, request }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    const body = await request.json()
    
    const course = superuserData.courses.find(c => c.id === courseId)
    
    if (!course) {
      return HttpResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      ...course,
      ...body,
      updatedAt: new Date().toISOString(),
    })
  }),
  
  // Delete course
  http.delete(`${BASE_URL}/superuser/courses/:courseId`, async ({ params }) => {
    await delay(NETWORK_DELAY)
    const { courseId } = params
    
    return HttpResponse.json(
      { success: true, message: "Course deleted successfully" },
      { status: 200 }
    )
  }),
  
  // Get system stats
  http.get(`${BASE_URL}/superuser/stats`, async () => {
    await delay(NETWORK_DELAY)
    return HttpResponse.json(superuserData.systemStats)
  }),
  
  // Get activity logs
  http.get(`${BASE_URL}/superuser/activity-logs`, async ({ request }) => {
    await delay(NETWORK_DELAY)
    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get("limit") || "50")
    
    return HttpResponse.json(superuserData.activityLogs.slice(0, limit))
  }),
  
  // Generate report
  http.post(`${BASE_URL}/superuser/reports/generate`, async ({ request }) => {
    await delay(2000) // Longer delay for report generation
    const body = await request.json()
    
    return HttpResponse.json({
      reportId: String(Date.now()),
      downloadUrl: `/reports/${Date.now()}-report.pdf`,
    })
  }),
]*/