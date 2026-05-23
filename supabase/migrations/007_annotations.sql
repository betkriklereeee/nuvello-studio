CREATE TABLE IF NOT EXISTS annotations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id uuid NOT NULL REFERENCES deliverables(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL REFERENCES auth.users(id),
  type           text NOT NULL CHECK (type IN ('pin', 'comment')),
  body           text NOT NULL,
  x_percent      float,
  y_percent      float,
  pin_number     integer,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS annotations_deliverable_id_idx ON annotations(deliverable_id);

-- RLS
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Clients can read annotations on deliverables belonging to their projects
CREATE POLICY "clients_read_own_annotations" ON annotations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN projects p ON p.id = d.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE d.id = annotations.deliverable_id
        AND c.client_user_id = auth.uid()
    )
  );

-- Clients can insert their own annotations
CREATE POLICY "clients_insert_own_annotations" ON annotations
  FOR INSERT WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM deliverables d
      JOIN projects p ON p.id = d.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE d.id = deliverable_id
        AND c.client_user_id = auth.uid()
    )
  );
