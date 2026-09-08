import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function JoinTrip() {
  const { inviteCode } = useParams()
  const navigate = useNavigate()

  const {
    user,
    loading: authLoading
  } = useAuth()

  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadInvitation = async () => {
      try {
        const { data, error } = await supabase.rpc(
          'get_trip_by_invite',
          {
            _invite_code: inviteCode
          }
        )

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error('Invitation not found')
        }

        setTrip({
          id: data[0].trip_id,
          name: data[0].trip_name
        })
      } catch (err) {
        console.error('Invitation error:', err)
        setError('This invitation link is invalid or expired.')
      } finally {
        setLoading(false)
      }
    }

    if (inviteCode) {
      loadInvitation()
    }
  }, [inviteCode])

  const handleJoin = async () => {
    if (!user) {
      navigate(`/?redirect=/join/${inviteCode}`)
      return
    }

    setJoining(true)
    setError('')

    try {
      // The Supabase function now:
      // 1. Validates the invitation
      // 2. Gets the user's real name
      // 3. Adds the user to trip_members
      // 4. Saves the correct user_id
      // 5. Saves the correct member_name

      const { data, error } = await supabase.rpc(
        'join_trip_by_invite',
        {
          _invite_code: inviteCode
        }
      )

      if (error) throw error

      // Open the joined trip
      navigate(`/trips/${data}`)
    } catch (err) {
      console.error('Join trip error:', err)

      setError(
        err.message || 'Could not join this trip.'
      )
    } finally {
      setJoining(false)
    }
  }

  if (authLoading || loading) {
    return <LoadingSpinner label="Loading invitation…" />
  }

  return (
    <Layout title="Join Trip">
      <div className="card p-6 text-center">
        {error ? (
          <>
            <h2 className="text-xl font-bold text-ink-900">
              Invitation Problem
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary mt-5 w-full"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-400">
              You've been invited to join
            </p>

            <h2 className="mt-2 text-2xl font-bold text-ink-900">
              {trip?.name}
            </h2>

            <p className="mt-3 text-sm text-ink-500">
              Join this trip to view expenses,
              add expenses and split costs with your friends.
            </p>

            <button
              onClick={handleJoin}
              disabled={joining}
              className="btn-primary mt-6 w-full"
            >
              {joining ? 'Joining…' : 'Join Trip'}
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}