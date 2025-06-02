import { SES } from '@aws-sdk/client-ses';
import { logError } from '@dodao/web-core/api/helpers/adapters/errorLogger';

const ses = new SES({
  region: process.env.AWS_REGION,
});

/**
 * Creates an HTML email body for alert notifications
 */
const createAlertEmailBody = (payload: any) => {
  // Extract alert information
  const { alert, alertCategory, alertType, triggered, timestamp } = payload;
  const formattedDate = new Date(timestamp).toLocaleString();

  // Create HTML for triggered conditions
  const triggeredHtml = triggered
    .map((group: any) => {
      const conditionsHtml = group.conditions
        .map((condition: any) => {
          let thresholdText = '';
          if (typeof condition.threshold === 'object') {
            thresholdText = `Range: Low ${condition.threshold.low}%, High ${condition.threshold.high}%`;
          } else {
            thresholdText = `${condition.threshold}%`;
          }

          return `
        <div style="margin-bottom: 10px; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">
          <p><strong>Condition Type:</strong> ${formatConditionType(condition.type)}</p>
          <p><strong>Threshold:</strong> ${thresholdText}</p>
        </div>
      `;
        })
        .join('');

      return `
      <div style="margin-bottom: 20px; padding: 15px; background-color: #f0f4f8; border-radius: 8px; border-left: 4px solid #007bff;">
        <h3 style="margin-top: 0; color: #333;">Asset: ${group.asset} (Chain: ${group.chain})</h3>
        <p><strong>Current Rate:</strong> ${group.currentRate}%</p>
        ${group.protocol ? `<p><strong>Compared Protocol:</strong> ${group.protocol}</p>` : ''}
        ${group.compoundRate ? `<p><strong>Compound Rate:</strong> ${group.compoundRate}%</p>` : ''}
        ${group.protocolRate ? `<p><strong>Protocol Rate:</strong> ${group.protocolRate}%</p>` : ''}
        ${group.diff ? `<p><strong>Difference:</strong> ${group.diff}%</p>` : ''}
        <h4 style="margin-top: 15px; color: #555;">Triggered Conditions:</h4>
        ${conditionsHtml}
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
  
          .alert-info {
              background-color: #e8f4fd;
              border-left: 4px solid #007bff;
              padding: 15px;
              margin-bottom: 20px;
              border-radius: 5px;
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
      </style>
  </head>
  
  <body>
      <div class="container">
          <div class="header">
              <h1>${alert}</h1>
          </div>
          <div class="content">
              <div class="alert-info">
                  <p><strong>Alert Category:</strong> ${alertCategory}</p>
                  <p><strong>Alert Type:</strong> ${alertType}</p>
                  <p><strong>Triggered At:</strong> ${formattedDate}</p>
              </div>
              
              <h2>Triggered Conditions</h2>
              ${triggeredHtml}
              
              <p>Thank you for using our alert service.</p>
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
function formatConditionType(type: string): string {
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
 * Sends an alert notification email
 */
export const sendAlertNotificationEmail = async (params: { email: string; payload: any; spaceId?: string }) => {
  const { email, payload, spaceId } = params;

  try {
    const from = 'support@tidbitshub.org';
    console.log('Sending alert notification email to', email, 'from', from);

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
              Data: createAlertEmailBody(payload),
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
