import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem } from '@/components/ui/sections/DisclosureList';
import InlineCard from '@/components/ui/sections/InlineCard';
import MarkdownContent from '@/components/ui/sections/MarkdownContent';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import TimelineRow from '@/components/ui/sections/TimelineRow';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import type { TariffCitation, TariffChapterPrototype, TariffEngineeringContent } from '@/types/tariff-chapter-prototype';
import { parseChapterBodyMarkdown } from '@/util/parse-markdown';
import React from 'react';

// Approach 2 tariff-engineering page (issue #1770): the documents and rules
// required, per line, and the legal levers that lower the duty — each tied to
// the regulation or schedule text that creates it. A summary table of the
// levers (what each saves) comes first and links to each lever's card, where
// the conditions are folded away.

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
        <TextLink key={c.label} href={c.url} size="xs" wrap>
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
      {/* The page H1 and the "Rates as of" date are rendered by the ChapterArticle shell. */}
      <Stack gap="md">
        <Text size="xs" tone="muted">
          Regulations as of {formatDate(engineering.regulationsAsOf)} (eCFR)
          {content.tariffUpdates ? ` · tariff schedule ${content.tariffUpdates.now.edition}` : ''}
        </Text>
        <MarkdownContent variant="body" html={parseChapterBodyMarkdown(engineering.intro)} />
      </Stack>

      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Legal ways to pay less
            </SectionHeading>
            <Text size="sm" tone="muted">
              Each one is written into the tariff schedule or customs regulations — and each depends on a document. Select one for who it applies to, the
              document and what to watch out for.
            </Text>
          </Stack>
          <TableScroll>
            <DataTable>
              <TableHead look="plain">
                <TableRow>
                  <TableHeaderCell width="wide">Way to pay less</TableHeaderCell>
                  <TableHeaderCell width="wide">What it saves</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {engineering.levers.map((lever) => (
                  <TableRow key={lever.id}>
                    <TableCell>
                      <TextLink href={`#${lever.id}`} wrap>
                        {lever.title}
                      </TextLink>
                    </TableCell>
                    <TableCell>{lever.saves}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </DataTable>
          </TableScroll>
        </Stack>
      </CardSection>

      <Stack as="section" gap="lg">
        {engineering.levers.map((lever) => (
          <InlineCard key={lever.id} id={lever.id} surface="card" padding="spacious">
            <Stack gap="md">
              <Heading as="h3" size="lg" tone="white">
                {lever.title}
              </Heading>
              <Text size="sm">
                <Text as="span" size="sm" tone="muted">
                  Saves:{' '}
                </Text>
                <Text as="span" size="sm" weight="semibold" tone="white">
                  {lever.saves}
                </Text>
              </Text>
              {/* The long conditions fold away; they stay in the HTML. */}
              <DisclosureItem look="inline" summary="Who it applies to, documents and what to watch out for">
                <Stack gap="md">
                  <DefinitionList
                    look="fields"
                    columns="1"
                    items={[
                      { term: 'Applies to', definition: lever.appliesTo },
                      { term: 'Document', definition: lever.document },
                      { term: <StatusBadge variant="warning" size="sm" label="Watch out" />, definition: lever.caveat },
                    ]}
                  />
                  {lever.provisions && (
                    <TableScroll>
                      <DataTable>
                        <TableHead look="plain">
                          <TableRow>
                            <TableHeaderCell>Provision</TableHeaderCell>
                            <TableHeaderCell>Rate</TableHeaderCell>
                            <TableHeaderCell width="wide">Covers</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <tbody>
                          {lever.provisions.map((p) => (
                            <TableRow key={p.code}>
                              <TableCell variant="code" tone="primary">
                                {p.code}
                              </TableCell>
                              <TableCell variant="rate">{p.rate}</TableCell>
                              <TableCell>{p.text}</TableCell>
                            </TableRow>
                          ))}
                        </tbody>
                      </DataTable>
                    </TableScroll>
                  )}
                </Stack>
              </DisclosureItem>
              <Citations citations={lever.citations} />
            </Stack>
          </InlineCard>
        ))}
      </Stack>

      <Stack as="section" gap="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              Documents and rules by product group
            </SectionHeading>
            <Text size="sm" tone="muted">
              Who clears the goods at the border, and the regulation that says what they need.
            </Text>
          </Stack>
          <div>
            {engineering.groups.map((group) => (
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

      <Text size="xs" tone="muted">
        {engineering.disclaimer}
      </Text>
    </Stack>
  );
}
