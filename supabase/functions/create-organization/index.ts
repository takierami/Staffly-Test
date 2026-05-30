import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) throw new Error('Unauthorized')

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile.role !== 'super_admin') {
      throw new Error('Forbidden')
    }

    const { name, slug, plan, admin_email, admin_name } = await req.json()

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name, slug, subscription_plan: plan })
      .select()
      .single()

    if (orgError) throw orgError

    // Create subscription
    await supabase.from('subscriptions').insert({
      organization_id: orgData.id,
      plan: plan
    })

    // Invite admin
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(admin_email, {
      data: {
        role: 'admin',
        organization_id: orgData.id,
        full_name: admin_name
      }
    })

    if (inviteError) throw inviteError

    await supabase.from('activity_logs').insert({
      organization_id: orgData.id,
      actor_id: user.id,
      action: 'created_organization',
      entity_type: 'organization',
      entity_id: orgData.id,
      metadata: { name, plan, admin_email }
    })

    return new Response(JSON.stringify(orgData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
