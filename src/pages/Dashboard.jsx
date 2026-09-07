import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import TripCard from '../components/TripCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTrips } from '../hooks/useTrips'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../lib/splitCalculations'

export default function Dashboard() {
  const { trips, loading, error } = useTrips()
  const { profile, user } = useAuth()

  const displayName =
    profile?.name ||
    user?.email?.split('@')[0] ||
    'there'

  /*
   * These values are calculated only from the real trip data
   * already returned by useTrips().
   */
  const totalExpenses = trips.reduce(
    (sum, trip) => sum + Number(trip.total || 0),
    0
  )

  const totalOwedToMe = trips.reduce(
    (sum, trip) =>
      sum + (Number(trip.myNet) > 0 ? Number(trip.myNet) : 0),
    0
  )

  const totalIOwe = trips.reduce(
    (sum, trip) =>
      sum + (Number(trip.myNet) < 0 ? Math.abs(Number(trip.myNet)) : 0),
    0
  )

  const hasBalance =
    totalOwedToMe > 0 || totalIOwe > 0

  return (
    <Layout title="Dashboard">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative mb-8 overflow-hidden rounded-[28px] border border-white/70 shadow-xl">

        {/* Scenic mountain background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
        style={{
           backgroundImage: `
            linear-gradient(
              135deg,
              rgba(210, 70, 35, 0.75) 0%,
              rgba(210, 55, 100, 0.70) 18%,
              rgba(125, 55, 190, 0.70) 36%,
              rgba(65, 75, 190, 0.70) 52%,
              rgba(25, 125, 200, 0.70) 68%,
              rgba(25, 155, 130, 0.70) 84%,
              rgba(75, 160, 45, 0.70) 100%
            )
          `
          }}
        />

        {/* Main soft mint gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e9f8ef]/95 via-[#dff5e8]/85 via-55% to-transparent" />

        {/* Extra soft green atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#dff7e9]/50 via-transparent to-[#0f5132]/10" />

        {/* Slight white haze for readability */}
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/20 via-transparent to-transparent" />

        {/* Hero content */}
        <div className="relative min-h-[360px] px-6 py-10 sm:px-10 sm:py-12 md:min-h-[390px] md:px-12 md:py-14 lg:px-14">

          <div className="max-w-2xl">

            {/* Brand badge */}
            <div className="inline-flex items-center rounded-full border border-brand-300/60 bg-white/35 px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest text-brand-800 backdrop-blur-md">
              TRIPSPLITTER
            </div>

            {/* Heading */}
            <h1 className="mt-6 max-w-xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl md:text-[52px] md:leading-[1.05]">
              Welcome back, {displayName}
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-600 sm:text-lg">
              Ready for your next adventure? Keep your trips organized and
              every expense perfectly balanced.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/trips/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl"
              >
                <span className="text-lg leading-none">+</span>
                Create New Trip
              </Link>

              {trips.length > 0 && (
                <a
                  href="#my-trips"
                  className="inline-flex items-center justify-center rounded-xl border border-white/80 bg-white/75 px-5 py-3 text-sm font-bold text-brand-800 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  View My Trips
                </a>
              )}

            </div>
          </div>

          {/* Slogan on the scenic side */}
          <div className="absolute right-8 top-8 hidden max-w-[240px] text-right lg:block">
            <p className="text-2xl font-semibold italic leading-tight text-brand-800 drop-shadow-sm">
              Travel together.
              <br />
              Split smarter.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================
          SUMMARY
      ====================================================== */}
      {!loading && !error && trips.length > 0 && (
        <section className="mb-9">

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Overview
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink-900">
              Your money at a glance
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            {/* Total Trips */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <span className="text-lg">✦</span>
                </div>

                <span className="text-xs font-medium text-ink-400">
                  Trips
                </span>

              </div>

              <p className="mt-5 text-2xl font-extrabold tracking-tight text-ink-900">
                {trips.length}
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Your shared adventures
              </p>

            </div>

            {/* Total Expenses */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <span className="text-lg">₹</span>
                </div>

                <span className="text-xs font-medium text-ink-400">
                  Spending
                </span>

              </div>

              <p className="mt-5 truncate text-2xl font-extrabold tracking-tight text-ink-900">
                {formatCurrency(totalExpenses)}
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Across all your trips
              </p>

            </div>

            {/* You Owe */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <span className="text-lg">↓</span>
                </div>

                <span className="text-xs font-medium text-ink-400">
                  You owe
                </span>

              </div>

              <p className="mt-5 truncate text-2xl font-extrabold tracking-tight text-ink-900">
                {formatCurrency(totalIOwe)}
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Your outstanding balance
              </p>

            </div>

            {/* You're Owed */}
            <div className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <span className="text-lg">↑</span>
                </div>

                <span className="text-xs font-medium text-ink-400">
                  You're owed
                </span>

              </div>

              <p className="mt-5 truncate text-2xl font-extrabold tracking-tight text-ink-900">
                {formatCurrency(totalOwedToMe)}
              </p>

              <p className="mt-1 text-xs text-ink-500">
                Money coming back to you
              </p>

            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          ERROR
      ====================================================== */}
      {!loading && error && (
        <section className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
              !
            </div>

            <div>
              <p className="font-semibold text-red-800">
                We couldn't load your trips
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

          </div>

        </section>
      )}

      {/* =====================================================
          LOADING
      ====================================================== */}
      {loading && (
        <div className="card mb-8">
          <LoadingSpinner label="Loading your trips…" />
        </div>
      )}

      {/* =====================================================
          MY TRIPS
      ====================================================== */}
      {!loading && !error && trips.length > 0 && (
        <section id="my-trips" className="scroll-mt-24">

          <div className="mb-5 flex items-end justify-between gap-4">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                Your adventures
              </p>

              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-ink-900">
                My Trips
              </h2>

              <p className="mt-1 text-sm text-ink-500">
                {trips.length} trip{trips.length === 1 ? '' : 's'} you're part of
              </p>
            </div>

            <Link
              to="/trips/new"
              className="hidden shrink-0 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-ink-50 sm:inline-flex"
            >
              + New Trip
            </Link>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {trips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                variant={index % 4}
              />
            ))}

          </div>

        </section>
      )}

      {/* =====================================================
          EMPTY STATE
      ====================================================== */}
      {!loading && !error && trips.length === 0 && (
        <section>

          <EmptyState
            icon="✦"
            title="Your next adventure starts here."
            subtitle="Create your first trip and start splitting expenses with your friends."
            action={
              <Link
                to="/trips/new"
                className="btn-primary px-5 py-3"
              >
                + Create Your First Trip
              </Link>
            }
          />

        </section>
      )}

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}
      {!loading && !error && trips.length > 0 && (
        <section className="mt-10 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-orange-50 px-6 py-8 md:px-9">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="max-w-xl">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
                Keep exploring
              </p>

              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-900">
                Travel together. Split smarter.
              </h2>

              <p className="mt-2 text-sm leading-6 text-ink-500">
                TripSplitter keeps group expenses simple, transparent
                and stress-free — so you can focus on the memories.
              </p>

            </div>

            <Link
              to="/trips/new"
              className="btn-primary shrink-0 px-5 py-3"
            >
              Create a Trip
            </Link>

          </div>

        </section>
      )}

      {/* =====================================================
          BALANCE NOTE
      ====================================================== */}
      {!loading && !error && trips.length > 0 && hasBalance && (
        <p className="mt-5 text-center text-xs text-ink-400">
          Your balances are calculated from the expenses and splits in your trips.
        </p>
      )}

    </Layout>
  )
}