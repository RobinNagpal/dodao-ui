import { Citations } from '@/components/industry-tariff/chapter/engineering/LeverCards';
import Text from '@/components/ui/Text';
import Stack from '@/components/ui/containers/Stack';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import TimelineRow from '@/components/ui/sections/TimelineRow';
import type { TariffEngineeringRule } from '@/types/tariff-chapter-prototype';
import React from 'react';

// Agency rules listed per product group (heading), each with the regulation that sets it. Shared by
// the import duty-saving rules page (documents to clear the goods in) and the export rules page
// (documents to ship them out).

interface RulesByGroupProps {
  rules: TariffEngineeringRule[];
  groups: { heading: string; label: string; ruleIds: string[]; note: string | null }[];
  heading: string;
  caption: string;
}

export default function RulesByGroup({ rules, groups, heading, caption }: RulesByGroupProps): React.JSX.Element {
  const ruleById = new Map(rules.map((r) => [r.id, r]));

  return (
    <Stack as="section" gap="lg">
      <Stack gap="lg">
        <Stack gap="xs">
          <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
            {heading}
          </SectionHeading>
          <Text size="sm" tone="muted">
            {caption}
          </Text>
        </Stack>
        <div>
          {groups.map((group) => (
            <TimelineRow
              key={group.heading}
              asideWidth="wide"
              aside={
                <>
                  <Text as="span" size="base" weight="semibold" tone="primary" font="mono">
                    {group.heading}
                  </Text>
                  <Text as="span" size="base" weight="semibold" tone="white">
                    {group.label}
                  </Text>
                </>
              }
            >
              <Stack gap="md">
                {group.ruleIds.map((id) => {
                  const rule = ruleById.get(id);
                  return rule ? (
                    <Stack key={id} gap="xxs">
                      <Text size="sm">
                        <Text as="span" size="sm" weight="semibold" tone="white">
                          {rule.agency}
                        </Text>{' '}
                        — {rule.title}
                      </Text>
                      <Citations citations={rule.citations} />
                    </Stack>
                  ) : null;
                })}
                {group.note && (
                  <Text size="xs" tone="muted">
                    {group.note}
                  </Text>
                )}
              </Stack>
            </TimelineRow>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}
