import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const dodaoauthsecret = process.env.DODAO_AUTH_SECRET;

/**
 * GET handler for generating a temporary JWT token
 * @returns A promise that resolves to a response containing the JWT token
 */
export async function GET() {
  if (!dodaoauthsecret) {
    return NextResponse.json({ error: 'Authentication secret not configured' }, { status: 500 });
  }

  try {
    const token = jwt.sign(
      {
        userId: 'robin',
        spaceId: 'news-reader',
        username: 'robin',
        accountId: 'robin',
      },
      dodaoauthsecret
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
