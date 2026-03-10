import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvflfjrftnteuzfpeiut.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZmxmanJmdG50ZXV6ZnBlaXV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjU3NzcsImV4cCI6MjA4ODAwMTc3N30.-Lt9v1wPdp_TvElBJjNW7l70u2O23ZzbYBtv1vZ0b7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
