import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { computeBalances } from '../lib/splitCalculations'

export function useTripDetails(tripId) {
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [members, setMembers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    setError('')

    try {
      const { data: tripRow, error: tripErr } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()
      if (tripErr) throw tripErr

      const { data: memberRows, error: memberErr } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true })
      if (memberErr) throw memberErr

      const { data: expenseRows, error: expenseErr } = await supabase
        .from('expenses')
        .select('*, expense_participants(*)')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
      if (expenseErr) throw expenseErr

      setTrip(tripRow)
      setMembers(memberRows || [])
      setExpenses(expenseRows || [])
    } catch (err) {
      setError(err.message || 'Could not load this trip.')
    } finally {
      setLoading(false)
    }
  }, [tripId])

  useEffect(() => {
    load()
  }, [load])

  const balances = computeBalances(members, expenses)
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const myMember = members.find((m) => m.user_id === user?.id)
  const myNet = myMember ? balances[myMember.id]?.net || 0 : 0
  const memberName = (memberId) => members.find((m) => m.id === memberId)?.member_name || 'Someone'

  return {
    trip,
    members,
    expenses,
    balances,
    total,
    myMember,
    myNet,
    memberName,
    loading,
    error,
    reload: load
  }
}
