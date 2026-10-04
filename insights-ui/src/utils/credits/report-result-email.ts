import { prisma } from '@/prisma';
import { getReportHrefs } from '@/utils/credits/report-target';
import { getCanonicalUrl } from '@/utils/getBaseUrlForServerSidePages';
import { sendEmail } from '@dodao/web-core/api/email/sendEmail';
import { CreditTransaction } from '@prisma/client';

/** Same sender as the KoalaGains login emails. */
const FROM_ADDRESS = 'contact@koalagains.com';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Plain, inline-styled layout so it renders the same in every mail client. */
function emailHtml({ heading, body, buttonLabel, buttonUrl }: { heading: string; body: string; buttonLabel: string; buttonUrl: string }): string {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px;">
      <p style="margin:0 0 24px;font-size:18px;font-weight:bold;">KoalaGains</p>
      <h1 style="margin:0 0 16px;font-size:20px;">${heading}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.5;">${body}</p>
      <a href="${buttonUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:6px;">${buttonLabel}</a>
      <p style="margin:32px 0 0;font-size:12px;line-height:1.5;color:#71717a;">
        You're receiving this because you used a credit to regenerate this report on KoalaGains.
      </p>
    </div>
  </body>
</html>`;
}

/**
 * Emails the user who paid for a regeneration once it has finished (report is
 * ready) or failed (credit returned). Best effort: a failed email is logged and
 * never breaks report completion or the refund.
 */
export async function sendReportResultEmail(spend: CreditTransaction, succeeded: boolean): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: spend.userId }, select: { email: true } });
    if (!user?.email) return;

    const label = escapeHtml(spend.reportLabel ?? 'your report');
    const hrefs = await getReportHrefs([spend]);
    const path = (spend.reportTargetId && hrefs.get(spend.reportTargetId)) || '/credits';
    const reportUrl = `${getCanonicalUrl()}${path}`;

    const email = succeeded
      ? {
          subject: `Your ${spend.reportLabel} report is ready`,
          html: emailHtml({
            heading: 'Your report is ready',
            body: `The fresh analysis of <strong>${label}</strong> you requested has been generated.`,
            buttonLabel: 'View report',
            buttonUrl: reportUrl,
          }),
        }
      : {
          subject: `We couldn't generate your ${spend.reportLabel} report`,
          html: emailHtml({
            heading: "We couldn't generate your report",
            body: `Something went wrong while generating the new <strong>${label}</strong> report. Your credit has been returned to your balance, so you can try again any time.`,
            buttonLabel: 'Go to report',
            buttonUrl: reportUrl,
          }),
        };

    await sendEmail({ to: user.email, from: FROM_ADDRESS, ...email });
  } catch (error) {
    // Message only: locally SES isn't set up, and a full AWS stack trace per email is just noise.
    console.error('[report-result-email] Failed to send', spend.id, error instanceof Error ? error.message : error);
  }
}
