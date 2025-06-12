'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  vaultName?: string; // Optional for Morpho vaults
}

interface ApiResponse {
  sparkAprs: any[];
  aaveAprs: any[];
  compoundAprs: any[];
  morphoVaults: any[];
}

export default function DebugPage() {
  const [allRates, setAllRates] = useState<MarketRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<MarketRate[]>([]);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [showMorphoColumns, setShowMorphoColumns] = useState(false);
  const baseUrl = getBaseUrl();

  // Function to generate market links based on platform
  const generateMarketLink = (platform: string, asset: string, chainName: string, assetAddress: string, vaultAddress?: string, vaultName?: string): string => {
    switch (platform.toLowerCase()) {
      case 'compound':
        return generateCompoundLink(asset, chainName);
      case 'aave':
        return generateAaveLink(assetAddress, chainName);
      case 'spark':
        return generateSparkLink(assetAddress, chainName);
      case 'morpho':
        return generateMorphoLink(vaultAddress || '', chainName, vaultName || '');
      default:
        return '#';
    }
  };

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

  // Function to generate Aave market links
  const generateAaveLink = (assetAddress: string, chainName: string): string => {
    const baseUrl = 'https://app.aave.com/reserve-overview/';
    
    // Chain market name mapping
    const marketMapping: Record<string, string> = {
      'Ethereum': 'proto_mainnet_v3',
      'Arbitrum': 'proto_arbitrum_v3',
      'Base': 'proto_base_v3',
      'Optimism': 'proto_optimism_v3',
      'Polygon': 'proto_polygon_v3',
      'Scroll': 'proto_scroll_v3'
    };

    const marketName = marketMapping[chainName] || 'proto_mainnet_v3';
    return `${baseUrl}?underlyingAsset=${assetAddress.toLowerCase()}&marketName=${marketName}`;
  };

  // Function to generate Spark market links
  const generateSparkLink = (assetAddress: string, chainName: string): string => {
    const baseUrl = 'https://app.spark.fi/markets';
    
    // Chain ID mapping (Spark is primarily on Ethereum)
    const chainIdMapping: Record<string, string> = {
      'Ethereum': '1'
    };

    const chainId = chainIdMapping[chainName] || '1';
    return `${baseUrl}/${chainId}/${assetAddress}`;
  };

  // Function to generate Morpho vault links
  const generateMorphoLink = (vaultAddress: string, chainName: string, vaultName: string): string => {
    const baseUrl = 'https://app.morpho.org';
    
    // Chain network mapping
    const networkMapping: Record<string, string> = {
      'Ethereum': 'ethereum',
      'Base': 'base',
      'Polygon': 'polygon',
      'Unichain': 'unichain'
    };

    const network = networkMapping[chainName] || 'ethereum';
    // Convert vault name to URL-friendly format (lowercase, spaces to hyphens)
    const urlFriendlyName = vaultName.toLowerCase().replace(/\s+/g, '-');
    
    return `${baseUrl}/${network}/vault/${vaultAddress}/${urlFriendlyName}`;
  };

  // Use useFetchData hook to fetch rates data
  const {
    data: ratesData,
    loading,
    error,
    reFetchData,
  } = useFetchData<ApiResponse>(`${baseUrl}/api/sending-alerts/test`, {}, 'Failed to load rates data. Please try again later.');

  // Transform all platform data when rates data changes
  useEffect(() => {
    if (ratesData) {
      const allTransformedRates: MarketRate[] = [];

      // Transform Compound data
      if (ratesData.compoundAprs) {
        const compoundRates = ratesData.compoundAprs
          .filter((rate: any) => rate.asset !== 'Unknown') // Exclude Unknown assets
          .map((rate: any) => ({
            platform: 'Compound',
            chainName: rate.chainName,
            asset: rate.asset,
            earnRate: rate.netEarnAPY,
            borrowRate: rate.netBorrowAPY,
            marketLink: generateMarketLink('compound', rate.asset, rate.chainName, rate.assetAddress)
          }));
        allTransformedRates.push(...compoundRates);
      }

      // Transform Aave data
      if (ratesData.aaveAprs) {
        const aaveRates = ratesData.aaveAprs
          .filter((rate: any) => rate.asset !== 'Unknown') // Exclude Unknown assets
          .map((rate: any) => ({
            platform: 'Aave',
            chainName: rate.chainName,
            asset: rate.asset,
            earnRate: rate.netEarnAPY,
            borrowRate: rate.netBorrowAPY,
            marketLink: generateMarketLink('aave', rate.asset, rate.chainName, rate.assetAddress)
          }));
        allTransformedRates.push(...aaveRates);
      }

      // Transform Spark data
      if (ratesData.sparkAprs) {
        const sparkRates = ratesData.sparkAprs
          .filter((rate: any) => rate.asset !== 'Unknown') // Exclude Unknown assets
          .map((rate: any) => ({
            platform: 'Spark',
            chainName: rate.chainName,
            asset: rate.asset,
            earnRate: rate.netEarnAPY,
            borrowRate: rate.netBorrowAPY,
            marketLink: generateMarketLink('spark', rate.asset, rate.chainName, rate.assetAddress)
          }));
        allTransformedRates.push(...sparkRates);
      }

      // Transform Morpho data
      if (ratesData.morphoVaults) {
        const morphoRates = ratesData.morphoVaults
          .filter((rate: any) => rate.asset !== 'Unknown') // Exclude Unknown assets
          .map((rate: any) => ({
            platform: 'Morpho',
            chainName: rate.chainName,
            asset: rate.asset,
            earnRate: rate.netEarnAPY,
            borrowRate: rate.netBorrowAPY,
            marketLink: generateMarketLink('morpho', rate.asset, rate.chainName, rate.assetAddress, rate.vaultAddress, rate.vaultName),
            vaultName: rate.vaultName
          }));
        allTransformedRates.push(...morphoRates);
      }
      
      setAllRates(allTransformedRates);
    }
  }, [ratesData]);

  // Filter rates by platform
  useEffect(() => {
    if (platformFilter === 'all') {
      setFilteredRates(allRates);
      setShowMorphoColumns(allRates.some(rate => rate.platform === 'Morpho'));
    } else {
      setFilteredRates(allRates.filter(rate => rate.platform.toLowerCase() === platformFilter.toLowerCase()));
      setShowMorphoColumns(platformFilter.toLowerCase() === 'morpho');
    }
  }, [allRates, platformFilter]);

  return (
    <div className="max-w-7xl mx-auto px-2 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-theme-primary">DeFi Rates Debug</h1>
          <p className="text-theme-muted">
            Debug page to view and cross-verify rates from various DeFi platforms including Compound, Aave, Spark, and Morpho.
          </p>
        </div>

        <div className="flex gap-2">
          <Select onValueChange={setPlatformFilter} defaultValue="all">
            <SelectTrigger className="w-[180px] border-theme-border-primary">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent className="bg-block">
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="all">All Platforms</SelectItem>
              </div>
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="compound">Compound</SelectItem>
              </div>
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="aave">Aave</SelectItem>
              </div>
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="spark">Spark</SelectItem>
              </div>
              <div className="hover-border-primary hover-text-primary">
                <SelectItem value="morpho">Morpho</SelectItem>
              </div>
            </SelectContent>
          </Select>

          <Button
            onClick={reFetchData}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary-color text-primary-text border border-transparent rounded-lg hover-border-body"
          >
            <RefreshCw size={16} className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} /> 
            Refresh Rates
          </Button>
        </div>
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
                  {showMorphoColumns && (
                    <TableHead className="w-[180px] text-left">Vault Name</TableHead>
                  )}
                  <TableHead className="w-[120px] text-center">Earn Rate (%)</TableHead>
                  <TableHead className="w-[120px] text-center">Borrow Rate (%)</TableHead>
                  <TableHead className="w-[120px] text-center">Market Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRates.length > 0 ? (
                  filteredRates.map((rate, index) => (
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
                      {showMorphoColumns && (
                        <TableCell className="text-theme-primary">
                          {rate.vaultName || '-'}
                        </TableCell>
                      )}
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
                    <TableCell colSpan={showMorphoColumns ? 7 : 6} className="h-24 text-center">
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
      {filteredRates.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Total Markets</h3>
            <p className="text-2xl font-bold text-primary-color">{filteredRates.length}</p>
          </div>
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Highest Earn Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...filteredRates.map((r: MarketRate) => r.earnRate)).toFixed(2)}%
            </p>
          </div>
          <div className="p-4 bg-block border border-primary-color rounded-lg">
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Lowest Borrow Rate</h3>
            <p className="text-2xl font-bold text-red-600">
              {Math.min(...filteredRates.map((r: MarketRate) => r.borrowRate)).toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
