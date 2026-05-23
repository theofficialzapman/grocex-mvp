import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jclqvgsxoxrsvwoicbsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbHF2Z3N4b3hyc3Z3b2ljYnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1Nzc2MDksImV4cCI6MjA5NTE1MzYwOX0.6j4qrQystbf4MIlkIbArcofXoXmQfgINjpLcW4ouGow';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
