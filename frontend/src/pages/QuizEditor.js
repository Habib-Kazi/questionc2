import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import api from '../utils/api';

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

function QuestionCard({ q, index, total, onChange, onDelete, onMove }) {
  const [expanded, setExpanded] = useState(true);
  const s = {
    card: { border: '1px solid rgba(196,164,96,0.12)', background: 'rgba(255,255,255,0.02)', marginBottom: '12px', transition: 'all 0.2s' },
    header: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' },
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,96,0.15)', color: '#e8e4dc', padding: '10px 14px', fontSize: '14px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none', marginBottom: '8px' },
    label: { fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(196,164,96,0.6)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
    optBtn: (sel) => ({ border: `1px solid ${sel ? '#c4a460' : 'rgba(196,164,96,0.15)'}`, background: sel ? 'rgba(196,164,96,0.1)' : 'transparent', color: sel ? '#c4a460' : 'rgba(232,228,220,0.5)', padding: '6px 14px', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '1px', transition: 'all 0.15s' }),
  };

  const updateOption = (key, val) => {
    const opts = { ...(q.options_json || { A: '', B: '', C: '', D: '' }), [key]: val };
    onChange({ ...q, options_json: opts });
  };

  return (
    <div style={s.card}>
      <div style={s.header} onClick={() => setExpanded(!expanded)}>
        <div style={{ background: 'rgba(196,164,96,0.1)', border: '1px solid rgba(196,164,96,0.2)', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: '12px', color: '#c4a460', flexShrink: 0 }}>{index + 1}</div>
        <div style={{ flex: 1, fontFamily: 'Georgia,serif', fontSize: '15px', color: 'rgba(232,228,220,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.question_text || 'New Question'}</div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(196,164,96,0.5)', border: '1px solid rgba(196,164,96,0.15)', padding: '3px 8px' }}>{q.type?.replace('_', ' ')}</span>
          <button onClick={(e) => { e.stopPropagation(); onMove(index, -1); }} disabled={index === 0} style={{ background: 'none', border: 'none', color: 'rgba(232,228,220,0.3)', cursor: 'pointer', fontSize: '14px' }}>↑</button>
          <button onClick={(e) => { e.stopPropagation(); onMove(index, 1); }} disabled={index === total - 1} style={{ background: 'none', border: 'none', color: 'rgba(232,228,220,0.3)', cursor: 'pointer', fontSize: '14px' }}>↓</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(index); }} style={{ background: 'none', border: 'none', color: 'rgba(220,80,80,0.5)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>×</button>
          <span style={{ color: 'rgba(232,228,220,0.3)', fontSize: '14px' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '20px', borderTop: '1px solid rgba(196,164,96,0.08)' }}>
          <label style={s.label}>Question Text</label>
          <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical', marginBottom: '16px' }} value={q.question_text} onChange={e => onChange({ ...q, question_text: e.target.value })} placeholder="Enter your question..." />

          {(q.type === 'mcq' || q.type === 'true_false') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={s.label}>Options</label>
              {q.type === 'true_false' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['True', 'False'].map(opt => (
                    <div key={opt} style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button style={s.optBtn(q.correct_answer === opt)} onClick={() => onChange({ ...q, correct_answer: opt })}>{opt}</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {OPTION_KEYS.map(key => (
                    <div key={key} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button style={s.optBtn(q.correct_answer === key)} onClick={() => onChange({ ...q, correct_answer: key })} title="Mark as correct">{key}</button>
                      <input style={{ ...s.input, marginBottom: 0, flex: 1 }} value={q.options_json?.[key] || ''} onChange={e => updateOption(key, e.target.value)} placeholder={`Option ${key}`} />
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(196,164,96,0.4)', marginTop: '8px' }}>Click option letter to mark as correct</p>
            </div>
          )}

          {(q.type === 'fill_blank' || q.type === 'short_answer' || q.type === 'long_answer') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={s.label}>Correct Answer / Model Answer</label>
              <textarea style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} value={q.correct_answer || ''} onChange={e => onChange({ ...q, correct_answer: e.target.value })} placeholder={q.type === 'fill_blank' ? 'The exact word/phrase' : 'Model answer for grading...'} />
            </div>
          )}

          <div>
            <label style={s.label}>Explanation (optional)</label>
            <input style={s.input} value={q.explanation || ''} onChange={e => onChange({ ...q, explanation: e.target.value })} placeholder="Why is this the correct answer?" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [educationLevel, setEducationLevel] = useState('college');
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.questions) {
      setQuestions(location.state.questions);
      setTitle(location.state.suggestedTitle || 'My Quiz');
      setDifficulty(location.state.config?.difficulty || 'medium');
      setEducationLevel(location.state.config?.educationLevel || 'college');
    }
  }, [location.state]);

  const addQuestion = () => {
    setQuestions([...questions, { type: 'mcq', question_text: '', options_json: { A: '', B: '', C: '', D: '' }, correct_answer: '', explanation: '', order_index: questions.length, points: 1 }]);
  };

  const updateQuestion = (idx, updated) => {
    setQuestions(questions.map((q, i) => i === idx ? updated : q));
  };

  const deleteQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx, dir) => {
    const newQ = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= newQ.length) return;
    [newQ[idx], newQ[target]] = [newQ[target], newQ[idx]];
    setQuestions(newQ);
  };

  const saveQuiz = async () => {
    if (!title.trim()) { setError('Please add a quiz title'); return; }
    if (questions.length === 0) { setError('Add at least one question'); return; }
    setSaving(true); setError('');
    try {
      const payload = { title, description, difficulty, education_level: educationLevel, timer_minutes: timerMinutes, allow_multiple_attempts: allowMultiple, questions };
      let data;
      if (quizId) {
        ({ data } = await api.put(`/quiz/quiz/${quizId}`, payload));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        ({ data } = await api.post('/quiz/create-quiz', payload));
        navigate(`/analytics/${data.quiz_id}`, { state: { justCreated: true, quizId: data.quiz_id } });
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: 'Georgia, serif' },
    nav: { padding: '20px 48px', borderBottom: '1px solid rgba(196,164,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, background: '#0a0a0f' },
    sidebar: { width: '280px', flexShrink: 0, background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(196,164,96,0.08)', padding: '32px 24px', height: 'calc(100vh - 64px)', overflowY: 'auto', position: 'sticky', top: '64px' },
    main: { flex: 1, padding: '32px 40px', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' },
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,96,0.15)', color: '#e8e4dc', padding: '12px 16px', fontSize: '14px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none', marginBottom: '16px' },
    label: { fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '2px', color: 'rgba(196,164,96,0.6)', marginBottom: '6px', display: 'block', textTransform: 'uppercase' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '12px 28px', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', transition: 'all 0.2s' },
    ghostBtn: { background: 'transparent', color: '#c4a460', border: '1px solid rgba(196,164,96,0.3)', padding: '10px 20px', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' },
  };

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap'); input:focus,textarea:focus,select:focus{border-color:rgba(196,164,96,0.4)!important;} select option{background:#1a1a20;}`}</style>

      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: '#c4a460', cursor: 'pointer' }} onClick={() => navigate('/')}>QUIZFORGE.AI</span>
          <span style={{ color: 'rgba(232,228,220,0.2)', fontSize: '18px' }}>|</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: 'rgba(232,228,220,0.5)', letterSpacing: '1px' }}>Quiz Editor</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {saved && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: '#4caf50' }}>✓ Saved</span>}
          {error && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: '#ff6b6b' }}>{error}</span>}
          <button style={s.ghostBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={s.primaryBtn} onClick={saveQuiz} disabled={saving}>{saving ? 'Saving...' : quizId ? 'Update Quiz' : 'Publish Quiz'}</button>
        </div>
      </nav>

      <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', letterSpacing: '3px', color: '#c4a460', marginBottom: '24px' }}>QUIZ SETTINGS</div>
          
          <label style={s.label}>Title</label>
          <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Quiz title..." />
          
          <label style={s.label}>Description</label>
          <textarea style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
          
          <label style={s.label}>Difficulty</label>
          <select style={{ ...s.input, cursor: 'pointer' }} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            {['easy','medium','hard','analytical','creative','iq_based'].map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          
          <label style={s.label}>Education Level</label>
          <select style={{ ...s.input, cursor: 'pointer' }} value={educationLevel} onChange={e => setEducationLevel(e.target.value)}>
            {['school','college','undergraduate','graduate','research'].map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
          
          <label style={s.label}>Timer (minutes, 0 = no timer)</label>
          <input style={s.input} type="number" min="0" max="180" value={timerMinutes} onChange={e => setTimerMinutes(parseInt(e.target.value) || 0)} />
          
          <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={allowMultiple} onChange={e => setAllowMultiple(e.target.checked)} style={{ cursor: 'pointer' }} />
            Allow multiple attempts
          </label>

          <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(196,164,96,0.04)', border: '1px solid rgba(196,164,96,0.1)' }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: 'rgba(196,164,96,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>STATS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'rgba(232,228,220,0.5)' }}>Questions</span>
              <span style={{ fontFamily: "'DM Mono',monospace", color: '#c4a460' }}>{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Main editor */}
        <div style={s.main}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '28px', fontWeight: 300 }}>{questions.length} Questions</h2>
            <button style={s.ghostBtn} onClick={addQuestion}>+ Add Question</button>
          </div>

          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', border: '2px dashed rgba(196,164,96,0.15)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>❑</div>
              <p style={{ color: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>No questions yet. Add one or go back to generate.</p>
              <button style={{ ...s.ghostBtn, marginTop: '20px' }} onClick={addQuestion}>+ Add First Question</button>
            </div>
          ) : (
            questions.map((q, i) => (
              <QuestionCard key={i} q={q} index={i} total={questions.length} onChange={(updated) => updateQuestion(i, updated)} onDelete={() => deleteQuestion(i)} onMove={(idx, dir) => moveQuestion(idx, dir)} />
            ))
          )}

          {questions.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button style={s.ghostBtn} onClick={addQuestion}>+ Add Another Question</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
