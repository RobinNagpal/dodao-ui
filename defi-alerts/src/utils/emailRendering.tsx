import { AlertWithAllDetails } from '@/types/alerts';
import { utils } from 'ethers';
import { Alert } from '@prisma/client';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';

/**
 * Utility functions for rendering React components to HTML strings for emails
 */

/**
 * Helper functions for generating HTML for email images
 */

/**
 * Generates HTML for an asset image
 */
export function getAssetImageHtml(chain: string, assetAddress: string, assetSymbol: string): string {
  try {
    const checksummed = utils.getAddress(assetAddress.toLowerCase());

    // Build primary TrustWallet URL
    const primaryUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${checksummed}/logo.png`;

    // Check for override URL
    const override = getOverrideUrl(chain, checksummed);
    const imageUrlToUse = override === null ? primaryUrl : override;

    return `<img src="${imageUrlToUse}" alt="${assetSymbol}" width="20" height="20" style="display:inline; vertical-align:middle;" />`;
  } catch (error) {
    // Fallback to a colored div with the first letter of the token symbol
    return `<span style="display:inline-flex; align-items:center; justify-content:center; background-color:#ffffff; color:#000000; border-radius:50%; font-weight:600; width:20px; height:20px; font-size:12px; vertical-align:middle;">${assetSymbol.charAt(
      0
    )}</span>`;
  }
}

/**
 * Generates HTML for a chain image
 */
export function getChainImageHtml(chain: string): string {
  const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/info/logo.png`;

  if (chain.toLowerCase() === 'unichain') {
    return `<span style="display:inline-flex; align-items:center; justify-content:center; background-color:#ffffff; border-radius:50%; padding:1px; width:20px; height:20px; vertical-align:middle;">
      <svg viewBox="0 0 116 115" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
        <path d="M115.476 56.406C84.3089 56.406 59.07 31.1416 59.07 0H56.8819V56.406H0.47583V58.594C31.6429 58.594 56.8819 83.8584 56.8819 115H59.07V58.594H115.476V56.406Z" fill="#fc0fa4" />
      </svg>
    </span>`;
  }

  return `<img src="${imageUrl}" alt="${chain}" width="20" height="20" style="display:inline; vertical-align:middle;" onerror="this.outerHTML='<span style=\\"display:inline-flex;align-items:center;justify-content:center;background-color:#ffffff;color:#000000;border-radius:50%;font-weight:600;width:20px;height:20px;font-size:12px;vertical-align:middle\\">${chain.charAt(
    0
  )}</span>'" />`;
}

/**
 * Generates HTML for a platform image
 */
export function getPlatformImageHtml(platform: string): string {
  // For email, we need to use absolute URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://defi-alerts.dodao.io';
  const imageUrl = `${baseUrl}/${platform.toLowerCase()}.svg`;

  return `<img src="${imageUrl}" alt="${platform} logo" width="20" height="20" style="display:inline; vertical-align:middle;" onerror="this.outerHTML='<span style=\\"display:inline-flex;align-items:center;justify-content:center;background-color:#007bff;color:#ffffff;border-radius:50%;width:20px;height:20px;font-size:10px;vertical-align:middle\\">${platform.charAt(
    0
  )}</span>'" />`;
}

/**
 * Renders an alerts table for email
 */
export function renderAlertsTableForEmail(alertObject: AlertWithAllDetails, triggeredValues: AlertTriggerValuesInterface[]): string {
  // Create a simple table with the alert information
  const tableHtml = `
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; border:1px solid #e5e7eb;">
      <thead>
        <tr>
          <th style="background-color:#f3f4f6; color:#374151; padding:12px; text-align:left; font-weight:600; font-size:14px; border-bottom:1px solid #e5e7eb;">Alert Type</th>
          <th style="background-color:#f3f4f6; color:#374151; padding:12px; text-align:left; font-weight:600; font-size:14px; border-bottom:1px solid #e5e7eb;">Asset/Chain</th>
          <th style="background-color:#f3f4f6; color:#374151; padding:12px; text-align:left; font-weight:600; font-size:14px; border-bottom:1px solid #e5e7eb;">Triggered Condition</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:12px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;">
            <div style="display:flex; flex-direction:column;">
              <span style="color:#1f2937; font-weight:600;">${alertObject.actionType === 'SUPPLY' ? 'Supply' : 'Borrow'}</span>
              <span style="font-size:12px; color:#6b7280;">${
                alertObject.category === 'PERSONALIZED' ? alertObject.walletAddress || 'Personal' : 'General'
              }</span>
            </div>
          </td>
          <td style="padding:12px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;">
            ${renderAssetChainInfo(alertObject.selectedChains || [], alertObject.selectedAssets || [])}
          </td>
          <td style="padding:12px; border-bottom:1px solid #e5e7eb; font-size:14px; color:#374151;">
            ${renderTriggeredValues(alertObject, triggeredValues)}
          </td>
        </tr>
      </tbody>
    </table>
  `;

  return tableHtml;
}

/**
 * Renders asset and chain information for email
 */
function renderAssetChainInfo(chains: any[], assets: any[]): string {
  if (!chains || chains.length === 0 || !assets || assets.length === 0) {
    return '<span style="color:#6b7280;">No chain/asset data</span>';
  }

  // Display up to 3 assets and chains
  const displayedAssets = assets.slice(0, 3);
  const displayedChains = chains.slice(0, 3);

  const hasMoreAssets = assets.length > 3;
  const hasMoreChains = chains.length > 3;

  let html = '<div style="display:flex; flex-direction:column; gap:8px;">';

  // Assets section
  html += '<div>';
  html += '<span style="font-weight:600; margin-right:8px;">Assets:</span>';
  html += '<div style="display:flex; align-items:center; gap:4px;">';

  displayedAssets.forEach((asset, index) => {
    if (asset.address && asset.symbol) {
      const chain = asset.chain || chains[0]?.name || 'ethereum';
      html += `<div style="display:inline-flex; align-items:center;">`;

      try {
        const checksummed = utils.getAddress(asset.address.toLowerCase());
        const primaryUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.toLowerCase()}/assets/${checksummed}/logo.png`;
        const override = getOverrideUrl(chain, checksummed);
        const imageUrlToUse = override === null ? primaryUrl : override;

        html += `<img src="${imageUrlToUse}" alt="${asset.symbol}" width="20" height="20" style="display:inline; vertical-align:middle;" />`;
      } catch (error) {
        html += `<span style="display:inline-flex; align-items:center; justify-content:center; background-color:#ffffff; color:#000000; border-radius:50%; font-weight:600; width:20px; height:20px; font-size:12px; vertical-align:middle;">${asset.symbol.charAt(
          0
        )}</span>`;
      }

      html += `<span style="margin-left:4px; font-size:14px;">${asset.symbol}</span>`;
      if (index < displayedAssets.length - 1) {
        html += `<span style="margin:0 4px;">,</span>`;
      }
      html += `</div>`;
    }
  });

  if (hasMoreAssets) {
    html += `<span style="font-size:12px; color:#6b7280;">+${assets.length - 3} more</span>`;
  }

  html += '</div></div>';

  // Chains section
  html += '<div>';
  html += '<span style="font-weight:600; margin-right:8px;">Chains:</span>';
  html += '<div style="display:flex; align-items:center; gap:4px;">';

  displayedChains.forEach((chain, index) => {
    html += `<div style="display:inline-flex; align-items:center;">`;

    const imageUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chain.name.toLowerCase()}/info/logo.png`;
    html += `<img src="${imageUrl}" alt="${
      chain.name
    }" width="20" height="20" style="display:inline; vertical-align:middle;" onerror="this.outerHTML='<span style=\\"display:inline-flex;align-items:center;justify-content:center;background-color:#ffffff;color:#000000;border-radius:50%;font-weight:600;width:20px;height:20px;font-size:12px;vertical-align:middle\\">${chain.name.charAt(
      0
    )}</span>'" />`;

    html += `<span style="margin-left:4px; font-size:14px;">${chain.name}</span>`;
    if (index < displayedChains.length - 1) {
      html += `<span style="margin:0 4px;">,</span>`;
    }
    html += `</div>`;
  });

  if (hasMoreChains) {
    html += `<span style="font-size:12px; color:#6b7280;">+${chains.length - 3} more</span>`;
  }

  html += '</div></div>';

  html += '</div>';

  return html;
}

/**
 * Renders triggered values for email
 */
function renderTriggeredValues(alert: Alert, triggeredValues: AlertTriggerValuesInterface[]): string {
  if (!triggeredValues || triggeredValues.length === 0) {
    return '<div style="color:#666666;">No trigger values available</div>';
  }

  let html = '<div style="display:flex; flex-direction:column; gap:8px;">';

  triggeredValues.forEach((triggerValue, index) => {
    const { condition, severity } = triggerValue;

    html += `<div style="margin-bottom:8px; padding:8px; background-color:#f8f9fa; border-radius:4px;">`;
    html += `<span style="font-weight:600; color:#333333;">`;

    // Add condition message
    html += renderConditionMessage(alert, triggerValue);

    // Add severity badge if present
    if (severity) {
      const bgColor = getSeverityColor(severity);
      html += `<span style="display:inline-block; padding:2px 8px; border-radius:4px; background-color:${bgColor}; color:#ffffff; margin-left:8px; font-size:12px;">${severity}</span>`;
    }

    html += `</span>`;
    html += `</div>`;
  });

  html += '</div>';

  return html;
}

/**
 * Renders condition message for email
 */
function renderConditionMessage(alert: Alert, triggerValue: AlertTriggerValuesInterface): string {
  const { isComparison, condition, chainName, asset, currentRate, compoundRate, protocolRate, diff, protocol } = triggerValue;
  const actionType = alert.actionType;

  // Format threshold values
  const formatThresholdValue = (threshold: number | { low: number; high: number }) => {
    if (typeof threshold === 'number') {
      return threshold.toFixed(2);
    } else {
      return `${threshold.low.toFixed(2)}–${threshold.high.toFixed(2)}`;
    }
  };

  if (isComparison) {
    switch (condition.type) {
      case 'RATE_DIFF_ABOVE':
        return `Alert when ${actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is ${
          actionType === 'SUPPLY' ? 'more(better earnings)' : 'more(higher cost)'
        } on compound by ${formatThresholdValue(condition.threshold)} compared to ${protocol || ''}. Current difference: ${diff}`;
      case 'RATE_DIFF_BELOW':
        return `Alert when ${actionType === 'SUPPLY' ? 'supply' : 'borrow'} rate is ${
          actionType === 'BORROW' ? 'less(better cost)' : 'more(better earnings)'
        } on compound by ${formatThresholdValue(condition.threshold)} compared to ${protocol || ''}. Current difference: ${diff}`;
      default:
        return `Comparison between compound (${compoundRate}) and ${protocol || ''} (${protocolRate}) with difference of ${diff}`;
    }
  } else {
    const platform = protocol || 'compound';

    switch (condition.type) {
      case 'APR_RISE_ABOVE':
        return `Alert when ${platform} ${actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR rises above ${formatThresholdValue(condition.threshold)} ${
          actionType === 'SUPPLY' ? '(better earning opportunity)' : '(higher borrowing cost)'
        }. Current rate: ${currentRate}`;
      case 'APR_FALLS_BELOW':
        return `Alert when ${platform} ${actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR falls below ${formatThresholdValue(condition.threshold)} ${
          actionType === 'SUPPLY' ? '(worse earning opportunity)' : '(better borrowing rate)'
        }. Current rate: ${currentRate}`;
      case 'APR_OUTSIDE_RANGE':
        return `Alert when ${platform} ${actionType === 'SUPPLY' ? 'supply' : 'borrow'} APR moves outside the range of ${formatThresholdValue(
          condition.threshold
        )} ${actionType === 'SUPPLY' ? '(significant change in earning opportunity)' : '(significant change in borrowing cost)'}. Current rate: ${currentRate}`;
      default:
        return `${platform} APR for ${asset} on ${chainName} is ${currentRate}`;
    }
  }
}

/**
 * Helper function to get color for severity
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'HIGH':
      return '#ef4444';
    case 'MEDIUM':
      return '#f59e0b';
    case 'LOW':
      return '#10b981';
    default:
      return '#6b7280';
  }
}

/**
 * Helper function to get override URL for asset images
 */
function getOverrideUrl(chain: string, checksummed: string): string | null {
  const lcChain = chain.toLowerCase();
  const key = `${lcChain}-${checksummed}`;

  const overrides: Record<string, string> = {
    'ethereum-0xdAC17F958D2ee523a2206206994597C13D831ec7': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'optimism-0x94b008aA00579c1307B0EF2c499aD98a8ce58e58': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'polygon-0xc2132D05D31c914a87C6611C10748AEb04B58e8F': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/assets/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9/logo.png`,
    'optimism-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'base-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'arbitrum-0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'unichain-0x4200000000000000000000000000000000000006': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png`,
    'unichain-0x078D782b760474a361dDA0AF3839290b0EF57AD6': `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png`,
    'mantle-0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34': `https://defi-alerts.dodao.io/USDe.svg`,
  };

  return overrides[key] ?? null;
}
