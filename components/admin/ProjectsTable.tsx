'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { ProjectStatusBadge } from './StatusBadge'
import { addProject, editProject, removeProject } from '@/lib/actions'
import type { Client, Project, ProjectStatus } from '@/lib/types'

const PROJECT_STATUSES: ProjectStatus[] = ['discovery', 'design', 'build', 'launch', 'complete']

const inputCls =
  'w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] ' +
  'placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-white'

interface Props {
  projects: Project[]
  clients: Client[]
  defaultClientId?: string
}

export function ProjectsTable({ projects: initial, clients, defaultClientId }: Props) {
  const [projects] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [servicesInput, setServicesInput] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const router = useRouter()

  function openAdd() {
    setEditing(null)
    setServicesInput('')
    setEstimatedHours('')
    setError('')
    setModalOpen(true)
  }

  function openEdit(p: Project) {
    setEditing(p)
    setServicesInput(p.services?.join(', ') ?? '')
    setEstimatedHours(p.estimated_hours != null ? String(p.estimated_hours) : '')
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const services = servicesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const data = {
      name: fd.get('name') as string,
      client_id: fd.get('client_id') as string,
      status: fd.get('status') as string,
      services,
      estimated_hours: estimatedHours ? Number(estimatedHours) : null,
    }
    const result = editing ? await editProject(editing.id, data) : await addProject(data)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setModalOpen(false)
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    const result = await removeProject(deleteId)
    if (result.error) {
      alert(result.error)
    } else {
      setDeleteId(null)
      router.refresh()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#2B2B2E]">Projects</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
        >
          + Add Project
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E0EB] bg-[#F8F8FA]">
              {['Project', 'Client', 'Status', 'Services', 'Created', ''].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-3 text-xs font-medium text-[#9490A8] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E0EB]">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#9490A8]">
                  No projects yet. Create one to get started.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F8FA] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#2B2B2E]">{p.name}</td>
                  <td className="px-6 py-4 text-[#5A5575]">
                    {p.clients?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <ProjectStatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.services?.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-[#F8F8FA] border border-[#E2E0EB] text-xs text-[#5A5575]"
                        >
                          {s}
                        </span>
                      )) ?? <span className="text-[#9490A8]">—</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#9490A8]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="p-1.5 rounded-md text-[#9490A8] hover:text-[#2B2B2E] hover:bg-[#F8F8FA]"
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-md text-[#9490A8] hover:text-[#2B2B2E] hover:bg-[#F8F8FA]"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-md text-[#9490A8] hover:text-[#B33A3A] hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Project' : 'Add Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">
              Project Name
            </label>
            <input name="name" defaultValue={editing?.name} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">Client</label>
            <select
              name="client_id"
              defaultValue={editing?.client_id ?? defaultClientId ?? ''}
              required
              className={inputCls}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">Status</label>
            <select
              name="status"
              defaultValue={editing?.status ?? 'discovery'}
              className={inputCls}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">
              Services{' '}
              <span className="text-[#9490A8] font-normal">
                (comma-separated, e.g. Web Design, SEO, Copywriting)
              </span>
            </label>
            <input
              value={servicesInput}
              onChange={(e) => setServicesInput(e.target.value)}
              placeholder="Web Design, SEO, Copywriting"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">
              Estimated Hours{' '}
              <span className="text-[#9490A8] font-normal">(optional)</span>
            </label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g. 40"
              min="0"
              step="0.5"
              className={inputCls}
            />
          </div>
          {error && <p className="text-xs text-[#B33A3A]">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60"
            >
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Project"
      >
        <p className="text-sm text-[#5A5575] mb-6">
          This will permanently delete the project and all its milestones and deliverables.
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteId(null)}
            className="px-4 py-2 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA]"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-[#B33A3A] text-white text-sm font-medium hover:bg-red-700"
          >
            Delete Project
          </button>
        </div>
      </Modal>
    </div>
  )
}
