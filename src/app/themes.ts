export interface ThemeValue {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  linkColor: string;
  headingColor: string;
  borderColor: string;

  blockBg: string;
}

export enum CssTheme {
  AaveTheme = 'AaveTheme',
  ArbitrumTheme = 'ArbitrumTheme',
  BalancerTheme = 'BalancerTheme',
  CompoundTheme = 'CompoundTheme',
  CryptoGelatoTheme = 'CryptoGelatoTheme',
  FuseTheme = 'FuseTheme',
  GlobalTheme = 'GlobalTheme',
  KlerosTheme = 'KlerosTheme',
  OptimismTheme = 'OptimismTheme',
  UniswapTheme = 'UniswapTheme',
}
export type ThemeKey = keyof typeof CssTheme;

export const themes: Record<keyof typeof CssTheme, ThemeValue> = {
  AaveTheme: {
    primaryColor: '#2EBAC6',
    bgColor: '#1B2030',
    textColor: '#f1f1f3',
    linkColor: '#f1f1f3',
    headingColor: '#f1f1f3',
    borderColor: '#d1d5da',
    blockBg: '#383D51',
  },
  ArbitrumTheme: {
    primaryColor: '#1B4ADD',
    bgColor: '#0A0A0A',
    textColor: '#f8fafc',
    linkColor: '#ffffff',
    headingColor: '#ffffff',
    borderColor: '#4971E9',
    blockBg: '#11192d',
  },
  BalancerTheme: {
    primaryColor: '#3183ff',
    bgColor: '#0A0A0A',
    textColor: '#f8fafc',
    linkColor: '#ffffff',
    headingColor: '#ffffff',
    borderColor: '#0751bf',
    blockBg: '#1D2C52',
  },
  CompoundTheme: {
    primaryColor: '#00AD79',
    bgColor: '#0D131A',
    textColor: '#f1f1f3',
    linkColor: '#f1f1f3',
    headingColor: '#f1f1f3',
    borderColor: '#d1d5da',
    blockBg: '#1e202d',
  },
  CryptoGelatoTheme: {
    primaryColor: '#3183ff',
    bgColor: '#141924',
    textColor: '#bdc1c7',
    linkColor: '#bdc1c7',
    headingColor: 'white',
    borderColor: '#2f3645',
    blockBg: '#2f3645',
  },
  FuseTheme: {
    primaryColor: '#000000',
    bgColor: '#FFFFFF',
    textColor: '#000000',
    linkColor: '#333333',
    headingColor: '#000000',
    borderColor: '#BBBBBB',
    blockBg: '#EEEEEE',
  },
  GlobalTheme: {
    primaryColor: '#384aff',
    bgColor: '#ffffff',
    textColor: '#57606a',
    linkColor: '#111111',
    headingColor: '#111111',
    borderColor: '#d0d7de',
    blockBg: '#F5F9FF',
  },
  KlerosTheme: {
    primaryColor: '#4d00b4',
    bgColor: '#ffffff',
    textColor: '#000000',
    linkColor: '#000000',
    headingColor: '#4d00b4',
    borderColor: '#cccccc',
    blockBg: 'transparent',
  },
  OptimismTheme: {
    primaryColor: '#ff0420',
    bgColor: '#1e1313',
    textColor: '#f1f1f3',
    linkColor: '#f1f1f3',
    headingColor: '#f1f1f3',
    borderColor: '#fb9191',
    blockBg: '#2f2d2d',
  },
  UniswapTheme: {
    primaryColor: '#6f6cbd',
    bgColor: '#212429',
    textColor: '#c2c5ca',
    linkColor: '#ffffff',
    headingColor: '#6f6cbd',
    borderColor: '#909294',
    blockBg: '#14141c',
  },
};
