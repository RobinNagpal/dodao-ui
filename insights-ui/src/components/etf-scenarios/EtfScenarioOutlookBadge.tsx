// Thin re-export of the shared scenario outlook badges. Kept so existing
// etf-scenario import sites keep working; see
// `@/components/ui/ScenarioOutlookBadge` for the canonical implementation.
export {
  ProbabilityBadge as EtfScenarioProbabilityBadge,
  DirectionBadge as EtfScenarioDirectionBadge,
  TimeframeBadge as EtfScenarioTimeframeBadge,
} from '@/components/ui/ScenarioOutlookBadge';
