import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';
import Navbar from './Components/Navbar';
import HomePage from './Components/HomePage';
import Feed from './Components/Feed';
import About from './Components/About';
import Settings from './Components/Settings';
import UserProfile from './Components/UserProfile';
import Quiz from './Components/Quiz';
import Chat from './Components/Chat';
import './App.css';

// Protected Route wrapper that shows quiz if not completed
const ProtectedRoute = ({ children }) => {
  const { hasCompletedQuiz, loading } = usePreferences();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1e28 0%, #1a3a45 50%, #0f2530 100%)',
        color: '#00ffff',
        fontSize: '1.2rem',
        letterSpacing: '2px'
      }}>
        INITIALIZING...
      </div>
    );
  }

  if (!hasCompletedQuiz()) {
    return <Navigate to="/quiz" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/quiz" element={<Quiz />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/archive"
                    element={
                      <ProtectedRoute>
                        <Feed />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/about" element={<About />} />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserProfile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <PreferencesProvider>
      <AppContent />
    </PreferencesProvider>
  );
}

export default App;
