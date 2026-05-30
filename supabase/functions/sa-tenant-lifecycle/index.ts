import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) throw new Error('Unauthorized')

    const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (callerProfile.role !== 'super_admin') throw new Error('Forbidden')

    const { organization_id, action, reason } = await req.json()

    let updateData: any = {}
    if (action === 'suspend') {
      updateData = { status: 'suspended', suspension_reason: reason, suspended_at: new Date().toISOString() }
    } else if (action === 'restore') {
      updateData = { status: 'active', suspension_reason: null, suspended_at: null, deleted_at: null }
    } else if (action === 'soft_delete') {
      updateData = { status: 'disabled', deleted_at: new Date().toISOString() }
    } else {
      throw new Error('Invalid action')
    }

    const { error: orgError } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organization_id)
    
    if (orgError) throw orgError

    await supabase.from('security_events').insert({
      actor_id: user.id,
      target_id: organization_id,
      event_type: `tenant_${action}`,
      severity: action === 'soft_delete' ? 'critical' : 'high',
      metadata: { reason }
    })

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
  }
})
