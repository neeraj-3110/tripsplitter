import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTripDetails } from '../hooks/useTripDetails'
import { buildInsights, formatCurrency, categoryIcon } from '../lib/splitCalculations'

const BAR_COLORS = ['#1f8455', '#2fa46a', '#54c087', '#87d9ac', '#b8ebce', '#dcf5e6', '#f1fbf6']

export default function Insights() {
  const { tripId } = useParams()
  const { trip, expenses, loading, error } = useTripDetails(tripId)

  if (loading) return <LoadingSpinner label="Crunching the numbers…" />
  if (error) {
    return (
      <Layout title="Insights" backTo={`/trips/${tripId}`}>
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
      </Layout>
    )
  }

  if (expenses.length === 0) {
    return (
      <Layout title="Insights" backTo={`/trips/${tripId}`}>
        <EmptyState
          icon="📊"
          title="Add a few expenses to see your spending insights."
          subtitle="Once you log some expenses, we'll break down your spending automatically."
        />
      </Layout>
    )
  }

  const insights = buildInsights(expenses)

  return (
    <Layout title={`Insights · ${trip?.name || ''}`} backTo={`/trips/${tripId}`}>
      <div className="card mb-4 p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-ink-400">Total Spending</p>
        <p className="mt-1 text-3xl font-bold text-ink-900">{formatCurrency(insights.total)}</p>
      </div>

      <div className="card mb-4 p-5">
        <p className="mb-3 text-sm font-semibold text-ink-700">Spending by Category</p>
        <div className="space-y-3">
          {insights.categories.map((c, index) => (
            <div key={c.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-700">
                  {categoryIcon(c.category)} {c.category}
                </span>
                <span className="text-ink-500">
                  {formatCurrency(c.amount)} · {c.percent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${c.percent}%`, backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {insights.biggest && (
        <div className="card mb-4 flex items-center gap-4 p-5">
          <div className="text-4xl">{categoryIcon(insights.biggest.category)}</div>
          <div>
            <p className="text-sm text-ink-500">Biggest Category</p>
            <p className="text-lg font-bold text-ink-900">{insights.biggest.category}</p>
            <p className="text-sm text-ink-600">
              {formatCurrency(insights.biggest.amount)} · {insights.biggest.percent}% of total spending
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <p className="text-lg font-bold text-ink-900">{insights.count}</p>
          <p className="text-xs text-ink-500">Expenses</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-lg font-bold text-ink-900">{formatCurrency(insights.average)}</p>
          <p className="text-xs text-ink-500">Average</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-lg font-bold text-ink-900">{formatCurrency(insights.highest?.amount || 0)}</p>
          <p className="text-xs text-ink-500">Highest</p>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-2 text-sm font-semibold text-ink-700">What this means</p>
        <ul className="space-y-1.5">
          {insights.statements.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-600">
              <span className="text-brand-600">•</span> {s}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
