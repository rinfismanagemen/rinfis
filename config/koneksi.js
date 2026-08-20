import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://odzszopvspcedihhdqvq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_YNND6SPaZJB-0aaVgQ-lLg_49dZo1C4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);