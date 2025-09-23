-- Create demo auth users and profiles for testing
-- Note: These are demo accounts with simple passwords for testing

-- First, let's create some demo auth users directly
-- We'll insert into auth.users and then the trigger will create profiles

-- Insert demo admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@kmrl.demo',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo Admin", "role": "admin"}',
  false,
  'authenticated'
);

-- Insert demo employee users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES 
(
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'employee1@kmrl.demo',
  crypt('emp123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "John Doe", "role": "employee"}',
  false,
  'authenticated'
),
(
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'employee2@kmrl.demo',
  crypt('emp123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jane Smith", "role": "employee"}',
  false,
  'authenticated'
);

-- Create profiles (the trigger should handle this, but let's ensure they exist)
INSERT INTO public.profiles (user_id, email, full_name, role, department) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@kmrl.demo', 'Demo Admin', 'admin', 'Administration'),
('00000000-0000-0000-0000-000000000002', 'employee1@kmrl.demo', 'John Doe', 'employee', 'Engineering'),
('00000000-0000-0000-0000-000000000003', 'employee2@kmrl.demo', 'Jane Smith', 'employee', 'Operations')
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department;

-- Create some demo documents for testing
INSERT INTO public.documents (
  id,
  title,
  file_name,
  file_url,
  category,
  status,
  priority,
  uploaded_by,
  parsed_text,
  summary
) VALUES 
(
  gen_random_uuid(),
  'Employee Handbook 2024',
  'handbook-2024.pdf',
  'https://example.com/demo-file.pdf',
  'Policy',
  'approved',
  'high',
  '00000000-0000-0000-0000-000000000001',
  'This is a comprehensive employee handbook containing company policies, procedures, and guidelines for all employees.',
  'Employee handbook with policies and procedures for 2024.'
),
(
  gen_random_uuid(),
  'Safety Training Manual',
  'safety-training.pdf', 
  'https://example.com/demo-safety.pdf',
  'Training',
  'approved',
  'high',
  '00000000-0000-0000-0000-000000000001',
  'Safety training manual covering workplace safety protocols, emergency procedures, and safety equipment usage.',
  'Comprehensive safety training manual for workplace protocols.'
),
(
  gen_random_uuid(),
  'Project Alpha Specification',
  'project-alpha-spec.pdf',
  'https://example.com/demo-spec.pdf', 
  'Project',
  'pending',
  'medium',
  '00000000-0000-0000-0000-000000000001',
  'Technical specification document for Project Alpha including requirements, architecture, and implementation details.',
  'Technical specification for Project Alpha development.'
);

-- Create document assignments for employees
WITH doc_ids AS (
  SELECT id, title FROM public.documents WHERE status = 'approved'
)
INSERT INTO public.document_assignments (document_id, employee_id)
SELECT 
  d.id,
  '00000000-0000-0000-0000-000000000002'
FROM doc_ids d
WHERE d.title IN ('Employee Handbook 2024', 'Safety Training Manual')
UNION ALL
SELECT 
  d.id,
  '00000000-0000-0000-0000-000000000003'  
FROM doc_ids d
WHERE d.title = 'Employee Handbook 2024';