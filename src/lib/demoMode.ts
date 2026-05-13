/**
 * Rich sample data + simulated imports for local demos.
 * - Development: enabled by default. Set `NEXT_PUBLIC_USE_DUMMY_DATA=false` to use real Supabase reads.
 * - Production: set `NEXT_PUBLIC_USE_DUMMY_DATA=true` only if you intentionally want bundled demo data.
 */
export function isDemoMode(): boolean {
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_USE_DUMMY_DATA !== 'false';
  }
  return process.env.NEXT_PUBLIC_USE_DUMMY_DATA === 'true';
}
