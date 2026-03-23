import { parseMarkdown } from '@/util/parse-markdown';
import { getCountryByExchange } from '@/utils/countryExchangeUtils';
import { EvaluationResult } from '@/types/ticker-typesv1';
import type { PastPerformanceResponse } from '@/types/ticker-typesv1';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';

export interface PastPerformanceProps {
  tickerData: PastPerformanceResponse['ticker'];
  data: PastPerformanceResponse;
}

export default function PastPerformance({ tickerData, data }: PastPerformanceProps): JSX.Element | null {
  const { categoryResult } = data;

  if (!tickerData || !categoryResult) {
    return null;
  }

  const createdAtRaw = categoryResult.createdAt || tickerData.createdAt || new Date();
  const updatedAtRaw = categoryResult.updatedAt || tickerData.updatedAt || new Date();

  const publishedDate = new Date(createdAtRaw);
  const modifiedDate = new Date(updatedAtRaw);

  const formattedModifiedDate = modifiedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const ticker = tickerData.symbol;
  const exchange = tickerData.exchange;

  const industryName = tickerData.industry?.name || tickerData.industryKey;
  const subIndustryName = tickerData.subIndustry?.name;

  const country = getCountryByExchange(exchange as any);
  const locationContext = country ? `${country} stock market` : `${exchange.toUpperCase()} stock market`;
  const industryContext = subIndustryName ? `${subIndustryName} (${industryName})` : industryName;

  const analysisTitle = `${tickerData.name} (${ticker}) Past Performance Analysis`;
  const executiveSummary = `A comprehensive historical performance analysis of ${tickerData.name} (${ticker}) in the ${industryContext} within the ${locationContext}, evaluating earnings growth, revenue trends, return on equity, and other key historical metrics.`;

  const passCount = categoryResult.factorResults?.filter((fr) => fr.result === EvaluationResult.Pass).length || 0;
  const totalCount = categoryResult.factorResults?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <article className="bg-gray-900 rounded-lg shadow-sm border border-color p-6 md:p-8" itemScope itemType="https://schema.org/Article">
        <meta itemProp="datePublished" content={publishedDate.toISOString()} />

        <header className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-color mb-2" itemProp="headline">
                {tickerData.name} <span className="text-muted-foreground">({ticker})</span>
              </h1>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                  {tickerData.exchange}
                </span>
                <span className="text-muted-foreground">•</span>
                <div
                  className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: 'var(--primary-color, #3b82f6)', color: 'white' }}
                >
                  {passCount}/{totalCount}
                </div>
                <span className="text-muted-foreground">•</span>
                <time dateTime={modifiedDate.toISOString()} className="text-muted-foreground text-sm" itemProp="dateModified">
                  {formattedModifiedDate}
                </time>
              </div>
            </div>

            <Link
              href={`/stocks/${tickerData.exchange}/${tickerData.symbol}`}
              className="link-color hover:underline text-sm font-medium whitespace-nowrap flex items-center gap-1"
            >
              View Full Report →
            </Link>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <section className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Analysis Title</h2>
            <p className="text-color" itemProp="description">
              {analysisTitle}
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl font-semibold text-color mb-3">Executive Summary</h2>
            <p className="text-color leading-relaxed" itemProp="abstract">
              {executiveSummary}
            </p>
          </section>

          {categoryResult.overallAnalysisDetails && (
            <section className="mb-6" itemProp="articleBody">
              <h2 className="text-xl font-semibold text-color mb-3">Comprehensive Analysis</h2>
              <div
                className="markdown markdown-body prose-headings:text-color prose-p:text-color prose-strong:text-color prose-code:text-color prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.overallAnalysisDetails) }}
              />
            </section>
          )}

          {categoryResult.summary && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Summary</h2>
              <div
                className="markdown markdown-body prose-headings:text-color prose-p:text-color prose-strong:text-color prose-code:text-color"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(categoryResult.summary) }}
              />
            </section>
          )}

          {categoryResult.factorResults && categoryResult.factorResults.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xl font-semibold text-color mb-3">Factor Analysis</h2>
              <ul className="space-y-3 mt-2">
                {categoryResult.factorResults.map((factor) => (
                  <li key={factor.id} className="bg-gray-800 px-2 py-4 sm:p-4 rounded-md">
                    <div className="flex flex-col gap-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {factor.result === EvaluationResult.Pass ? (
                            <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                          ) : (
                            <XCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold">{factor.analysisCategoryFactor?.factorAnalysisTitle}</h3>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            factor.result === EvaluationResult.Pass ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {factor.result}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{factor.oneLineExplanation}</p>
                      <div className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(factor.detailedExplanation) }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-color">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              <span>Last updated by </span>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">KoalaGains</span>
              </span>
              <span> on </span>
              <time dateTime={modifiedDate.toISOString()} itemProp="dateModified">
                {formattedModifiedDate}
              </time>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                Stock Analysis
              </span>
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                Past Performance
              </span>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
