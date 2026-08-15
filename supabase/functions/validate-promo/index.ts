import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    await requireUser(req);
    const { code } = await req.json();
    const normalizedCode = String(code || "").trim().toUpperCase();

    if (!normalizedCode) {
      return jsonResponse({ error: "Enter a promo code." }, 400);
    }

    const { data, error } = await createServiceClient()
      .from("promo_codes")
      .select("code, discount_percent, discount_amount")
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return jsonResponse({ error: "The promo code is invalid or inactive." }, 404);
    }

    return jsonResponse(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to validate promo code";
    return jsonResponse({ error: message }, 400);
  }
});
