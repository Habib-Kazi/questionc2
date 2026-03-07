import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import QuizEditor from './pages/QuizEditor';
import QuizPlayer from './pages/QuizPlayer';
import ResultPage from './pages/ResultPage';
import Dashboard from './pages/Dashboard';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/upload" element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path="/editor/:quizId?" element={<PrivateRoute><QuizEditor /></PrivateRoute>} />
          <Route path="/quiz/:quizId" element={<QuizPlayer />} />
          <Route path="/result/:responseId" element={<ResultPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/analytics/:quizId" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
