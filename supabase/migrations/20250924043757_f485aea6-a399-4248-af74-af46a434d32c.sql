-- Drop the incorrect RLS policy
DROP POLICY IF EXISTS "Employees can view approved assigned documents" ON documents;

-- Create the corrected RLS policy with proper table reference
CREATE POLICY "Employees can view approved assigned documents" ON documents
FOR SELECT TO authenticated
USING (
  status = 'approved' AND 
  EXISTS (
    SELECT 1 FROM document_assignments da 
    WHERE da.document_id = documents.id 
    AND da.employee_id = auth.uid()
  )
);