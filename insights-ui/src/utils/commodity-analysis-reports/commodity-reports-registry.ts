import { CommodityReportJson } from '@/types/commodity/commodity-analysis-types';
import gold from '@/commodity-data/reports/gold.json';
import silver from '@/commodity-data/reports/silver.json';
import platinum from '@/commodity-data/reports/platinum.json';
import palladium from '@/commodity-data/reports/palladium.json';
import copper from '@/commodity-data/reports/copper.json';
import liveCattle from '@/commodity-data/reports/live-cattle.json';
import leanHogs from '@/commodity-data/reports/lean-hogs.json';
import feederCattle from '@/commodity-data/reports/feeder-cattle.json';
import wtiCrudeOil from '@/commodity-data/reports/wti-crude-oil.json';
import brentCrudeOil from '@/commodity-data/reports/brent-crude-oil.json';
import naturalGas from '@/commodity-data/reports/natural-gas.json';
import gasolineRbob from '@/commodity-data/reports/gasoline-rbob.json';
import heatingOil from '@/commodity-data/reports/heating-oil.json';
import corn from '@/commodity-data/reports/corn.json';
import wheat from '@/commodity-data/reports/wheat.json';
import soybeans from '@/commodity-data/reports/soybeans.json';
import soybeanMeal from '@/commodity-data/reports/soybean-meal.json';
import soybeanOil from '@/commodity-data/reports/soybean-oil.json';
import coffee from '@/commodity-data/reports/coffee.json';
import sugar from '@/commodity-data/reports/sugar.json';
import cotton from '@/commodity-data/reports/cotton.json';
import cocoa from '@/commodity-data/reports/cocoa.json';

/**
 * Registry of authored commodity reports, keyed by slug.
 *
 * Report content is static JSON (no database, no LLM generation). To publish a
 * new commodity report:
 *   1. Create `src/commodity-data/reports/<slug>.json` following the
 *      `CommodityReportJson` shape (see `src/commodity-data/README.md`).
 *   2. Add one `import` above and one entry to the map below.
 *
 * Importing the JSON (rather than reading it from disk at request time) keeps the
 * content bundled with the server build, so it works identically in local dev and
 * on Vercel without any file-tracing configuration.
 */
export const COMMODITY_REPORTS: Record<string, CommodityReportJson> = {
  gold: gold as unknown as CommodityReportJson,
  silver: silver as unknown as CommodityReportJson,
  platinum: platinum as unknown as CommodityReportJson,
  palladium: palladium as unknown as CommodityReportJson,
  copper: copper as unknown as CommodityReportJson,
  'live-cattle': liveCattle as unknown as CommodityReportJson,
  'lean-hogs': leanHogs as unknown as CommodityReportJson,
  'feeder-cattle': feederCattle as unknown as CommodityReportJson,
  'wti-crude-oil': wtiCrudeOil as unknown as CommodityReportJson,
  'brent-crude-oil': brentCrudeOil as unknown as CommodityReportJson,
  'natural-gas': naturalGas as unknown as CommodityReportJson,
  'gasoline-rbob': gasolineRbob as unknown as CommodityReportJson,
  'heating-oil': heatingOil as unknown as CommodityReportJson,
  corn: corn as unknown as CommodityReportJson,
  wheat: wheat as unknown as CommodityReportJson,
  soybeans: soybeans as unknown as CommodityReportJson,
  'soybean-meal': soybeanMeal as unknown as CommodityReportJson,
  'soybean-oil': soybeanOil as unknown as CommodityReportJson,
  coffee: coffee as unknown as CommodityReportJson,
  sugar: sugar as unknown as CommodityReportJson,
  cotton: cotton as unknown as CommodityReportJson,
  cocoa: cocoa as unknown as CommodityReportJson,
};
