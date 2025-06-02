'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle } from 'lucide-react';
import {
  type SupplyRow,
  type BorrowRow,
  type ComparisonRow,
  type ConditionType,
  type SeverityLevel,
  type NotificationFrequency,
  severityOptions,
  frequencyOptions,
} from '@/types/alerts';
import { toSentenceCase } from '@/utils/getSentenceCase';

interface PositionSettingsCardProps {
  title: string;
  description: string;
  rows: SupplyRow[] | BorrowRow[] | ComparisonRow[];
  updateRow: <K extends keyof any>(idx: number, field: K, val: any) => void;
  errors?: {
    conditions?: string[];
    supplyThresholds?: string[];
    borrowThresholds?: string[];
  };
  conditionOptions?: { value: string; label: string }[];
  isComparisonCard?: boolean;
  thresholdLabel?: string;
}

export default function PositionSettingsCard({
  title,
  description,
  rows,
  updateRow,
  errors,
  conditionOptions,
  isComparisonCard = false,
  thresholdLabel = 'Threshold',
}: PositionSettingsCardProps) {
  return (
    <Card className="mb-6 border-theme-primary bg-block border-primary-color">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg text-theme-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-theme-muted mb-4">{description}</p>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-primary-color">
                {isComparisonCard && <TableHead className="text-theme-primary">Platform</TableHead>}
                <TableHead className="text-theme-primary">Chain</TableHead>
                <TableHead className="text-theme-primary">Market</TableHead>
                <TableHead className="text-theme-primary">Rate</TableHead>
                {!isComparisonCard && <TableHead className="text-theme-primary">Condition</TableHead>}
                <TableHead className="text-theme-primary">{thresholdLabel}</TableHead>
                <TableHead className="text-theme-primary">Severity</TableHead>
                <TableHead className="text-theme-primary">Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i} className="border-primary-color">
                  {isComparisonCard && <TableCell className="text-theme-primary">{toSentenceCase((r as ComparisonRow).platform)}</TableCell>}
                  <TableCell className="text-theme-primary">{r.chain}</TableCell>
                  <TableCell className="text-theme-primary">{r.market}</TableCell>
                  <TableCell className="text-theme-primary">{r.rate}</TableCell>

                  {!isComparisonCard && (
                    <TableCell>
                      <Select
                        value={(r as SupplyRow | BorrowRow).conditionType}
                        onValueChange={(value) => updateRow(i, 'conditionType', value as ConditionType)}
                      >
                        <SelectTrigger className="w-full hover-border-primary">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent className="bg-block">
                          {conditionOptions?.map((opt) => (
                            <div key={opt.value} className="hover-border-primary hover-text-primary">
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}

                  <TableCell>
                    {!isComparisonCard && (r as SupplyRow | BorrowRow).conditionType === 'APR_OUTSIDE_RANGE' ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          placeholder="Min"
                          value={(r as SupplyRow | BorrowRow).thresholdLow || ''}
                          onChange={(e) => updateRow(i, 'thresholdLow', e.target.value)}
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                          }`}
                        />
                        <Input
                          type="text"
                          placeholder="Max"
                          value={(r as SupplyRow | BorrowRow).thresholdHigh || ''}
                          onChange={(e) => updateRow(i, 'thresholdHigh', e.target.value)}
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            errors?.conditions && errors.conditions[i] ? 'border-red-500' : ''
                          }`}
                        />
                        <span className="text-theme-muted">%</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Input
                          type="text"
                          placeholder="Value"
                          value={r.threshold || ''}
                          onChange={(e) => updateRow(i, 'threshold', e.target.value)}
                          className={`w-20 border-theme-primary focus-border-primary focus:outline-none transition-colors ${
                            isComparisonCard
                              ? (errors?.supplyThresholds && errors.supplyThresholds[i]) || (errors?.borrowThresholds && errors.borrowThresholds[i])
                                ? 'border-red-500'
                                : ''
                              : errors?.conditions && errors.conditions[i]
                              ? 'border-red-500'
                              : ''
                          }`}
                        />
                        <span className="ml-2 text-theme-muted">% APR</span>
                      </div>
                    )}
                    {isComparisonCard
                      ? (errors?.supplyThresholds && errors.supplyThresholds[i] && (
                          <div className="mt-1 flex items-center text-red-500 text-sm">
                            <AlertCircle size={14} className="mr-1" />
                            <span>{errors.supplyThresholds[i]}</span>
                          </div>
                        )) ||
                        (errors?.borrowThresholds && errors.borrowThresholds[i] && (
                          <div className="mt-1 flex items-center text-red-500 text-sm">
                            <AlertCircle size={14} className="mr-1" />
                            <span>{errors.borrowThresholds[i]}</span>
                          </div>
                        ))
                      : errors?.conditions &&
                        errors.conditions[i] && (
                          <div className="mt-1 flex items-center text-red-500 text-sm">
                            <AlertCircle size={14} className="mr-1" />
                            <span>{errors.conditions[i]}</span>
                          </div>
                        )}
                  </TableCell>

                  <TableCell>
                    <Select value={r.severity} onValueChange={(value) => updateRow(i, 'severity', value as SeverityLevel)}>
                      <SelectTrigger className="w-[120px] hover-border-primary">
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent className="bg-block">
                        {severityOptions.map((opt) => (
                          <div key={opt.value} className="hover-border-primary hover-text-primary">
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell>
                    <Select value={r.frequency} onValueChange={(value) => updateRow(i, 'frequency', value as NotificationFrequency)}>
                      <SelectTrigger className="w-[140px] hover-border-primary">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-block">
                        {frequencyOptions.map((f) => (
                          <div key={f.value} className="hover-border-primary hover-text-primary">
                            <SelectItem key={f.value} value={f.value}>
                              {f.label}
                            </SelectItem>
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
