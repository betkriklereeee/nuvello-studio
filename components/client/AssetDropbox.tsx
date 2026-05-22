'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, X, Folder } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const ACCEPTED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'text/plain',
]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

type FileRecord = {
  name: string
  id: string | null
  created_at: string | null
  metadata: { size?: number } | null
}

export function AssetDropbox({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [uploading, setUploading] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load existing files on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.storage
      .from('project-assets')
      .list(projectId, { sortBy: { column: 'created_at', order: 'desc' } })
      .then(({ data }) => {
        if (data) {
          setFiles(
            data
              .filter((f) => f.name !== '.emptyFolderPlaceholder')
              .map((f) => ({
                name: f.name,
                id: f.id,
                created_at: f.created_at,
                metadata: f.metadata as { size?: number } | null,
              }))
          )
        }
      })
  }, [projectId])

  async function uploadFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((e) => [...e, `${file.name}: unsupported file type`])
      return
    }
    if (file.size > MAX_SIZE) {
      setErrors((e) => [...e, `${file.name}: exceeds 10 MB limit`])
      return
    }

    setUploading((u) => [...u, file.name])
    const supabase = createClient()
    const path = `${projectId}/${file.name}`
    const { error } = await supabase.storage
      .from('project-assets')
      .upload(path, file, { upsert: true })
    setUploading((u) => u.filter((n) => n !== file.name))

    if (error) {
      setErrors((e) => [...e, `${file.name}: ${error.message}`])
    } else {
      // Refresh file list
      const { data } = await supabase.storage
        .from('project-assets')
        .list(projectId, { sortBy: { column: 'created_at', order: 'desc' } })
      if (data) {
        setFiles(
          data
            .filter((f) => f.name !== '.emptyFolderPlaceholder')
            .map((f) => ({
              name: f.name,
              id: f.id,
              created_at: f.created_at,
              metadata: f.metadata as { size?: number } | null,
            }))
        )
      }
    }
  }

  function handleFileList(fileList: FileList) {
    Array.from(fileList).forEach(uploadFile)
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length) handleFileList(e.dataTransfer.files)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId]
  )

  return (
    <section>
      <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Share Files</h2>
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-5 space-y-4">
        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-[#1E1F6B] bg-[#EEEDF8]'
              : 'border-[#E2E0EB] hover:border-[#C5C4E0] hover:bg-[#F8F8FA]',
          ].join(' ')}
        >
          <Upload size={20} className="mx-auto text-[#9490A8] mb-2" />
          <p className="text-sm text-[#5A5575]">
            Drop files here or{' '}
            <span className="text-[#1E1F6B] font-medium">browse</span>
          </p>
          <p className="text-xs text-[#9490A8] mt-1">
            Images, PDFs, Word docs, ZIP — max 10 MB
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => e.target.files && handleFileList(e.target.files)}
          />
        </div>

        {/* Upload progress */}
        {uploading.map((name) => (
          <div key={name} className="flex items-center gap-2 text-sm text-[#5A5575]">
            <div className="w-3.5 h-3.5 border-2 border-[#1E1F6B] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Uploading {name}…
          </div>
        ))}

        {/* Errors */}
        {errors.map((err, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-xs text-[#B33A3A] bg-red-50 border border-red-100 rounded-lg px-3 py-2"
          >
            <span className="flex-1 truncate">{err}</span>
            <button
              onClick={() => setErrors((e) => e.filter((_, j) => j !== i))}
              className="ml-2 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* File list */}
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id ?? file.name} className="flex items-center gap-3 text-sm">
                <FileText size={14} className="text-[#9490A8] flex-shrink-0" />
                <span className="flex-1 truncate text-[#2B2B2E]">{file.name}</span>
                <span className="text-xs text-[#9490A8] flex-shrink-0">
                  {[
                    file.metadata?.size ? `${Math.round(file.metadata.size / 1024)} KB` : null,
                    file.created_at
                      ? new Date(file.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            ))}
          </div>
        ) : uploading.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-2 text-center">
            <Folder size={20} className="text-[#C5C4E0]" />
            <p className="text-xs text-[#9490A8]">No files uploaded yet.</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
