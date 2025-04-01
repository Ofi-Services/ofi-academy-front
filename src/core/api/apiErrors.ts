
// src/core/api/apiErrors.ts

/**
 * Error específico de la API para gestionar errores de negocio
 */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error de red para problemas de conectividad
 */
export class NetworkError extends Error {
  constructor(
    message: string = 'Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Error de autenticación para problemas de acceso
 */
export class AuthenticationError extends ApiError {
  constructor(
    message: string = 'Tu sesión ha expirado o no tienes permisos para acceder a este recurso.',
    code: string = 'AUTH_REQUIRED',
    status: number = 401
  ) {
    super(code, message, status);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Códigos de error comunes para estandarizar los errores de la API
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;