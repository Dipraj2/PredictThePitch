/**
 * migrate.js
 * ──────────
 * One-time migration: creates the simulations table + RLS policies.
 * Run from the server/ directory: node migrate.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('🔗 Connecting to:', process.env.SUPABASE_URL);

  // Test connection
  const { error: pingErr } = await supabase.from('_test_connection_').select('*').limit(1);
  // Expected error (table doesn't exist) = connection works
  if (pingErr && pingErr.code !== '42P01' && pingErr.message?.includes('relation')) {
    console.log('ℹ️  Connection test (expected "relation" error):', pingErr.message.slice(0, 80));
  } else if (pingErr?.code === '42P01') {
    console.log('✅ Supabase connection: OK');
  }

  console.log('\n📋 Creating simulations table...');

  // Create table by inserting into a non-existent table to check if it exists first
  const { error: checkErr } = await supabase.from('simulations').select('id').limit(1);
  
  if (!checkErr || checkErr.code === '42P01') {
    if (checkErr?.code === '42P01') {
      console.log('   Table does not exist yet — needs manual creation');
      console.log('\n⚠️  PostgREST cannot run DDL. Run this SQL in your Supabase Dashboard:');
      console.log('   https://supabase.com/dashboard/project/rckhedcnqeepqqudshdq/sql/new\n');
      console.log('─'.repeat(70));
      console.log(`
create table if not exists public.simulations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  team_a text not null,
  team_b text not null,
  home_goals int,
  away_goals int,
  home_xg float,
  away_xg float,
  confidence float,
  narrative text,
  explanations jsonb,
  created_at timestamptz default now()
);

alter table public.simulations enable row level security;

create policy "Users see own simulations" on public.simulations
  for select using (auth.uid() = user_id);

create policy "Users insert own simulations" on public.simulations
  for insert with check (auth.uid() = user_id);
      `);
      console.log('─'.repeat(70));
    } else {
      console.log('✅ simulations table already exists');
    }
  }

  // Check anon key by decoding JWT (it's in the payload)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const payload = JSON.parse(Buffer.from(serviceKey.split('.')[1], 'base64').toString());
  console.log('\n🔑 Service key info:', { role: payload.role, ref: payload.ref, exp: new Date(payload.exp * 1000).toISOString() });
  
  // The anon key has the same structure but role="anon"
  // We can't derive it from the service key, but we can confirm the URL
  const anonNote = `
┌─ IMPORTANT: Frontend env vars needed ─────────────────────────────────────┐
│                                                                            │
│  Add to /mnt/d/Projects/ai-match-predictor/.env:                          │
│                                                                            │
│  VITE_SUPABASE_URL=https://rckhedcnqeepqqudshdq.supabase.co               │
│  VITE_SUPABASE_ANON_KEY=<get from Supabase Dashboard → Settings → API>   │
│  VITE_MIDDLEWARE_URL=http://localhost:3001                                 │
│                                                                            │
│  Dashboard: https://supabase.com/dashboard/project/rckhedcnqeepqqudshdq   │
│             Settings → API → Project API keys → anon public               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘`;
  console.log(anonNote);
}

run().catch(console.error);
