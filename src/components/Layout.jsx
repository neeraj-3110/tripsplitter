import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children, title, backTo, actions }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, user, signOut } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDashboard = location.pathname === '/dashboard'
  const isSettings = location.pathname === '/settings'

  const displayName =
    profile?.name ||
    user?.email?.split('@')[0] ||
    'User'

  const avatarLetter =
    displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">

      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 md:px-6">

          {/* Back Button */}
          {backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-white text-ink-600 transition-all duration-200 hover:-translate-x-0.5 hover:border-ink-200 hover:bg-ink-50"
              aria-label="Go back"
            >
              <span className="text-lg">←</span>
            </button>
          )}

          {/* Brand */}
          <Link
            to="/dashboard"
            className="group flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-base">TS</span>
            </div>

            <div className="hidden sm:block">
              <p className="text-[15px] font-extrabold tracking-tight text-ink-900">
                TripSplitter
              </p>

              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-ink-400">
                Travel together. Split smarter.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="ml-8 hidden items-center gap-1 md:flex">

              <Link
                to="/dashboard"
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  isDashboard
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/dashboard"
                className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-500 transition-all hover:bg-ink-50 hover:text-ink-800"
              >
                My Trips
              </Link>

            </nav>
          )}

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-2">

            {actions}

            {user && (
              <>
                {/* Profile */}
                <Link
                  to="/settings"
                  className={`hidden items-center gap-2 rounded-xl p-1.5 pr-3 transition-all sm:flex ${
                    isSettings
                      ? 'bg-brand-50'
                      : 'hover:bg-ink-50'
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xs font-bold text-white shadow-sm">
                    {avatarLetter}
                  </div>

                  <span className="max-w-[120px] truncate text-sm font-semibold text-ink-700">
                    {displayName}
                  </span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                  onClick={() =>
                    setMobileMenuOpen(!mobileMenuOpen)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-100 bg-white text-ink-600 transition hover:bg-ink-50 md:hidden"
                  aria-label="Open menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <span className="text-xl">×</span>
                  ) : (
                    <span className="text-xl">☰</span>
                  )}
                </button>
              </>
            )}

          </div>
        </div>

        {/* ==================== MOBILE MENU ==================== */}
        {user && mobileMenuOpen && (
          <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">

            <div className="space-y-1">

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                  isDashboard
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50'
                }`}
              >
                Dashboard
              </Link>

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-ink-50"
              >
                My Trips
              </Link>

              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink-600 hover:bg-ink-50"
              >
                Profile & Settings
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>

            </div>

          </div>
        )}

      </header>

      {/* ==================== PAGE CONTENT ==================== */}
      <main className="mx-auto min-h-[calc(100vh-16rem)] max-w-6xl px-4 py-6 md:px-6 md:py-8">

        {/* Page Header */}
        {(title || backTo || actions) && (
          <div className="mb-6 flex items-center gap-3">

            {backTo && (
              <button
                onClick={() => navigate(backTo)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-white text-ink-600 shadow-sm transition-all hover:-translate-x-0.5 hover:bg-ink-50"
                aria-label="Back"
              >
                ←
              </button>
            )}

            {title && (
              <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight text-ink-900 md:text-2xl">
                {title}
              </h1>
            )}

            {!user && actions}
          </div>
        )}

        {/* Page Content */}
        <div className="animate-page-in">
          {children}
        </div>

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-ink-100 bg-white">

        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">

          <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">

            {/* Brand */}
            <div>
              <Link
                to="/dashboard"
                className="text-sm font-extrabold tracking-tight text-ink-900"
              >
                TripSplitter
              </Link>

              <p className="mt-1 text-xs text-ink-400">
                Travel together. Split smarter.
              </p>
            </div>

            {/* Creator */}
            <div className="flex flex-col items-center sm:items-end">

              <p className="text-xs text-ink-400">
                Crafted with care
              </p>

              <p className="mt-0.5 text-sm font-semibold text-ink-700">
                by <span className="text-brand-600">Neeraj Pal</span>
              </p>

            </div>

          </div>

          <div className="mt-6 border-t border-ink-100 pt-4 text-center">
            <p className="text-[11px] text-ink-400">
              © {new Date().getFullYear()} TripSplitter. Made for better trips and happier groups.
            </p>
          </div>

        </div>

      </footer>

    </div>
  )
}