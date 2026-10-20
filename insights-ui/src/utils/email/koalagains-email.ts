/** Sender used for every KoalaGains system email (login links, report-result emails, contact form). */
export const KOALAGAINS_FROM_ADDRESS = 'contact@koalagains.com';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailAddress(value: string): boolean {
  return EMAIL_PATTERN.test(value);
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
