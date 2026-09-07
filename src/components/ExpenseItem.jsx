import { Link } from 'react-router-dom'
import { formatCurrency, categoryIcon } from '../lib/splitCalculations'

export default function ExpenseItem({ expense, tripId, payerName }) {
  const date = new Date(expense.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })

  return (
    <Link
      to={`/trips/${tripId}/expenses/${expense.id}`}
      className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 transition hover:border-brand-200 hover:shadow-sm"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-100">
        {expense.photo_url ? (
          <img src={expense.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">
            {categoryIcon(expense.category)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900">{expense.description}</p>
        <p className="mt-0.5 text-xs text-ink-500">
          Paid by {payerName} · {expense.category} · {date}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-ink-900">{formatCurrency(expense.amount)}</p>
      </div>
    </Link>
  )
}
