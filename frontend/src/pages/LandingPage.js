import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '📄', title: 'PDF & DOCX', desc: 'Upload research papers, textbooks, and documents' },
  { icon: '🌐', title: 'Web URLs', desc: 'Extract content from any website or article' },
  { icon: '🖼️', title: 'Image OCR', desc: 'Convert scanned images and photos to quizzes' },
  { icon: '🤖', title: 'AI Generation', desc: 'GPT-4 powered question generation in seconds' },
  { icon: '📊', title: 'Analytics', desc: 'Deep insights into participant performance' },
  { icon: '🔗', title: 'Share Anywhere', desc: 'Public quiz links, no login required for participants' },
];

const questionTypes = ['MCQ', 'True/False', 'Fill in the Blank', 'Short Answer', 'Long Answer'];
const difficulties = ['Easy', 'Medium', 'Hard', 'Analytical', 'IQ-Based'];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#0a0a0f', minHeight: '100vh', color: '#e8e4dc', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        .hero-glow {
          position: fixed; pointer-events: none; z-index: 0;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(196,164,96,0.08) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: left 0.3s ease, top 0.3s ease;
        }
        .fade-in { animation: fadeIn 1s ease forwards; opacity: 0; }
        .fade-up { animation: fadeUp 0.8s ease forwards; opacity: 0; }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px);} to { opacity:1; transform:translateY(0);} }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
        .delay-4 { animation-delay: 0.8s; }
        .cta-btn {
          background: linear-gradient(135deg, #c4a460 0%, #e8c878 50%, #c4a460 100%);
          color: #0a0a0f; border: none; padding: 16px 40px;
          font-size: 16px; font-family: 'DM Mono', monospace; font-weight: 400;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          transition: all 0.3s; clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(196,164,96,0.4); filter: brightness(1.1); }
        .ghost-btn {
          background: transparent; color: #c4a460; border: 1px solid rgba(196,164,96,0.4);
          padding: 14px 32px; font-size: 15px; font-family: 'DM Mono', monospace;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
          transition: all 0.3s; text-decoration: none; display: inline-block;
        }
        .ghost-btn:hover { border-color: #c4a460; background: rgba(196,164,96,0.05); }
        .feature-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(196,164,96,0.1);
          padding: 32px; transition: all 0.4s;
        }
        .feature-card:hover { background: rgba(196,164,96,0.04); border-color: rgba(196,164,96,0.25); transform: translateY(-4px); }
        .nav-link { color: rgba(232,228,220,0.6); text-decoration: none; font-family:'DM Mono',monospace; font-size:13px; letter-spacing:1px; transition: color 0.2s; }
        .nav-link:hover { color: #c4a460; }
        .section-line { width: 60px; height: 1px; background: linear-gradient(90deg, #c4a460, transparent); margin: 0 auto 40px; }
        .badge { display: inline-block; padding: 4px 12px; border: 1px solid rgba(196,164,96,0.3); font-family:'DM Mono',monospace; font-size:11px; letter-spacing:2px; color: #c4a460; text-transform:uppercase; }
        .grid-overlay { position:fixed; inset:0; background-image: linear-gradient(rgba(196,164,96,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(196,164,96,0.03) 1px, transparent 1px); background-size: 60px 60px; pointer-events:none; z-index:0; }
        .stat-num { font-family:'Cormorant Garamond',serif; font-size:52px; font-weight:300; color:#c4a460; line-height:1; }
        .tag { display:inline-block; background:rgba(196,164,96,0.08); border:1px solid rgba(196,164,96,0.2); padding:6px 14px; font-family:'DM Mono',monospace; font-size:12px; color:rgba(232,228,220,0.7); margin: 4px; }
      `}</style>

      {/* Cursor glow */}
      <div className="hero-glow" style={{ left: `${mousePos.x * 100}%`, top: `${mousePos.y * 100}%` }} />
      <div className="grid-overlay" />

      {/* NAV */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 60px', borderBottom: '1px solid rgba(196,164,96,0.08)' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 300, letterSpacing: '3px', color: '#c4a460' }}>
          QUIZFORGE<span style={{ color: 'rgba(232,228,220,0.4)', fontSize: '16px' }}>.AI</span>
        </div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
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
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 60px 100px' }}>
        <div className="fade-in" style={{ marginBottom: '24px' }}>
          <span className="badge">Powered by GPT-4</span>
        </div>
        
        <h1 className="fade-up delay-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(52px, 8vw, 96px)', fontWeight: 300, lineHeight: 1.05, marginBottom: '32px', letterSpacing: '-1px' }}>
          Turn any source<br />
          <em style={{ color: '#c4a460', fontStyle: 'italic' }}>into a quiz.</em>
        </h1>
        
        <p className="fade-up delay-2" style={{ fontSize: '18px', color: 'rgba(232,228,220,0.55)', maxWidth: '580px', margin: '0 auto 16px', lineHeight: '1.7', fontWeight: 300 }}>
          Upload a PDF, paste a URL, or drop an image. QuizForge extracts the knowledge and crafts intelligent assessments in seconds.
        </p>
        
        <p className="fade-up delay-2" style={{ fontSize: '14px', color: 'rgba(196,164,96,0.6)', fontFamily: "'DM Mono', monospace", letterSpacing: '1px', marginBottom: '52px' }}>
          No setup. No friction. Just intelligence.
        </p>
        
        <div className="fade-up delay-3" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="cta-btn" onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}>
            Start Creating Free
          </button>
          <a href="#how-it-works" className="ghost-btn">See how it works</a>
        </div>

        {/* Floating source type pills */}
        <div className="fade-in delay-4" style={{ marginTop: '80px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['PDF Documents', 'DOCX Files', 'Web URLs', 'Images (OCR)', 'Plain Text'].map(t => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(196,164,96,0.08)', borderBottom: '1px solid rgba(196,164,96,0.08)', padding: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
        {[
          { num: '5+', label: 'Question Types' },
          { num: '6', label: 'Difficulty Levels' },
          { num: '∞', label: 'Source Formats' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '20px', borderRight: i < 2 ? '1px solid rgba(196,164,96,0.08)' : 'none' }}>
            <div className="stat-num">{s.num}</div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: 'rgba(232,228,220,0.4)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 1, padding: '100px 60px', textAlign: 'center' }}>
        <div className="section-line" />
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '16px' }}>From source to quiz in <em style={{ color: '#c4a460' }}>three steps</em></h2>
        <p style={{ color: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono', monospace", fontSize: '13px', letterSpacing: '1px', marginBottom: '80px' }}>No prompts. No configuration. Pure automation.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', maxWidth: '960px', margin: '0 auto' }}>
          {[
            { step: '01', title: 'Upload Source', desc: 'Drop a PDF, paste a URL, or upload an image. Our extraction engine pulls clean text from any format.', icon: '⬆' },
            { step: '02', title: 'Configure & Generate', desc: 'Choose question type, difficulty, and education level. GPT-4 crafts precise, pedagogically sound questions.', icon: '⚙' },
            { step: '03', title: 'Share & Analyze', desc: 'Get a shareable quiz link instantly. Track responses, scores, and insights from your dashboard.', icon: '📈' },
          ].map((s) => (
            <div key={s.step} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(196,164,96,0.08)', padding: '48px 36px', textAlign: 'left' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#c4a460', letterSpacing: '3px', marginBottom: '24px' }}>{s.step}</div>
              <div style={{ fontSize: '32px', marginBottom: '20px' }}>{s.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, marginBottom: '16px' }}>{s.title}</h3>
              <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '15px', lineHeight: '1.7', fontFamily: "'Georgia', serif" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 60px', textAlign: 'center' }}>
        <div className="section-line" />
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, marginBottom: '60px' }}>Everything you need</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', maxWidth: '1000px', margin: '0 auto' }}>
          {features.map((f) => (
            <div key={f.title} className="feature-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ color: 'rgba(232,228,220,0.45)', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUESTION TYPES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 60px', borderTop: '1px solid rgba(196,164,96,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#c4a460', letterSpacing: '3px', marginBottom: '24px' }}>QUESTION TYPES</div>
          {questionTypes.map((t, i) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(196,164,96,0.06)' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'rgba(196,164,96,0.4)' }}>0{i+1}</span>
              <span style={{ fontSize: '16px' }}>{t}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#c4a460', letterSpacing: '3px', marginBottom: '24px' }}>DIFFICULTY LEVELS</div>
          {difficulties.map((d, i) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid rgba(196,164,96,0.06)' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'rgba(196,164,96,0.4)' }}>0{i+1}</span>
              <span style={{ fontSize: '16px' }}>{d}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 60px', borderTop: '1px solid rgba(196,164,96,0.08)' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,5vw,72px)', fontWeight: 300, marginBottom: '24px', lineHeight: 1.1 }}>
          Ready to transform<br /><em style={{ color: '#c4a460' }}>your knowledge?</em>
        </h2>
        <p style={{ color: 'rgba(232,228,220,0.4)', fontSize: '16px', marginBottom: '48px' }}>Free to start. No credit card required.</p>
        <button className="cta-btn" style={{ fontSize: '14px', padding: '18px 48px' }} onClick={() => navigate(isAuthenticated ? '/upload' : '/register')}>
          Create Your First Quiz
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '32px 60px', borderTop: '1px solid rgba(196,164,96,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', color: 'rgba(196,164,96,0.6)', letterSpacing: '2px' }}>QUIZFORGE.AI</div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'rgba(232,228,220,0.2)', letterSpacing: '1px' }}>© 2025 QuizForge. All rights reserved.</div>
      </footer>
    </div>
  );
}
