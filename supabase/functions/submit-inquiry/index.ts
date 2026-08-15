import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { sendContactNotification } from "../_shared/email.ts";
import { createServiceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const input = await req.json();
    const inquiry = {
      name: String(input.name || "").trim(),
      email: String(input.email || "").trim().toLowerCase(),
      phone: String(input.phone || "").trim(),
      message: String(input.message || "").trim(),
    };

    if (!inquiry.name || !/^\S+@\S+\.\S+$/.test(inquiry.email) || inquiry.message.length < 5) {
      return jsonResponse({ error: "Enter a valid name, email, and message." }, 400);
    }
    if (inquiry.name.length > 120 || inquiry.email.length > 254 || inquiry.phone.length > 40 || inquiry.message.length > 5000) {
      return jsonResponse({ error: "One of the inquiry fields is too long." }, 400);
    }

    const serviceClient = createServiceClient();
    const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
    const { data: recentInquiry } = await serviceClient
      .from("inquiries")
      .select("id")
      .eq("email", inquiry.email)
      .gte("created_at", oneMinuteAgo)
      .limit(1)
      .maybeSingle();
    if (recentInquiry) {
      return jsonResponse({ error: "Please wait a minute before sending another message." }, 429);
    }

    const { error } = await serviceClient.from("inquiries").insert(inquiry);
    if (error) throw new Error(error.message);

    try {
      await sendContactNotification(inquiry);
    } catch (emailError) {
      console.error("Unable to send inquiry notification:", emailError);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send inquiry";
    return jsonResponse({ error: message }, 400);
  }
});
