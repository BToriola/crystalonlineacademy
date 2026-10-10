export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** When Supabase isn't configured the app runs in demo mode with sample data. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const isDemoMode = !isSupabaseConfigured;
