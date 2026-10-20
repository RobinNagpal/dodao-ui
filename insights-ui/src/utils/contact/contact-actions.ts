'use server';

import { escapeHtml, isValidEmailAddress, KOALAGAINS_FROM_ADDRESS } from '@/utils/email/koalagains-email';
import { sendEmail } from '@dodao/web-core/api/email/sendEmail';

/** The address shown on the homepage's "Get in Touch" section. */
const TO_ADDRESS = 'contact@koalagains.com';

export type ContactFormResult = { ok: true } | { ok: false; error: string };

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Strips characters that have no business in a one-line email header (CR/LF and other controls). */
function toHeaderSafeText(value: string): string {
  // eslint-disable-next-line no-control-regex -- deliberately stripping CR/LF/control chars before use in a mail header
  return value.replace(/[\x00-\x1f\x7f]+/g, ' ').trim();
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
 *
 * `honeypot` is an input the real form keeps hidden from sighted users via CSS; a filled-in
 * value means a bot filled every field blindly, so the submission is dropped — while still
 * reporting success, so the bot cannot tell it was dropped.
 */
export async function submitContactForm(input: {
  firstName: unknown;
  lastName: unknown;
  email: unknown;
  phoneNumber: unknown;
  message: unknown;
  honeypot?: unknown;
}): Promise<ContactFormResult> {
  if (asTrimmedString(input.honeypot) !== '') {
    return { ok: true };
  }

  const email = asTrimmedString(input.email);
  const message = asTrimmedString(input.message);
  if (!email || !isValidEmailAddress(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (!message) {
    return { ok: false, error: 'Enter a message.' };
  }

  const firstName = toHeaderSafeText(asTrimmedString(input.firstName));
  const lastName = toHeaderSafeText(asTrimmedString(input.lastName));
  const phoneNumber = asTrimmedString(input.phoneNumber);
  const name = [firstName, lastName].filter(Boolean).join(' ') || '(no name given)';

  try {
    await sendEmail({
      to: TO_ADDRESS,
      from: KOALAGAINS_FROM_ADDRESS,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: emailHtml(name, email, phoneNumber, message),
    });
    return { ok: true };
  } catch (error) {
    console.error('[contact-actions] Failed to send contact form email', error instanceof Error ? error.message : error);
    return { ok: false, error: `Something went wrong sending your message. Please email ${TO_ADDRESS} directly.` };
  }
}
