import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const t = {
  bg: '#0e0e18', nav: '#0a0a0f', border: 'rgba(196,164,96,0.15)',
  text: '#e8e4dc', textMuted: 'rgba(232,228,220,0.4)', accent: '#c4a460',
  cardBg: 'rgba(255,255,255,0.02)',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/creator/quizzes').then(({ data }) => setQuizzes(data)).finally(() => setLoading(false));
  }, []);

  const deleteQuiz = async (id) => {
    if (!window.confirm('Delete this quiz and all responses?')) return;
    await api.delete(`/quiz/quiz/${id}`);
    setQuizzes(quizzes.filter(q => q.id !== id));
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${id}`);
  };

  const s = {
    page: { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'Georgia, serif' },
    nav: { padding: '20px 48px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.nav },
    main: { maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' },
    heading: { fontFamily: "'Cormorant Garamond',serif", fontSize: '40px', fontWeight: 300, marginBottom: '8px' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '12px 28px', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', transition: 'all 0.2s' },
    ghostBtn: { background: 'transparent', color: t.textMuted, border: `1px solid ${t.border}`, padding: '8px 16px', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', transition: 'all 0.2s' },
    card: { background: t.cardBg, border: `1px solid ${t.border}`, padding: '28px', marginBottom: '12px' },
  };

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap'); .quiz-card:hover{opacity:0.9}`}</style>

      <nav style={s.nav}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: t.accent, cursor: 'pointer' }} onClick={() => navigate('/')}>QUIZFORGE.AI</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: t.textMuted }}>{user?.name}</span>
          <button style={s.ghostBtn} onClick={() => { logout(); navigate('/'); }}>Logout</button>
          <button style={s.primaryBtn} onClick={() => navigate('/upload')}>+ New Quiz</button>
        </div>
      </nav>

      <main style={s.main}>
        <div style={{ marginBottom: '48px' }}>
          <h1 style={s.heading}>{user?.name}'s Quizzes</h1>
          <p style={{ color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '1px' }}>
            {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created
          </p>
        </div>

        {quizzes.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginBottom: '40px', border: `1px solid ${t.border}`, background: t.border }}>
            {[
              { label: 'Total Quizzes', value: quizzes.length },
              { label: 'Total Responses', value: quizzes.reduce((s, q) => s + q.response_count, 0) },
              { label: 'Avg Score', value: quizzes.some(q => q.avg_score > 0) ? Math.round(quizzes.filter(q => q.avg_score > 0).reduce((s, q) => s + q.avg_score, 0) / quizzes.filter(q => q.avg_score > 0).length) + '%' : 'N/A' },
            ].map((stat, i) => (
              <div key={i} style={{ padding: '28px', textAlign: 'center', background: t.bg }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '40px', fontWeight: 300, color: t.accent, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: t.textMuted, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>Loading your quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 40px', border: `2px dashed ${t.border}` }}>
            <div style={{ fontSize: '56px', marginBottom: '24px' }}>📋</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, marginBottom: '12px' }}>No quizzes yet</h2>
            <p style={{ color: t.textMuted, marginBottom: '32px', fontSize: '15px' }}>Upload a source and let AI generate your first quiz</p>
            <button style={s.primaryBtn} onClick={() => navigate('/upload')}>Create First Quiz</button>
          </div>
        ) : (
          <div>
            {quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card" style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '22px', fontWeight: 400, marginBottom: '8px', cursor: 'pointer', color: t.text }} onClick={() => navigate(`/analytics/${quiz.id}`)}>{quiz.title}</h3>
                    {quiz.description && <p style={{ color: t.textMuted, fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' }}>{quiz.description}</p>}
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: quiz.question_count + ' questions' },
                        { label: quiz.difficulty },
                        { label: quiz.education_level },
                        { label: quiz.response_count + ' responses' },
                        { label: quiz.avg_score + '% avg', color: quiz.avg_score >= 70 ? '#4caf50' : quiz.avg_score >= 50 ? '#ff9800' : t.textMuted },
                      ].map((tag, i) => (
                        <span key={i} style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: tag.color || t.accent, border: `1px solid ${t.border}`, padding: '3px 10px', letterSpacing: '0.5px' }}>{tag.label}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '24px' }}>
                    <button style={s.ghostBtn} onClick={() => copyLink(quiz.id)}>🔗</button>
                    <button style={s.ghostBtn} onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}>👁</button>
                    <button style={s.ghostBtn} onClick={() => navigate(`/analytics/${quiz.id}`)}>Analytics</button>
                    <button style={s.ghostBtn} onClick={() => navigate(`/editor/${quiz.id}`)}>Edit</button>
                    <button style={{ ...s.ghostBtn, color: 'rgba(220,80,80,0.6)', borderColor: 'rgba(220,80,80,0.2)' }} onClick={() => deleteQuiz(quiz.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
