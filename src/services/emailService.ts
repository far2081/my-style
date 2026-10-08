// Production Transactional Email Service
// Connects to Resend API / SMTP Gateway for REAL live transactional emails

declare const process: any;

const getEnvKey = (viteKey: string, rawKey: string): string => {
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && metaEnv[viteKey]) return metaEnv[viteKey];
    if (metaEnv && metaEnv[rawKey]) return metaEnv[rawKey];
  } catch {}
  try {
    if (typeof process !== 'undefined' && process?.env && process.env[rawKey]) {
      return process.env[rawKey];
    }
  } catch {}
  return '';
};

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const isEmailConfigured = Boolean(
  getEnvKey('VITE_RESEND_API_KEY', 'RESEND_API_KEY') &&
  !getEnvKey('VITE_RESEND_API_KEY', 'RESEND_API_KEY').includes('your_live')
);

export const emailService = {
  /**
   * Send a real transactional email via Resend API
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    const apiKey = getEnvKey('VITE_RESEND_API_KEY', 'RESEND_API_KEY');

    if (!apiKey || apiKey.includes('your_live')) {
      return {
        success: false,
        error: 'Email provider not configured. Please set RESEND_API_KEY in your environment variables.',
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: payload.from || 'StyleMira AI Atelier <onboarding@resend.dev>',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `Email delivery failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error attempting to send email.',
      };
    }
  },

  /**
   * Send Order Confirmation Email
   */
  async sendOrderConfirmation(order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    items: Array<{ name: string; size: string; quantity: number; price: number }>;
    total: number;
    paymentMethod: string;
    paymentStatus: string;
    shippingAddress: { address: string; city: string };
  }): Promise<EmailResponse> {
    const itemRows = order.items
      .map(
        (it) => `
        <tr style="border-bottom: 1px solid #4A2438;">
          <td style="padding: 12px 8px; color: #F7F1EA; font-size: 14px;">${it.name} (${it.size})</td>
          <td style="padding: 12px 8px; color: #F7F1EA; font-size: 14px; text-align: center;">${it.quantity}</td>
          <td style="padding: 12px 8px; color: #C9A86A; font-size: 14px; text-align: right; font-weight: bold;">PKR ${(it.price * it.quantity).toLocaleString()}</td>
        </tr>`
      )
      .join('');

    const html = `
      <div style="background-color: #252127; font-family: 'Georgia', serif; padding: 40px 20px; color: #F7F1EA;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #321B2F; border: 1px solid #C9A86A; border-radius: 16px; overflow: hidden; padding: 36px;">
          <div style="text-align: center; border-bottom: 1px solid rgba(201, 168, 106, 0.3); padding-bottom: 24px; margin-bottom: 24px;">
            <p style="text-transform: uppercase; letter-spacing: 4px; font-size: 11px; color: #C9A86A; margin: 0;">Haute Couture Commission</p>
            <h1 style="font-size: 28px; margin: 8px 0 0; color: #F7F1EA; letter-spacing: 2px;">STYLEMIRA AI</h1>
          </div>

          <h2 style="font-size: 20px; color: #C9A86A; margin-bottom: 12px;">Order Confirmed #${order.orderNumber}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #E9D5D8;">
            Respected ${order.customerName},<br/><br/>
            Your bespoke haute couture commission has been officially registered in the StyleMira AI atelier archives.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #C9A86A; text-align: left;">
                <th style="padding: 8px; color: #C9A86A; font-size: 11px; text-transform: uppercase;">Creation</th>
                <th style="padding: 8px; color: #C9A86A; font-size: 11px; text-transform: uppercase; text-align: center;">Qty</th>
                <th style="padding: 8px; color: #C9A86A; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div style="background-color: #4A2438; padding: 18px; border-radius: 12px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #C9A86A;">
              <span>Grand Total:</span>
              <span>PKR ${order.total.toLocaleString()}</span>
            </div>
            <p style="font-size: 12px; color: #E9D5D8; margin: 8px 0 0;">
              Payment Arrangement: <strong>${order.paymentMethod}</strong> (${order.paymentStatus})<br/>
              Delivery Address: <strong>${order.shippingAddress.address}, ${order.shippingAddress.city}</strong>
            </p>
          </div>

          <div style="text-align: center; border-top: 1px solid rgba(201, 168, 106, 0.2); padding-top: 20px; font-size: 11px; color: #E9D5D8;">
            <p style="margin: 0;">Created by farhana Aamir • farzunmir@gmail.com</p>
            <p style="margin: 4px 0 0; color: #C9A86A;">StyleMira AI Atelier • Lahore, Pakistan</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderNumber} — STYLEMIRA AI Atelier`,
      html,
    });
  },

  /**
   * Send Order Status Update Email
   */
  async sendStatusUpdate(orderNumber: string, customerName: string, customerEmail: string, newStatus: string): Promise<EmailResponse> {
    const html = `
      <div style="background-color: #252127; font-family: 'Georgia', serif; padding: 40px 20px; color: #F7F1EA;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #321B2F; border: 1px solid #C9A86A; border-radius: 16px; padding: 36px;">
          <h1 style="font-size: 24px; color: #F7F1EA; text-align: center;">STYLEMIRA AI</h1>
          <p style="text-align: center; color: #C9A86A; text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Couture Production Update</p>
          
          <h2 style="font-size: 18px; color: #C9A86A; margin-top: 24px;">Commission #${orderNumber} Status: ${newStatus.toUpperCase()}</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #E9D5D8;">
            Dear ${customerName},<br/><br/>
            Your commission stage has been updated to <strong>${newStatus.toUpperCase()}</strong> by the master atelier tailors.
          </p>

          <div style="text-align: center; border-top: 1px solid rgba(201, 168, 106, 0.2); padding-top: 20px; font-size: 11px; color: #E9D5D8; margin-top: 30px;">
            <p style="margin: 0;">Created by farhana Aamir • farzunmir@gmail.com</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: customerEmail,
      subject: `Order #${orderNumber} Status Update: ${newStatus.toUpperCase()} — StyleMira AI`,
      html,
    });
  },
};
