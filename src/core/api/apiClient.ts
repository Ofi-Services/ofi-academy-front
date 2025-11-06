// src/core/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, NetworkError, AuthenticationError, ErrorCodes } from './apiErrors';

/**
 * Interfaz para la respuesta de error de la API
 */
interface ApiErrorResponse {
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Configuración del entorno para la API
 */
export const API_CONFIG = {
  BASE_URL: "http://localhost:8000" ,//import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  TIMEOUT: 30000, // 30 segundos
  VERSION: "v1",
};

/**
 * Crea y configura una instancia de Axios para las peticiones a la API
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/${API_CONFIG.VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Interceptor para añadir token de autenticación a las peticiones
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para manejar respuestas y errores de forma estandarizada
  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorResponse>) => {
      if (!error.response) {
        // Error de red o timeout
        return Promise.reject(new NetworkError(
          'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.',
          error as Error
        ));
      }

      const { response } = error;
      const status = response.status;
      const data = response.data || {};

      // Obtener los detalles del error desde la respuesta
      const errorCode = data.code || ErrorCodes.UNKNOWN_ERROR;
      const errorMessage = data.message || 'Ha ocurrido un error desconocido';
      const errorDetails = data.details;

      // Manejar casos específicos según el estado HTTP
      if (status === 401) {
        // Error de autenticación
        return Promise.reject(new AuthenticationError(
          errorMessage,
          errorCode,
          status
        ));
      }

      // Crear un error específico de la API
      return Promise.reject(new ApiError(
        errorCode,
        errorMessage,
        status,
        errorDetails
      ));
    }
  );

  return instance;
};

// Crear la instancia del cliente de API
export const apiClient = createApiClient();

/**
 * Clase para gestionar las operaciones con la API
 * Proporciona una capa de abstracción sobre axios para operaciones comunes
 */
export class ApiService {
  constructor(private readonly instance: AxiosInstance = apiClient) {}

  /**
   * Realiza una petición GET
   * @param url Endpoint a consultar
   * @param config Configuración adicional de la petición
   * @returns Respuesta tipada
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  /**
   * Realiza una petición POST
   * @param url Endpoint a consultar
   * @param data Datos a enviar
   * @param config Configuración adicional de la petición
   * @returns Respuesta tipada
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  /**
   * Realiza una petición PUT
   * @param url Endpoint a consultar
   * @param data Datos a enviar
   * @param config Configuración adicional de la petición
   * @returns Respuesta tipada
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  /**
   * Realiza una petición PATCH
   * @param url Endpoint a consultar
   * @param data Datos a enviar
   * @param config Configuración adicional de la petición
   * @returns Respuesta tipada
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  /**
   * Realiza una petición DELETE
   * @param url Endpoint a consultar
   * @param config Configuración adicional de la petición
   * @returns Respuesta tipada
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }
}

// Exportar una instancia global del servicio API
export const apiService = new ApiService(apiClient);