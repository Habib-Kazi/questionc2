import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Georgia', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');
        .auth-input { background:rgba(255,255,255,0.04); border:1px solid rgba(196,164,96,0.2); color:#e8e4dc; padding:14px 18px; font-size:15px; font-family:Georgia,serif; width:100%; outline:none; transition:border 0.2s; }
        .auth-input:focus { border-color:rgba(196,164,96,0.5); }
        .auth-btn { background:linear-gradient(135deg,#c4a460,#e8c878,#c4a460); color:#0a0a0f; border:none; padding:16px; width:100%; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .auth-btn:hover { filter:brightness(1.1); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>
      <div style={{ width: '420px', padding: '60px 48px', border: '1px solid rgba(196,164,96,0.15)', background: 'rgba(255,255,255,0.02)' }}>
        <Link to="/" style={{ display: 'block', textAlign: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 300, letterSpacing: '3px', color: '#c4a460', textDecoration: 'none', marginBottom: '48px' }}>QUIZFORGE.AI</Link>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, color: '#e8e4dc', marginBottom: '8px' }}>Create account</h2>
        <p style={{ color: 'rgba(232,228,220,0.35)', fontSize: '14px', marginBottom: '36px' }}>Start building quizzes for free</p>
        {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', padding: '12px', fontSize: '14px', marginBottom: '20px' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[{k:'name',label:'Full Name',type:'text',ph:'Your name'},{k:'email',label:'Email',type:'email',ph:'you@example.com'},{k:'password',label:'Password',type:'password',ph:'Min 8 characters'}].map(f => (
            <div key={f.k}>
              <label style={{ display:'block', fontFamily:"'DM Mono',monospace", fontSize:'11px', letterSpacing:'2px', color:'rgba(196,164,96,0.7)', marginBottom:'8px', textTransform:'uppercase' }}>{f.label}</label>
              <input className="auth-input" type={f.type} value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})} required placeholder={f.ph} />
            </div>
          ))}
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Get Started Free'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '28px', color: 'rgba(232,228,220,0.35)', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#c4a460', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
