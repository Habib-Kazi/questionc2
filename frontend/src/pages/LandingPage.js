import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📄', title: 'PDF & DOCX', desc: 'Upload research papers, textbooks, and documents' },
  { icon: '🌐', title: 'Web URLs', desc: 'Extract content from any website or article' },
  { icon: '🖼️', title: 'Image OCR', desc: 'Convert scanned images and photos to quizzes' },
  { icon: '🤖', title: 'AI Generation', desc: 'Groq AI powered question generation in seconds' },
  { icon: '📊', title: 'Analytics', desc: 'Deep insights into participant performance' },
  { icon: '🔗', title: 'Share Anywhere', desc: 'Public quiz links, no login required for participants' },
];

const t = {
  bg: '#0e0e18', nav: '#0a0a0f', border: 'rgba(196,164,96,0.15)',
  text: '#e8e4dc', textMuted: 'rgba(232,228,220,0.4)', accent: '#c4a460',
  cardBg: 'rgba(255,255,255,0.02)',
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: t.bg, minHeight: '100vh', color: t.text, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hero-glow { position:fixed; pointer-events:none; z-index:0; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle,rgba(196,164,96,0.08) 0%,transparent 70%); transform:translate(-50%,-50%); transition:left 0.3s ease,top 0.3s ease; }
        .fade-up { animation:fadeUp 0.8s ease forwards; opacity:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
        .delay-1{animation-delay:0.2s;}.delay-2{animation-delay:0.4s;}.delay-3{animation-delay:0.6s;}.delay-4{animation-delay:0.8s;}
        .cta-btn { background:linear-gradient(135deg,#c4a460 0%,#e8c878 50%,#c4a460 100%); color:#0a0a0f; border:none; padding:14px 32px; font-size:14px; font-family:'DM Mono',monospace; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(196,164,96,0.4);}
        .ghost-btn { background:transparent; color:#c4a460; border:1px solid rgba(196,164,96,0.4); padding:12px 28px; font-size:14px; font-family:'DM Mono',monospace; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.3s; text-decoration:none; display:inline-block; }
        .ghost-btn:hover{background:rgba(196,164,96,0.1);}
        .feature-card { background:rgba(255,255,255,0.02); border:1px solid rgba(196,164,96,0.15); padding:28px; transition:all 0.4s; }
        .feature-card:hover{border-color:rgba(196,164,96,0.4);transform:translateY(-4px);}
        .nav-link{color:rgba(232,228,220,0.4);text-decoration:none;font-family:'DM Mono',monospace;font-size:13px;letter-spacing:1px;transition:color 0.2s;}
        .nav-link:hover{color:#c4a460;}
        .tag{display:inline-block;background:rgba(196,164,96,0.08);border:1px solid rgba(196,164,96,0.2);padding:6px 14px;font-family:'DM Mono',monospace;font-size:12px;color:#e8e4dc;margin:4px;}
        .mobile-menu{display:none;flex-direction:column;gap:16px;padding:20px 24px;background:#0a0a0f;border-bottom:1px solid rgba(196,164,96,0.15);}
        .mobile-menu.open{display:flex;}
        .nav-mobile-btn{display:none;background:none;border:none;cursor:pointer;font-size:22px;color:#e8e4dc;}
        @media(max-width:768px){
          .nav-desktop{display:none!important;}
          .nav-mobile-btn{display:flex!important;}
          .hero-title{font-size:42px!important;}
          .hero-pad{padding:80px 24px 60px!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .stats-grid{grid-template-columns:1fr!important;}
          .steps-grid{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div className="hero-glow" style={{ left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%` }} />

      {/* NAV */}
      <nav style={{ position: 'relative', zIndex: 10, background: t.nav, borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 300, letterSpacing: '3px', color: t.accent }}>
            QUIZFORGE<span style={{ color: t.textMuted, fontSize: '16px' }}>.AI</span>
          </div>
          <div className="nav-desktop" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            {isAuthenticated ? (
              <button className="cta-btn" style={{ padding: '10px 24px', fontSize: '12px' }} onClick={() => navigate('/dashboard')}>Dashboard</button>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign in</Link>
                <button className="cta-btn" style={{ padding: '10px 24px', fontSize: '12px' }} onClick={() => navigate('/register')}>Get Started</button>
              </>
            )}
          </div>
          <button className="nav-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '✕' : '☰'}</button>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          <a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</a>
          {isAuthenticated ? (
            <button className="cta-btn" style={{ alignSelf: 'flex-start' }} onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>Dashboard</button>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <button className="cta-btn" style={{ alignSelf: 'flex-start' }} onClick={() => { navigate('/register'); setMenuOpen(false); }}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-pad" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 60px 100px' }}>
        <h1 className="fade-up delay-1 hero-title" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(42px,8vw,96px)', fontWeight: 300, lineHeight: 1.05, marginBottom: '32px' }}>
          Turn any source<br /><em style={{ color: t.accent }}>into a quiz.</em>
        </h1>
        <p className="fade-up delay-2" style={{ fontSize: 'clamp(15px,2vw,18px)', color: t.textMuted, maxWidth: '580px', margin: '0 auto 16px', lineHeight: '1.7' }}>
          Upload a PDF, paste a URL, or drop an image. QuizForge extracts the knowledge and crafts intelligent assessments in seconds.
        </p>
        <p className="fade-up delay-2" style={{ fontSize: '13px', color: t.accent, fontFamily: "'DM Mono',monospace", letterSpacing: '1px', marginBottom: '48px', opacity: 0.7 }}>
          No setup. No friction. Just intelligence.
        </p>
        <div className="fade-up delay-3" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cta-btn" onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}>Start Creating Free</button>
          <a href="#how-it-works" className="ghost-btn">See how it works</a>
        </div>
        <div className="fade-up delay-4" style={{ marginTop: '60px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['PDF Documents', 'DOCX Files', 'Web URLs', 'Images (OCR)', 'Plain Text'].map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, padding: '48px 24px' }}>
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', maxWidth: '800px', margin: '0 auto' }}>
          {[{ num: '5+', label: 'Question Types' }, { num: '6', label: 'Difficulty Levels' }, { num: '∞', label: 'Source Formats' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px', borderRight: i < 2 ? `1px solid ${t.border}` : 'none' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,5vw,52px)', fontWeight: 300, color: t.accent, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: t.textMuted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 60px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 300, marginBottom: '16px' }}>Everything you need</h2>
        <p style={{ color: t.textMuted, marginBottom: '56px', fontSize: '16px' }}>Powerful tools for creating intelligent assessments</p>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', maxWidth: '1000px', margin: '0 auto', background: t.border }}>
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 400, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: t.textMuted, fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '80px 60px', borderTop: `1px solid ${t.border}`, textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 300, marginBottom: '16px' }}>How it works</h2>
        <p style={{ color: t.textMuted, marginBottom: '56px', fontSize: '16px' }}>From source to quiz in three simple steps</p>
        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '32px', maxWidth: '900px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Upload Your Source', desc: 'PDF, DOCX, URL, or image — we handle any format' },
            { step: '02', title: 'AI Generates Questions', desc: 'Groq AI analyzes content and creates smart questions instantly' },
            { step: '03', title: 'Share & Track', desc: 'Share your quiz link and monitor results in real time' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '32px 24px', border: `1px solid ${t.border}`, background: t.cardBg }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: t.accent, letterSpacing: '3px', marginBottom: '16px', opacity: 0.6 }}>STEP {s.step}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>{s.title}</h3>
              <p style={{ color: t.textMuted, fontSize: '14px', lineHeight: '1.6' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 60px', textAlign: 'center', borderTop: `1px solid ${t.border}` }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,56px)', fontWeight: 300, marginBottom: '24px' }}>
          Ready to transform your<br /><em style={{ color: t.accent }}>content into knowledge?</em>
        </h2>
        <p style={{ color: t.textMuted, marginBottom: '40px', fontSize: '16px' }}>Join educators and creators building smarter assessments</p>
        <button className="cta-btn" onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}>Start Creating Free</button>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${t.border}`, padding: '32px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 300, letterSpacing: '2px', color: t.accent }}>QUIZFORGE.AI</div>
        <div style={{ color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '11px' }}>© 2026 QuizForge AI. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/login" className="nav-link">Sign In</Link>
          <Link to="/register" className="nav-link">Get Started</Link>
        </div>
      </footer>
    </div>
  );
}
