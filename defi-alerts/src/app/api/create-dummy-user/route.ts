import { prisma } from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract user data from request body
    const {
      name = 'Test User',
      email,
      username,
      publicAddress,
      phoneNumber,
      spaceId = 'default-alerts-space', // Default space if not provided
    } = body;

    // Validate required fields
    if (!email && !username && !publicAddress) {
      return NextResponse.json({ error: 'At least one of email, username, or publicAddress is required' }, { status: 400 });
    }

    // Create or ensure default space exists
    const defaultSpace = await prisma.space.upsert({
      where: { id: spaceId },
      update: {},
      create: {
        id: spaceId,
        name: 'Alerts Test Space',
        creator: 'system',
        verified: true,
        adminUsernamesV1: [],
        authSettings: {},
        features: ['alerts'],
        // Add required fields that were missing
        // themeColors: null,
      },
    });

    // Generate unique identifiers if not provided
    const finalUsername = username || `user_${Date.now()}`;
    const finalEmail = email || `test_${Date.now()}@example.com`;

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email: finalEmail,
        emailVerified: new Date(),
        spaceId: spaceId,
        username: finalUsername,
        authProvider: 'test',
        publicAddress: publicAddress || null,
        phoneNumber: phoneNumber || null,
        // Remove image field if it's not being set
        // image: null, // Only include if you want to explicitly set it
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        spaceId: newUser.spaceId,
        publicAddress: newUser.publicAddress,
        phoneNumber: newUser.phoneNumber,
      },
    });
  } catch (error: any) {
    console.error('Error creating user:', error);

    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return NextResponse.json({ error: `User with this ${field} already exists in this space` }, { status: 409 });
    }

    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid reference to related record' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}
