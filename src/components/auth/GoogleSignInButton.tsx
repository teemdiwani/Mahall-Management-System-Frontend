import React, { useEffect, useRef, useState } from 'react';
import { authApi } from '../../api/authApi';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => Promise<void> | void;
  onError: (error: string) => void;
  textType?: 'signin_with' | 'signup_with' | 'continue_with';
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  textType = 'continue_with',
  disabled = false,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string>(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  );
  const [isGsiLoaded, setIsGsiLoaded] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Fetch Google Client ID if not defined in Vite env
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      if (clientId && clientId.length > 5) {
        setIsInitializing(false);
        return;
      }
      try {
        const res = await authApi.getAuthConfig();
        if (isMounted && res.data?.googleClientId) {
          setClientId(res.data.googleClientId);
        }
      } catch (e) {
        console.warn('Could not fetch backend auth config:', e);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, [clientId]);

  // 2. Poll/wait for window.google to be available
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setIsGsiLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        clearInterval(interval);
      }
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // 3. Initialize and Render Google Button
  useEffect(() => {
    if (!isGsiLoaded || !clientId || !buttonContainerRef.current) return;

    try {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response.credential) {
            onError('Google did not return an authentication credential.');
            return;
          }
          try {
            setIsSubmitting(true);
            await onSuccess(response.credential);
          } catch (err: any) {
            onError(err?.message || 'Google authentication failed.');
          } finally {
            setIsSubmitting(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear previous button if any
      buttonContainerRef.current.innerHTML = '';

      window.google?.accounts.id.renderButton(buttonContainerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: textType,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonContainerRef.current.offsetWidth || 384,
      });
    } catch (err) {
      console.error('Error initializing Google Identity Services:', err);
    }
  }, [isGsiLoaded, clientId, textType, onSuccess, onError]);

  // Dev Mock Sign In (available in development mode for easy offline/demo testing)
  const handleDevMockLogin = async () => {
    try {
      setIsSubmitting(true);
      const mockPayload = {
        email: 'ahmed.rashid.google@example.com',
        name: 'Ahmed Google User',
        sub: 'google-sub-dev-user-001',
      };
      const mockToken = `mock-dev-token:${btoa(JSON.stringify(mockPayload))}`;
      await onSuccess(mockToken);
    } catch (err: any) {
      onError(err?.message || 'Dev mock Google sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isButtonBusy = disabled || isSubmitting;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Container for Official Google Button */}
      <div
        ref={buttonContainerRef}
        className={`w-full flex justify-center min-h-[44px] transition-opacity ${
          isButtonBusy ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Placeholder while Google Script or Client ID is loading */}
        {(!isGsiLoaded || isInitializing) && (
          <div className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-500 bg-gray-50 animate-pulse">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Loading Google Sign-in...
          </div>
        )}
      </div>

      {/* Dev Mode quick test button */}
      {import.meta.env.DEV && (
        <button
          id="dev-google-login-btn"
          type="button"
          onClick={handleDevMockLogin}
          disabled={isButtonBusy}
          className="mt-2 text-xs text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          title="Instant sign-in with a mock test account for local testing"
        >
          ⚡ Dev Mode: Quick Test Google Login
        </button>
      )}
    </div>
  );
};

export default GoogleSignInButton;
