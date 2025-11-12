
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Base URL - en producción apuntaría a tu API real
const BASE_URL = "https://ofiacademy.api.sofiatechnology.ai/api"

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage or Redux state
    const token = localStorage.getItem("ofi_token")
    
    // If we have a token, include it in the headers
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    
    headers.set("Content-Type", "application/json")
    
    return headers
  },
})

// Base API with automatic authentication
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Courses",
    "UserProgress", 
    "TeamMembers",
    "TeamProgress",
    "Users",
    "SystemStats",
    "Certificates",
  ],
  endpoints: () => ({}),
})