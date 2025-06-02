import { NextResponse } from 'next/server';
import { prisma } from '@/prisma';
import { CHAINS, COMPOUND_MARKETS, type ChainConfig, type MarketConfig } from '@/shared/web3/config';

export async function POST() {
  try {
    await Promise.all(
      CHAINS.map(async ({ chainId, name }: ChainConfig) => {
        await prisma.chain.upsert({
          where: { chainId },
          update: { name },
          create: { chainId, name },
        });
      })
    );

    await Promise.all(
      COMPOUND_MARKETS.map(async ({ chainId, symbol, baseAssetAddress }: MarketConfig) => {
        const compositeId = `${chainId}_${baseAssetAddress.toLowerCase()}`;
        await prisma.asset.upsert({
          where: { chainId_address: compositeId },
          update: { symbol, address: baseAssetAddress.toLowerCase() },
          create: {
            chainId_address: compositeId,
            chainId,
            symbol,
            address: baseAssetAddress.toLowerCase(),
          },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
