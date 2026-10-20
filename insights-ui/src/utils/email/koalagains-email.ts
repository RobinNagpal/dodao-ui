/** Sender used for every KoalaGains system email (login links, report-result emails, contact form). */
export const KOALAGAINS_FROM_ADDRESS = 'contact@koalagains.com';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Rejects a leading/trailing dot or a run of consecutive dots in either the local or domain part. */
const NO_STRAY_DOTS = /^(?!\.)[^@]*(?<!\.)@(?!\.)[^@]*(?<!\.)$/;

export function isValidEmailAddress(value: string): boolean {
  return EMAIL_PATTERN.test(value) && NO_STRAY_DOTS.test(value) && !value.includes('..');
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
