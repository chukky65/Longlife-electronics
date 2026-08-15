import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { sendOrderEmail } from "../_shared/email.ts";
import { buildShippingAddress } from "../_shared/orders.ts";
import { createServiceClient, requireUser } from "../_shared/supabase.ts";

type PaymentMethod = "pay_on_delivery" | "bank_transfer" | "card";

interface CreateOrderItem {
  productId: string;
  quantity: number;
}

interface CreateOrderPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  cart: CreateOrderItem[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const user = await requireUser(req);
    const payload = (await req.json()) as CreateOrderPayload;
    const serviceClient = createServiceClient();

    if (!payload.cart?.length) {
      return jsonResponse({ error: "Your cart is empty." }, 400);
    }

    if (payload.cart.length > 100) {
      return jsonResponse({ error: "The cart contains too many line items." }, 400);
    }

    if (!["pay_on_delivery", "bank_transfer", "card"].includes(payload.paymentMethod)) {
      return jsonResponse({ error: "Select a valid payment method." }, 400);
    }

    const requiredShippingFields = [
      payload.firstName,
      payload.lastName,
      payload.phone,
      payload.address,
      payload.city,
      payload.state,
    ];
    if (requiredShippingFields.some((value) => !String(value || "").trim())) {
      return jsonResponse({ error: "Complete all required delivery details." }, 400);
    }
    if (requiredShippingFields.some((value) => String(value).length > 250)) {
      return jsonResponse({ error: "One of the delivery fields is too long." }, 400);
    }

    if (payload.promoCode && payload.promoCode.length > 50) {
      return jsonResponse({ error: "The promo code is too long." }, 400);
    }

    const cartItems = payload.cart
      .map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity),
      }))
      .filter((item) =>
        item.productId &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
      );

    if (!cartItems.length) {
      return jsonResponse({ error: "No valid cart items were submitted." }, 400);
    }

    const productIds = [...new Set(cartItems.map((item) => item.productId))];
    const { data: products, error: productsError } = await serviceClient
      .from("products")
      .select("id, name, price, stock, in_stock")
      .in("id", productIds);

    if (productsError || !products) {
      throw new Error(productsError?.message || "Failed to load products");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      const product = productMap.get(item.productId);
      if (!product || !product.in_stock) {
        return jsonResponse({ error: "One of the selected products is no longer available." }, 400);
      }

      if (Number(product.stock || 0) < item.quantity) {
        return jsonResponse({ error: `${product.name} does not have enough stock right now.` }, 400);
      }

      subtotal += Number(product.price) * item.quantity;
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: Number(product.price),
      });
    }

    let discountAmount = 0;
    let appliedPromoCode = "";

    if (payload.promoCode?.trim()) {
      const { data: promo, error: promoError } = await serviceClient
        .from("promo_codes")
        .select("code, discount_percent, discount_amount")
        .eq("code", payload.promoCode.trim().toUpperCase())
        .eq("is_active", true)
        .single();

      if (promoError || !promo) {
        return jsonResponse({ error: "The promo code is invalid or inactive." }, 400);
      }

      appliedPromoCode = promo.code;
      if (promo.discount_percent) {
        discountAmount = subtotal * (Number(promo.discount_percent) / 100);
      } else if (promo.discount_amount) {
        discountAmount = Number(promo.discount_amount);
      }
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);

    const { data: orderId, error: orderError } = await serviceClient.rpc("create_order_with_items", {
      p_user_id: user.id,
      p_total: finalTotal,
      p_shipping_address: buildShippingAddress(payload),
      p_payment_method: payload.paymentMethod,
      p_items: orderItems,
    });

    if (orderError || !orderId) {
      throw new Error(orderError?.message || "Failed to create order");
    }

    if (payload.paymentMethod !== "card") {
      try {
        await sendOrderEmail({
          email: user.email || "",
          name: payload.firstName || user.user_metadata?.full_name || "Customer",
          orderId,
          total: finalTotal,
          kind: "placed",
        });
      } catch (emailError) {
        console.error("Unable to send order receipt email:", emailError);
      }
    }

    return jsonResponse({
      orderId,
      total: finalTotal,
      status: "pending",
      paymentMethod: payload.paymentMethod,
      promoCode: appliedPromoCode || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create order";
    return jsonResponse({ error: message }, 400);
  }
});
