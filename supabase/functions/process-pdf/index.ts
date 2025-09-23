import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { documentId, fileUrl } = await req.json();
    console.log('Processing PDF:', documentId, fileUrl);

    // Download the PDF file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download PDF');
    }

    const pdfBuffer = await fileResponse.arrayBuffer();
    
    // For now, we'll use a simple text extraction approach
    // In production, you'd use a proper PDF parsing library
    const extractedText = `Extracted text from PDF (${documentId}). This is a placeholder for actual PDF text extraction.`;

    // Generate summary using Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const summaryResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Please provide a concise summary of the following document text:\n\n${extractedText}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const summaryData = await summaryResponse.json();
    const summary = summaryData.candidates?.[0]?.content?.parts?.[0]?.text || 'Summary generation failed';

    // Update document with extracted text and summary
    const { error } = await supabaseClient
      .from('documents')
      .update({
        parsed_text: extractedText,
        summary: summary,
      })
      .eq('id', documentId);

    if (error) {
      throw error;
    }

    console.log('Document processed successfully:', documentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        extractedText: extractedText.substring(0, 200) + '...',
        summary: summary.substring(0, 200) + '...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});