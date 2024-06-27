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
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        a {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        h1 {
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sign In to Your Account</h1>
        <p>Your sign-in link is below. Please click the button to proceed.</p>
        <a href="${decodeURIComponent(link)}">Sign In</a>
        <p>If you did not request this email, please ignore it.</p>
    </div>
</body>
</html>
`;

export const sendVerificationRequest = async (params: { identifier: string; url: string; expires: Date; token: string }) => {
  const { identifier: email, url } = params;

  const from = 'support@tidbitshub.org';
  console.log('Sending email to', email, 'from', from, 'with body', emailBody);
  // Sending email via AWS SES
  ses.sendEmail(
    {
      Source: from,
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: {
          Data: 'Sign in to your account',
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
