import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoadingSpinner from './components/LoadingSpinner'

import Landing from './pages/Landing'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

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

      {/* Login / Signup */}
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

      {/* Forgot Password */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Reset Password */}
      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Join Trip */}
      <Route
        path="/join/:inviteCode"
        element={<JoinTrip />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Create Trip */}
      <Route
        path="/trips/new"
        element={
          <RequireAuth>
            <CreateTrip />
          </RequireAuth>
        }
      />

      {/* Trip Details */}
      <Route
        path="/trips/:tripId"
        element={
          <RequireAuth>
            <TripDetails />
          </RequireAuth>
        }
      />

      {/* Add Expense */}
      <Route
        path="/trips/:tripId/expenses/new"
        element={
          <RequireAuth>
            <AddExpense />
          </RequireAuth>
        }
      />

      {/* Expense Details */}
      <Route
        path="/trips/:tripId/expenses/:expenseId"
        element={
          <RequireAuth>
            <ExpenseDetails />
          </RequireAuth>
        }
      />

      {/* Edit Expense */}
      <Route
        path="/trips/:tripId/expenses/:expenseId/edit"
        element={
          <RequireAuth>
            <EditExpense />
          </RequireAuth>
        }
      />

      {/* Insights */}
      <Route
        path="/trips/:tripId/insights"
        element={
          <RequireAuth>
            <Insights />
          </RequireAuth>
        }
      />

      {/* Settlement */}
      <Route
        path="/trips/:tripId/settlement"
        element={
          <RequireAuth>
            <Settlement />
          </RequireAuth>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />

      {/* Unknown URL */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}