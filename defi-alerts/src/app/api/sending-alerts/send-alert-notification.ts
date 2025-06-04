import { toSentenceCase } from '@/utils/getSentenceCase';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { SES } from '@aws-sdk/client-ses';
import { AlertActionType, ConditionType } from '@prisma/client';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';

/**
 * Interface for the notification payload
 */
interface NotificationPayload {
  alert: string;
  alertCategory: string;
  alertType: AlertActionType;
  walletAddress?: string | null;
  triggered: AlertTriggerValuesInterface[];
  timestamp: string;
}

const ses = new SES({
  region: process.env.AWS_REGION,
});

/**
 * Creates an HTML email body for alert notifications
 */
const createAlertEmailBody = (payload: NotificationPayload): string => {
  // Extract alert information
  const { alert, alertCategory, alertType, triggered, timestamp, walletAddress } = payload;
  const formattedDate = new Date(timestamp).toLocaleString();
  const normalizedAlertCategory = toSentenceCase(alertCategory);
  const normalizedAlertType = toSentenceCase(alertType);

  // Create HTML for triggered conditions
  const triggeredHtml = triggered
    .map((group: AlertTriggerValuesInterface) => {
      // Extract the single condition object
      const condition = group.condition;

      // Format the threshold text (either a range or a single percentage)
      let thresholdText = '';
      if (typeof condition.threshold === 'object') {
        thresholdText = `Range: Low ${condition.threshold.low}%, High ${condition.threshold.high}%`;
      } else {
        thresholdText = `${condition.threshold}%`;
      }

      // Get explanation message for why this alert is important
      const explanation = getAlertExplanation(condition.type, alertType, group.isComparison || false);

      // Build the HTML for that one condition
      const conditionHtml = `
      <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
        <p><strong>Condition Type:</strong> ${formatConditionType(condition.type)}</p>
        <p><strong>Threshold:</strong> ${thresholdText}</p>
        ${explanation ? `<p><strong>What this means:</strong> ${explanation}</p>` : ''}
      </div>
    `;

      // Build the HTML for the entire group (asset/chain + rates + single condition)
      return `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f4f8; border-radius: 8px; border-left: 4px solid #007bff;">
        <h3 style="margin-top: 0; color: #333;">Asset: ${group.asset} (Chain: ${group.chainName})</h3>
        ${group.currentRate ? `<p><strong>Current Rate:</strong> ${group.currentRate}%</p>` : ''}
        ${group.protocol ? `<p><strong>Compared Protocol:</strong> ${group.protocol}</p>` : ''}
        ${group.compoundRate ? `<p><strong>Compound Rate:</strong> ${group.compoundRate}%</p>` : ''}
        ${group.protocolRate ? `<p><strong>Protocol Rate:</strong> ${group.protocolRate}%</p>` : ''}
        ${group.diff ? `<p><strong>Difference:</strong> ${group.diff}%</p>` : ''}
        <h4 style="margin-top: 15px; color: #555;">Triggered Condition:</h4>
        ${conditionHtml}
      </div>
    `;
    })
    .join('');

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

              <h2>Triggered Conditions</h2>
              ${triggeredHtml}

              <p>Thank you for using our alert service. If you have any questions, feel free to reply to this email or <a href="mailto:support@dodao.io">contact support</a>.</p>
              <p>Best regards,<br>Dodao Support</p>
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
 * Formats condition type for better readability
 */
function formatConditionType(type: ConditionType): string {
  switch (type) {
    case 'APR_RISE_ABOVE':
      return 'APR Rise Above';
    case 'APR_FALLS_BELOW':
      return 'APR Falls Below';
    case 'APR_OUTSIDE_RANGE':
      return 'APR Outside Range';
    case 'RATE_DIFF_ABOVE':
      return 'Rate Difference Above';
    case 'RATE_DIFF_BELOW':
      return 'Rate Difference Below';
    default:
      return type;
  }
}

/**
 * Generates an explanation message for why the alert is important
 */
function getAlertExplanation(conditionType: ConditionType, actionType: AlertActionType, isComparison: boolean): string {
  if (isComparison) {
    switch (conditionType) {
      case 'APR_RISE_ABOVE':
        return actionType === 'SUPPLY' 
          ? 'Compound offers better earning opportunity' 
          : 'Compound has higher borrowing cost';
      case 'APR_FALLS_BELOW':
        return actionType === 'SUPPLY' 
          ? 'Compound offers worse earning opportunity' 
          : 'Compound has better borrowing rate';
      case 'APR_OUTSIDE_RANGE':
        return actionType === 'SUPPLY' 
          ? 'Significant change in earning opportunity' 
          : 'Significant change in borrowing cost';
      case 'RATE_DIFF_ABOVE':
        return actionType === 'SUPPLY' 
          ? 'Compound offers better earnings' 
          : 'Compound has higher cost';
      case 'RATE_DIFF_BELOW':
        return actionType === 'SUPPLY' 
          ? 'Compound offers worse earnings' 
          : 'Compound has better cost';
      default:
        return '';
    }
  } else {
    switch (conditionType) {
      case 'APR_RISE_ABOVE':
        return actionType === 'SUPPLY' 
          ? 'Better earning opportunity' 
          : 'Higher borrowing cost';
      case 'APR_FALLS_BELOW':
        return actionType === 'SUPPLY' 
          ? 'Worse earning opportunity' 
          : 'Better borrowing rate';
      case 'APR_OUTSIDE_RANGE':
        return actionType === 'SUPPLY' 
          ? 'Significant change in earning opportunity' 
          : 'Significant change in borrowing cost';
      case 'RATE_DIFF_ABOVE':
        return actionType === 'SUPPLY' 
          ? 'Better earning opportunity' 
          : 'Higher borrowing cost';
      case 'RATE_DIFF_BELOW':
        return actionType === 'SUPPLY' 
          ? 'Worse earning opportunity' 
          : 'Better borrowing rate';
      default:
        return '';
    }
  }
}

/**
 * Sends an alert notification email
 */
export const sendAlertNotificationEmail = async (params: { email: string; payload: NotificationPayload; spaceId?: string }): Promise<void> => {
  const { email, payload, spaceId } = params;

  try {
    const from = 'support@tidbitshub.org';
    console.log('Sending alert notification email to', email, 'from', from);
    const emailBody = createAlertEmailBody(payload);
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
