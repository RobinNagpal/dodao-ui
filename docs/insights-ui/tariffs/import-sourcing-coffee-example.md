# Example Report — Import Sourcing Comparison: Coffee (US Buyer)

> This is an **example/illustrative report** for the proposed "Import sourcing comparison for U.S. buyers" feature in [`optional_tariff_features.md`](./optional_tariff_features.md).
> Numbers are an April 2026 snapshot for example purposes. Always confirm rates with a licensed customs broker before placing real orders.
> For tariff term definitions, see [`../tariffs/basic-concepts.md`](../tariffs/basic-concepts.md).

---

## 1. Why Coffee?

- **One of the largest U.S. food imports.** The U.S. is the world's #1 coffee importer; coffee is on almost every grocery shelf, café, and office.
- **Almost 100% imported.** The U.S. produces a tiny amount of coffee in Hawaii, Puerto Rico, and California; everything else is imported.
- **Many real source countries.** Unlike products that come mostly from one place (e.g., toys from China), coffee is sourced from 15+ countries. That makes it a very useful example for comparison.
- **Easy for any user to understand.** Unit price is well known: a pound of green coffee, retail-ground coffee, or roast-and-ground bag.

## 2. The Product and HTS Code

| HTS Code | Description | MFN Duty |
|---|---|---|
| **0901.11** | Green (unroasted) coffee, not decaffeinated | **0%** (Free) |
| 0901.12 | Green coffee, decaffeinated | 0% |
| 0901.21 | Roasted coffee, not decaffeinated | 0% |
| 0901.22 | Roasted coffee, decaffeinated | 0% |

**Key point:** Coffee enters the U.S. duty-free under MFN. The cost differences across countries come from **temporary surcharges, freight, quality, and average price per pound**, not the base tariff.

## 3. Top 5+ Source Countries for U.S. Coffee Imports

(Approximate share of U.S. green coffee imports by volume; example numbers.)

| Rank | Country | Share | Mostly | FTA with U.S.? |
|---:|---|---:|---|---|
| 1 | Brazil | ~30% | Arabica + Robusta | No |
| 2 | Colombia | ~20% | Arabica | Yes (CTPA) |
| 3 | Vietnam | ~10% | Robusta (instant) | No |
| 4 | Honduras | ~7% | Arabica | Yes (CAFTA-DR) |
| 5 | Guatemala | ~5% | Arabica | Yes (CAFTA-DR) |
| 6 | Nicaragua | ~5% | Arabica | Yes (CAFTA-DR) |
| 7 | Mexico | ~4% | Arabica | Yes (USMCA) |
| 8 | Indonesia | ~4% | Robusta + specialty | No |
| 9 | Ethiopia | ~3% | Specialty Arabica | No (AGOA-eligible) |
| 10 | Peru | ~3% | Arabica (organic) | Yes (PTPA) |

## 4. Tariff and Cost Comparison (April 2026 snapshot)

| Country | MFN | Section 301 | Section 122 (temp, expires ~Jul 24 2026) | Total extra duty |
|---|---:|---:|---:|---:|
| Brazil | 0% | 0% | 10% | **10%** |
| Colombia (CTPA) | 0% | 0% | 0% (FTA-exempt*) | **0%** |
| Vietnam | 0% | 0% | 10% | **10%** |
| Honduras (CAFTA-DR) | 0% | 0% | 0% (FTA-exempt*) | **0%** |
| Guatemala (CAFTA-DR) | 0% | 0% | 0% (FTA-exempt*) | **0%** |
| Nicaragua (CAFTA-DR) | 0% | 0% | 0% (FTA-exempt*) | **0%** |
| Mexico (USMCA) | 0% | 0% | 0% (USMCA-exempt) | **0%** |
| Indonesia | 0% | 0% | 10% | **10%** |
| Ethiopia | 0% | 0% | 10% | **10%** |
| Peru (PTPA) | 0% | 0% | 0% (FTA-exempt*) | **0%** |

*FTA exemption from temporary Section 122 surcharge depends on the executive order text; confirm with your broker for each shipment.

## 5. Average Buying Cost (Green Coffee, FOB)

These are illustrative price ranges per pound for **green (unroasted)** coffee at origin, April 2026:

| Country | Typical FOB price (USD/lb) | Typical quality |
|---|---:|---|
| Brazil | $1.80 – $2.20 | Volume Arabica, mild |
| Colombia | $2.40 – $3.00 | Premium Arabica |
| Vietnam | $1.20 – $1.60 | Robusta, instant-grade |
| Honduras | $2.20 – $2.80 | Mid-to-specialty Arabica |
| Guatemala | $2.50 – $3.20 | Specialty Arabica |
| Nicaragua | $2.20 – $2.80 | Mid-specialty Arabica |
| Mexico | $2.30 – $2.90 | Mid Arabica |
| Indonesia | $1.80 – $3.50 | Wide range (Robusta to specialty) |
| Ethiopia | $3.20 – $5.00 | Specialty Arabica |
| Peru | $2.40 – $3.10 | Organic Arabica |

