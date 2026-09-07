import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'

import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import TripDetails from './pages/TripDetails'
import JoinTrip from './pages/JoinTrip'
import AddExpense from './pages/AddExpense'
import EditExpense from './pages/EditExpense'
import ExpenseDetails from './pages/ExpenseDetails'
import Insights from './pages/Insights'
import Settlement from './pages/Settlement'
import Settings from './pages/Settings'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner label="Loading your account…" />

  if (!user) return <Navigate to="/" replace />

  return children
}

export default function App() {
  const { user, loading } = useAuth()

  return (
    <Routes>
      <Route
        path="/"
        element={
          loading
            ? <LoadingSpinner />
            : user
              ? <Navigate to="/dashboard" replace />
              : <Landing />
        }
      />

      <Route
        path="/join/:inviteCode"
        element={<JoinTrip />}
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/new"
        element={
          <RequireAuth>
            <CreateTrip />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId"
        element={
          <RequireAuth>
            <TripDetails />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId/expenses/new"
        element={
          <RequireAuth>
            <AddExpense />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId/expenses/:expenseId"
        element={
          <RequireAuth>
            <ExpenseDetails />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId/expenses/:expenseId/edit"
        element={
          <RequireAuth>
            <EditExpense />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId/insights"
        element={
          <RequireAuth>
            <Insights />
          </RequireAuth>
        }
      />

      <Route
        path="/trips/:tripId/settlement"
        element={
          <RequireAuth>
            <Settlement />
          </RequireAuth>
        }
      />

      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}