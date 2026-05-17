'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { addClient, editClient, removeClient } from '@/lib/actions'
import type { Client } from '@/lib/types'

const inputCls =
  'w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] ' +
  'placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-white'

export function ClientsTable({ clients: initial }: { clients: Client[] }) {
  const [clients] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function openAdd() {
    setEditing(null)
    setError('')
    setModalOpen(true)
  }

  function openEdit(c: Client) {
    setEditing(c)
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      company: (fd.get('company') as string) || undefined,
    }
    const result = editing ? await editClient(editing.id, data) : await addClient(data)
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
    const result = await removeClient(deleteId)
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
        <h1 className="text-2xl font-semibold text-[#2B2B2E]">Clients</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
        >
          + Add Client
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E0EB] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E2E0EB] bg-[#F8F8FA]">
              {['Name', 'Company', 'Email', 'Projects', 'Created', ''].map((h) => (
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
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#9490A8]">
                  No clients yet. Add your first client to get started.
                </td>
              </tr>
            ) : (
              clients.map((c) => (
                <tr key={c.id} className="hover:bg-[#F8F8FA] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#2B2B2E]">{c.name}</td>
                  <td className="px-6 py-4 text-[#5A5575]">{c.company ?? '—'}</td>
                  <td className="px-6 py-4 text-[#5A5575]">{c.email}</td>
                  <td className="px-6 py-4 text-[#5A5575]">
                    {c.projects?.[0]?.count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-[#9490A8]">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="p-1.5 rounded-md text-[#9490A8] hover:text-[#2B2B2E] hover:bg-[#F8F8FA]"
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-md text-[#9490A8] hover:text-[#2B2B2E] hover:bg-[#F8F8FA]"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
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
        title={editing ? 'Edit Client' : 'Add Client'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">Full Name</label>
            <input name="name" defaultValue={editing?.name} required className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={editing?.email}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A5575] mb-1.5">
              Company <span className="text-[#9490A8] font-normal">(optional)</span>
            </label>
            <input name="company" defaultValue={editing?.company ?? ''} className={inputCls} />
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
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Client"
      >
        <p className="text-sm text-[#5A5575] mb-6">
          This will permanently delete the client and all their projects, milestones, and
          deliverables. This cannot be undone.
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
            Delete Client
          </button>
        </div>
      </Modal>
    </div>
  )
}
