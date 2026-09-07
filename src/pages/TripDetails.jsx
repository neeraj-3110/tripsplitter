import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import Layout from '../components/Layout'
import ExpenseItem from '../components/ExpenseItem'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useTripDetails } from '../hooks/useTripDetails'
import { formatCurrency } from '../lib/splitCalculations'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function TripDetails() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    trip,
    members,
    expenses,
    total,
    myNet,
    memberName,
    loading,
    error
  } = useTripDetails(tripId)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Invitation states
  const [showInvite, setShowInvite] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [creatingInvite, setCreatingInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleDeleteTrip = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${trip.name}"?\n\nThis will permanently delete the trip, its expenses, settlements, and members.`
    )

    if (!confirmed) return

    setDeleting(true)
    setDeleteError('')

    try {
      const { error: deleteErr } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (deleteErr) throw deleteErr

      navigate('/dashboard')
    } catch (err) {
      setDeleteError(
        err.message || 'Could not delete this trip.'
      )
    } finally {
      setDeleting(false)
    }
  }

  // Create invitation link
  const handleCreateInvite = async () => {
    setCreatingInvite(true)
    setInviteError('')
    setCopied(false)

    try {
      const { data, error } = await supabase.rpc(
        'create_trip_invitation',
        {
          _trip_id: tripId
        }
      )

      if (error) throw error

      const link = `${window.location.origin}/join/${data}`

      setInviteLink(link)
      setShowInvite(true)
    } catch (err) {
      setInviteError(
        err.message || 'Could not create invitation link.'
      )
    } finally {
      setCreatingInvite(false)
    }
  }

  // Copy invitation link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      setInviteError('Could not copy the link.')
    }
  }

  // Share invitation
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Join ${trip.name}`,
          text: `Join my trip "${trip.name}" on TripSplit!`,
          url: inviteLink
        })
      } else {
        await handleCopyLink()
      }
    } catch (err) {
      // User cancelled sharing - do nothing
    }
  }

  // Email invitation
  const handleEmail = () => {
    const subject = encodeURIComponent(
      `Join my TripSplit trip - ${trip.name}`
    )

    const body = encodeURIComponent(
      `Hi!\n\nI've created a trip called "${trip.name}" on TripSplit.\n\nJoin the trip using this link:\n${inviteLink}\n\nSee you there!`
    )

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`
  }

  if (loading) {
    return <LoadingSpinner label="Loading trip…" />
  }

  if (error) {
    return (
      <Layout title="Trip" backTo="/dashboard">
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      </Layout>
    )
  }

  if (!trip) return null

  const isTripOwner = trip.created_by === user?.id

  return (
    <Layout title={trip.name} backTo="/dashboard">

      <div className="card mb-4 p-5">

        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-ink-500">
              {members.length} member{members.length === 1 ? '' : 's'}
            </p>

            <p className="mt-1 text-2xl font-bold text-ink-900">
              {formatCurrency(total)}
            </p>

            <p className="text-xs text-ink-400">
              Total spending
            </p>
          </div>
        </div>

        {myNet !== 0 && (
          <div
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              myNet > 0
                ? 'bg-brand-50 text-brand-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {myNet > 0
              ? `You are owed ${formatCurrency(myNet)}`
              : `${formatCurrency(-myNet)} is ready to leave your wallet`}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Link
            to={`/trips/${tripId}/expenses/new`}
            className="btn-primary flex-1"
          >
            + Add Expense
          </Link>

          <Link
            to={`/trips/${tripId}/insights`}
            className="btn-secondary flex-1"
          >
            📊 Insights
          </Link>
        </div>

        {/* Invite Friends Button */}
        <button
          onClick={handleCreateInvite}
          disabled={creatingInvite}
          className="btn-secondary mt-2 w-full"
        >
          {creatingInvite
            ? 'Creating invitation…'
            : '👥 Invite Friends'}
        </button>

        {inviteError && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {inviteError}
          </p>
        )}

        {/* Invitation box */}
        {showInvite && inviteLink && (
          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4">

            <p className="text-sm font-semibold text-ink-900">
              Invite friends to {trip.name}
            </p>

            <p className="mt-1 text-xs text-ink-500">
              Send this link to your friends. They can open it,
              log in and join this trip.
            </p>

            <div className="mt-3 rounded-lg bg-white p-3">
              <p className="break-all text-xs text-ink-600">
                {inviteLink}
              </p>
            </div>

            <div className="mt-3 flex gap-2">

              <button
                onClick={handleCopyLink}
                className="btn-primary flex-1"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              <button
                onClick={handleShare}
                className="btn-secondary flex-1"
              >
                Share
              </button>

            </div>

            <button
              onClick={handleEmail}
              className="mt-2 w-full rounded-xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-700 transition hover:bg-white"
            >
              Email Invitation
            </button>

          </div>
        )}

        <Link
          to={`/trips/${tripId}/settlement`}
          className="mt-2 block text-center text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Settle Up →
        </Link>

      </div>

      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
        Expenses
      </h2>

      {expenses.length === 0 ? (
        <EmptyState
          icon="🧾"
          title="No expenses yet."
          subtitle="Add your first expense to start tracking the trip."
          action={
            <Link
              to={`/trips/${tripId}/expenses/new`}
              className="btn-primary"
            >
              + Add Expense
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              tripId={tripId}
              payerName={memberName(expense.paid_by)}
            />
          ))}
        </div>
      )}

      {isTripOwner && (
        <div className="mt-8 border-t border-ink-100 pt-6">

          {deleteError && (
            <p className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              {deleteError}
            </p>
          )}

          <button
            onClick={handleDeleteTrip}
            disabled={deleting}
            className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? 'Deleting Trip…' : 'Delete Trip'}
          </button>

        </div>
      )}

    </Layout>
  )
}