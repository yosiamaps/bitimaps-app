import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS Headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password } = await req.json()
    
    // Ambil password yang benar dari environment variable yang aman
    const correctPassword = Deno.env.get('APP_PASSWORD')

    if (!correctPassword) {
        console.error('APP_PASSWORD environment variable not set.');
        return new Response(JSON.stringify({ error: 'Kesalahan konfigurasi server.' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
    
    if (password === correctPassword) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Password salah.' }), {
        status: 401, // Unauthorized
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (err) {
    return new Response(String(err?.message ?? err), { 
        status: 500,
        headers: corsHeaders,
    })
  }
})