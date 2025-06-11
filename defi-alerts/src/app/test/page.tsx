'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface MarketRate {
  platform: string;
  chainName: string;
  asset: string;
  earnRate: number;
  borrowRate: number;
  marketLink: string;
}

interface ApiResponse {
  sparkAprs: any[];
  compoundAprs: any[];
}

export default function DebugPage() {
  const [compoundRates, setCompoundRates] = useState<MarketRate[]>([]);
  const baseUrl = getBaseUrl();

  // Function to generate Compound market links
  const generateCompoundLink = (asset: string, chainName: string): string => {
    const baseUrl = 'https://app.compound.finance/markets';
    
    // Asset name mapping for URLs
    const assetMapping: Record<string, string> = {
      'wstETH': 'wsteth',
      'USDS': 'usds',
      'USDC': 'usdc',
      'WETH': 'weth',
      'USDT': 'usdt',
      'USDC.e': 'usdc.e',
      'USDbC': 'usdbc',
      'AERO': 'aero',
      'USDe': 'usde',
      'RON': 'ron'
    };

    // Chain suffix mapping
    const chainMapping: Record<string, string> = {
      'Ethereum': 'mainnet',
      'Optimism': 'op',
      'Polygon': 'polygon',
      'Arbitrum': 'arb',
      'Base': 'basemainnet',
      'Scroll': 'scroll',
      'Mantle': 'mantle',
      'Ronin': 'ronin',
      'Linea': 'linea',
      'Unichain': 'unichain'
    };

    const assetSlug = assetMapping[asset] || asset.toLowerCase();
    const chainSuffix = chainMapping[chainName] || chainName.toLowerCase();
    
    return `${baseUrl}/${assetSlug}-${chainSuffix}`;
  };

  // Use useFetchData hook to fetch rates data
  const {
    data: ratesData,
    loading,
    error,
    reFetchData,
  } = useFetchData<ApiResponse>(`${baseUrl}/api/sending-alerts/test`, {}, 'Failed to load rates data. Please try again later.');

  // Transform compound data when rates data changes
  useEffect(() => {
    if (ratesData?.compoundAprs) {
      const transformedRates: MarketRate[] = ratesData.compoundAprs.map((rate: any) => ({
        platform: 'Compound',
        chainName: rate.chainName,
        asset: rate.asset,
        earnRate: rate.netEarnAPY,
        borrowRate: rate.netBorrowAPY,
        marketLink: generateCompoundLink(rate.asset, rate.chainName)
      }));
      
      setCompoundRates(transformedRates);
    }
  }, [ratesData]);

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">DeFi Rates Debug</h1>
          <p className="text-theme-muted">
            Debug page to view and cross-verify rates from various DeFi platforms including Compound, Aave, Spark, and Morpho.
          </p>
        </div>

        <Button
          onClick={reFetchData}
          disabled={loading}
          className="mt-4 md:mt-0 px-4 py-2 text-sm bg-primary-color text-primary-text border border-transparent rounded-lg hover-border-body"
        >
          <RefreshCw size={16} className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} /> 
          Refresh Rates
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="text-theme-muted">Loading rates...</div>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-md border border-primary-color overflow-hidden bg-block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-primary-color">
                  <TableHead className="w-[120px] text-left">Platform</TableHead>
                  <TableHead className="w-[120px] text-left">Chain</TableHead>
                  <TableHead className="w-[120px] text-left">Asset</TableHead>
                  <TableHead className="w-[120px] text-center">Earn Rate (%)</TableHead>
                  <TableHead className="w-[120px] text-center">Borrow Rate (%)</TableHead>
                  <TableHead className="w-[120px] text-center">Market Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compoundRates.length > 0 ? (
                  compoundRates.map((rate, index) => (
                    <TableRow key={`${rate.platform}-${rate.chainName}-${rate.asset}-${index}`} className="border-primary-color">
                      <TableCell className="font-medium text-theme-primary">
                        {rate.platform}
                      </TableCell>
                      <TableCell className="text-theme-primary">
                        {rate.chainName}
                      </TableCell>
                      <TableCell className="text-theme-primary">
                        {rate.asset}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">
                          {rate.earnRate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">
                          {rate.borrowRate.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="p-2 border-theme-border-primary text-theme-primary hover-border-primary"
                          onClick={() => window.open(rate.marketLink, '_blank')}
                        >
                          <ExternalLink size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-theme-muted">
                        <p>No rates data available</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {compoundRates.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Total Markets</h3>
            <p className="text-2xl font-bold text-primary-color">{compoundRates.length}</p>
          </div>
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Highest Earn Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...compoundRates.map(r => r.earnRate)).toFixed(2)}%
            </p>
          </div>
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Lowest Borrow Rate</h3>
            <p className="text-2xl font-bold text-red-600">
              {Math.min(...compoundRates.map(r => r.borrowRate)).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
