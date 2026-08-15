import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      return jsonResponse({ error: "Enter a valid email address." }, 400);
    }

    const { error } = await createServiceClient()
      .from("newsletter_subscriptions")
      .upsert({ email: normalizedEmail, is_active: true }, { onConflict: "email" });
    if (error) throw new Error(error.message);

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to subscribe";
    return jsonResponse({ error: message }, 400);
  }
});
