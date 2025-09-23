-- Clean up existing demo users that were created incorrectly
DELETE FROM public.document_assignments 
WHERE employee_id IN (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012'
);

DELETE FROM public.documents 
WHERE uploaded_by IN (
  '12345678-90ab-cdef-1234-567890abcdef',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012'
);

DELETE FROM public.profiles 
WHERE user_id IN (
  '12345678-90ab-cdef-1234-567890abcdef',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'b2c3d4e5-f6g7-8901-bcde-f23456789012'
);

-- Note: Cannot delete from auth.users via SQL migration
-- The demo users in auth.users will need to be removed via the admin API