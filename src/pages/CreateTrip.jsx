import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function CreateTrip() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [members, setMembers] = useState([''])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateMember = (index, value) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? value : m))
    )
  }

  const addMemberField = () => {
    setMembers((prev) => [...prev, ''])
  }

  const removeMemberField = (index) => {
    setMembers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in to create a trip.')
      return
    }

    if (!name.trim()) {
      setError('Please give your trip a name.')
      return
    }

    const extraMembers = members
      .map((m) => m.trim())
      .filter(Boolean)

    /*
     * Get the logged-in user's real name.
     * Priority:
     * 1. Profile name
     * 2. Supabase Auth name metadata
     * 3. Full name metadata
     * 4. Part before @ in email
     */
    const ownerName =
      profile?.name?.trim() ||
      user.user_metadata?.name?.trim() ||
      user.user_metadata?.full_name?.trim() ||
      user.email?.split('@')[0]?.trim() ||
      'User'

    setSubmitting(true)

    try {
      // Create the trip
      const { data: trip, error: tripErr } = await supabase
        .from('trips')
        .insert({
          name: name.trim(),
          start_date: startDate || null,
          end_date: endDate || null,
          created_by: user.id
        })
        .select()
        .single()

      if (tripErr) {
        throw tripErr
      }

      // Add the trip owner and manually entered members
      const memberRows = [
        {
          trip_id: trip.id,
          user_id: user.id,
          member_name: ownerName
        },
        ...extraMembers.map((memberName) => ({
          trip_id: trip.id,
          user_id: null,
          member_name: memberName
        }))
      ]

      const { error: memberErr } = await supabase
        .from('trip_members')
        .insert(memberRows)

      if (memberErr) {
        throw memberErr
      }

      // Open the newly created trip
      navigate(`/trips/${trip.id}`)
    } catch (err) {
      console.error('Create trip error:', err)

      setError(
        err.message ||
        'Could not create the trip. Please try again.'
      )

      setSubmitting(false)
    }
  }

  return (
    <Layout title="Create Trip" backTo="/dashboard">
      <form
        onSubmit={handleSubmit}
        className="card space-y-5 p-5"
      >
        {/* Trip Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Trip name
          </label>

          <input
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goa Trip"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              Start date{' '}
              <span className="text-ink-400">
                (optional)
              </span>
            </label>

            <input
              type="date"
              className="input-field"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">
              End date{' '}
              <span className="text-ink-400">
                (optional)
              </span>
            </label>

            <input
              type="date"
              className="input-field"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Members */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">
            Members
          </label>

          <p className="mb-2 text-xs text-ink-400">
            You're automatically added. Add your friends by
            name — they don't need an account.
          </p>

          <div className="space-y-2">
            {members.map((member, index) => (
              <div
                key={index}
                className="flex gap-2"
              >
                <input
                  className="input-field"
                  value={member}
                  onChange={(e) =>
                    updateMember(index, e.target.value)
                  }
                  placeholder={`Friend ${index + 1} name`}
                />

                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMemberField(index)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 text-ink-500 hover:bg-ink-50"
                    aria-label="Remove member"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMemberField}
            className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            + Add another member
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting ? 'Creating…' : 'Create Trip'}
        </button>
      </form>
    </Layout>
  )
}