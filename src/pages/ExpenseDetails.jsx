import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabaseClient'
import { formatCurrency, categoryIcon } from '../lib/splitCalculations'

export default function ExpenseDetails() {
  const { tripId, expenseId } = useParams()
  const navigate = useNavigate()

  const [expense, setExpense] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [{ data: expenseRow, error: expErr }, { data: memberRows, error: memErr }] = await Promise.all([
          supabase.from('expenses').select('*, expense_participants(*)').eq('id', expenseId).single(),
          supabase.from('trip_members').select('*').eq('trip_id', tripId)
        ])
        if (expErr) throw expErr
        if (memErr) throw memErr
        if (mounted) {
          setExpense(expenseRow)
          setMembers(memberRows || [])
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Could not load this expense.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [expenseId, tripId])

  const memberName = (id) => members.find((m) => m.id === id)?.member_name || 'Someone'

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error: deleteErr } = await supabase.from('expenses').delete().eq('id', expenseId)
      if (deleteErr) throw deleteErr
      navigate(`/trips/${tripId}`)
    } catch (err) {
      setError(err.message || 'Could not delete this expense.')
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading expense…" />

  if (error && !expense) {
    return (
      <Layout title="Expense" backTo={`/trips/${tripId}`}>
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
      </Layout>
    )
  }
  if (!expense) return null

  const date = new Date(expense.created_at).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  return (
    <Layout title="Expense Details" backTo={`/trips/${tripId}`}>
      <div className="card overflow-hidden">
        <div className="h-56 w-full bg-ink-100">
          {expense.photo_url ? (
            <img src={expense.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl">
              {categoryIcon(expense.category)}
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-lg font-semibold text-ink-900">{expense.description}</p>
          <p className="mt-1 text-2xl font-bold text-ink-900">{formatCurrency(expense.amount)}</p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-ink-100 px-3 py-1 text-ink-600">
              {categoryIcon(expense.category)} {expense.category}
            </span>
            <span className="rounded-full bg-ink-100 px-3 py-1 text-ink-600">
              Paid by {memberName(expense.paid_by)}
            </span>
          </div>

          <p className="mt-3 text-xs text-ink-400">{date}</p>

          <div className="mt-5 border-t border-ink-100 pt-4">
            <p className="mb-2 text-sm font-semibold text-ink-700">Split between</p>
            <div className="space-y-1.5">
              {(expense.expense_participants || []).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{memberName(p.member_id)}</span>
                  <span className="font-medium text-ink-900">{formatCurrency(p.share_amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-2">
            <Link to={`/trips/${tripId}/expenses/${expenseId}/edit`} className="btn-secondary flex-1">
              Edit
            </Link>
            {confirmDelete ? (
              <button onClick={handleDelete} disabled={deleting} className="btn-danger flex-1">
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="btn-danger flex-1">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
