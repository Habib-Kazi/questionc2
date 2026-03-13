
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice', icon: '◉', desc: 'A, B, C, D options' },
  { value: 'true_false', label: 'True / False', icon: '⊕', desc: 'Binary judgment' },
  { value: 'fill_blank', label: 'Fill in Blank', icon: '▭', desc: 'Complete the sentence' },
  { value: 'short_answer', label: 'Short Answer', icon: '≡', desc: '1-3 sentence response' },
  { value: 'long_answer', label: 'Long Answer', icon: '❑', desc: 'Essay response' },
];

const EDUCATION_LEVELS = ['school', 'college', 'undergraduate', 'graduate', 'research'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'analytical', 'creative', 'iq_based'];

const t = {
  bg: '#0e0e18', nav: '#0a0a0f', border: 'rgba(196,164,96,0.15)',
  text: '#e8e4dc', textMuted: 'rgba(232,228,220,0.4)', accent: '#c4a460',
  cardBg: 'rgba(255,255,255,0.02)', input: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(196,164,96,0.2)',
};

export default function UploadPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [step, setStep] = useState(1);
  const [uploadMode, setUploadMode] = useState('file');
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({ questionType: 'mcq', numQuestions: 10, educationLevel: 'college', difficulty: 'medium' });

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer?.files[0] || e.target.files[0];
    if (f) setFile(f);
  };

  const extractContent = async () => {
    setExtracting(true); setError('');
    try {
      let content = '';
      if (uploadMode === 'text') {
        content = pastedText;
      } else {
        const formData = new FormData();
        if (uploadMode === 'file' && file) formData.append('file', file);
        if (uploadMode === 'url' && url) formData.append('url', url);
        const { data } = await api.post('/quiz/upload-source', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        content = data.content;
      }
      setExtractedContent(content);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Extraction failed. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const generateQuestions = async () => {
    setStep(3); setError('');
    try {
      const { data } = await api.post('/quiz/generate-questions', {
        content: extractedContent,
        question_type: config.questionType,
        num_questions: config.numQuestions,
        education_level: config.educationLevel,
        difficulty: config.difficulty,
      });
      navigate('/editor', { state: { questions: data.questions, suggestedTitle: data.suggested_title, config } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed.');
      setStep(2);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: t.bg, color: t.text, fontFamily: 'Georgia, serif' },
    nav: { padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: t.nav },
    main: { maxWidth: '860px', margin: '0 auto', padding: 'clamp(32px,5vw,60px) 24px' },
    heading: { fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,5vw,48px)', fontWeight: 300, marginBottom: '12px', color: t.text },
    sub: { color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '1px', marginBottom: '40px' },
    modeBtn: (active) => ({ padding: '10px 20px', border: `1px solid ${active ? t.accent : t.border}`, background: active ? `${t.accent}15` : 'transparent', color: active ? t.accent : t.textMuted, cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s' }),
    dropzone: { border: `2px dashed ${dragOver ? t.accent : t.border}`, background: dragOver ? `${t.accent}08` : t.cardBg, padding: 'clamp(40px,8vw,80px) 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' },
    input: { background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text, padding: '14px 18px', fontSize: '15px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none', transition: 'border 0.2s' },
    textarea: { background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text, padding: '14px 18px', fontSize: '15px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none', minHeight: '180px', resize: 'vertical' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '14px 36px', fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', transition: 'all 0.3s' },
    label: { display: 'block', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: t.accent, marginBottom: '10px', textTransform: 'uppercase', opacity: 0.8 },
    ghostBtn: { background: 'transparent', color: t.accent, border: `1px solid ${t.border}`, padding: '14px 36px', fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap');
        input:focus,textarea:focus,select:focus{border-color:${t.accent}!important;}
        select option{background:${t.nav};}
        @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
        @media(max-width:600px){
          .qtypes-grid{grid-template-columns:repeat(2,1fr)!important;}
          .config-grid{grid-template-columns:1fr!important;}
          .btn-row{flex-direction:column!important;}
          .mode-btns{flex-wrap:wrap!important;}
        }
      `}</style>

      <nav style={s.nav}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: t.accent, cursor: 'pointer' }} onClick={() => navigate('/')}>QUIZFORGE.AI</span>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.textMuted, padding: '8px 16px', fontFamily: "'DM Mono',monospace", fontSize: '11px', cursor: 'pointer' }}>Dashboard →</button>
      </nav>

      <main style={s.main}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['Upload Source', 'Configure', 'Generate'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > i + 1 ? t.accent : step === i + 1 ? `${t.accent}25` : 'transparent', border: `1px solid ${step >= i + 1 ? t.accent : t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: '12px', color: step > i + 1 ? '#0a0a0f' : step === i + 1 ? t.accent : t.textMuted }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: step === i + 1 ? t.text : t.textMuted, letterSpacing: '1px' }}>{label}</span>
              {i < 2 && <div style={{ width: 'clamp(20px,4vw,40px)', height: '1px', background: t.border }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', padding: '14px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

        {step === 1 && (
          <div>
            <h1 style={s.heading}>Upload your source</h1>
            <p style={s.sub}>PDF · DOCX · Image · URL · Plain Text</p>
            <div className="mode-btns" style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
              {[{ v: 'file', l: 'File Upload' }, { v: 'url', l: 'Web URL' }, { v: 'text', l: 'Paste Text' }].map(m => (
                <button key={m.v} style={s.modeBtn(uploadMode === m.v)} onClick={() => { setUploadMode(m.v); setError(''); }}>{m.l}</button>
              ))}
            </div>

            {uploadMode === 'file' && (
              <div style={s.dropzone} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop}>
                <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" onChange={handleFileDrop} />
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>⬆</div>
                {file ? (
                  <div>
                    <div style={{ color: t.accent, fontSize: '16px', marginBottom: '6px' }}>{file.name}</div>
                    <div style={{ color: t.textMuted, fontSize: '13px' }}>{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '16px', marginBottom: '8px', color: t.text }}>Drop your file here or tap to browse</div>
                    <div style={{ color: t.textMuted, fontSize: '13px', fontFamily: "'DM Mono',monospace" }}>PDF, DOCX, TXT, PNG, JPG, WEBP</div>
                  </div>
                )}
              </div>
            )}

            {uploadMode === 'url' && (
              <div>
                <label style={s.label}>Website URL</label>
                <input style={s.input} type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article" />
              </div>
            )}

            {uploadMode === 'text' && (
              <div>
                <label style={s.label}>Paste your content</label>
                <textarea style={s.textarea} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Paste your text, notes, or content here..." />
                <p style={{ color: t.textMuted, fontSize: '13px', marginTop: '8px' }}>{pastedText.length} characters</p>
              </div>
            )}

            <div style={{ marginTop: '28px' }}>
              <button style={s.primaryBtn} disabled={extracting || (uploadMode === 'file' && !file) || (uploadMode === 'url' && !url) || (uploadMode === 'text' && pastedText.length < 50)} onClick={extractContent}>
                {extracting ? 'Extracting...' : 'Extract Content →'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 style={s.heading}>Configure generation</h1>
            <p style={s.sub}>Customize your quiz parameters</p>
            <div style={{ background: `${t.accent}08`, border: `1px solid ${t.border}`, padding: '18px', marginBottom: '36px' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: t.accent, letterSpacing: '2px', marginBottom: '8px' }}>EXTRACTED CONTENT</div>
              <div style={{ color: t.textMuted, fontSize: '14px', lineHeight: '1.6' }}>{extractedContent.slice(0, 300)}...</div>
              <div style={{ color: t.accent, fontFamily: "'DM Mono',monospace", fontSize: '11px', marginTop: '8px', opacity: 0.6 }}>{extractedContent.length} characters extracted</div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={s.label}>Question Type</label>
              <div className="qtypes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
                {QUESTION_TYPES.map(qt => (
                  <div key={qt.value} onClick={() => setConfig({ ...config, questionType: qt.value })} style={{ border: `1px solid ${config.questionType === qt.value ? t.accent : t.border}`, background: config.questionType === qt.value ? `${t.accent}10` : t.cardBg, padding: '14px 10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{qt.icon}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '10px', color: config.questionType === qt.value ? t.accent : t.textMuted, letterSpacing: '0.5px' }}>{qt.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={s.label}>Questions</label>
                <input style={{ ...s.input, textAlign: 'center', fontSize: '22px', padding: '12px' }} type="number" min="1" max="50" value={config.numQuestions} onChange={e => setConfig({ ...config, numQuestions: parseInt(e.target.value) })} />
              </div>
              <div>
                <label style={s.label}>Education Level</label>
                <select style={{ ...s.input, cursor: 'pointer' }} value={config.educationLevel} onChange={e => setConfig({ ...config, educationLevel: e.target.value })}>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Difficulty</label>
                <select style={{ ...s.input, cursor: 'pointer' }} value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div className="btn-row" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button style={s.ghostBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={s.primaryBtn} onClick={generateQuestions}>Generate {config.numQuestions} Questions →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '56px', marginBottom: '28px', animation: 'spin 2s linear infinite' }}>⚙</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,4vw,36px)', fontWeight: 300, marginBottom: '16px', color: t.text }}>Generating your quiz</h2>
            <p style={{ color: t.textMuted, fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>AI is crafting {config.numQuestions} {config.questionType} questions...</p>
          </div>
        )}
      </main>
    </div>
  );
}
