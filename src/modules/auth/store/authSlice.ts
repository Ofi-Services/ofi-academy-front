// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import { authService, AuthResponse, User, LoginCredentials, RegisterData } from '../services/authService';
import { ApiError, NetworkError } from '@/core/api/apiErrors';
import { RootState } from '@/core/store/store';

// Definición del estado
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  } | null;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null
};

// Funciones auxiliares para manejar errores
const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details
    };
  } else if (error instanceof NetworkError) {
    return {
      code: 'NETWORK_ERROR',
      message: error.message
    };
  } else {
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error 
        ? error.message 
        : 'Ha ocurrido un error desconocido. Por favor, intenta nuevamente.'
    };
  }
};

// Parsea errores de validación específicos de campos
const parseValidationErrors = (error: ApiError) => {
  if (error.code === 'VALIDATION_ERROR' && error.details) {
    const fieldErrors = error.details as Record<string, string[]>;
    const firstField = Object.keys(fieldErrors)[0];
    if (firstField && fieldErrors[firstField] && fieldErrors[firstField].length > 0) {
      return {
        code: error.code,
        message: fieldErrors[firstField][0],
        field: firstField,
        details: error.details
      };
    }
  }
  
  return {
    code: error.code,
    message: error.message,
    details: error.details
  };
};

// Thunks - Acciones asíncronas
export const loginUser = createAsyncThunk<
  AuthResponse, 
  LoginCredentials,
  { rejectValue: ReturnType<typeof handleApiError> }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Guardar tokens en localStorage
      localStorage.setItem('token', response.tokens.token);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        return rejectWithValue(parseValidationErrors(error));
      }
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterData,
  { rejectValue: ReturnType<typeof handleApiError> }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Guardar tokens en localStorage
      localStorage.setItem('token', response.tokens.token);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      return response;
    } catch (error) {
      if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        return rejectWithValue(parseValidationErrors(error));
      }
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice de Redux
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Manejo de estados pendientes (loading)
    builder.addMatcher(
      isAnyOf(
        loginUser.pending,
        registerUser.pending
      ),
      (state) => {
        state.isLoading = true;
        state.error = null;
      }
    );
    
    // Manejo de errores (rejected)
    builder.addMatcher(
      isAnyOf(
        loginUser.rejected,
        registerUser.rejected
      ),
      (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthState['error'];
      }
    );
    
    // Casos específicos para acciones fulfilled
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.token;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.tokens.token;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.isAuthenticated = true;
      });
  },
});

// Exportar acciones síncronas
export const { logout, clearError } = authSlice.actions;

// Selectores
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthToken = (state: RootState) => state.auth.token;

// Exportar el reducer
export default authSlice.reducer;