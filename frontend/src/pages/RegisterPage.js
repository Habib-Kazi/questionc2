import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, theme, themeMode, toggleTheme } = useAuth();
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

  const t = theme;

  return (
    <div style={{ minHeight:'100vh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Georgia',serif", transition:'all 0.3s', padding:'24px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');
        .auth-input { background:${t.input}; border:1px solid ${t.inputBorder}; color:${t.text}; padding:14px 18px; font-size:15px; font-family:Georgia,serif; width:100%; outline:none; transition:border 0.2s; }
        .auth-input:focus { border-color:${t.accent}; }
        .auth-input::placeholder { color:${t.textMuted}; }
        .auth-btn { background:linear-gradient(135deg,#c4a460,#e8c878,#c4a460); color:#0a0a0f; border:none; padding:16px; width:100%; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .auth-btn:hover { filter:brightness(1.1); }
        .auth-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .toggle-btn { background:${t.cardBg}; border:1px solid ${t.border}; color:${t.text}; padding:8px 14px; font-family:'DM Mono',monospace; font-size:11px; cursor:pointer; border-radius:4px; transition:all 0.3s; }
      `}</style>

      {/* Top bar */}
      <div style={{ width:'100%', maxWidth:'480px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <Link to="/" style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontWeight:300, letterSpacing:'3px', color:t.accent, textDecoration:'none' }}>QUIZFORGE.AI</Link>
        <button className="toggle-btn" onClick={toggleTheme}>{themeMode==='dark'?'☀️ Light':'🌙 Dark'}</button>
      </div>

      <div style={{ width:'100%', maxWidth:'480px', padding:'clamp(32px,5vw,60px) clamp(24px,5vw,48px)', border:`1px solid ${t.border}`, background:t.cardBg, transition:'all 0.3s' }}>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(26px,4vw,32px)', fontWeight:300, color:t.text, marginBottom:'8px' }}>Create account</h2>
        <p style={{ color:t.textMuted, fontSize:'14px', marginBottom:'32px' }}>Start building quizzes for free</p>

        {error && <div style={{ background:'rgba(220,50,50,0.1)', border:'1px solid rgba(220,50,50,0.3)', color:'#ff6b6b', padding:'12px', fontSize:'14px', marginBottom:'20px', borderRadius:'2px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {[{k:'name',label:'Full Name',type:'text',ph:'Your name'},{k:'email',label:'Email',type:'email',ph:'you@example.com'},{k:'password',label:'Password',type:'password',ph:'Min 8 characters'}].map(f => (
            <div key={f.k}>
              <label style={{ display:'block', fontFamily:"'DM Mono',monospace", fontSize:'11px', letterSpacing:'2px', color:t.accent, marginBottom:'8px', textTransform:'uppercase', opacity:0.8 }}>{f.label}</label>
              <input className="auth-input" type={f.type} value={form[f.k]} onChange={e => setForm({...form, [f.k]:e.target.value})} required placeholder={f.ph} />
            </div>
          ))}
          <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Get Started Free'}</button>
        </form>

        <p style={{ textAlign:'center', marginTop:'24px', color:t.textMuted, fontSize:'14px' }}>
          Already have an account? <Link to="/login" style={{ color:t.accent, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
