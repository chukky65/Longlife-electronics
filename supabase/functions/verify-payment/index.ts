import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { finalizePaidOrder } from "../_shared/orders.ts";
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
    const { orderId } = await req.json();
    const reference = String(orderId || "").trim();

    if (!reference) {
      return jsonResponse({ error: "Missing order reference." }, 400);
    }

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, total, status, payment_method, user_id")
      .eq("id", reference)
      .single();

    if (orderError || !order || order.user_id !== user.id) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    if (order.payment_method !== "card") {
      return jsonResponse({ error: "This order does not require card verification." }, 400);
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
    if (!paystackSecretKey) {
      throw new Error("Missing Paystack secret key");
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const result = await response.json();
    if (!response.ok || !result?.status || result?.data?.status !== "success") {
      return jsonResponse({ error: "Payment has not been verified yet." }, 400);
    }

    const paidAmount = Number(result.data.amount || 0);
    const expectedAmount = Math.round(Number(order.total || 0) * 100);
    if (paidAmount !== expectedAmount) {
      return jsonResponse({ error: "Payment amount does not match the order total." }, 400);
    }

    const finalized = await finalizePaidOrder(serviceClient, order.id, {
      email: user.email || result.data.customer?.email || "",
      name: user.user_metadata?.full_name || "Customer",
    }, {
      amount: paidAmount,
      currency: String(result.data.currency || ""),
    });

    return jsonResponse({
      orderId: order.id,
      status: finalized.order.status,
      alreadyFinalized: finalized.alreadyFinalized,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment";
    return jsonResponse({ error: message }, 400);
  }
});
