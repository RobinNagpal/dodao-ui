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
}

/**
 * Sends one HTML email through AWS SES. Like the login email, it prints the
 * email to the server log first, so it can be read in the terminal when SES
 * isn't configured locally (the send then fails and the caller logs that).
 */
export async function sendEmail({ to, from, subject, html }: SendEmailInput): Promise<void> {
  console.log('Sending email to', to, 'from', from, 'subject', subject);
  console.log('Email body: ', html);
  await ses.sendEmail({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  });
}
