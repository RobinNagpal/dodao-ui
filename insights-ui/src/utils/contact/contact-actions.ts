'use server';

import { getAppConfigValue } from '@/lib/appConfig/appConfig';
import { escapeHtml, isValidEmailAddress, KOALAGAINS_FROM_ADDRESS } from '@/utils/email/koalagains-email';
import { sendEmail, type SendEmailInput } from '@dodao/web-core/api/email/sendEmail';
import { headers } from 'next/headers';

/** The address shown on the homepage's "Get in Touch" section — same mailbox the system `from` address already uses. */
const TO_ADDRESS = KOALAGAINS_FROM_ADDRESS;

export type ContactFormResult = { ok: true } | { ok: false; error: string };

const MAX_FORWARD_ADDRESSES = 10;
/** Characters that can't be part of an address — so "Name <a@b.com>", quotes (incl. smart quotes) and any list separator all split cleanly. */
const NOT_PART_OF_AN_ADDRESS = /[\s,;<>"'“”‘’()[\]]+/;
/** ASCII-only on purpose: SES rejects non-ASCII addresses, which would make that copy fail on every submission. */
const STRICT_ASCII_ADDRESS = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

/**
 * Extra recipients from the CONTACT_FORM_FORWARD_EMAILS app setting (admin → App Settings → Contact Form).
 * Words without an "@" (names, "off") are ignored, so "off" disables forwarding; an "@" token that still
 * isn't a valid address is logged and skipped.
 */
async function forwardAddresses(): Promise<string[]> {
  const raw = (await getAppConfigValue('CONTACT_FORM_FORWARD_EMAILS')) ?? '';
  const seen = new Set([TO_ADDRESS.toLowerCase()]);
  const addresses: string[] = [];
  for (const token of raw.split(NOT_PART_OF_AN_ADDRESS)) {
    const candidate = token.replace(/^mailto:/i, '').replace(/\.+$/, '');
    if (!candidate.includes('@')) continue;
    if (!STRICT_ASCII_ADDRESS.test(candidate) || !isValidEmailAddress(candidate)) {
      console.warn(`[contact-actions] Ignoring malformed CONTACT_FORM_FORWARD_EMAILS entry: "${candidate}"`);
      continue;
    }
    if (seen.has(candidate.toLowerCase())) continue;
    seen.add(candidate.toLowerCase());
    addresses.push(candidate);
  }
  if (addresses.length > MAX_FORWARD_ADDRESSES) {
    console.warn(`[contact-actions] CONTACT_FORM_FORWARD_EMAILS lists ${addresses.length} addresses; only the first ${MAX_FORWARD_ADDRESSES} are used.`);
    return addresses.slice(0, MAX_FORWARD_ADDRESSES);
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

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_PER_SENDER = 5;
/** Across all senders. The per-sender key below is client-spoofable, so this is the cap that actually bounds SES volume. */
const RATE_LIMIT_MAX_TOTAL = 30;
/** sender key -> timestamps (ms) of accepted submissions within the window. Per-process; only accepted submissions are stored, so it stays small. */
const submissionsByKey = new Map<string, number[]>();

/** First hop of X-Forwarded-For. A client can put anything there, so this only slows down well-behaved repeat senders. */
async function rateLimitKey(): Promise<string> {
  const forwardedFor = (await headers()).get('x-forwarded-for');
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

function checkRateLimit(key: string): 'sender' | 'global' | null {
  const now = Date.now();
  let total = 0;
  for (const [k, stamps] of submissionsByKey) {
    const recent = stamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      submissionsByKey.delete(k);
    } else {
      submissionsByKey.set(k, recent);
      total += recent.length;
    }
  }
  if (total >= RATE_LIMIT_MAX_TOTAL) return 'global';
  const mine = submissionsByKey.get(key) ?? [];
  if (mine.length >= RATE_LIMIT_MAX_PER_SENDER) return 'sender';
  submissionsByKey.set(key, [...mine, now]);
  return null;
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

/** Sends one copy; never throws, so one bad recipient can't stop the others. Logs the recipient (our inbox or an admin-configured forward, never the visitor). */
async function deliverTo(to: string, mail: Omit<SendEmailInput, 'to'>): Promise<boolean> {
  try {
    await sendEmail({ ...mail, to });
    return true;
  } catch (error) {
    console.error(`[contact-actions] Failed to send contact form email to ${to}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Sends the homepage "Get in Touch" form to the KoalaGains contact inbox, plus a separate copy to each
 * CONTACT_FORM_FORWARD_EMAILS address, with the submitter as reply-to so a reply goes straight to them.
 * The submission counts as sent if any copy was delivered.
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

  const limited = checkRateLimit(await rateLimitKey());
  if (limited === 'sender') {
    return { ok: false, error: "You've sent several messages recently. Please wait a bit before sending another." };
  }
  if (limited === 'global') {
    return { ok: false, error: `We're receiving a lot of messages right now. Please try again in a few minutes, or email ${TO_ADDRESS} directly.` };
  }

  const firstName = toHeaderSafeText(asTrimmedString(input.firstName));
  const lastName = toHeaderSafeText(asTrimmedString(input.lastName));
  const phoneNumber = asTrimmedString(input.phoneNumber);
  const name = [firstName, lastName].filter(Boolean).join(' ') || '(no name given)';

  const mail: Omit<SendEmailInput, 'to'> = {
    from: KOALAGAINS_FROM_ADDRESS,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    html: emailHtml(name, email, phoneNumber, message),
    containsUserSuppliedContent: true,
  };
  // The forward list is looked up alongside the main send, so a cold settings cache never delays it.
  const [deliveredToInbox, deliveredToForwards] = await Promise.all([
    deliverTo(TO_ADDRESS, mail),
    forwardAddresses().then((addresses) => Promise.all(addresses.map((to) => deliverTo(to, mail)))),
  ]);

  if (deliveredToInbox || deliveredToForwards.some(Boolean)) {
    return { ok: true };
  }
  return { ok: false, error: `Something went wrong sending your message. Please email ${TO_ADDRESS} directly.` };
}
