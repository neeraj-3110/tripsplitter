import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({ name: name.trim() })
      setMessage('Profile updated.')
    } catch (err) {
      setError(err.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <Layout title="Settings" backTo="/dashboard">
      <form onSubmit={handleSave} className="card space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Name</label>
          <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
          <input className="input-field bg-ink-50" value={user?.email || ''} disabled />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-brand-700">{message}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      <button onClick={handleLogout} className="btn-danger mt-4 w-full">
        Log Out
      </button>
    </Layout>
  )
}
