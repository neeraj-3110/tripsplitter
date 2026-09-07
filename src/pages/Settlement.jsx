import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabaseClient'
import { useTripDetails } from '../hooks/useTripDetails'
import {
  simplifySettlements,
  formatCurrency,
  toPaise,
  toRupees
} from '../lib/splitCalculations'

export default function Settlement() {
  const { tripId } = useParams()

  const {
    members,
    balances,
    memberName,
    myMember,
    loading: loadingTrip,
    reload
  } = useTripDetails(tripId)

  const [settledHistory, setSettledHistory] = useState([])
  const [loadingSettlements, setLoadingSettlements] = useState(true)
  const [error, setError] = useState('')
  const [markingId, setMarkingId] = useState(null)

  const loadSettlements = async () => {
    setLoadingSettlements(true)

    try {
      const { data, error: err } = await supabase
        .from('settlements')
        .select('*')
        .eq('trip_id', tripId)
        .eq('settled', true)

      if (err) throw err

      setSettledHistory(data || [])
    } catch (err) {
      setError(err.message || 'Could not load settlement history.')
    } finally {
      setLoadingSettlements(false)
    }
  }

  useEffect(() => {
    loadSettlements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId])

  if (loadingTrip || loadingSettlements) {
    return <LoadingSpinner label="Calculating settlements…" />
  }

  // Fold in already-settled payments so suggested transactions
  // reflect what's left.
  const adjustedBalances = {}

  Object.entries(balances).forEach(([id, b]) => {
    adjustedBalances[id] = { net: b.net }
  })

  settledHistory.forEach((s) => {
    if (adjustedBalances[s.from_member]) {
      adjustedBalances[s.from_member].net = toRupees(
        toPaise(adjustedBalances[s.from_member].net) +
          toPaise(s.amount)
      )
    }

    if (adjustedBalances[s.to_member]) {
      adjustedBalances[s.to_member].net = toRupees(
        toPaise(adjustedBalances[s.to_member].net) -
          toPaise(s.amount)
      )
    }
  })

  const transactions = simplifySettlements(adjustedBalances)

  // Current user's payment summary
  const myBalance = myMember ? balances[myMember.id] : null
  const myPaid = myBalance?.paid ?? 0
  const myOwed = myBalance?.owed ?? 0
  const myNet = myBalance?.net ?? 0

  // Mark a payment as settled
  const handleMarkSettled = async (tx) => {
    setMarkingId(`${tx.from}-${tx.to}`)

    try {
      const { error: insertErr } = await supabase
        .from('settlements')
        .insert({
          trip_id: tripId,
          from_member: tx.from,
          to_member: tx.to,
          amount: tx.amount,
          settled: true
        })

      if (insertErr) throw insertErr

      await loadSettlements()
      await reload()
    } catch (err) {
      setError(err.message || 'Could not record this settlement.')
    } finally {
      setMarkingId(null)
    }
  }

  // Undo a settled payment
  const handleUnsettle = async (settlementId) => {
    setMarkingId(settlementId)
    setError('')

    try {
      const { error: updateErr } = await supabase
        .from('settlements')
        .update({ settled: false })
        .eq('id', settlementId)

      if (updateErr) throw updateErr

      await loadSettlements()
      await reload()
    } catch (err) {
      setError(err.message || 'Could not undo this settlement.')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <Layout title="Settle Up" backTo={`/trips/${tripId}`}>

      {/* Your personal payment summary */}
      {myBalance && (
        <div className="card mb-4 p-5">
          <h2 className="text-base font-semibold text-ink-900">
            Your Trip Summary
          </h2>

          <div className="mt-4 space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-ink-500">
                You paid
              </span>

              <span className="font-semibold text-ink-900">
                {formatCurrency(myPaid)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-ink-500">
                Your share
              </span>

              <span className="font-semibold text-ink-900">
                {formatCurrency(myOwed)}
              </span>
            </div>

            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-sm text-ink-500">
                Your balance
              </p>

              <p className="mt-1 text-sm font-medium text-ink-900">
                {formatCurrency(myPaid)} − {formatCurrency(myOwed)} ={' '}
                {formatCurrency(myNet)}
              </p>
            </div>

            {myNet > 0 ? (
              <div className="rounded-xl bg-green-50 p-3">
                <p className="font-semibold text-green-700">
                  You paid extra {formatCurrency(myNet)}
                </p>

                <p className="mt-1 text-sm text-green-600">
                  You need to receive {formatCurrency(myNet)}
                </p>
              </div>
            ) : myNet < 0 ? (
              <div className="rounded-xl bg-red-50 p-3">
                <p className="font-semibold text-red-700">
                  You still need to pay {formatCurrency(Math.abs(myNet))}
                </p>

                <p className="mt-1 text-sm text-red-600">
                  You paid less than your share.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-green-50 p-3">
                <p className="font-semibold text-green-700">
                  You are all settled up.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Current payments */}
      {transactions.length === 0 ? (
        <EmptyState
          icon="🎉"
          title="All settled up!"
          subtitle="Nobody owes anybody anything right now."
        />
      ) : (
        <div className="space-y-2">

          {transactions.map((tx) => (
            <div
              key={`${tx.from}-${tx.to}`}
              className="card flex items-center justify-between p-4"
            >

              <div className="text-sm text-ink-700">

                <span className="font-semibold">
                  {memberName(tx.from)}
                </span>

                {' '}needs to pay{' '}

                <span className="font-semibold">
                  {memberName(tx.to)}
                </span>

                <p className="mt-0.5 text-base font-bold text-ink-900">
                  {formatCurrency(tx.amount)}
                </p>

              </div>

              <button
                onClick={() => handleMarkSettled(tx)}
                disabled={markingId === `${tx.from}-${tx.to}`}
                className="btn-secondary"
              >
                {markingId === `${tx.from}-${tx.to}`
                  ? 'Saving…'
                  : 'Mark Settled'}
              </button>

            </div>
          ))}

        </div>
      )}

      {/* Settled payments */}
      {settledHistory.length > 0 && (
        <div className="mt-6">

          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-400">
            Settled Payments
          </h2>

          <div className="space-y-2">

            {settledHistory.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"
              >

                <div>
                  <span className="text-ink-500">
                    {memberName(s.from_member)} →{' '}
                    {memberName(s.to_member)}
                  </span>

                  <p className="mt-0.5 text-xs text-green-600">
                    Settled
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <span className="font-medium text-ink-700">
                    {formatCurrency(s.amount)}
                  </span>

                  <button
                    onClick={() => handleUnsettle(s.id)}
                    disabled={markingId === s.id}
                    className="btn-secondary"
                  >
                    {markingId === s.id
                      ? 'Saving…'
                      : 'Unsettle'}
                  </button>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}

    </Layout>
  )
}