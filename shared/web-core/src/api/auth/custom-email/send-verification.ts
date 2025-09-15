import { SES } from '@aws-sdk/client-ses';

const ses = new SES({
  region: process.env.AWS_REGION,
});
/** Web compatible method to create a random string of a given length */
export function randomString(size: number) {
  const i2hex = (i: number) => ('0' + i.toString(16)).slice(-2);
  const r = (a: string, i: number): string => a + i2hex(i);
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes).reduce(r, '');
}

const emailBody = (link: string) => `
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

        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        a.button {
            font-size: 16px;
            color: #ffffff !important;
            background-color: #007bff;
            padding: 12px 20px;
            text-decoration: none;
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
            <h1>Log In to Your Account</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You requested a secure login link to access your account on our platform. Click the button below to log
                in.</p>
            <p><strong>Please note:</strong> This link is valid for a limited time and can only be used once.</p>
            <div class="button-container">
                <a href="${decodeURIComponent(link)}" class="button">Log in to Your Account</a>
            </div>
            <p>If you didn’t request this link, please ignore this email or contact our support team if you have any
                concerns.</p>
            <p>Thanks,<br>Dodao Support</p>
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

export const sendVerificationRequest = async (params: { identifier: string; url: string; expires: Date; token: string; from?: string }) => {
  const { identifier: email, url } = params;

  const from = params.from || 'support@tidbitshub.org';
  console.log('Sending email to', email, 'from', from);
  console.log('Email body: ', emailBody(url));
  // Sending email via AWS SES
  ses.sendEmail(
    {
      Source: from,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: 'Log in to your account',
        },
        Body: {
          Html: {
            Data: emailBody(url),
          },
        },
      },
    },
    (err, info) => {
      if (err) {
        console.error(err);
        throw new Error('Failed to send email');
      } else {
        console.log('Email sent: ', info);
      }
    }
  );
};

export function defaultNormalizer(email?: string) {
  if (!email) throw new Error('Missing email from request body.');
  // Get the first two elements only,
  // separated by `@` from user input.
  let [local, domain] = email.toLowerCase().trim().split('@');
  // The part before "@" can contain a ","
  // but we remove it on the domain part
  domain = domain.split(',')[0];
  return `${local}@${domain}`;
}
