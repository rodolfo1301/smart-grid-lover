import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://oxzsjxhokmnqrbpfvvit.supabase.co";
const supabaseKey = "sb_publishable_IaQijIbqsrdu1n9QxIiJzw_GqrXGqRH";

export const supabase = createClient(supabaseUrl, supabaseKey);
