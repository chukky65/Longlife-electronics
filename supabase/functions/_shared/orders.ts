import { sendOrderEmail } from "./email.ts";
import { createServiceClient } from "./supabase.ts";

interface OrderItem {
  product_id: string;
  quantity: number;
}

export const buildShippingAddress = (input: {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}) =>
  `${input.firstName} ${input.lastName}\n${input.address}, ${input.city}, ${input.state}\nPhone: ${input.phone}`;

export const restoreStock = async (
  serviceClient: ReturnType<typeof createServiceClient>,
  items: OrderItem[],
) => {
  for (const item of items) {
    const { error } = await serviceClient.rpc("restore_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });

    if (error) {
      throw new Error(error.message || `Failed to restore stock for product ${item.product_id}`);
    }
  }
};

export const reserveStock = async (
  serviceClient: ReturnType<typeof createServiceClient>,
  items: OrderItem[],
) => {
  const reservedItems: OrderItem[] = [];

  try {
    for (const item of items) {
      const { error } = await serviceClient.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });

      if (error) {
        throw new Error(error.message || `Failed to reserve stock for product ${item.product_id}`);
      }

      reservedItems.push(item);
    }
  } catch (error) {
    if (reservedItems.length > 0) {
      await restoreStock(serviceClient, reservedItems);
    }
    throw error;
  }
};

export const finalizePaidOrder = async (
  serviceClient: ReturnType<typeof createServiceClient>,
  orderId: string,
  customer: { email: string; name: string },
  payment?: { amount: number; currency: string },
) => {
  const { data: order, error: orderError } = await serviceClient
    .from("orders")
    .select("id, total, status, payment_method")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  if (payment) {
    const expectedAmount = Math.round(Number(order.total || 0) * 100);
    if (payment.amount !== expectedAmount || payment.currency.toUpperCase() !== "NGN") {
      throw new Error("Payment amount or currency does not match the order");
    }
  }

  if (order.status !== "pending") {
    return {
      alreadyFinalized: true,
      order,
    };
  }

  const { data: updatedOrder, error: updateError } = await serviceClient
    .from("orders")
    .update({ status: "processing" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id, total, status, payment_method")
    .single();

  if (updateError || !updatedOrder) {
    const { data: freshOrder } = await serviceClient
      .from("orders")
      .select("id, total, status, payment_method")
      .eq("id", orderId)
      .single();

    if (freshOrder && freshOrder.status !== "pending") {
      return {
        alreadyFinalized: true,
        order: freshOrder,
      };
    }

    throw new Error(updateError?.message || "Failed to finalize paid order");
  }

  try {
    await sendOrderEmail({
      email: customer.email,
      name: customer.name,
      orderId: updatedOrder.id,
      total: Number(updatedOrder.total || 0),
      kind: "paid",
    });
  } catch (error) {
    console.error("Unable to send payment confirmation email:", error);
  }

  return {
    alreadyFinalized: false,
    order: updatedOrder,
  };
};
