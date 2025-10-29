import { Routes, Route } from "react-router-dom"
import Login from "@/modules/auth/pages/Index"
import NotFound from "@/shared/components/common/NotFound"

// Import modular routes
import { consultantRoutes } from "@/modules/consultant/routes/consultant.routes"
import { leaderRoutes } from "@/modules/leader/routes/leader.routes"
//import { superuserRoutes } from "@/modules/superuser/routes/superuser.routes"
import { sharedRoutes } from "@/shared/routes/shared.routes"

/**
 * Main Application Routes
 * 
 * Routes are organized by modules:
 * - Consultant routes: /dashboard, /schedule, /resources, /forums
 * - Leader routes: /leader/*
 * - Superuser routes: /superuser/*
 * - Shared routes: /support, /settings (all authenticated users)
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />

      {/* Consultant module routes */}
      {consultantRoutes}

      {/* Leader module routes */}
      {leaderRoutes}

      {/* Superuser module routes */}
      {/*superuserRoutes*/}

      {/* Shared routes (all authenticated users) */}
      {sharedRoutes}

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}