import { Link } from 'react-router-dom'
import { formatCurrency } from '../lib/splitCalculations'

export default function TripCard({ trip, variant = 0 }) {
  const {
    id,
    name,
    memberCount,
    total,
    myNet
  } = trip

  const visualStyles = [
    {
      background:
        'bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600',
      accent: 'bg-white/10',
      icon: '✦'
    },
    {
      background:
        'bg-gradient-to-br from-ink-900 via-ink-800 to-brand-800',
      accent: 'bg-white/10',
      icon: '↗'
    },
    {
      background:
        'bg-gradient-to-br from-brand-700 via-brand-600 to-ink-800',
      accent: 'bg-white/10',
      icon: '◎'
    },
    {
      background:
        'bg-gradient-to-br from-ink-800 via-brand-800 to-brand-700',
      accent: 'bg-white/10',
      icon: '◇'
    }
  ]

  const style = visualStyles[variant % visualStyles.length]

  const balancePositive =
    Number(myNet) > 0

  const balanceNegative =
    Number(myNet) < 0

  return (
    <Link
      to={`/trips/${id}`}
      className="group block overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >

      {/* =========================
          VISUAL HEADER
      ========================== */}
      <div
        className={`relative min-h-[150px] overflow-hidden ${style.background} p-5 text-white`}
      >

        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-xl transition-transform duration-500 group-hover:scale-125" />

        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-xl" />

        {/* Top row */}
        <div className="relative flex items-start justify-between gap-4">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-lg backdrop-blur-sm">
            {style.icon}
          </div>

          <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm">
            Trip
          </span>

        </div>

        {/* Trip name */}
        <div className="relative mt-7">

          <h3 className="line-clamp-2 text-xl font-extrabold tracking-tight text-white">
            {name}
          </h3>

          <p className="mt-1 text-xs font-medium text-white/65">
            Your shared adventure
          </p>

        </div>

      </div>

      {/* =========================
          CARD DETAILS
      ========================== */}
      <div className="p-5">

        {/* Members + spending */}
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-ink-50 p-3.5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm text-brand-700 shadow-sm">
                +
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                  Members
                </p>

                <p className="mt-0.5 text-sm font-bold text-ink-900">
                  {memberCount}
                </p>
              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-ink-50 p-3.5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-brand-700 shadow-sm">
                ₹
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                  Spending
                </p>

                <p className="mt-0.5 truncate text-sm font-bold text-ink-900">
                  {formatCurrency(total)}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =========================
            BALANCE
        ========================== */}
        {balancePositive && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
                Your balance
              </p>

              <p className="mt-0.5 text-sm font-bold text-brand-700">
                You're owed
              </p>
            </div>

            <p className="text-base font-extrabold text-brand-700">
              {formatCurrency(myNet)}
            </p>

          </div>
        )}

        {balanceNegative && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-500">
                Your balance
              </p>

              <p className="mt-0.5 text-sm font-bold text-red-600">
                You owe
              </p>
            </div>

            <p className="text-base font-extrabold text-red-600">
              {formatCurrency(Math.abs(myNet))}
            </p>

          </div>
        )}

        {!balancePositive && !balanceNegative && (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-ink-100 bg-ink-50 px-4 py-3">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-ink-400">
                Your balance
              </p>

              <p className="mt-0.5 text-sm font-bold text-ink-700">
                All settled
              </p>
            </div>

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-600 shadow-sm">
              ✓
            </span>

          </div>
        )}

        {/* =========================
            OPEN TRIP
        ========================== */}
        <div className="mt-5 flex items-center justify-between">

          <span className="text-xs font-medium text-ink-400">
            View expenses & balances
          </span>

          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 transition-all duration-200 group-hover:gap-2.5">
            Open Trip
            <span aria-hidden="true">
              →
            </span>
          </span>

        </div>

      </div>

    </Link>
  )
}