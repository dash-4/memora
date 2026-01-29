import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth';

import Landing from './pages/Landing';
import FAQ from './pages/FAQ';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import DecksList from './pages/Decks/DecksList';
import DeckDetail from './pages/Decks/DeckDetail';
import StudyMode from './pages/Study/StudyMode';
import Statistics from './pages/Statistics';
import Schedule from './pages/Schedule/Schedule';

const ProtectedRoute = ({ children }) => {
  return authService.isAuthenticated() ? children : <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ children }) => {
  return !authService.isAuthenticated() ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route 
          path="/login" 
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          } 
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <DecksList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:id"
          element={
            <ProtectedRoute>
              <DeckDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study"
          element={
            <ProtectedRoute>
              <StudyMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/:deckId"
          element={
            <ProtectedRoute>
              <StudyMode />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
