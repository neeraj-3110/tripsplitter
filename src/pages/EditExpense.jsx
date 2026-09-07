import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import PhotoUpload from '../components/PhotoUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import { supabase } from '../lib/supabaseClient'
import { CATEGORIES, splitEqually } from '../lib/splitCalculations'

export default function EditExpense() {
  const { tripId, expenseId } = useParams()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Food')
  const [paidBy, setPaidBy] = useState('')
  const [participantIds, setParticipantIds] = useState([])
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null)
  const [photoFile, setPhotoFile] = useState(undefined) // undefined = unchanged, null = removed, Blob = new
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const [{ data: expense, error: expErr }, { data: memberRows, error: memErr }] = await Promise.all([
          supabase.from('expenses').select('*, expense_participants(*)').eq('id', expenseId).single(),
          supabase.from('trip_members').select('*').eq('trip_id', tripId)
        ])
        if (expErr) throw expErr
        if (memErr) throw memErr
        if (!mounted) return

        setMembers(memberRows || [])
        setAmount(String(expense.amount))
        setDescription(expense.description)
        setCategory(expense.category)
        setPaidBy(expense.paid_by)
        setParticipantIds((expense.expense_participants || []).map((p) => p.member_id))
        setExistingPhotoUrl(expense.photo_url)
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

  const toggleParticipant = (id) => {
    setParticipantIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const validate = () => {
    const numericAmount = Number(amount)
    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return 'Please enter a valid amount greater than zero.'
    }
    if (!description.trim()) return 'Please add a short description.'
    if (!paidBy) return 'Please select who paid.'
    if (participantIds.length === 0) return 'Please select at least one participant.'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setSubmitting(true)

    try {
      let photoUrl = existingPhotoUrl
      if (photoFile === null) {
        photoUrl = null
      } else if (photoFile) {
        const fileName = `${tripId}/${Date.now()}.jpg`
        const { error: uploadErr } = await supabase.storage
          .from('expense-photos')
          .upload(fileName, photoFile, { contentType: 'image/jpeg' })
        if (uploadErr) throw new Error('Could not upload the photo. Please try again.')
        const { data: publicUrl } = supabase.storage.from('expense-photos').getPublicUrl(fileName)
        photoUrl = publicUrl.publicUrl
      }

      const { error: updateErr } = await supabase
        .from('expenses')
        .update({
          description: description.trim(),
          amount: Number(amount),
          category,
          paid_by: paidBy,
          photo_url: photoUrl
        })
        .eq('id', expenseId)
      if (updateErr) throw new Error('Could not update the expense.')

      // Replace participants: simplest correct approach is delete + reinsert.
      const { error: deleteErr } = await supabase.from('expense_participants').delete().eq('expense_id', expenseId)
      if (deleteErr) throw new Error('Could not update the split.')

      const shares = splitEqually(Number(amount), participantIds)
      const rows = shares.map((s) => ({
        expense_id: expenseId,
        member_id: s.memberId,
        share_amount: s.shareAmount
      }))
      const { error: insertErr } = await supabase.from('expense_participants').insert(rows)
      if (insertErr) throw new Error('Could not update the split.')

      navigate(`/trips/${tripId}/expenses/${expenseId}`)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Loading…" />

  return (
    <Layout title="Edit Expense" backTo={`/trips/${tripId}/expenses/${expenseId}`}>
      <form onSubmit={handleSubmit} className="card space-y-5 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">₹</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              className="input-field pl-7"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
          <input className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  category === c.key
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-ink-200 text-ink-600 hover:bg-ink-50'
                }`}
              >
                {c.icon} {c.key}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Paid by</label>
          <select className="input-field" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.member_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Split between</label>
          <div className="space-y-1.5 rounded-xl border border-ink-100 p-3">
            {members.map((m) => (
              <label key={m.id} className="flex items-center gap-2.5 py-1 text-sm text-ink-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  checked={participantIds.includes(m.id)}
                  onChange={() => toggleParticipant(m.id)}
                />
                {m.member_name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Photo of the place</label>
          <PhotoUpload
            value={photoFile === undefined ? existingPhotoUrl : null}
            onChange={(file) => setPhotoFile(file)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </Layout>
  )
}
