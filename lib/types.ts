export type Client = {
  id: string
  name: string
  email: string
  company: string | null
  pipedrive_deal_id: string | null
  client_user_id: string | null
  created_at: string
  projects?: { count: number }[]
}

export type ProjectStatus = 'discovery' | 'design' | 'build' | 'launch' | 'complete'
export type MilestoneStatus = 'pending' | 'in_progress' | 'complete'
export type DeliverableStatus = 'pending' | 'approved' | 'revision'

export type Project = {
  id: string
  client_id: string
  name: string
  status: ProjectStatus
  services: string[] | null
  estimated_hours: number | null
  created_at: string
  clients?: { name: string } | null
}

export type Milestone = {
  id: string
  project_id: string
  title: string
  status: MilestoneStatus
  due_date: string | null
  sort_order: number
  created_at: string
}

export type Deliverable = {
  id: string
  project_id: string
  title: string
  file_url: string | null
  status: DeliverableStatus
  revision_notes: string | null
  created_at: string
}

export type DriveFolder = {
  id: string
  client_id: string
  project_id: string | null
  folder_id: string
  folder_url: string
  created_at: string
}

export type Message = {
  id: string
  project_id: string
  client_id: string
  message: string
  read: boolean
  created_at: string
  clients?: { name: string }
}

export type TimeEntry = {
  id: string
  project_id: string
  hours: number
  description: string | null
  logged_by: string | null
  created_at: string
}

export type StorageFile = {
  name: string
  id: string | null
  created_at: string | null
  updated_at: string | null
  metadata: { size?: number; mimetype?: string } | null
}
