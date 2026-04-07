export type NullableNumber = number | null;

// Helper to format regular numbers with commas
export function formatNumber(value: NullableNumber, decimals: number = 2): string {
  if (value === null) return 'N/A';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Helper to format volume numbers with commas (no decimals)
export function formatVolume(value: NullableNumber): string {
  if (value === null) return 'N/A';
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  });
}

// Helper to format percentage from decimal
export function formatPercentageDecimal(value: NullableNumber): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
}

// Helper to format currency
export function formatCurrency(value: NullableNumber, currency: string | null, decimals: number = 2): string {
  if (value === null) return 'N/A';
  // Only show currency prefix if it's not USD (USD is the default, so we don't show it)
  const currencyPrefix = currency && currency !== 'USD' ? `${currency} ` : '';
  return `${currencyPrefix}${formatNumber(value, decimals)}`;
}
