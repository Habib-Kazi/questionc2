import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../utils/api';

export default function AnalyticsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const justCreated = location.state?.justCreated;

  useEffect(() => {
    api.get(`/creator/results/${quizId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [quizId]);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/quiz/${quizId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    window.open(`/api/creator/results/${quizId}/export`, '_blank');
  };

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: 'Georgia, serif' },
    nav: { padding: '20px 48px', borderBottom: '1px solid rgba(196,164,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    main: { maxWidth: '1100px', margin: '0 auto', padding: '48px 24px' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,164,96,0.1)', padding: '28px' },
    label: { fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(196,164,96,0.5)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '10px 24px', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' },
    ghostBtn: { background: 'transparent', color: '#c4a460', border: '1px solid rgba(196,164,96,0.3)', padding: '10px 20px', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' },
  };

  if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#c4a460', fontFamily: "'DM Mono',monospace", fontSize: '14px', letterSpacing: '2px' }}>Loading analytics...</div></div>;
  if (!data) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#ff6b6b' }}>Failed to load data</div></div>;

  const { quiz, summary, score_distribution, participants, question_stats, hardest_questions } = data;
  const quizUrl = `${window.location.origin}/quiz/${quizId}`;

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');`}</style>
      
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: '#c4a460', cursor: 'pointer' }} onClick={() => navigate('/')}>QUIZFORGE.AI</span>
          <span style={{ color: 'rgba(232,228,220,0.2)' }}>|</span>
          <button style={{ background: 'none', border: 'none', color: 'rgba(232,228,220,0.4)', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '12px' }} onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={s.ghostBtn} onClick={exportCSV}>Export CSV</button>
          <button style={s.ghostBtn} onClick={() => navigate(`/editor/${quizId}`)}>Edit Quiz</button>
          <button style={s.primaryBtn} onClick={copyLink}>{copied ? '✓ Copied!' : '🔗 Share Quiz'}</button>
        </div>
      </nav>

      <main style={s.main}>
        {/* Just created banner */}
        {justCreated && (
          <div style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)', padding: '20px 28px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: '#4caf50', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '2px', marginBottom: '4px' }}>✓ QUIZ PUBLISHED</div>
              <div style={{ fontSize: '14px', color: 'rgba(232,228,220,0.6)' }}>Your quiz is live at: <span style={{ color: '#c4a460', fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>{quizUrl}</span></div>
            </div>
            <button style={s.primaryBtn} onClick={copyLink}>{copied ? 'Copied!' : 'Copy Link'}</button>
          </div>
        )}

        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '36px', fontWeight: 300, marginBottom: '8px' }}>{quiz.title}</h1>
        <p style={{ color: 'rgba(232,228,220,0.3)', fontFamily: "'DM Mono',monospace", fontSize: '12px', marginBottom: '40px' }}>{quiz.difficulty} · {summary.total_responses} responses</p>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', marginBottom: '40px', border: '1px solid rgba(196,164,96,0.1)' }}>
          {[
            { label: 'Responses', value: summary.total_responses, icon: '👥' },
            { label: 'Avg Score', value: summary.avg_score + '%', icon: '📊' },
            { label: 'Highest', value: summary.highest_score + '%', icon: '🏆' },
            { label: 'Lowest', value: summary.lowest_score + '%', icon: '📉' },
            { label: 'Pass Rate', value: summary.pass_rate + '%', icon: '✅' },
          ].map(stat => (
            <div key={stat.label} style={{ padding: '24px 16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '32px', fontWeight: 300, color: '#c4a460', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(232,228,220,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '6px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
          {/* Score distribution chart */}
          <div style={s.card}>
            <div style={s.label}>Score Distribution</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={score_distribution}>
                <XAxis dataKey="range" tick={{ fill: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono',monospace", fontSize: 11 }} axisLine={{ stroke: 'rgba(196,164,96,0.2)' }} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono',monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a20', border: '1px solid rgba(196,164,96,0.2)', color: '#e8e4dc', fontFamily: "'DM Mono',monospace", fontSize: 12 }} cursor={{ fill: 'rgba(196,164,96,0.05)' }} />
                <Bar dataKey="count" fill="#c4a460" radius={[2, 2, 0, 0]}>
                  {score_distribution.map((entry, i) => <Cell key={i} fill={entry.range === '81-100' ? '#4caf50' : entry.range === '0-20' ? '#f44336' : '#c4a460'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hardest questions */}
          <div style={s.card}>
            <div style={s.label}>Most Difficult Questions</div>
            {hardest_questions.length === 0 ? (
              <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '14px' }}>No data yet</p>
            ) : (
              hardest_questions.map((q, i) => (
                <div key={i} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: i < hardest_questions.length - 1 ? '1px solid rgba(196,164,96,0.08)' : 'none' }}>
                  <div style={{ fontSize: '14px', marginBottom: '6px', lineHeight: '1.4', color: 'rgba(232,228,220,0.8)' }}>{q.question_text}</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: q.correct_rate < 40 ? '#f44336' : '#ff9800' }}>{q.correct_rate}% correct</span>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: 'rgba(232,228,220,0.3)' }}>{q.total_answers} attempts</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question performance */}
        <div style={{ ...s.card, marginBottom: '32px' }}>
          <div style={s.label}>Question Performance</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(196,164,96,0.1)' }}>
                  {['#', 'Question', 'Type', 'Attempts', 'Correct', 'Success Rate'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(196,164,96,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question_stats.map((q, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(196,164,96,0.05)' }}>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '12px', color: '#c4a460' }}>{i + 1}</td>
                    <td style={{ padding: '12px', fontSize: '14px', maxWidth: '300px' }}>{q.question_text}</td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '11px', color: 'rgba(232,228,220,0.4)' }}>{q.type?.replace('_', ' ')}</td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '12px' }}>{q.total_answers}</td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '12px' }}>{q.correct_count}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', maxWidth: '80px' }}>
                          <div style={{ height: '100%', width: `${q.correct_rate}%`, background: q.correct_rate >= 70 ? '#4caf50' : q.correct_rate >= 40 ? '#ff9800' : '#f44336', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: q.correct_rate >= 70 ? '#4caf50' : q.correct_rate >= 40 ? '#ff9800' : '#f44336' }}>{q.correct_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Participants */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={s.label}>Participants ({participants.length})</div>
            <button style={s.ghostBtn} onClick={exportCSV}>Export CSV</button>
          </div>
          {participants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(232,228,220,0.3)' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>No participants yet. Share your quiz link!</p>
              <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(196,164,96,0.05)', border: '1px solid rgba(196,164,96,0.1)', fontFamily: "'DM Mono',monospace", fontSize: '13px', color: '#c4a460', cursor: 'pointer' }} onClick={copyLink}>{quizUrl}</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(196,164,96,0.1)' }}>
                  {['Name', 'Email', 'Score', 'Percentage', 'Time', 'Submitted'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(196,164,96,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 'normal' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(196,164,96,0.05)' }}>
                    <td style={{ padding: '12px', fontSize: '15px' }}>{p.name}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono',monospace" }}>{p.email || '-'}</td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>{p.score}/{p.max_score}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '13px', color: p.percentage >= 70 ? '#4caf50' : p.percentage >= 50 ? '#ff9800' : '#f44336' }}>{p.percentage}%</span>
                    </td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '12px', color: 'rgba(232,228,220,0.4)' }}>{p.time_taken_seconds ? `${Math.floor(p.time_taken_seconds/60)}m ${p.time_taken_seconds%60}s` : '-'}</td>
                    <td style={{ padding: '12px', fontFamily: "'DM Mono',monospace", fontSize: '11px', color: 'rgba(232,228,220,0.3)' }}>{p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
