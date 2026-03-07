// Result page is embedded in QuizPlayer after submission
// This route handles direct navigation to a result
import { useNavigate } from 'react-router-dom';
export default function ResultPage() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0f', display:'flex', alignItems:'center', justifyContent:'center', color:'#e8e4dc' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'20px' }}>🎓</div>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:'28px', fontWeight:300, marginBottom:'16px' }}>Result not available</h2>
        <p style={{ color:'rgba(232,228,220,0.4)', marginBottom:'24px' }}>Results are shown immediately after quiz submission.</p>
        <button onClick={() => navigate('/')} style={{ background:'transparent', border:'1px solid rgba(196,164,96,0.3)', color:'#c4a460', padding:'10px 24px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Go Home</button>
      </div>
    </div>
  );
}
