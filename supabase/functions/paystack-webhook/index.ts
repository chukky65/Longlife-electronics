import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import crypto from "node:crypto";
import { finalizePaidOrder } from "../_shared/orders.ts";
import { createServiceClient } from "../_shared/supabase.ts";

serve(async (req) => {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

    if (!paystackSecretKey) {
      return new Response("Missing Paystack secret key", { status: 500 });
    }

    const serviceClient = createServiceClient();
    const bodyText = await req.text();

    const hash = crypto
      .createHmac("sha512", paystackSecretKey)
      .update(bodyText)
      .digest("hex");

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === "charge.success") {
      const { reference, customer, metadata } = event.data;
      const orderId = String(reference || "").trim();
      const customerName = metadata?.custom_fields?.find(
        (field: { variable_name?: string }) => field.variable_name === "customer_name",
      )?.value;

      if (!orderId) {
        throw new Error("Missing order reference in webhook payload");
      }

      await finalizePaidOrder(serviceClient, orderId, {
        email: customer?.email || "",
        name: customerName || customer?.first_name || "Customer",
      }, {
        amount: Number(event.data.amount || 0),
        currency: String(event.data.currency || ""),
      });
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
});
