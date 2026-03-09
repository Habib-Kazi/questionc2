import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('intro'); // intro | quiz | submitted
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/quiz/${quizId}`).then(({ data }) => {
      setQuiz(data);
      if (data.timer_minutes > 0) setTimeLeft(data.timer_minutes * 60);
    }).catch(() => setError('Quiz not found or no longer available.')).finally(() => setLoading(false));
  }, [quizId]);

  useEffect(() => {
    if (phase === 'quiz' && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const startQuiz = () => {
    if (!participantName.trim()) return;
    setStartTime(Date.now());
    setPhase('quiz');
  };

  const setAnswer = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : null;
    const answersList = quiz.questions.map(q => ({ question_id: q.id, selected_answer: answers[q.id] || null }));
    try {
      const { data } = await api.post(`/quiz/${quizId}/submit`, {
        participant_name: participantName,
        participant_email: participantEmail || null,
        answers: answersList,
        time_taken_seconds: timeTaken,
      });
      setResult(data);
      setPhase('submitted');
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const answered = Object.keys(answers).length;
  const total = quiz?.questions?.length || 0;
  const progress = total > 0 ? (answered / total) * 100 : 0;

  const s = {
    page: { minHeight: '100vh', background: '#0e0e18', color: '#e8e4dc', fontFamily: 'Georgia, serif' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '14px 36px', fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', transition: 'all 0.3s' },
    input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(196,164,96,0.2)', color: '#e8e4dc', padding: '14px 18px', fontSize: '16px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none' },
    label: { display: 'block', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: 'rgba(196,164,96,0.7)', marginBottom: '8px', textTransform: 'uppercase' },
  };

  if (loading) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ color: '#c4a460', fontFamily: "'DM Mono',monospace", fontSize: '14px', letterSpacing: '2px' }}>Loading quiz...</div></div>;
  if (error) return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠</div><div style={{ color: '#ff6b6b', marginBottom: '16px' }}>{error}</div></div></div>;

  // INTRO PHASE
  if (phase === 'intro') return (
    <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap'); input:focus{border-color:rgba(196,164,96,0.5)!important;}`}</style>
      <div style={{ maxWidth: '560px', width: '100%', padding: '60px 48px', border: '1px solid rgba(196,164,96,0.15)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: '#c4a460', letterSpacing: '3px', marginBottom: '24px', textTransform: 'uppercase' }}>QuizForge · Assessment</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '38px', fontWeight: 300, marginBottom: '16px', lineHeight: 1.1 }}>{quiz.title}</h1>
        {quiz.description && <p style={{ color: 'rgba(232,228,220,0.5)', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>{quiz.description}</p>}
        
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', padding: '20px', background: 'rgba(196,164,96,0.04)', border: '1px solid rgba(196,164,96,0.1)' }}>
          {[
            { label: 'Questions', value: quiz.question_count },
            { label: 'Difficulty', value: quiz.difficulty },
            { label: 'Time Limit', value: quiz.timer_minutes > 0 ? `${quiz.timer_minutes} min` : 'No limit' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 300, color: '#c4a460' }}>{item.value}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(232,228,220,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
          <div>
            <label style={s.label}>Your Name *</label>
            <input style={s.input} value={participantName} onChange={e => setParticipantName(e.target.value)} placeholder="Enter your full name" onKeyDown={e => e.key === 'Enter' && startQuiz()} />
          </div>
          <div>
            <label style={s.label}>Email (optional)</label>
            <input style={s.input} type="email" value={participantEmail} onChange={e => setParticipantEmail(e.target.value)} placeholder="For receiving your results" />
          </div>
        </div>

        <button style={{ ...s.primaryBtn, width: '100%', fontSize: '14px', padding: '16px' }} onClick={startQuiz} disabled={!participantName.trim()}>
          Start Quiz →
        </button>
      </div>
    </div>
  );

  // SUBMITTED PHASE
  if (phase === 'submitted' && result) {
    const pct = result.percentage;
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const color = pct >= 70 ? '#4caf50' : pct >= 50 ? '#ff9800' : '#f44336';
    
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>{pct >= 70 ? '🎉' : pct >= 50 ? '👍' : '📚'}</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '52px', fontWeight: 300, color, marginBottom: '8px' }}>{grade}</h1>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '14px', color: 'rgba(232,228,220,0.5)', letterSpacing: '2px', marginBottom: '40px' }}>
            {result.score} / {result.max_score} points · {pct}%
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
            {result.answers.map((a, i) => {
              const q = quiz.questions[i];
              if (!q) return null;
              return (
                <div key={i} style={{ background: a.is_correct ? 'rgba(76,175,80,0.06)' : 'rgba(244,67,54,0.06)', border: `1px solid ${a.is_correct ? 'rgba(76,175,80,0.2)' : 'rgba(244,67,54,0.2)'}`, padding: '16px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(232,228,220,0.4)' }}>Q{i+1}</span>
                    <span style={{ color: a.is_correct ? '#4caf50' : '#f44336', fontSize: '14px' }}>{a.is_correct ? '✓' : '✗'}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(232,228,220,0.7)', marginBottom: '8px', lineHeight: '1.4' }}>{q.question_text.slice(0, 80)}{q.question_text.length > 80 ? '...' : ''}</div>
                  {!a.is_correct && a.correct_answer && (
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: '#4caf50' }}>Correct: {a.correct_answer}</div>
                  )}
                  {a.explanation && <div style={{ fontSize: '12px', color: 'rgba(232,228,220,0.35)', marginTop: '6px', fontStyle: 'italic' }}>{a.explanation}</div>}
                </div>
              );
            })}
          </div>

          <button style={s.primaryBtn} onClick={() => window.location.reload()}>Take Again</button>
        </div>
      </div>
    );
  }

  // QUIZ PHASE
  const q = quiz.questions[currentQ];
  const isLastQ = currentQ === total - 1;
  const timerWarning = timeLeft !== null && timeLeft < 60;

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap'); .opt-btn:hover{border-color:rgba(196,164,96,0.4)!important;background:rgba(196,164,96,0.05)!important;}`}</style>
      
      {/* Header bar */}
      <div style={{ background: '#0a0a0f', borderBottom: '1px solid rgba(196,164,96,0.1)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '18px', fontWeight: 300, color: '#c4a460' }}>{quiz.title}</div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: 'rgba(232,228,220,0.4)' }}>{answered}/{total} answered</span>
          {timeLeft !== null && (
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '16px', color: timerWarning ? '#f44336' : '#c4a460', fontWeight: timerWarning ? 'bold' : 'normal', animation: timerWarning ? 'pulse 1s infinite' : 'none' }}>
              ⏱ {formatTime(timeLeft)}
            </span>
          )}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      </div>

      {/* Progress bar */}
      <div style={{ height: '2px', background: 'rgba(196,164,96,0.1)' }}>
        <div style={{ height: '100%', width: `${(currentQ / total) * 100}%`, background: 'linear-gradient(90deg,#c4a460,#e8c878)', transition: 'width 0.3s' }} />
      </div>

      <div style={{ display: 'flex', maxWidth: '900px', margin: '0 auto', padding: '40px 24px', gap: '40px' }}>
        {/* Question nav sidebar */}
        <div style={{ width: '200px', flexShrink: 0 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(196,164,96,0.5)', marginBottom: '16px' }}>QUESTIONS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {quiz.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} style={{ width: '36px', height: '36px', border: `1px solid ${i === currentQ ? '#c4a460' : answers[quiz.questions[i].id] ? 'rgba(76,175,80,0.5)' : 'rgba(196,164,96,0.15)'}`, background: i === currentQ ? 'rgba(196,164,96,0.15)' : answers[quiz.questions[i].id] ? 'rgba(76,175,80,0.08)' : 'transparent', color: i === currentQ ? '#c4a460' : 'rgba(232,228,220,0.5)', fontFamily: "'DM Mono',monospace", fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s' }}>{i + 1}</button>
            ))}
          </div>
        </div>

        {/* Question */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: 'rgba(196,164,96,0.5)', letterSpacing: '2px', marginBottom: '20px' }}>
            QUESTION {currentQ + 1} of {total} · {q.type?.replace('_', ' ').toUpperCase()}
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 300, lineHeight: '1.5', marginBottom: '36px' }}>{q.question_text}</h2>

          {/* MCQ options */}
        {q.type === 'mcq' && q.options_json && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
    {Object.entries(typeof q.options_json === 'string' ? JSON.parse(q.options_json.replace(/'/g, '"')) : q.options_json).map(([key, val]) => (
      <button key={key} className="opt-btn" onClick={() => setAnswer(q.id, key)} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px 20px', border: `1px solid ${answers[q.id] === key ? '#c4a460' : 'rgba(196,164,96,0.15)'}`, background: answers[q.id] === key ? 'rgba(196,164,96,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '13px', color: answers[q.id] === key ? '#c4a460' : 'rgba(196,164,96,0.5)', flexShrink: 0, marginTop: '1px' }}>{key}</span>
        <span style={{ fontSize: '15px', color: '#e8e4dc', lineHeight: '1.5', fontFamily: 'Georgia, serif' }}>{val}</span>
      </button>
    ))}
  </div>
)}

          {/* True/False */}
          {q.type === 'true_false' && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
              {['True', 'False'].map(opt => (
                <button key={opt} className="opt-btn" onClick={() => setAnswer(q.id, opt)} style={{ flex: 1, padding: '24px', border: `1px solid ${answers[q.id] === opt ? '#c4a460' : 'rgba(196,164,96,0.15)'}`, background: answers[q.id] === opt ? 'rgba(196,164,96,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', fontFamily: "'Cormorant Garamond',serif", fontSize: '24px', fontWeight: 300, color: answers[q.id] === opt ? '#c4a460' : '#e8e4dc', transition: 'all 0.15s' }}>
                  {opt === 'True' ? '✓ True' : '✗ False'}
                </button>
              ))}
            </div>
          )}

          {/* Fill blank / Short / Long */}
          {(q.type === 'fill_blank' || q.type === 'short_answer' || q.type === 'long_answer') && (
            <div style={{ marginBottom: '40px' }}>
              {q.type === 'long_answer' ? (
                <textarea style={{ ...s.input, minHeight: '160px', resize: 'vertical' }} value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} placeholder={q.type === 'fill_blank' ? 'Type the missing word/phrase...' : 'Write your answer here...'} />
              ) : (
                <input style={s.input} value={answers[q.id] || ''} onChange={e => setAnswer(q.id, e.target.value)} placeholder={q.type === 'fill_blank' ? 'Fill in the blank...' : 'Your answer...'} />
              )}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} style={{ background: 'transparent', border: '1px solid rgba(196,164,96,0.2)', color: 'rgba(232,228,220,0.5)', padding: '12px 24px', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1px', cursor: 'pointer' }}>← Previous</button>
            
            {isLastQ ? (
              <button style={s.primaryBtn} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : `Submit Quiz (${answered}/${total} answered)`}
              </button>
            ) : (
              <button onClick={() => setCurrentQ(Math.min(total - 1, currentQ + 1))} style={s.primaryBtn}>Next →</button>
            )}
          </div>

          {error && <div style={{ marginTop: '16px', color: '#ff6b6b', fontSize: '14px' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
