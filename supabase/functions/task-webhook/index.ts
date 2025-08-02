import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract task ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const taskId = pathParts[pathParts.length - 1];

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'Task ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the webhook payload
    let webhookData = {};
    try {
      const body = await req.text();
      if (body) {
        webhookData = JSON.parse(body);
      }
    } catch (error) {
      console.log('No JSON body or invalid JSON, proceeding with empty data');
    }

    // Verify the task exists and has a webhook URL
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, metadata, status')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      return new Response(
        JSON.stringify({ error: 'Task not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if task has webhook functionality enabled
    const metadata = task.metadata as any;
    if (!metadata?.webhook_url) {
      return new Response(
        JSON.stringify({ error: 'Task does not have webhook functionality enabled' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update task status to completed
    const { error: updateError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        metadata: {
          ...metadata,
          webhook_completed_at: new Date().toISOString(),
          webhook_data: webhookData,
        },
      })
      .eq('id', taskId);

    if (updateError) {
      console.error('Error updating task:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update task status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the webhook completion
    console.log(`Task ${taskId} marked as completed via webhook`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Task marked as completed',
        taskId: taskId,
        completedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});