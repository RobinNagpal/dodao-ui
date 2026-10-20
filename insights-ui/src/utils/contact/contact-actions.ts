'use server';

import { sendEmail } from '@dodao/web-core/api/email/sendEmail';

/** Same sender as the other KoalaGains system emails (login links, report-result emails). */
const FROM_ADDRESS = 'contact@koalagains.com';
/** The address shown on the homepage's "Get in Touch" section. */
const TO_ADDRESS = 'hello@koalagains.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function emailHtml(name: string, email: string, phoneNumber: string, message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <p style="margin:0 0 24px;font-size:18px;font-weight:bold;">New message from the koalagains.com contact form</p>
      <p style="margin:0 0 8px;font-size:14px;"><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      ${phoneNumber ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${escapeHtml(phoneNumber)}</p>` : ''}
      <p style="margin:24px 0 0;font-size:15px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(message)}</p>
    </div>
  </body>
</html>`;
}

/**
 * Sends the homepage "Get in Touch" form to the KoalaGains contact inbox, with the
 * submitter set as reply-to so a reply goes straight to them.
 */
export async function submitContactForm(input: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const email = input.email?.trim() ?? '';
  const message = input.message?.trim() ?? '';
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!message) {
    return { ok: false, error: 'Enter a message.' };
  }

  const firstName = input.firstName?.trim() ?? '';
  const lastName = input.lastName?.trim() ?? '';
  const phoneNumber = input.phoneNumber?.trim() ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || '(no name given)';

  try {
    await sendEmail({
      to: TO_ADDRESS,
      from: FROM_ADDRESS,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: emailHtml(name, email, phoneNumber, message),
    });
    return { ok: true };
  } catch (error) {
    console.error('[contact-actions] Failed to send contact form email', error instanceof Error ? error.message : error);
    return { ok: false, error: 'Something went wrong sending your message. Please email hello@koalagains.com directly.' };
  }
}
