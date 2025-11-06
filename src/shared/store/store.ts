import { configureStore } from "@reduxjs/toolkit"
import { setupListeners } from "@reduxjs/toolkit/query"
import { baseApi } from "@/core/api/baseApi"
import { coursesApi } from "@/shared/store/coursesApi" // ← IMPORTAR
import authReducer from "@/modules/auth/store/authSlice"
import { trainingCalendarApi } from "../components/common/calendar/store/TrainingCalendarApi"

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer, // ← AGREGAR
    [trainingCalendarApi.reducerPath]: trainingCalendarApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(coursesApi.middleware) // ← AGREGAR
      .concat(trainingCalendarApi.middleware), // ← AGREGAR
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
