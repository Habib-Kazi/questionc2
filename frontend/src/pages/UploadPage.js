import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState(1); // 1=upload 2=configure 3=generating
  const [uploadMode, setUploadMode] = useState('file'); // file | url | text
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  
  const [config, setConfig] = useState({
    questionType: 'mcq',
    numQuestions: 10,
    educationLevel: 'college',
    difficulty: 'medium',
  });

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
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
        const { data } = await api.post('/quiz/upload-source', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
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
      setError(err.response?.data?.detail || 'Generation failed. Check your API key.');
      setStep(2);
    }
  };

  const s = {
    page: { minHeight: '100vh', background: '#0a0a0f', color: '#e8e4dc', fontFamily: 'Georgia, serif' },
    nav: { padding: '24px 48px', borderBottom: '1px solid rgba(196,164,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { fontFamily: "'Cormorant Garamond',serif", fontSize: '20px', fontWeight: 300, letterSpacing: '3px', color: '#c4a460', cursor: 'pointer', textDecoration: 'none' },
    main: { maxWidth: '860px', margin: '0 auto', padding: '60px 24px' },
    heading: { fontFamily: "'Cormorant Garamond',serif", fontSize: '48px', fontWeight: 300, marginBottom: '12px' },
    sub: { color: 'rgba(232,228,220,0.4)', fontSize: '16px', marginBottom: '52px', fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '1px' },
    modeBtn: (active) => ({ padding: '10px 24px', border: `1px solid ${active ? '#c4a460' : 'rgba(196,164,96,0.2)'}`, background: active ? 'rgba(196,164,96,0.1)' : 'transparent', color: active ? '#c4a460' : 'rgba(232,228,220,0.5)', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s' }),
    dropzone: { border: `2px dashed ${dragOver ? '#c4a460' : 'rgba(196,164,96,0.25)'}`, background: dragOver ? 'rgba(196,164,96,0.04)' : 'rgba(255,255,255,0.01)', padding: '80px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' },
    input: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,96,0.2)', color: '#e8e4dc', padding: '16px 20px', fontSize: '15px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none' },
    textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,164,96,0.2)', color: '#e8e4dc', padding: '16px 20px', fontSize: '15px', fontFamily: 'Georgia,serif', width: '100%', outline: 'none', minHeight: '200px', resize: 'vertical' },
    primaryBtn: { background: 'linear-gradient(135deg,#c4a460,#e8c878,#c4a460)', color: '#0a0a0f', border: 'none', padding: '16px 48px', fontFamily: "'DM Mono',monospace", fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)', transition: 'all 0.3s' },
    label: { display: 'block', fontFamily: "'DM Mono',monospace", fontSize: '11px', letterSpacing: '2px', color: 'rgba(196,164,96,0.7)', marginBottom: '10px', textTransform: 'uppercase' },
    card: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,164,96,0.1)', padding: '20px', marginBottom: '12px' },
  };

  return (
    <div style={s.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Mono:wght@300;400&display=swap'); input:focus,textarea:focus{border-color:rgba(196,164,96,0.5)!important;}`}</style>
      
      <nav style={s.nav}>
        <span style={s.logo} onClick={() => navigate('/')}>QUIZFORGE.AI</span>
        <button onClick={() => navigate('/dashboard')} style={{ ...s.modeBtn(false), border: 'none', fontSize: '13px' }}>Dashboard →</button>
      </nav>

      <main style={s.main}>
        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '48px', alignItems: 'center' }}>
          {['Upload Source', 'Configure', 'Generate'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: step > i+1 ? '#c4a460' : step === i+1 ? 'rgba(196,164,96,0.2)' : 'transparent', border: `1px solid ${step >= i+1 ? '#c4a460' : 'rgba(196,164,96,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono',monospace", fontSize: '12px', color: step >= i+1 ? (step > i+1 ? '#0a0a0f' : '#c4a460') : 'rgba(232,228,220,0.3)' }}>
                {step > i+1 ? '✓' : i+1}
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: '12px', color: step === i+1 ? '#e8e4dc' : 'rgba(232,228,220,0.3)', letterSpacing: '1px' }}>{label}</span>
              {i < 2 && <div style={{ width: '40px', height: '1px', background: 'rgba(196,164,96,0.2)' }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.3)', color: '#ff6b6b', padding: '14px', marginBottom: '24px', fontSize: '14px' }}>{error}</div>}

        {/* STEP 1: Upload */}
        {step === 1 && (
          <div>
            <h1 style={s.heading}>Upload your source</h1>
            <p style={s.sub}>PDF · DOCX · Image · URL · Plain Text</p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {[{v:'file',l:'File Upload'},{v:'url',l:'Web URL'},{v:'text',l:'Paste Text'}].map(m => (
                <button key={m.v} style={s.modeBtn(uploadMode === m.v)} onClick={() => { setUploadMode(m.v); setError(''); }}>{m.l}</button>
              ))}
            </div>

            {uploadMode === 'file' && (
              <div style={s.dropzone} onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop}>
                <input ref={fileRef} type="file" style={{ display: 'none' }} accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp" onChange={handleFileDrop} />
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⬆</div>
                {file ? (
                  <div>
                    <div style={{ color: '#c4a460', fontSize: '18px', marginBottom: '8px' }}>{file.name}</div>
                    <div style={{ color: 'rgba(232,228,220,0.4)', fontSize: '13px' }}>{(file.size / 1024).toFixed(0)} KB</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>Drop your file here</div>
                    <div style={{ color: 'rgba(232,228,220,0.35)', fontSize: '13px', fontFamily: "'DM Mono',monospace" }}>PDF, DOCX, TXT, PNG, JPG, WEBP</div>
                  </div>
                )}
              </div>
            )}

            {uploadMode === 'url' && (
              <div>
                <label style={s.label}>Website URL</label>
                <input style={s.input} type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article" />
                <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '13px', marginTop: '8px' }}>We'll extract the main content from any public webpage</p>
              </div>
            )}

            {uploadMode === 'text' && (
              <div>
                <label style={s.label}>Paste your content</label>
                <textarea style={s.textarea} value={pastedText} onChange={e => setPastedText(e.target.value)} placeholder="Paste your text, notes, or content here..." />
                <p style={{ color: 'rgba(232,228,220,0.3)', fontSize: '13px', marginTop: '8px' }}>{pastedText.length} characters</p>
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <button style={s.primaryBtn} disabled={extracting || (uploadMode === 'file' && !file) || (uploadMode === 'url' && !url) || (uploadMode === 'text' && pastedText.length < 50)} onClick={extractContent}>
                {extracting ? 'Extracting...' : 'Extract Content →'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Configure */}
        {step === 2 && (
          <div>
            <h1 style={s.heading}>Configure generation</h1>
            <p style={s.sub}>Customize your quiz parameters</p>

            <div style={{ background: 'rgba(196,164,96,0.04)', border: '1px solid rgba(196,164,96,0.1)', padding: '20px', marginBottom: '40px' }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: '#c4a460', letterSpacing: '2px', marginBottom: '10px' }}>EXTRACTED CONTENT</div>
              <div style={{ color: 'rgba(232,228,220,0.5)', fontSize: '14px', lineHeight: '1.6' }}>{extractedContent.slice(0, 300)}...</div>
              <div style={{ color: 'rgba(196,164,96,0.4)', fontFamily: "'DM Mono',monospace", fontSize: '11px', marginTop: '10px' }}>{extractedContent.length} characters extracted</div>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <label style={s.label}>Question Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {QUESTION_TYPES.map(t => (
                  <div key={t.value} onClick={() => setConfig({...config, questionType: t.value})} style={{ border: `1px solid ${config.questionType === t.value ? '#c4a460' : 'rgba(196,164,96,0.15)'}`, background: config.questionType === t.value ? 'rgba(196,164,96,0.08)' : 'rgba(255,255,255,0.02)', padding: '16px 12px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: '20px', marginBottom: '8px' }}>{t.icon}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '11px', color: config.questionType === t.value ? '#c4a460' : 'rgba(232,228,220,0.5)', letterSpacing: '0.5px' }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginBottom: '36px' }}>
              <div>
                <label style={s.label}>Number of Questions</label>
                <input style={{ ...s.input, textAlign: 'center', fontSize: '24px', padding: '12px' }} type="number" min="1" max="50" value={config.numQuestions} onChange={e => setConfig({...config, numQuestions: parseInt(e.target.value)})} />
              </div>
              <div>
                <label style={s.label}>Education Level</label>
                <select style={{ ...s.input, cursor: 'pointer' }} value={config.educationLevel} onChange={e => setConfig({...config, educationLevel: e.target.value})}>
                  {EDUCATION_LEVELS.map(l => <option key={l} value={l} style={{ background: '#1a1a20' }}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={s.label}>Difficulty</label>
                <select style={{ ...s.input, cursor: 'pointer' }} value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})}>
                  {DIFFICULTIES.map(d => <option key={d} value={d} style={{ background: '#1a1a20' }}>{d.charAt(0).toUpperCase() + d.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button style={{ ...s.primaryBtn, background: 'transparent', color: '#c4a460', border: '1px solid rgba(196,164,96,0.3)', clipPath: 'none' }} onClick={() => setStep(1)}>← Back</button>
              <button style={s.primaryBtn} onClick={generateQuestions}>Generate {config.numQuestions} Questions →</button>
            </div>
          </div>
        )}

        {/* STEP 3: Generating */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '32px', animation: 'spin 2s linear infinite' }}>⚙</div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '36px', fontWeight: 300, marginBottom: '16px' }}>Generating your quiz</h2>
            <p style={{ color: 'rgba(232,228,220,0.4)', fontFamily: "'DM Mono',monospace", fontSize: '13px' }}>GPT-4 is crafting {config.numQuestions} {config.questionType} questions...</p>
          </div>
        )}
      </main>
    </div>
  );
}
