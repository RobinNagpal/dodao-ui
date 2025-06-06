import AlertsTableEmail, { AlertsTableEmailProps } from './email/AlertsTableEmail';
import { NotificationPayload } from '@/types/alerts';
import { toSentenceCase } from '@/utils/getSentenceCase';
import { SES } from '@aws-sdk/client-ses';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';
import { AlertActionType, ConditionType } from '@prisma/client';
import React from 'react';

const ses = new SES({
  region: process.env.AWS_REGION,
});

/**
 * Creates an HTML email body for alert notifications
 */

export default async function getStaticHTMLOfEmail(props: AlertsTableEmailProps): Promise<string> {
  const element = React.createElement(AlertsTableEmail, props);
  const ReactDOMServer = (await import('react-dom/server')).default;

  const appString = ReactDOMServer.renderToStaticMarkup(element);
  return appString;
}

const createAlertEmailBody = async (payload: NotificationPayload): Promise<string> => {
  // Extract alert information
  const { alert, alertObject, alertCategory, alertType, triggered, timestamp, walletAddress } = payload;
  const formattedDate = new Date(timestamp).toLocaleString();
  const normalizedAlertCategory = toSentenceCase(alertCategory);
  const normalizedAlertType = toSentenceCase(alertType);

  // Generate the alerts table HTML using the AlertsTableEmail component
  const props: AlertsTableEmailProps = { alert: alertObject, triggeredValues: payload.triggered };
  const alertsTableHtml = await getStaticHTMLOfEmail(props);

  return `
  <!DOCTYPE html>
  <html lang="en">

  <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333333;
              margin: 0;
              padding: 0;
          }

          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
          }

          .header {
              text-align: center;
              padding: 10px 0;
              border-bottom: 1px solid #dddddd;
          }

          .content {
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
              color: #555555;
          }

          .alert-summary {
            background-color: #e8f4fd;
            border-left: 4px solid #007bff;
            border-radius: 4px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .alert-summary p {
            margin: 4px 0;
            font-size: 14px;
            color: #333333;
          }
          .alert-summary strong {
            color: #007bff;
          }

          .footer {
              font-size: 14px;
              color: #999999;
              text-align: center;
              margin-top: 30px;
          }

          .link {
              cursor: pointer;
              text-decoration: underline;
          }

          .header {
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            line-height: 28px;
          }
      </style>
  </head>

  <body>
      <div class="container">
          <div class="header">
              <h1>${alert}</h1>
          </div>
          <div class="content">
              <div class="alert-summary">
                <p><strong>Alert Category:</strong> ${normalizedAlertCategory}</p>
                <p><strong>Alert Type:</strong> ${normalizedAlertType}</p>
                <p><strong>Triggered At:</strong> ${formattedDate}</p>
                ${walletAddress ? `<p><strong>Wallet Address:</strong> ${walletAddress}</p>` : ''}
              </div>

              <h2>Alert Details</h2>
              ${alertsTableHtml}

              <p>Thank you for using our alert service. If you have any questions, feel free to reply to this email or <a href="mailto:support@dodao.io">contact support</a>.</p>
              <p>Best regards,<br>DoDAO Support</p>
          </div>
          <div class="footer">
              <p>&copy; 
              <a href='https://dodao.io/' class="link">
                DoDAO
              </a>
              . All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
};

/**
 * Sends an alert notification email
 */
export const sendAlertNotificationEmail = async (params: { email: string; payload: NotificationPayload; spaceId?: string }): Promise<void> => {
  const { email, payload, spaceId } = params;

  try {
    const from = 'support@dodao.io';
    console.log('Sending alert notification email to', email, 'from', from);
    const emailBody = await createAlertEmailBody(payload);
    console.log('Email body: ', emailBody);
    // Sending email via AWS SES
    ses.sendEmail(
      {
        Source: from,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: `Alert Notification: ${payload.alert}`,
          },
          Body: {
            Html: {
              Data: emailBody,
            },
          },
        },
      },
      (err, info) => {
        if (err) {
          console.error('Error sending alert notification email:', err);
          throw err;
        } else {
          console.log('Alert notification email sent: ', info);
        }
      }
    );
  } catch (error) {
    console.error('Failed to send alert notification email:', error);
    await logError(
      'Failed to send alert notification email',
      {
        email,
        payload,
      },
      error as Error,
      spaceId
    );
  }
};
