import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import CharacterPage from './pages/CharacterPage'
import InventoryPage from './pages/InventoryPage'
import SkillsPage from './pages/SkillsPage'
import ShopPage from './pages/ShopPage'
import QuestsPage from './pages/QuestsPage'
import JobChangePage from './pages/JobChangePage'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sl-bg">
        <div className="sl-arise-text text-2xl">LOADING SYSTEM...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="character" element={<CharacterPage />} />
        <Route path="quests" element={<QuestsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="job" element={<JobChangePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
