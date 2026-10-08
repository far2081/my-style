import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe environment variables resolution across Vite and Next.js
declare const process: any;

const getEnvVar = (viteKey: string, nextKey: string): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[viteKey]) return metaEnv[viteKey];
    if (metaEnv && metaEnv[nextKey]) return metaEnv[nextKey];
  } catch {}

  try {
    if (typeof process !== 'undefined' && process?.env && process.env[nextKey]) {
      return process.env[nextKey];
    }
  } catch {}

  return '';
};

const envUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  envUrl && 
  envKey && 
  !envUrl.includes('your-project') &&
  !envUrl.includes('placeholder') &&
  !envUrl.includes('dummy')
);


// Graceful client fallback
export const supabase: SupabaseClient = createClient(
  envUrl || 'https://placeholder.supabase.co',
  envKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Storage Bucket Constants
export const STORAGE_BUCKETS = {
  PUBLIC_PRODUCTS: 'products',
  PRIVATE_USERS: 'private-customer-assets',
} as const;

/**
 * Helper to build public product image path in Supabase Storage
 */
export function getSupabaseImageUrl(bucket: string, path: string): string {
  if (!isSupabaseConfigured) return path;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || path;
}
