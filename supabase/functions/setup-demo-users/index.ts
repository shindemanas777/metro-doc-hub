import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('Starting demo user setup...');

    // Demo users to create
    const demoUsers = [
      {
        email: 'admin@demo.com',
        password: 'admin123',
        full_name: 'Demo Admin',
        role: 'admin'
      },
      {
        email: 'employee@demo.com', 
        password: 'employee123',
        full_name: 'Demo Employee',
        role: 'employee'
      }
    ];

    const createdUsers = [];

    // Create each demo user
    for (const userData of demoUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      // Create user with admin client
      const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Skip email confirmation for demo users
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (createError) {
        console.error(`Error creating user ${userData.email}:`, createError);
        // Continue with other users even if one fails
        continue;
      }

      if (user.user) {
        console.log(`Successfully created user: ${userData.email} with ID: ${user.user.id}`);
        createdUsers.push({
          id: user.user.id,
          email: userData.email,
          role: userData.role
        });
      }
    }

    // Create demo documents
    if (createdUsers.length > 0) {
      const adminUser = createdUsers.find(u => u.role === 'admin');
      const employeeUser = createdUsers.find(u => u.role === 'employee');

      if (adminUser) {
        console.log('Creating demo documents...');
        
        const demoDocuments = [
          {
            title: 'Employee Handbook 2024',
            category: 'HR',
            file_name: 'employee-handbook-2024.pdf',
            file_url: 'https://example.com/employee-handbook.pdf',
            status: 'approved',
            priority: 'high',
            uploaded_by: adminUser.id,
            summary: 'Complete employee handbook covering policies, procedures, and benefits.',
            parsed_text: 'This document contains important information about company policies...'
          },
          {
            title: 'Safety Guidelines',
            category: 'Safety',
            file_name: 'safety-guidelines.pdf', 
            file_url: 'https://example.com/safety-guidelines.pdf',
            status: 'pending',
            priority: 'medium',
            uploaded_by: adminUser.id,
            summary: 'Important safety procedures and guidelines for all employees.',
            parsed_text: 'Safety is our top priority. Please follow these guidelines...'
          },
          {
            title: 'IT Security Policy',
            category: 'IT',
            file_name: 'it-security-policy.pdf',
            file_url: 'https://example.com/it-security.pdf', 
            status: 'approved',
            priority: 'high',
            uploaded_by: adminUser.id,
            summary: 'Information technology security policies and procedures.',
            parsed_text: 'All employees must follow these IT security guidelines...'
          }
        ];

        const { data: documents, error: docError } = await supabaseAdmin
          .from('documents')
          .insert(demoDocuments)
          .select();

        if (docError) {
          console.error('Error creating demo documents:', docError);
        } else {
          console.log(`Created ${documents?.length || 0} demo documents`);

          // Create document assignments for approved documents
          if (employeeUser && documents) {
            const approvedDocs = documents.filter(doc => doc.status === 'approved');
            const assignments = approvedDocs.map(doc => ({
              document_id: doc.id,
              employee_id: employeeUser.id
            }));

            if (assignments.length > 0) {
              const { error: assignError } = await supabaseAdmin
                .from('document_assignments')
                .insert(assignments);

              if (assignError) {
                console.error('Error creating document assignments:', assignError);
              } else {
                console.log(`Created ${assignments.length} document assignments`);
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Demo setup completed. Created ${createdUsers.length} users.`,
        users: createdUsers.map(u => ({ email: u.email, role: u.role }))
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in setup-demo-users function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});