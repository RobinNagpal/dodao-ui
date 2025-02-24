import InvestmentSectors from '@/app/investment-sectors/InvestmentSectors';
import { themeColors } from '@/util/theme-colors';
import React from 'react';
import styles from './InvestmentSectors.module.scss';

export default function Page() {
  return (
    <div className={styles.investmentSectorsContainer} style={{ ...themeColors }}>
      <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
        <InvestmentSectors />
      </div>
    </div>
  );
}
