import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showForgot, setShowForgot] = useState(false);

  // Redirect to home if already logged in
  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage({ text: 'Check your email for a confirmation link!', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Something went wrong', type: 'error' });
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const isLovableHost = window.location.hostname.endsWith('.lovable.app');
      if (isLovableHost) {
        const result = await lovable.auth.signInWithOAuth('google', {
          redirect_uri: window.location.origin,
        });
        if (result.error) {
          setMessage({ text: (result.error as Error).message || 'Google sign-in failed', type: 'error' });
          setLoading(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (error) {
          setMessage({ text: error.message || 'Google sign-in failed', type: 'error' });
          setLoading(false);
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Google sign-in failed', type: 'error' });
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to send reset email', type: 'error' });
    }
    setLoading(false);
  };

  if (showForgot) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="orb orb-gold" />
        <div className="orb orb-teal" />
        <div className="orb orb-purple" />
        <div className="glass-card w-full max-w-md p-8 relative z-10">
          <h1 className="font-display text-2xl font-extrabold text-center mb-2">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-center mb-6">Enter your email to receive a reset link</p>
          {message && (
            <div className={`text-sm p-3 rounded-xl mb-4 ${message.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-destructive/10 text-destructive'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Email address" className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <button onClick={() => { setShowForgot(false); setMessage(null); }}
            className="w-full text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors">
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="orb orb-gold" />
      <div className="orb orb-teal" />
      <div className="orb orb-purple" />
      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold">
            Fit<span className="text-gold">Genius</span> AI
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Your intelligent wellness companion</p>
        </div>

        {message && (
          <div className={`text-sm p-3 rounded-xl mb-4 ${message.type === 'success' ? 'bg-teal/10 text-teal' : 'bg-destructive/10 text-destructive'}`}>
            {message.text}
          </div>
        )}

        {/* Google Sign In - only show on Lovable domains */}
        {window.location.hostname.endsWith('.lovable.app') && (
          <>
            <button onClick={handleGoogleAuth} disabled={loading}
              className="w-full bg-secondary hover:bg-muted py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-colors disabled:opacity-50 mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          )}
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="Email address" className="w-full bg-secondary rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Password" className="w-full bg-secondary rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isSignUp && (
            <button type="button" onClick={() => { setShowForgot(true); setMessage(null); }}
              className="text-xs text-gold hover:underline">
              Forgot password?
            </button>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
            className="text-gold hover:underline font-medium">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
