import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { sendOrderEmail } from "../_shared/email.ts";
import { createServiceClient, requireUser } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const user = await requireUser(req);
    const serviceClient = createServiceClient();
    const { orderId, kind = "placed" } = await req.json();

    if (!orderId) {
      return jsonResponse({ error: "Missing order ID." }, 400);
    }

    const { data: order, error } = await serviceClient
      .from("orders")
      .select("id, total, user_id")
      .eq("id", orderId)
      .single();

    if (error || !order || order.user_id !== user.id) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    await sendOrderEmail({
      email: user.email || "",
      name: user.user_metadata?.full_name || "Customer",
      orderId: order.id,
      total: Number(order.total || 0),
      kind,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send order receipt";
    return jsonResponse({ error: message }, 400);
  }
});
