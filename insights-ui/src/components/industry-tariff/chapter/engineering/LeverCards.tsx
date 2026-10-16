import DefinitionList from '@/components/ui/DefinitionList';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import ShowAt from '@/components/ui/containers/ShowAt';
import Stack from '@/components/ui/containers/Stack';
import CardSection from '@/components/ui/sections/CardSection';
import { DisclosureItem } from '@/components/ui/sections/DisclosureList';
import InlineCard from '@/components/ui/sections/InlineCard';
import SectionHeading from '@/components/ui/sections/SectionHeading';
import { DataTable, TableCell, TableHead, TableHeaderCell, TableRow, TableScroll } from '@/components/ui/tables/DataTable';
import { StackedRow, StackedRowList } from '@/components/ui/tables/StackedRowList';
import type { TariffCitation, TariffEngineeringLever } from '@/types/tariff-chapter-prototype';
import React from 'react';

// "Legal ways to pay less": a boxed summary table of the levers (what each saves, linking to its
// card), then one card per lever with its conditions folded away and its citations. Shared by the
// import duty-saving rules page and the export rules page.

export function Citations({ citations }: { citations: TariffCitation[] }): React.JSX.Element {
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

interface LeverCardsProps {
  levers: TariffEngineeringLever[];
  heading: string;
  caption: string;
  /** Column header for the lever titles in the summary table. */
  leverColumn?: string;
}

export default function LeverCards({ levers, heading, caption, leverColumn = 'Way to pay less' }: LeverCardsProps): React.JSX.Element {
  return (
    <>
      <CardSection padding="roomy" bordered>
        <Stack gap="lg">
          <Stack gap="xs">
            <SectionHeading as="h2" size="lg" weight="bold" tone="heading">
              {heading}
            </SectionHeading>
            <Text size="sm" tone="muted">
              {caption}
            </Text>
          </Stack>
          <ShowAt range="lg-up">
            <TableScroll>
              <DataTable>
                <TableHead look="plain">
                  <TableRow>
                    <TableHeaderCell width="wide">{leverColumn}</TableHeaderCell>
                    <TableHeaderCell width="wide">What it saves</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {levers.map((lever) => (
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
          </ShowAt>
          {/* Phones: two wide columns would cut "What it saves" off at the edge, so each way becomes a
              list item with what it saves underneath. */}
          <ShowAt range="below-lg">
            <StackedRowList>
              {levers.map((lever) => (
                <StackedRow
                  key={lever.id}
                  label={
                    <Stack gap="xs">
                      <TextLink href={`#${lever.id}`} wrap>
                        {lever.title}
                      </TextLink>
                      <Text as="span" size="sm">
                        {lever.saves}
                      </Text>
                    </Stack>
                  }
                />
              ))}
            </StackedRowList>
          </ShowAt>
        </Stack>
      </CardSection>

      <Stack as="section" gap="lg">
        {levers.map((lever) => (
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
    </>
  );
}
