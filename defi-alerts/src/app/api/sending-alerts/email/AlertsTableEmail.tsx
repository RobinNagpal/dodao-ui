import { AlertWithAllDetails } from '@/types/alerts';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { getAssetImageHtml, getChainImageHtml } from '@/utils/emailRendering';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { toSentenceCase } from '@/utils/getSentenceCase';
import React from 'react';
import TriggerValuesCellEmail from './TriggerValuesCellEmail';

export interface AlertsTableEmailProps {
  alerts: {
    alert: AlertWithAllDetails;
    triggeredValues: AlertTriggerValuesInterface[];
  }[];
}

/**
 * Component for rendering a compact table of alerts for email
 */

function AlertsTableEmail({ alerts }: AlertsTableEmailProps) {
  if (!alerts || alerts.length === 0) {
    return <div style={{ color: '#666666' }}>No alerts available</div>;
  }

  // Table styles
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '20px',
    border: '1px solid #e5e7eb',
  };

  const thStyle = {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    padding: '12px',
    textAlign: 'left' as const,
    fontWeight: 600,
    fontSize: '14px',
    borderBottom: '1px solid #e5e7eb',
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#374151',
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Alert Type</th>
          <th style={thStyle}>Chain/Asset</th>
          <th style={thStyle}>Triggered Condition</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((item, index) => {
          const { alert, triggeredValues } = item;

          return (
            <tr key={index}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#1f2937', fontWeight: 600 }}>{toSentenceCase(alert.actionType)}</span>
                  {alert.category === 'PERSONALIZED' ? (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{formatWalletAddress(alert.walletAddress!)}</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>General</span>
                  )}
                </div>
              </td>
              <td style={tdStyle}>
                <AssetChainPairCellEmail chains={alert.selectedChains || []} assets={alert.selectedAssets || []} />
              </td>
              <td style={tdStyle}>
                <TriggerValuesCellEmail alert={alert} triggerValues={triggeredValues} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Email-friendly version of AssetChainPairCell component
 */
const AssetChainPairCellEmail = ({ chains, assets }: { chains: any[]; assets: any[] }) => {
  if (!chains || chains.length === 0 || !assets || assets.length === 0) {
    return <span style={{ color: '#6b7280' }}>No chain/asset data</span>;
  }

  // Display up to 3 assets and chains
  const displayedAssets = assets.slice(0, 3);
  const displayedChains = chains.slice(0, 3);

  const hasMoreAssets = assets.length > 3;
  const hasMoreChains = chains.length > 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div>
        <span style={{ fontWeight: 600, marginRight: '8px' }}>Assets:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {displayedAssets.map((asset, index) => (
            <React.Fragment key={index}>
              {asset.address && asset.symbol && (
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {getAssetImageHtml(asset.chain || chains[0]?.name || 'ethereum', asset.address, asset.assetSymbol)}
                  <span style={{ marginLeft: '4px', fontSize: '14px' }}>{asset.symbol}</span>
                  {index < displayedAssets.length - 1 && <span style={{ margin: '0 4px' }}>,</span>}
                </div>
              )}
            </React.Fragment>
          ))}
          {hasMoreAssets && <span style={{ fontSize: '12px', color: '#6b7280' }}>+{assets.length - 3} more</span>}
        </div>
      </div>

      <div>
        <span style={{ fontWeight: 600, marginRight: '8px' }}>Chains:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {displayedChains.map((chain, index) => (
            <React.Fragment key={index}>
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                {getChainImageHtml(chain)}
                <span style={{ marginLeft: '4px', fontSize: '14px' }}>{chain.name}</span>
                {index < displayedChains.length - 1 && <span style={{ margin: '0 4px' }}>,</span>}
              </div>
            </React.Fragment>
          ))}
          {hasMoreChains && <span style={{ fontSize: '12px', color: '#6b7280' }}>+{chains.length - 3} more</span>}
        </div>
      </div>
    </div>
  );
};

export default AlertsTableEmail;
