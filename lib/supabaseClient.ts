import { createClient } from '@supabase/supabase-js';

// Gunakan environment variables dari Vercel jika tersedia, jika tidak, gunakan kunci di bawah ini untuk development lokal.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://owwsfmrhktfgqcpebztl.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3NmbXJoa3RmZ3FjcGVienRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQ0ODYsImV4cCI6MjA3ODM3MDQ4Nn0.m35nbpNAb1DPj9IxzZ-Dyr9V2XB4RpC9Zp-VNSKrfuo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);