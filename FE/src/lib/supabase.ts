// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// .env.local 파일에 적어둔 URL과 API 키를 불러옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 이 supabase 객체를 통해 앞으로 데이터를 저장하고 불러오게 됩니다!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);