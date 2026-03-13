import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import api from '../utils/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await api.post('/auth/google', { access_token: tokenResponse.access_token });
        login(data.token, data.user);
        navigate('/dashboard');
      } catch (err) {
        setError('Google login failed. Please try again.');
      }
    },
    onError: () => setError('Google login failed. Please try again.'),
  });

  const t = {
    bg: '#0e0e18', border: 'rgba(196,164,96,0.15)',
    text: '#e8e4dc', textMuted: 'rgba(232,228,220,0.4)', accent: '#c4a460',
    cardBg: 'rgba(255,255,255,0.02)', input: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(196,164,96,0.2)',
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', padding: '24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');
        .auth-input { background:${t.input}; border:1px solid ${t.inputBorder}; color:${t.text}; padding:14px 18px; font-size:15px; font-family:Georgia,serif; width:100%; outline:none; transition:border 0.2s; box-sizing:border-box; }
        .auth-input:focus { border-color:${t.accent}; }
        .auth-input::placeholder { color:${t.textMuted}; }
        .auth-btn { background:linear-gradient(135deg,#c4a460,#e8c878,#c4a460); color:#0a0a0f; border:none; padding:16px; width:100%; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .google-btn { background:rgba(255,255,255,0.05); border:1px solid rgba(196,164,96,0.2); color:${t.text}; padding:14px; width:100%; font-family:'DM Mono',monospace; font-size:12px; letter-spacing:1.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; }
        .google-btn:hover { background:rgba(255,255,255,0.08); border-color:rgba(196,164,96,0.4); }
      `}</style>

      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: t.accent, textDecoration: 'none' }}>QUIZFORGE.AI</Link>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', padding: '48px', border: `1px solid ${t.border}`, background: t.cardBg }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, color: t.text, marginBottom: '8px' }}>Create account</h2>
        <p style={{ color: t.textMuted, fontSize: '14px', marginBottom: '32px' }}>Start building quizzes for free</p>

        {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', padding: '12px', fontSize: '14px', marginBottom: '20px' }}>{error}</div>}

        {/* Google Login Button */}
        <button className="google-btn" onClick={() => googleLogin()} style={{ marginBottom: '20px' }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.851 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: t.border }} />
          <span style={{ color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '11px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: t.border }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { k: 'name', label: 'Full Name', type: 'text', ph: 'Your name' },
            { k: 'email', label: 'Email', type: 'email', ph: 'you@example.com' },
            { k: 'password', label: 'Password', type: 'password', ph: 'Min 8 characters' }
          ].map(f => (
            <div key={f.k}>
              <label style={{ display: 'block', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: t.accent, marginBottom: '8px', textTransform: 'uppercase' }}>{f.label}</label>
              <input className="auth-input" type={f.type} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} required placeholder={f.ph} />
            </div>
          ))}
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Get Started Free'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', color: t.textMuted, fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: t.accent, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
