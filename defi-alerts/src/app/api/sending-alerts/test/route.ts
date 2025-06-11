import { useAaveAprs } from '@/utils/getAaveAPR';
import { useCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { useSparkAprs } from '@/utils/getSparkAPR';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const fetchSparkAprs = useSparkAprs();
  const sparkAprs = await fetchSparkAprs();

  const fetchAaveAprs = useAaveAprs();
  const aaveAprs = await fetchAaveAprs();

  const fetchCompoundAprs = useCompoundMarketsAprs();
  const compoundAprs = await fetchCompoundAprs();

  return NextResponse.json({
    sparkAprs,
    aaveAprs,
    compoundAprs,
  });
}
