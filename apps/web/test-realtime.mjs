import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://oollhaoxjvauyruulote.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vbGxoYW94anZhdXlydXVsb3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzU1NjAsImV4cCI6MjEwNjk1MTU2MH0.kZkbiT_YRiDkD0G2KTwMFwu1o0JF2TEzSjEKtzFfWZg'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function test() {
  const channel = supabase.channel('realtime_test')
  
  channel.on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, payload => {
    console.log('REALTIME ROOMS UPDATE RECEIVED:', payload)
  })
  
  channel.subscribe(async (status) => {
    console.log('STATUS:', status)
    if (status === 'SUBSCRIBED') {
      console.log('Subscribed! Updating a room to trigger realtime...')
      // Try updating an arbitrary row if we have permissions, but anon can't update directly!
      // But we can trigger edge function or just wait for 10 seconds while the user tests.
      // Wait, we can't update without service_role key.
      console.log('Waiting for updates from the frontend...')
    }
  })
}

test()
