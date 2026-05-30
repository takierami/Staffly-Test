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

    const { organization_id, action } = await req.json()
    // actions: suspend, activate, disable

    let status = 'active'
    if (action === 'suspend') status = 'suspended'
    else if (action === 'disable') status = 'disabled'

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .update({ status })
      .eq('id', organization_id)
      .select()
      .single()

    if (orgError) throw orgError

    await supabase.from('activity_logs').insert({
      organization_id,
      actor_id: user.id,
      action: `organization_${action}`,
      entity_type: 'organization',
      entity_id: organization_id
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
