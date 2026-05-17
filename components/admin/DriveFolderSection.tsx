'use client'

import { useState } from 'react'
import { FolderOpen, ExternalLink, Save } from 'lucide-react'
import { saveProjectDriveFolder } from '@/lib/actions'
import type { DriveFolder } from '@/lib/types'

export function DriveFolderSection({
  projectId,
  clientId,
  existing,
}: {
  projectId: string
  clientId: string
  existing: DriveFolder | null
}) {
  const [url, setUrl] = useState(existing?.folder_url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setSaving(true)
    setError('')
    const result = await saveProjectDriveFolder({
      project_id: projectId,
      client_id: clientId,
      folder_url: url.trim(),
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div>
      {existing && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E2E0EB] bg-white mb-3">
          <FolderOpen size={16} className="text-[#1E1F6B] flex-shrink-0" />
          <span className="text-sm text-[#5A5575] flex-1 truncate">{existing.folder_url}</span>
          <a
            href={existing.folder_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-1.5 rounded-md text-[#9490A8] hover:text-[#1E1F6B] hover:bg-[#EEEDF8] transition-colors"
            title="Open in Google Drive"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      <form onSubmit={handleSave} className="flex gap-2">
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setSaved(false) }}
          placeholder="Paste Google Drive folder URL…"
          className="flex-1 px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-white"
        />
        <button
          type="submit"
          disabled={saving || !url.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
        >
          <Save size={14} />
          {saving ? 'Saving…' : saved ? 'Saved!' : existing ? 'Update' : 'Save'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-[#B33A3A]">{error}</p>}
    </div>
  )
}
