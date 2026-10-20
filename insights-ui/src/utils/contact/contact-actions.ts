'use server';

import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { escapeHtml, isValidEmailAddress, KOALAGAINS_FROM_ADDRESS } from '@/utils/email/koalagains-email';
import { sendEmail } from '@dodao/web-core/api/email/sendEmail';
import { headers } from 'next/headers';

/** The address shown on the homepage's "Get in Touch" section — same mailbox the system `from` address already uses. */
const TO_ADDRESS = KOALAGAINS_FROM_ADDRESS;

export type ContactFormResult = { ok: true } | { ok: false; error: string };

/** Extra recipients from the CONTACT_FORM_FORWARD_EMAILS app setting (admin → App Settings → Contact Form). "off" disables forwarding. */
async function forwardAddresses(): Promise<string[]> {
  const raw = (await getAppConfigValue('CONTACT_FORM_FORWARD_EMAILS'))?.trim() ?? '';
  if (raw === '' || raw.toLowerCase() === 'off') return [];

  const seen = new Set([TO_ADDRESS.toLowerCase()]);
  const addresses: string[] = [];
  for (const address of raw.split(/[\s,;]+/)) {
    if (!address || seen.has(address.toLowerCase())) continue;
    if (!isValidEmailAddress(address)) {
      console.warn(`[contact-actions] Skipping invalid CONTACT_FORM_FORWARD_EMAILS entry: "${address}"`);
      continue;
    }
    seen.add(address.toLowerCase());
    addresses.push(address);
  }
  return addresses;
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * True for anything that isn't the untouched empty string the real form always submits for its
 * hidden honeypot field — including a non-string value, which a direct, scripted call to this
 * action (bypassing the DOM form entirely) could send instead.
 */
function isHoneypotTripped(value: unknown): boolean {
  return typeof value !== 'string' || value.trim() !== '';
}

const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
/** submitter key -> submission timestamps (ms) within the current window. Per-process only, which is fine for blunting casual abuse of the shared SES sender. */
const submissionsByKey = new Map<string, number[]>();

/** Keyed by the first hop of X-Forwarded-For (set by the CDN/load balancer in front of this app); falls back to a shared key if that header is ever missing. */
async function rateLimitKey(): Promise<string> {
  const forwardedFor = (await headers()).get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (submissionsByKey.get(key) ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_SUBMISSIONS) {
    submissionsByKey.set(key, recent);
    return true;
  }
  recent.push(now);
  submissionsByKey.set(key, recent);
  return false;
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
      <p style="margin:24px 0 0;font-size:15px;line-height:1.5;">${escapeHtml(message).replace(/\n/g, '<br>')}</p>
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
  if (isHoneypotTripped(input.honeypot)) {
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

  if (isRateLimited(await rateLimitKey())) {
    return { ok: false, error: "You've sent several messages recently. Please wait a bit before sending another." };
  }

  const firstName = toHeaderSafeText(asTrimmedString(input.firstName));
  const lastName = toHeaderSafeText(asTrimmedString(input.lastName));
  const phoneNumber = asTrimmedString(input.phoneNumber);
  const name = [firstName, lastName].filter(Boolean).join(' ') || '(no name given)';

  try {
    await sendEmail({
      to: TO_ADDRESS,
      bcc: await forwardAddresses(),
      from: KOALAGAINS_FROM_ADDRESS,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      html: emailHtml(name, email, phoneNumber, message),
      containsUserSuppliedContent: true,
    });
    return { ok: true };
  } catch (error) {
    console.error('[contact-actions] Failed to send contact form email', error instanceof Error ? error.message : error);
    return { ok: false, error: `Something went wrong sending your message. Please email ${TO_ADDRESS} directly.` };
  }
}
