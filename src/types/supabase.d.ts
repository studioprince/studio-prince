
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
  }
}
