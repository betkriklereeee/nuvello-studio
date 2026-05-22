'use client'

import { useState } from 'react'
import { Download, FileText, Folder } from 'lucide-react'
import { getAssetDownloadUrl } from '@/lib/actions'
import type { StorageFile } from '@/lib/types'

export function AssetsSection({
  projectId,
  files,
}: {
  projectId: string
  files: StorageFile[]
}) {
  if (files.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-center">
        <Folder size={28} className="text-[#C5C4E0]" />
        <p className="text-sm text-[#9490A8]">No files uploaded by the client yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <AssetRow key={file.id ?? file.name} projectId={projectId} file={file} />
      ))}
    </div>
  )
}

function AssetRow({ projectId, file }: { projectId: string; file: StorageFile }) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    const url = await getAssetDownloadUrl(`${projectId}/${file.name}`)
    setLoading(false)
    if (url) window.open(url, '_blank')
  }

  const sizeKb = file.metadata?.size ? Math.round(file.metadata.size / 1024) : null
  const date = file.created_at
    ? new Date(file.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E0EB] bg-white">
      <FileText size={15} className="text-[#9490A8] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2B2B2E] truncate">{file.name}</p>
        {(sizeKb !== null || date) && (
          <p className="text-xs text-[#9490A8] mt-0.5">
            {[sizeKb !== null ? `${sizeKb} KB` : null, date].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA] disabled:opacity-60 transition-colors"
      >
        <Download size={13} />
        {loading ? 'Getting link…' : 'Download'}
      </button>
    </div>
  )
}
