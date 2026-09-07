import { useRef, useState } from 'react'

// Resizes/compresses an image file in the browser before upload so users
// don't accidentally upload multi-megabyte camera photos.
async function compressImage(file, maxDimension = 1280, quality = 0.8) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
  })
}

export default function PhotoUpload({ value, onChange }) {
  const [preview, setPreview] = useState(value || null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('That image is too large (max 15MB).')
      return
    }

    setError('')
    try {
      const compressed = await compressImage(file)
      const localUrl = URL.createObjectURL(compressed)
      setPreview(localUrl)
      onChange(compressed)
    } catch {
      setError('Could not process that image. Please try another.')
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Expense place preview" className="h-44 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-ink-200 text-ink-500 transition hover:border-brand-300 hover:bg-brand-50"
        >
          <span className="text-2xl">📸</span>
          <span className="text-sm font-medium">Add Photo</span>
          <span className="text-xs text-ink-400">Where did this happen? (optional)</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
