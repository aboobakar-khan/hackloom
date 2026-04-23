import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import UserDashboard from './UserDashboard.jsx'
import CreateHackathon from './CreateHackathon.jsx'
import HackathonPublic from './HackathonPublic.jsx'
import ResultsPage from './ResultsPage.jsx'
import OrganizerResults from './OrganizerResults.jsx'
import Auth from './Auth.jsx'
import AuthCallback from './AuthCallback.jsx'
import ResetPassword from './ResetPassword.jsx'
import { AuthProvider } from './AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/create-hackathon" element={<CreateHackathon />} />
          <Route path="/hackathon/:id" element={<HackathonPublic />} />
          <Route path="/hackathon/:id/register" element={<HackathonPublic />} />
          <Route path="/hackathon/:id/submit" element={<HackathonPublic />} />
          <Route path="/hackathon/:hackathonId/results" element={<ResultsPage />} />
          <Route path="/hackathon/:hackathonId/manage-results" element={<OrganizerResults />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
