import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffCitation, TariffChapterPrototype, TariffEngineeringContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Approach 2 tariff-engineering page (issue #1770): the documents and rules
// required, per line, and the legal levers that lower the duty — each tied to
// the regulation or schedule text that creates it.

interface ChapterTariffEngineeringApproach2Props {
  content: TariffChapterPrototype;
  engineering: TariffEngineeringContent;
}

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function Citations({ citations }: { citations: TariffCitation[] }): React.JSX.Element {
  return (
    <Stack direction="row" gap="md" wrap>
      {citations.map((c) => (
        <TextLink key={c.label} href={c.url} size="xs">
          {c.label} ↗
        </TextLink>
      ))}
    </Stack>
  );
}

export default function ChapterTariffEngineeringApproach2({ content, engineering }: ChapterTariffEngineeringApproach2Props): React.JSX.Element {
  const ruleById = new Map(engineering.rules.map((r) => [r.id, r]));

  return (
    <Stack gap="2xl">
      {/* The page H1 is rendered by the ChapterArticle shell from `engineering.h1`. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Regulations as of {formatDate(engineering.regulationsAsOf)} (eCFR) · tariff schedule {content.tariffUpdates?.now.edition ?? ''} · last checked{' '}
          {formatDate(engineering.lastCheckedAt)}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(engineering.intro)} />
      </Stack>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Legal ways to pay less</SectionHeading>
            <Text size="sm" tone="muted">
              Each one is written into the tariff schedule or customs regulations — and each depends on a document.
            </Text>
          </Stack>
          <Stack gap="md">
            {engineering.levers.map((lever) => (
              <InlineCard key={lever.id} padding="roomy">
                <Stack gap="sm">
                  <Heading as="h3" size="md" tone="white">
                    {lever.title}
                  </Heading>
                  <Text size="sm" weight="semibold">
                    Saves: {lever.saves}
                  </Text>
                  <Text size="sm" tone="muted">
                    Applies to: {lever.appliesTo}
                  </Text>
                  <Text size="sm">Document: {lever.document}</Text>
                  {lever.provisions && (
                    <TableScroll>
                      <DataTable>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Provision</TableHeaderCell>
                            <TableHeaderCell>Rate</TableHeaderCell>
                            <TableHeaderCell width="wide">Covers</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <tbody>
                          {lever.provisions.map((p) => (
                            <TableRow key={p.code}>
                              <TableCell variant="code">{p.code}</TableCell>
                              <TableCell variant="rate">{p.rate}</TableCell>
                              <TableCell>{p.text}</TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </DataTable>
                    </TableScroll>
                  )}
                  <Text size="xs" tone="muted">
                    Watch out: {lever.caveat}
                  </Text>
                  <Citations citations={lever.citations} />
                </Stack>
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <CardSection padding="normal">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2">Documents and rules by product group</SectionHeading>
            <Text size="sm" tone="muted">
              Who clears the animals at the border, and the regulation that says what they need.
            </Text>
          </Stack>
          <Stack gap="md">
            {engineering.groups.map((group) => (
              <InlineCard key={group.heading} padding="cozy">
                <Stack gap="sm">
                  <Text size="sm" weight="semibold" tone="white">
                    {group.heading} {group.label}
                  </Text>
                  {group.ruleIds.map((id) => {
                    const rule = ruleById.get(id);
                    return rule ? (
                      <Stack key={id} gap="xxs">
                        <Text size="sm">
                          {rule.agency} — {rule.title}
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
              </InlineCard>
            ))}
          </Stack>
        </Stack>
      </CardSection>

      <Text size="xs" tone="muted">
        {engineering.disclaimer}
      </Text>
    </Stack>
  );
}
