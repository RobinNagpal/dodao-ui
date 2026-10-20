import { SES } from '@aws-sdk/client-ses';

/** The one SES client for every email the apps send (login links, report results, …). */
export const ses = new SES({
  region: process.env.AWS_REGION,
});

export interface SendEmailInput {
  to: string;
  from: string;
  subject: string;
  html: string;
  /** Set when the recipient should be able to hit "reply" and land on someone other than `from` (e.g. a contact-form submitter). */
  replyTo?: string;
  /** Extra recipients hidden from everyone else on the email (so a "reply all" never reaches them). */
  bcc?: string[];
  /**
   * Set when `subject`/`html` carry third-party-submitted content (e.g. a contact-form
   * visitor's name/message) that shouldn't land in production logs. Callers that only ever
   * send our own copy (login links, report results) leave this unset and keep full production
   * logging, which is useful for debugging.
   */
  containsUserSuppliedContent?: boolean;
}

// NODE_ENV alone isn't enough: a Vercel *preview* build also has NODE_ENV=production baked in,
// so it's excluded explicitly. The app's real production host (AWS/Lightsail) never sets
// VERCEL_ENV, so this still resolves to `true` there.
function isRealProduction(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview';
}

/**
 * Sends one HTML email through AWS SES. Like the login email, it prints the
 * email to the server log first, so it can be read in the terminal when SES
 * isn't configured locally (the send then fails and the caller logs that).
 * That logging is skipped in production for callers marked `containsUserSuppliedContent`.
 */
export async function sendEmail({ to, from, subject, html, replyTo, bcc, containsUserSuppliedContent }: SendEmailInput): Promise<void> {
  if (!(containsUserSuppliedContent && isRealProduction())) {
    console.log('Sending email to', to, bcc?.length ? `(bcc ${bcc.join(', ')})` : '', 'from', from, 'subject', subject);
    console.log('Email body: ', html);
  }
  await ses.sendEmail({
    Source: from,
    Destination: { ToAddresses: [to], BccAddresses: bcc?.length ? bcc : undefined },
    ReplyToAddresses: replyTo ? [replyTo] : undefined,
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  });
}
