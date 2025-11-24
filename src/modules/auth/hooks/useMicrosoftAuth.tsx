
import { useState, useCallback, useEffect } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';

// Configuración de MSAL
const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '', // Tu Client ID de Azure
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

export type AuthStatus = 'idle' | 'loading' | 'authenticating' | 'success' | 'error';

export interface MicrosoftAuthState {
  status: AuthStatus;
  user: AccountInfo | null;
  error: string | null;
  accessToken: string | null;
}

export interface UseMicrosoftAuthReturn {
  state: MicrosoftAuthState;
  loginWithMicrosoft: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const useMicrosoftAuth = (): UseMicrosoftAuthReturn => {
  const [state, setState] = useState<MicrosoftAuthState>({
    status: 'idle',
    user: null,
    error: null,
    accessToken: null,
  });

  // Inicializar MSAL
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();
        
        // Manejar respuesta de redirect
        const response = await msalInstance.handleRedirectPromise();
        
        if (response) {
          setState({
            status: 'success',
            user: response.account,
            error: null,
            accessToken: response.accessToken,
          });
        } else {
          // Verificar si hay una cuenta activa
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            setState(prev => ({
              ...prev,
              user: accounts[0],
              status: 'success',
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing MSAL:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Error al inicializar la autenticación',
        }));
      }
    };

    initializeMsal();
  }, []);

  const loginWithMicrosoft = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: 'loading',
      error: null,
    }));

    try {
      // Intentar login silencioso primero
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        try {
          const silentRequest = {
            scopes: ['User.Read', 'openid', 'profile', 'email'],
            account: accounts[0],
          };
          
          const response = await msalInstance.acquireTokenSilent(silentRequest);
          
          setState({
            status: 'success',
            user: response.account,
            error: null,
            accessToken: response.accessToken,
          });
          
          return;
        } catch (silentError) {
          console.log(silentError);
        }
      }

      // Si el login silencioso falla, usar popup o redirect
      setState(prev => ({ ...prev, status: 'authenticating' }));

      const loginRequest = {
        scopes: ['User.Read', 'openid', 'profile', 'email'],
        prompt: 'select_account',
      };

      // Opción 1: Login con Popup (más rápido, mejor UX)
      try {
        const response = await msalInstance.loginPopup(loginRequest);
        
        setState({
          status: 'success',
          user: response.account,
          error: null,
          accessToken: response.accessToken,
        });
      } catch (popupError: any) {
        // Si el popup es bloqueado, intentar con redirect
        if (popupError.errorCode === 'popup_window_error' || 
            popupError.errorCode === 'empty_window_error') {
          console.log('Popup blocked, using redirect');
          await msalInstance.loginRedirect(loginRequest);
          // El estado se manejará cuando la página recargue
        } else {
          throw popupError;
        }
      }
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      
      let errorMessage = 'Error al iniciar sesión con Microsoft';
      
      if (error.errorCode === 'user_cancelled') {
        errorMessage = 'Inicio de sesión cancelado';
      } else if (error.errorCode === 'consent_required') {
        errorMessage = 'Se requiere consentimiento adicional';
      } else if (error.errorCode === 'interaction_required') {
        errorMessage = 'Se requiere interacción del usuario';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState({
        status: 'error',
        user: null,
        error: errorMessage,
        accessToken: null,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
        });
      }
      
      setState({
        status: 'idle',
        user: null,
        error: null,
        accessToken: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Limpiar el estado de todas formas
      setState({
        status: 'idle',
        user: null,
        error: null,
        accessToken: null,
      });
    }
  }, []);

  return {
    state,
    loginWithMicrosoft,
    logout,
    isLoading: state.status === 'loading' || state.status === 'authenticating',
  };
};