import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import crypto from "node:crypto";

serve(async (req) => {
  try {
    const signature = req.headers.get("x-paystack-signature");
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!PAYSTACK_SECRET_KEY) {
      return new Response("Missing Paystack Secret Key", { status: 500 });
    }

    // Read the raw body as text for signature verification
    const bodyText = await req.text();

    // Verify Paystack Signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(bodyText)
      .digest("hex");

    if (hash !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    // Parse the validated body
    const event = JSON.parse(bodyText);

    if (event.event === "charge.success") {
      const { reference, customer, amount } = event.data;
      // The reference is our Supabase order.id
      const orderId = reference;

      // Connect to Supabase using Service Role (Admin) privileges
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 1. Update Order Status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
        throw new Error("Failed to update order status");
      }

      // 2. Send Email Receipt via Resend
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const totalNaira = amount / 100; // Paystack amount is in kobo
        const email = customer.email;
        const name = customer.first_name || "Customer";

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Longlife Electronics <onboarding@resend.dev>",
            to: [email],
            subject: `Order Receipt #${orderId.substring(0, 8).toUpperCase()}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Longlife Electronics</h1>
                </div>
                <div style="padding: 30px;">
                  <h2>Thank you for your order, ${name}!</h2>
                  <p>We've successfully verified your payment and are currently processing your order.</p>
                  
                  <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Order Summary</h3>
                    <p><strong>Order ID:</strong> ${orderId}</p>
                    <p><strong>Total Paid:</strong> ₦${totalNaira.toLocaleString()}</p>
                  </div>
                  
                  <p>If you have any questions, feel free to contact our support.</p>
                </div>
                <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
                  &copy; ${new Date().getFullYear()} Longlife Electronics, Asaba.
                </div>
              </div>
            `,
          }),
        });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
});
