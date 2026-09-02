import nodemailer from "nodemailer";

function getResendApiKey() {
  if (process.env.RESEND_API_KEY) return process.env.RESEND_API_KEY.trim();
  if (process.env.SMTP_PASS && process.env.SMTP_PASS.trim().startsWith("re_")) {
    return process.env.SMTP_PASS.trim();
  }
  return null;
}

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
}

function getSender() {
  return process.env.SMTP_FROM || process.env.RESEND_FROM || process.env.SMTP_USER || '"Deallyhub" <no-reply@deallyhub.com>';
}

async function dispatchEmail({ to, subject, html, simulationLabel, actionUrl }) {
  const resendApiKey = getResendApiKey();
  const from = getSender();

  // 1. Prefer Resend HTTPS REST API (bypasses Railway SMTP port blocking, fast & reliable)
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
      }

      console.log(`[Resend HTTPS] Email sent to ${to}: ${data.id}`);
      return { success: true, messageId: data.id, url: actionUrl };
    } catch (err) {
      console.error(`[Resend HTTPS] Failed to send email to ${to}:`, err.message);
      throw err;
    }
  }

  // 2. Fallback to standard SMTP (if non-Resend SMTP credentials configured)
  const transporter = getTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log(`[SMTP] Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, url: actionUrl };
    } catch (err) {
      console.error(`[SMTP] Failed to send email to ${to}:`, err.message);
      throw err;
    }
  }

  // 3. Fallback to local console simulation
  console.log("==================================================");
  console.log(`[EMAIL SIMULATION] ${simulationLabel} to: ${to}`);
  if (actionUrl) {
    console.log(`[ACTION LINK]: ${actionUrl}`);
  }
  console.log("==================================================");
  return { success: true, simulated: true, url: actionUrl };
}

function generateDeallyEmailHtml({ title, subtitle, name, messageText, buttonText, buttonUrl, expirationNote }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #002f34;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 40px 10px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
            <!-- Header with Deallyhub Brand -->
            <tr>
              <td align="center" style="background-color: #002f34; padding: 32px 24px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                  Deally<span style="color: #0d9488;">hub</span>
                </h1>
                <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; font-weight: 500;">
                  Buy, Sell & Connect Across the Country
                </p>
              </td>
            </tr>

            <!-- Body Content -->
            <tr>
              <td style="padding: 36px 32px;">
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #002f34;">
                  ${subtitle}
                </h2>
                <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #334155;">
                  Hello ${name ? `<strong>${name}</strong>` : "there"},
                </p>
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                  ${messageText}
                </p>

                <!-- Action Button (Bulletproof HTML email button for mobile) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                  <tr>
                    <td align="center">
                      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto; border-radius: 12px; background-color: #002f34; border: 1px solid #0d9488;">
                        <tr>
                          <td align="center" style="border-radius: 12px; background-color: #002f34; padding: 0;">
                            <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 14px 36px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; -webkit-text-size-adjust: none;">
                              ${buttonText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin: 20px 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                  ${expirationNote}
                </p>
                <p style="margin: 0; font-size: 12px; color: #94a3b8; word-break: break-all;">
                  If the button doesn't work, tap or copy and paste this link:<br>
                  <a href="${buttonUrl}" target="_blank" rel="noopener noreferrer" style="color: #0d9488; text-decoration: underline; font-weight: 600;">${buttonUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                  If you didn't request this email from Deallyhub, you can safely ignore it.
                </p>
                <p style="margin: 0; font-size: 11px; font-weight: 600; color: #94a3b8;">
                  Deallyhub MarketPlace Copyrights 2026
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

function resolveClientOrigin(clientOrigin) {
  let origin = (clientOrigin || process.env.APP_URL || "https://deallyhub.com").trim().replace(/\/+$/, "");
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
    origin = process.env.APP_URL ? process.env.APP_URL.trim().replace(/\/+$/, "") : "https://deallyhub.com";
  }
  return origin;
}

export async function sendVerificationEmail({ email, name, token, clientOrigin }) {
  const backendBase = (process.env.BACKEND_PUBLIC_URL || "https://deallyhub-production.up.railway.app").replace(/\/+$/, "");
  const verifyUrl = `${backendBase}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  console.log(`[VERIFY EMAIL] Generated verifyUrl for ${email}: ${verifyUrl}`);

  const title = "Verify your Deallyhub Account";
  const subtitle = "Confirm your email address";
  const messageText = "Thank you for registering on Deallyhub! Please click the button below to verify your email address and activate your advertiser profile.";
  const buttonText = "Verify Email Address";
  const expirationNote = "This verification link is valid for 24 hours. Once verified, you will have full access to posting advertisements and chatting.";

  const html = generateDeallyEmailHtml({
    title,
    subtitle,
    name,
    messageText,
    buttonText,
    buttonUrl: verifyUrl,
    expirationNote
  });

  return dispatchEmail({
    to: email,
    subject: "Verify your email address - Deallyhub",
    html,
    simulationLabel: "Verification Email",
    actionUrl: verifyUrl
  });
}

export async function sendPasswordResetEmail({ email, name, token, clientOrigin }) {
  const origin = resolveClientOrigin(clientOrigin);
  const resetUrl = `${origin}/?reset_token=${encodeURIComponent(token)}`;

  const title = "Reset your Deallyhub Password";
  const subtitle = "Password Reset Request";
  const messageText = "We received a request to reset your password for your Deallyhub account. Click the button below to choose a new password.";
  const buttonText = "Reset My Password";
  const expirationNote = "This reset link is valid for 1 hour for security purposes. If you didn't request a password reset, your account is safe and you can ignore this email.";

  const html = generateDeallyEmailHtml({
    title,
    subtitle,
    name,
    messageText,
    buttonText,
    buttonUrl: resetUrl,
    expirationNote
  });

  return dispatchEmail({
    to: email,
    subject: "Reset your password - Deallyhub",
    html,
    simulationLabel: "Password Reset Email",
    actionUrl: resetUrl
  });
}
