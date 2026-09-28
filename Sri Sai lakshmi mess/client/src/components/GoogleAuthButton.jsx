import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, ExternalLink, Sparkles, X, KeyRound, Shield } from 'lucide-react';

// Google Official Multi-color G SVG Icon
export function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ mode = 'signin', onSuccess, onError }) {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const googleBtnContainerRef = useRef(null);

  // Check env variable or localStorage override
  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    localStorage.getItem('ssl_google_client_id') ||
    '';

  const isRealClientConfigured = Boolean(
    clientId && clientId.trim() !== '' && !clientId.includes('YOUR_GOOGLE_CLIENT_ID')
  );

  // Initialize Google Identity Services when script is ready and clientId is set
  useEffect(() => {
    if (!isRealClientConfigured) return;

    let checkInterval = null;
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId.trim(),
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Render official Google button into the hidden/fallback container if desired
          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: mode === 'signup' ? 'signup_with' : 'signin_with',
              logo_alignment: 'left',
              width: '100%',
            });
          }
        } catch (err) {
          console.warn('[GoogleAuth] Google Identity Services init error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGsi();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clientId, isRealClientConfigured, mode]);

  // Handle Google OAuth Credential returned from Google popup / One-Tap
  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      onError?.('No credential received from Google.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginWithGoogle(response.credential);
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err) {
      console.error('[GoogleAuth] Backend verification error:', err);
      onError?.(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Click handler for our custom branded Google Button
  const handleButtonClick = () => {
    if (isRealClientConfigured && window.google?.accounts?.id) {
      setLoading(true);
      try {
        // Trigger Google account selector prompt / popup
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setLoading(false);
            // If One-Tap prompt is suppressed by browser policy, click the native rendered button
            const nativeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
            if (nativeBtn) {
              nativeBtn.click();
            } else {
              setShowSetupModal(true);
            }
          }
        });
      } catch (e) {
        setLoading(false);
        const nativeBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
        if (nativeBtn) nativeBtn.click();
        else setShowSetupModal(true);
      }
    } else {
      // Show setup modal / demo tester
      setShowSetupModal(true);
    }
  };

  // Demo Google Sign-In (runs the full backend OAuth flow for instant testing)
  const handleDemoSignIn = async () => {
    setLoading(true);
    setShowSetupModal(false);
    try {
      // Build a demo test token format supported by the backend in development
      const demoPayload = {
        googleId: `goog_demo_${Date.now()}`,
        email: `customer.${Date.now().toString().slice(-4)}@gmail.com`,
        name: mode === 'signup' ? 'Lakshmi Priya (Google Customer)' : 'Santhosh (Google Customer)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      };
      const demoToken = 'demo_google_' + btoa(JSON.stringify(demoPayload));
      const user = await loginWithGoogle(demoToken);
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (err) {
      console.error('[GoogleAuth] Demo error:', err);
      onError?.(err.message || 'Demo Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomClientId = (e) => {
    e.preventDefault();
    if (!customClientId.trim()) return;
    localStorage.setItem('ssl_google_client_id', customClientId.trim());
    setShowSetupModal(false);
    window.location.reload();
  };

  const buttonText = mode === 'signup' ? 'Sign up with Google' : 'Continue with Google';

  return (
    <>
      <div className="google-auth-container" style={{ width: '100%' }}>
        {/* Hidden or visible container for official Google Identity Services button */}
        <div
          ref={googleBtnContainerRef}
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {/* Custom Premium Styled Google OAuth Button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className="auth-google-btn"
          aria-label={buttonText}
          title="Sign in with your Google Account"
        >
          {loading ? (
            <span className="auth-spinner-dark" />
          ) : (
            <>
              <span className="auth-google-icon-wrapper">
                <GoogleIcon size={20} />
              </span>
              <span className="auth-google-btn-text">{buttonText}</span>
              <span className="auth-google-badge">OAuth</span>
            </>
          )}
        </button>
      </div>

      {/* Google OAuth Setup / Demo Modal */}
      {showSetupModal && (
        <div className="google-modal-overlay" onClick={() => setShowSetupModal(false)}>
          <div
            className="google-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="google-modal-title"
          >
            <div className="google-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GoogleIcon size={24} />
                <h3 id="google-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1c1917' }}>
                  Google OAuth 2.0 Sign-In
                </h3>
              </div>
              <button
                type="button"
                className="google-modal-close"
                onClick={() => setShowSetupModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="google-modal-body">
              <div className="google-modal-info-box">
                <Shield size={20} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.88rem', color: '#44403c', lineHeight: 1.5 }}>
                  <strong>Secure Google Authentication</strong>
                  <p style={{ margin: '0.25rem 0 0' }}>
                    Customers can sign up and log in using their verified Google account. Google securely handles password verification and profile syncing.
                  </p>
                </div>
              </div>

              {/* Instant Test Mode */}
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                border: '1.5px solid #fed7aa',
                borderRadius: '12px',
                padding: '1rem 1.1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} color="#c2410c" />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#9a3412' }}>
                    Instant Demo / Test Login
                  </span>
                </div>
                <p style={{ margin: '0 0 0.85rem', fontSize: '0.82rem', color: '#7c2d12', lineHeight: 1.4 }}>
                  Test the complete OAuth flow right now! This connects to your backend <code>/api/auth/google</code>, creates or signs in the customer account, and issues a verified JWT session.
                </p>
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                  }}
                >
                  <GoogleIcon size={16} />
                  <span>{loading ? 'Authenticating…' : '⚡ Test Google OAuth Now (1-Click)'}</span>
                </button>
              </div>

              {/* Instructions to configure real Client ID */}
              <div style={{
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '1rem',
                background: '#fafaf9'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <KeyRound size={15} color="#57534e" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#292524' }}>
                    Connect Real Google Cloud Client ID
                  </span>
                </div>
                <ol style={{ margin: '0 0 0.85rem 1.25rem', padding: 0, fontSize: '0.8rem', color: '#57534e', lineHeight: 1.5 }}>
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" style={{ color: '#ea580c', fontWeight: 600 }}>Google Cloud Console <ExternalLink size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /></a></li>
                  <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web application)</li>
                  <li>Add your domain / <code>http://localhost:5173</code> to Authorized JavaScript Origins</li>
                  <li>Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>client/.env</code> or enter it below:</li>
                </ol>

                <form onSubmit={handleSaveCustomClientId} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
                    value={customClientId}
                    onChange={(e) => setCustomClientId(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.82rem',
                      border: '1px solid #d6d3d1',
                      borderRadius: '8px',
                      background: 'white'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 0.9rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
                  >
                    Save & Use
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
