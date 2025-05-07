// Custom type definitions for Supabase functions that aren't correctly typed

import { PostgrestError } from "@supabase/supabase-js";
import { ClientProfile } from "@/services/supabaseClient";

declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    rpc(
      fn: 'get_client_by_id',
      params: { uid: string }
    ): Promise<{ data: ClientProfile | null; error: PostgrestError | null }>;
    
    rpc(
      fn: 'handle_client_profile',
      params: { 
        uid: string;
        client_email: string;
        client_name?: string | null;
        client_phone?: string | null;
      }
    ): Promise<{ data: ClientProfile | null; error: PostgrestError | null }>;

    // Keep the existing function types for backward compatibility
    rpc(
      fn: 'get_profile_by_id' | 'create_user_profile' | 'get_user_role' | 'get_user_role_safe' | 'is_admin' | 'is_super_admin',
      params: any
    ): Promise<{ data: any; error: PostgrestError | null }>;
  }
}
