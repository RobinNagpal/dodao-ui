# ETF Reports — Open Questions

Running list of unresolved design / research questions for the ETF reports work.
Resolutions should be moved into `etfs.md` (or the relevant spec) once decided.

## 1) What is the comparison "base" for each ETF group?

For **equity ETFs**, we have a natural benchmark: the **S&P Global** (or S&P 500 for US-equity).
We do **not** yet have an agreed-upon base/benchmark for the other groups.

Goal: for **every group** in `etf-analysis-categories.json`, decide what the comparison base
should be — i.e. the index / reference ETF / synthetic basket that we score "alpha", relative
performance, fees, risk, and yield against.

### Specific sub-questions

- [ ] **Fixed-income ETFs** — what is the right base?
  - Candidates to evaluate: Bloomberg US Aggregate Bond (AGG / BND), ICE BofA US Treasury indices,
    Bloomberg Global Aggregate, short-term T-bill indices (SHV/BIL), or category-specific (HY, IG,
    munis, TIPS, EM debt).
  - Should the base differ by **duration bucket** (short / intermediate / long)?
  - Should the base differ by **credit quality** (treasury vs IG vs HY vs EM)?
- [ ] **Per-group base selection** — for each group in `etf-analysis-categories.json`, list:
  - Primary base (single index / ETF) used for headline comparisons.
  - Optional secondary bases (e.g. category-specific peers).
  - Rationale for the choice (liquidity, coverage, recognizability, methodology).
- [ ] **Equity sub-groups** — confirm whether "S&P Global" is right for all equity groups, or
  whether some sub-groups need a different base (e.g. region/country ETFs vs sector ETFs vs
  thematic ETFs vs factor ETFs).
- [ ] **Commodity / alternatives / crypto / multi-asset** groups — define bases (e.g. Bloomberg
  Commodity Index, gold spot, BTC spot, 60/40 benchmark) where applicable.
- [ ] **How the base is used in the report**:
  - Performance comparison windows (1y / 3y / 5y / since inception).
  - Risk metrics relative to base (beta, tracking error, max drawdown delta).
  - Yield / income comparison where relevant.
- [ ] **Storage / configuration**:
  - Where do we store the `groupKey -> base(s)` mapping? (Likely a new JSON in
    `insights-ui/src/etf-analysis-data/`.)
  - Should the mapping be versioned alongside the analysis-factors JSONs?
- [ ] **Prompt impact**:
  - How are the base(s) injected into the analysis prompts so the generated narrative compares
    against the right benchmark?
