import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { computeBalances } from '../lib/splitCalculations'

export function useTrips() {
  const { user } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')

    try {
      // Trips the current user belongs to (as a real member row).
      const { data: myMemberships, error: memErr } = await supabase
        .from('trip_members')
        .select('id, trip_id')
        .eq('user_id', user.id)

      if (memErr) throw memErr

      const tripIds = [...new Set((myMemberships || []).map((m) => m.trip_id))]
      if (tripIds.length === 0) {
        setTrips([])
        setLoading(false)
        return
      }

      const { data: tripRows, error: tripErr } = await supabase
        .from('trips')
        .select('id, name, start_date, end_date, created_at, created_by, trip_members(id, user_id), expenses(id, amount, paid_by, expense_participants(member_id, share_amount))')
        .in('id', tripIds)
        .order('created_at', { ascending: false })

      if (tripErr) throw tripErr

      const myMemberIdByTrip = {}
      ;(myMemberships || []).forEach((m) => {
        myMemberIdByTrip[m.trip_id] = m.id
      })

      const enriched = (tripRows || []).map((trip) => {
        const total = (trip.expenses || []).reduce((sum, e) => sum + Number(e.amount), 0)
        const balances = computeBalances(trip.trip_members, trip.expenses || [])
        const myMemberId = myMemberIdByTrip[trip.id]
        const myNet = myMemberId && balances[myMemberId] ? balances[myMemberId].net : 0

       return {
          id: trip.id,
          name: trip.name,
          memberCount: (trip.trip_members || []).length,
          total,
          myNet,
          canDelete: trip.created_by === user.id
       }
      })

      setTrips(enriched)
    } catch (err) {
      setError(err.message || 'Could not load your trips.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  return { trips, loading, error, reload: load }
}
