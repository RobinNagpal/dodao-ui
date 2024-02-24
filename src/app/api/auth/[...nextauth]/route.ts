import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SES } from '@aws-sdk/client-ses';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';

// Configure AWS SES
const ses = new SES({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

import { headers } from 'next/headers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Capture the hostname from the request
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host');
  const httpsProto = headersList.get('x-forwarded-proto');
  // Do whatever you want here, before the request is passed down to `NextAuth`
  return await NextAuth(req, res, {
    ...authOptions,
    providers: authOptions.providers.map((provider) => {
      if (provider.id === 'email') {
        return {
          ...provider,

          sendVerificationRequest: ({ identifier: email, url, provider }) => {
            const { from } = provider;
            const baseUrl = `${httpsProto}://${host}`;
            const customUrl = url.replace(/^http?:\/\/[^/]+/, baseUrl);
            const link = `${customUrl}&utm_source=${host}`;

            // Email HTML body
            const emailBody = `Your sign in link is <a href="${link}">here</a>.`;

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
                      Data: emailBody,
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
          },
        };
      }
      return provider;
    }),
  });
}

export { handler as GET, handler as POST };
