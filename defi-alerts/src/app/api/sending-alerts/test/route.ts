import { useAaveAprs } from '@/utils/getAaveAPR';
import { useCompoundMarketsAprs } from '@/utils/getCompoundAPR';
import { useSparkAprs } from '@/utils/getSparkAPR';
import { useMorphoVaultsAprs } from '@/utils/getMorphoAPR';
import { useMorphoMarketsAprs } from '@/utils/getMorphoMarketsAPR';
import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/apiTypes';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const fetchSparkAprs = useSparkAprs();
  const sparkAprs = await fetchSparkAprs();

  const fetchAaveAprs = useAaveAprs();
  const aaveAprs = await fetchAaveAprs();

  const fetchCompoundAprs = useCompoundMarketsAprs();
  const compoundAprs = await fetchCompoundAprs();

  const fetchMorphoVaults = useMorphoVaultsAprs();
  const morphoVaults = await fetchMorphoVaults();

  const fetchMorphoMarkets = useMorphoMarketsAprs();
  const morphoMarkets = await fetchMorphoMarkets();

  const response: ApiResponse = {
    sparkAprs,
    aaveAprs,
    compoundAprs,
    morphoVaults,
    morphoMarkets,
  };

  return NextResponse.json(response);
}
