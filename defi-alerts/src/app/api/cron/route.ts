import { NextRequest, NextResponse } from 'next/server';

/**
 * Cron job handler that runs once every hour
 * This function calls the compound-market-alerts endpoint to check for conditions and send notifications
 */
export async function GET(request: NextRequest) {
  try {
    // Call the compound-market-alerts endpoint
    const response = await fetch(new URL('/api/sending-alerts/compound-market-alerts', request.url), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to call compound-market-alerts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return the response from the compound-market-alerts endpoint
    return NextResponse.json({
      success: true,
      message: 'Cron job executed successfully',
      result: data,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Cron job failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
