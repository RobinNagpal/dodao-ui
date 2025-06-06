import { AlertWithAllDetails } from '@/types/alerts';
import { AlertTriggerValuesInterface } from '@/types/prismaTypes';
import { formatWalletAddress } from '@/utils/getFormattedWalletAddress';
import { toSentenceCase } from '@/utils/getSentenceCase';
import React from 'react';
import TriggerValuesCellEmail from './TriggerValuesCellEmail';

export interface AlertsTableEmailProps {
  alert: AlertWithAllDetails;
  triggeredValues: AlertTriggerValuesInterface[];
}

/**
 * Component for rendering a compact table of alerts for email
 * Shows alert type at the top and each AlertTriggerValuesInterface as a separate row with detailed condition information
 */

function AlertsTableEmail({ alert, triggeredValues }: AlertsTableEmailProps) {
  if (!alert || !triggeredValues || triggeredValues.length === 0) {
    return <div style={{ color: '#666666' }}>No alert data available</div>;
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

  // Alert info section styles
  const alertInfoStyle = {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '16px',
  };

  return (
    <div>
      <table style={tableStyle}>
        <tbody>
          {triggeredValues.map((triggerValue, index) => (
            <tr key={index}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <TriggerValuesCellEmail alert={alert} triggerValues={[triggerValue]} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlertsTableEmail;
