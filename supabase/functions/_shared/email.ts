const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const sender = Deno.env.get("RESEND_FROM_EMAIL") || "Longlife Electronics <onboarding@resend.dev>";
const contactEmail = Deno.env.get("CONTACT_EMAIL") || "";

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character] || character));

type EmailKind = "placed" | "paid";

interface SendOrderEmailInput {
  email: string;
  name: string;
  orderId: string;
  total: number;
  kind: EmailKind;
}

const templates: Record<EmailKind, { subject: string; heading: string; body: string; totalLabel: string }> = {
  placed: {
    subject: "Order Received",
    heading: "We received your order",
    body: "Thank you for shopping with Longlife Electronics. Your order has been received and is awaiting the next processing step.",
    totalLabel: "Order Total",
  },
  paid: {
    subject: "Payment Confirmed",
    heading: "Your payment has been confirmed",
    body: "We have verified your card payment successfully and your order is now being processed.",
    totalLabel: "Amount Paid",
  },
};

export const sendOrderEmail = async ({ email, name, orderId, total, kind }: SendOrderEmailInput) => {
  if (!resendApiKey || !email) return;

  const template = templates[kind];
  const safeName = escapeHtml(name || "Customer");
  const safeOrderId = escapeHtml(orderId.substring(0, 8).toUpperCase());
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [email],
      subject: `${template.subject} #${safeOrderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <div style="background: #111827; padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Longlife Electronics</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin-top: 0; color: #111827;">Hello ${safeName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">${template.body}</p>
            <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #111827;"><strong>Order ID:</strong> ${safeOrderId}</p>
              <p style="margin: 0; color: #111827;"><strong>${template.totalLabel}:</strong> NGN ${Number(total).toLocaleString()}</p>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">If you need help, reply to this email or contact our support team.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) throw new Error(`Resend email failed with status ${response.status}`);
};

export const sendContactNotification = async (input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}) => {
  if (!resendApiKey || !contactEmail) return;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: sender,
      to: [contactEmail],
      reply_to: input.email,
      subject: "New storefront inquiry",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2>New storefront inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(input.phone || "Not provided")}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(input.message)}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) throw new Error(`Resend contact email failed with status ${response.status}`);
};