## 6. Landed Cost Comparison — Worked Example

Buying **20,000 lb** (about one 20-foot container) of green Arabica coffee, mid-quality.

```
Brazil:
  Product value (20,000 lb x $2.00):  $40,000.00
  MFN duty (0%):                      $     0.00
  Section 122 (10%):                  $ 4,000.00
  Ocean freight (Santos -> NY/NJ):    $ 1,800.00
  MPF + HMF:                          $   188.64
  Insurance + handling:               $   400.00
                                       -----------
  Total LANDED:                       $46,388.64
  Cost per lb:                        $    2.32

Colombia (CTPA):
  Product value (20,000 lb x $2.60):  $52,000.00
  MFN duty (0%):                      $     0.00
  Section 122 (FTA-exempt):           $     0.00
  Ocean freight (Cartagena -> US GC): $ 1,500.00
  MPF + HMF:                          $   213.06
  Insurance + handling:               $   400.00
                                       -----------
  Total LANDED:                       $54,113.06
  Cost per lb:                        $    2.71

Honduras (CAFTA-DR):
  Product value (20,000 lb x $2.40):  $48,000.00
  MFN duty (0%):                      $     0.00
  Section 122 (FTA-exempt):           $     0.00
  Ocean freight (Puerto Cortes -> GC):$ 1,400.00
  MPF + HMF:                          $   200.06
  Insurance + handling:               $   400.00
                                       -----------
  Total LANDED:                       $50,000.06
  Cost per lb:                        $    2.50

Vietnam (Robusta only):
  Product value (20,000 lb x $1.40):  $28,000.00
  MFN duty (0%):                      $     0.00
  Section 122 (10%):                  $ 2,800.00
  Ocean freight (HCMC -> LA):         $ 2,200.00
  MPF + HMF:                          $   132.06
  Insurance + handling:               $   500.00
                                       -----------
  Total LANDED:                       $33,632.06
  Cost per lb:                        $    1.68
```

## 7. What This Tells the Buyer

- **Cheapest per pound: Vietnam.** Best for instant coffee blends and big-volume Robusta. Quality is not specialty.
- **Best Arabica value: Honduras and Brazil.** Honduras wins when Section 122 is active because it gets FTA exemption. Once Section 122 expires (~July 24, 2026), Brazil becomes more competitive again.
- **Best premium Arabica: Colombia and Guatemala.** Higher price per pound, but FTA exemption helps offset.
- **Best specialty (highest price per pound): Ethiopia.** Pays Section 122; only worth it for specialty roasters.
- **Smallest customs paperwork risk: Mexico (USMCA).** Volume is limited but quality is decent and customs is simple.

## 8. Decision Matrix — Who Should Buy from Where

| Buyer type | Best fit |
|---|---|
| Big roaster making mass-market blends | Brazil + Vietnam Robusta blend |
| Specialty roaster (single-origin café) | Colombia, Guatemala, Ethiopia |
| Private-label grocery brand | Honduras / Nicaragua (FTA + decent quality) |
| Decaf focus | Colombia, Mexico (Mountain Water decaf) |
| Organic / fair-trade brand | Peru, Honduras, Mexico |
| Instant coffee maker | Vietnam Robusta + small Brazil blend |

## 9. Caveats and Risks (Be Honest)

- **Coffee prices swing 30–60% in a year.** Frost in Brazil, drought in Vietnam, or harvest disease can flip the rankings within months.
- **Quality is not in this table.** Two coffees at the same price can taste very different. Always cup-test before signing a contract.
- **Section 122 is temporary.** When it expires, the gap between FTA and non-FTA countries will narrow.
- **Non-tariff barriers exist.** FDA prior notice, USDA APHIS, organic certification, mycotoxin rules — all add cost and are not in this comparison.
- **Freight cost is volatile.** A Red Sea closure or a Panama Canal drought can change the answer.
- **AD/CVD checks.** Coffee currently has no anti-dumping orders, but always verify before signing.

## 10. What the App Should Show in This View

1. The country comparison table (tariff + freight + average FOB price).
2. A landed-cost calculator the user can change (volume, FOB price, freight estimate).
3. A "what changes if Section 122 expires" toggle.
4. An "alternative HTS classification" hint (e.g., roasted vs green).
5. Source links and data dates next to every number.
6. A short narrative summary like Sections 7–8 above, written in plain English.
