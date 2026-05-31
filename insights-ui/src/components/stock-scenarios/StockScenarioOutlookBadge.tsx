// Thin re-export of the shared scenario outlook badges. Kept so existing
// stock-scenario import sites keep working; see
// `@/components/ui/ScenarioOutlookBadge` for the canonical implementation.
export {
  ProbabilityBadge as StockScenarioProbabilityBadge,
  DirectionBadge as StockScenarioDirectionBadge,
  TimeframeBadge as StockScenarioTimeframeBadge,
} from '@/components/ui/ScenarioOutlookBadge';
