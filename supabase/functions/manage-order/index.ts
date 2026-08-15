import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, requireAdmin } from "../_shared/supabase.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    await requireAdmin(req);
    const serviceClient = createServiceClient();
    const { orderId, action, status, refundConfirmed } = await req.json();

    if (!orderId || !action) {
      return jsonResponse({ error: "Missing order action details." }, 400);
    }

    const { data: order, error: orderError } = await serviceClient
      .from("orders")
      .select("id, status, payment_method")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return jsonResponse({ error: "Order not found." }, 404);
    }

    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (action === "update_status" && !allowedStatuses.includes(status)) {
      return jsonResponse({ error: "Invalid order status." }, 400);
    }

    if (
      action === "update_status" &&
      status === "cancelled" &&
      order.payment_method === "card" &&
      order.status !== "pending" &&
      !refundConfirmed
    ) {
      return jsonResponse({ error: "Confirm the card refund in Paystack before cancelling this order." }, 400);
    }

    if (
      action === "update_status" &&
      order.payment_method === "card" &&
      order.status === "pending" &&
      !["pending", "cancelled"].includes(status)
    ) {
      return jsonResponse({ error: "An unpaid card order can only advance after Paystack verification." }, 400);
    }

    const transitions: Record<string, string[]> = {
      pending: ["pending", "processing", "cancelled"],
      processing: ["processing", "shipped", "cancelled"],
      shipped: ["shipped", "delivered", "cancelled"],
      delivered: ["delivered", "cancelled"],
      cancelled: ["cancelled"],
    };

    if (action === "update_status" && !transitions[order.status]?.includes(status)) {
      return jsonResponse({ error: `The order cannot move from ${order.status} to ${status}.` }, 400);
    }

    if (action === "archive") {
      if (order.status !== "cancelled") {
        return jsonResponse({ error: "Cancel the order before archiving it." }, 400);
      }

      const { error: archiveError } = await serviceClient
        .from("orders")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", orderId);
      if (archiveError) {
        throw new Error(archiveError.message || "Failed to archive order");
      }

      return jsonResponse({ success: true, archived: true });
    }

    if (action === "update_status") {
      if (status === "cancelled") {
        const { error: cancelError } = await serviceClient.rpc("cancel_order_and_restore_stock", {
          p_order_id: orderId,
        });
        if (cancelError) {
          throw new Error(cancelError.message || "Failed to cancel order");
        }
        return jsonResponse({ success: true, order: { id: orderId, status: "cancelled" } });
      }

      const { data: updatedOrder, error: updateError } = await serviceClient
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .select("id, status")
        .single();

      if (updateError || !updatedOrder) {
        throw new Error(updateError?.message || "Failed to update order");
      }

      return jsonResponse({ success: true, order: updatedOrder });
    }

    return jsonResponse({ error: "Unsupported order action." }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to manage order";
    return jsonResponse({ error: message }, 400);
  }
});
