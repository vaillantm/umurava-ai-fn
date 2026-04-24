'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { login, register, requestPasswordReset } from '@/lib/auth';
import { showToast } from '@/lib/toast';

type Screen = 'login' | 'signup' | 'forgot' | 'forgot-success';

function PasswordStrength({ value }: { value: string }) {
  const score = [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  const colors = ['#dc2626', '#f97316', '#eab308', '#16a34a'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <>
      <div className="strength-bar">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="strength-seg" style={{ background: index < score ? colors[Math.max(score - 1, 0)] : 'var(--border2)' }} />
        ))}
      </div>
      <div className="strength-label" style={{ color: score > 0 ? colors[score - 1] : 'var(--text-dim)' }}>
        {score > 0 ? labels[score - 1] : 'Enter a password'}
      </div>
    </>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('login');
  const [loginPassVisible, setLoginPassVisible] = useState(false);
  const [signupPassVisible, setSignupPassVisible] = useState(false);
  const [signupPass, setSignupPass] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [sentEmail, setSentEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ fullName: '', email: '', password: '', companyName: '' });

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await login(loginForm);
      showToast('Signed in successfully.', 'success');
      router.push('/dashboard');
    } catch {
      showToast('Login failed. Please check your credentials.', 'info');
    } finally {
      setBusy(false);
    }
  }

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await register({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
        companyName: signupForm.companyName
      });
      showToast('Account created successfully.', 'success');
      router.push('/dashboard');
    } catch {
      showToast('Registration failed. Please try again.', 'info');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <nav>
        <Link className="nav-logo" href="/">
          <div className="nav-logo-mark">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <div className="nav-logo-text">Umurava AI</div>
        </Link>
        <button type="button" className="btn-ghost" onClick={() => router.push('/')}>
          Back to Home
        </button>
      </nav>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className={`screen ${screen === 'login' ? 'active' : ''}`}>
            <div className="auth-logo">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub">
              Sign in to your recruiter workspace.
              <br />
              Authorized recruiting teams only.
            </div>

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  required
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    type={loginPassVisible ? 'text' : 'password'}
                    id="login-pass"
                    placeholder="Password"
                    required
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <span className="input-icon material-symbols-outlined" onClick={() => setLoginPassVisible((value) => !value)}>
                    {loginPassVisible ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                <span className="auth-link" style={{ fontSize: 12 }} onClick={() => setScreen('forgot')}>
                  Forgot password?
                </span>
              </div>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? 'Signing in...' : 'Sign In to Workspace'}{' '}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </button>
            </form>

            <div className="auth-footer">
              Don't have an account? <span className="auth-link" onClick={() => setScreen('signup')}>Create one</span>
            </div>
          </div>

          <div className={`screen ${screen === 'signup' ? 'active' : ''}`}>
            <div className="auth-logo">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div className="auth-title">Create account</div>
            <div className="auth-sub">Set up your recruiter workspace to get started with AI-powered hiring.</div>

            <form onSubmit={handleSignupSubmit}>
              <div className="auth-grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    required
                    value={signupForm.fullName}
                    onChange={(event) => setSignupForm((current) => ({ ...current, fullName: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    placeholder="Acme Ltd"
                    value={signupForm.companyName}
                    onChange={(event) => setSignupForm((current) => ({ ...current, companyName: event.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  placeholder="recruiter@company.com"
                  required
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    type={signupPassVisible ? 'text' : 'password'}
                    id="signup-pass"
                    placeholder="Min. 8 characters"
                    value={signupForm.password}
                    onChange={(event) => {
                      setSignupPass(event.target.value);
                      setSignupForm((current) => ({ ...current, password: event.target.value }));
                    }}
                    required
                  />
                  <span className="input-icon material-symbols-outlined" onClick={() => setSignupPassVisible((value) => !value)}>
                    {signupPassVisible ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
                <PasswordStrength value={signupPass} />
              </div>
              <div className="checkbox-row">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <span className="auth-link">Terms of Service</span> and <span className="auth-link">Privacy Policy</span>
                </label>
              </div>
              <button type="submit" className="btn-primary" disabled={busy}>
                {busy ? 'Creating account...' : 'Create Account'}{' '}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </button>
            </form>

            <div className="auth-footer">
              Already have an account? <span className="auth-link" onClick={() => setScreen('login')}>Sign in</span>
            </div>
          </div>

          <div className={`screen ${screen === 'forgot' ? 'active' : ''}`}>
            <span className="back-link" onClick={() => setScreen('login')}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                arrow_back
              </span>{' '}
              Back to sign in
            </span>
            <div className="auth-logo">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div className="auth-title">Reset password</div>
            <div className="auth-sub">Enter your work email and we'll send you a link to reset your password.</div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  const response = await requestPasswordReset({ email: forgotEmail });
                  setSentEmail(response.email);
                  setScreen('forgot-success');
                  showToast(response.message, 'success');
                } catch {
                  showToast('Could not send reset link.', 'info');
                }
              }}
            >
              <div className="form-group">
                <label>Work Email</label>
                <input
                  type="email"
                  id="forgot-email"
                  placeholder="recruiter@company.com"
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary">
                Send Reset Link{' '}
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  send
                </span>
              </button>
            </form>
          </div>

          <div className={`screen ${screen === 'forgot-success' ? 'active' : ''}`} style={{ textAlign: 'center' }}>
            <div className="success-icon">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
            <div className="auth-title" style={{ marginBottom: 8 }}>
              Check your inbox
            </div>
            <div className="auth-sub" style={{ marginBottom: 24 }}>
              We sent a reset link to <strong>{sentEmail}</strong>. Check your spam folder if you don't see it.
            </div>
            <span className="auth-link" onClick={() => setScreen('login')}>
              Back to sign in
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
