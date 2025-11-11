import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owwsfmrhktfgqcpebztl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93d3NmbXJoa3RmZ3FjcGVienRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3OTQ0ODYsImV4cCI6MjA3ODM3MDQ4Nn0.m35nbpNAb1DPj9IxzZ-Dyr9V2XB4RpC9Zp-VNSKrfuo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
