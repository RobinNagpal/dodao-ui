# Sneakers / Footwear from Vietnam — Detailed Tariff & Cost Reduction Guide

> **For beginners:** Read [basic-concepts.md](./basic-concepts.md) first if you don't know words like HTS code, MFN, FTZ, drawback, tariff engineering, etc. This guide assumes you understand those terms.

---

## 1. The Product

- **What it is:** Athletic sneakers (Nike-style, Adidas-style, casual sneakers) with rubber/plastic outer sole and textile or synthetic upper.
- **Country of origin:** Vietnam.
- **Why Vietnam:** Vietnam now produces **~50% of Nike's footwear** and **~40% of Adidas's** globally. Vietnam overtook China in athletic footwear around 2020.

## 2. The HTS Code

Footwear is one of the most **complicated chapters** of the entire tariff schedule. The duty depends on:

1. **Upper material** (leather, textile, synthetic)
2. **Sole material** (rubber/plastic, leather, other)
3. **Whether "athletic"** (defined narrowly by CBP)
4. **Gender / size** (men's, women's, youth, infant)
5. **Per-pair value** (different rates above/below price thresholds)
6. **Construction method** (welt, cement, vulcanized)

| HTS Code | Description | MFN Duty |
|---|---|---|
| **6404.11.9020** | Athletic footwear, textile upper, rubber/plastic sole, valued >$12/pair, men's | **20%** |
| 6404.11.9050 | Athletic footwear, textile upper, rubber/plastic sole, valued >$12/pair, women's | 20% |
| 6402.99.31 | Other rubber/plastic footwear, textile lining, athletic | 6% |
| 6403.99.60 | Athletic footwear, leather upper, rubber/plastic sole | 8.5% |
| 6402.91.40 | Sneakers, rubber/plastic upper, athletic | 6% |

**Big takeaway:** The same physical sneaker can pay anywhere from **6% to 37.5%** depending on material composition and value. This is why footwear is the #1 product for tariff engineering.

## 3. Current Tariff Stack (April 2026)

| Component | Rate | Why it applies |
|---|---|---|
| MFN (athletic textile upper) | **20%** | High base rate for this category |
| Section 301 | 0% | Vietnam (not China) |
| Section 232 | 0% | Footwear not on Section 232 list |
| Reciprocal 20% (was active in 2025) | **0% now** | Struck down by SCOTUS Feb 2026 |
| Section 122 | **10%** | All countries, expires ~July 24, 2026 |
| AD/CVD | None | No active orders on Vietnamese sneakers |
| **Total extra over MFN** | **10%** | |
| **Total all-in duty** | **30%** | |

## 4. Landed Cost Calculation on $10,000 of Sneakers

```
Product value (FOB):              $10,000.00
MFN duty (20%):                   $ 2,000.00
Section 122 (10%):                $ 1,000.00
MPF (0.3464%, min $33.58):        $    34.64
HMF (0.125%, ocean only):         $    12.50
                                  -----------
Total LANDED COST:                $13,047.14
Effective tariff rate:            30.47%
```

(Vietnam → U.S. ocean shipping for a small container shipment is roughly **$500–$2,000**, not included.)

---

## 5. Detailed Ways to Reduce the Tariff Cost

### Option A: Tariff Engineering — Material Composition

**This is the #1 lever for footwear** because the duty rate depends so heavily on what the shoe is made of.

#### The big four classification levers:

##### 1. Upper material (HUGE impact)

- **Textile upper (mesh, canvas):** 20% duty (HTS 6404)
- **Leather upper:** 8.5% duty (HTS 6403)
- **Rubber/plastic upper:** 6% duty (HTS 6402)

Switching from a mesh-textile upper to a leather upper can drop duty from 20% to 8.5% — a **57% reduction** in the duty rate.

**Real-world example:** **Adidas** offers many of the same sneaker silhouette in both "leather" and "primeknit textile" versions. The leather version often has lower duty.

##### 2. The "athletic" classification trap

CBP has a narrow definition of "athletic" footwear (essentially: designed for serious sport). A casual sneaker that **looks athletic** but isn't built for serious athletics may classify as **non-athletic**, which has different rates.

**Example:** A canvas Vans-style skate shoe is NOT classified as athletic. It falls under HTS 6404.19, with rates often lower than 6404.11 athletic.

##### 3. The "felt" trick (Converse-style)

The famous **Converse Chuck Taylor** has a strip of **felt textile** on the bottom of the rubber sole. Why? Because **HTS rules consider the "outer sole" to be felt, not rubber**. Felt-soled footwear has a much lower duty.

- HTS 6405 (footwear with felt or other textile outer sole): rates often **12.5%** or lower.
- vs. HTS 6404 with full rubber sole: **20%**.

This is the most famous tariff engineering case study in footwear, and it's been validated in court.

##### 4. Per-pair value brackets

HTS 6404.11 has price tiers:

- **Up to $3/pair:** 48% + extra
- **$3–$6.50:** 37.5%
- **$6.50–$12:** 90¢/pair + 20%
- **Over $12:** 20%

If your declared FOB price falls just below a tier boundary, you might be in a higher-rate bracket. **Pricing your import at the right value tier** (genuinely, not by under-invoicing) keeps you in the 20% range. For most modern sneakers >$12 FOB, this isn't an issue, but it matters for cheap shoes.

#### Which tactic is most practical for sneakers?

For premium athletic sneakers ($30+ retail), **the felt-sole trick or shifting upper material to leather** are the proven approaches. They require:

- A genuine product redesign (not just paperwork).
- A **CBP Binding Ruling** confirming the new HTS classification.
- Acceptance from your design team that the product will look slightly different.

---

### Option B: First Sale Rule

Footwear has one of the **deepest, most fragmented supply chains** in apparel:

```
Vietnamese factory  →  Hong Kong agent  →  U.S. brand  →  U.S. retailer
   ($15)               ($25)                ($40)            ($120)
```

The factory sells at $15. By the time it reaches the U.S. importer (the brand), the price is $40 — a 167% markup. With duty at 30%, you save a huge amount declaring on the **first sale price**.

#### Math on a $10,000 import (assuming first-sale price is 60% of import price):

- Last-sale duty: 30% × $10,000 = $3,000
- First-sale duty: 30% × $6,000 = $1,800
- **Saving: $1,200**

#### Practical setup:

1. **Vietnamese factory invoice** — get this from your manufacturing partner. They sell to a Hong Kong/Singapore agent who marks up to your final price.
2. **Documentation that shows U.S. destination** — the factory must know the goods are heading to the U.S. from the start.
3. **Customs broker** — use one with first-sale experience. CBP audits these claims more carefully than other claims.

#### Hurdle: Many brands don't have visibility into the factory's invoice

Your relationship is with the agent, not the factory. The agent treats their factory's price as a trade secret. If you can't see the factory invoice, you can't do first sale.

**Solution:** Negotiate "open book" arrangements. Some brands renegotiate vendor contracts to require factory invoice transparency. Nike, Adidas, and most other major brands already have this.

---

### Option C: Free Trade Agreement Sourcing (Move to a USMCA Country)

Vietnam has **no free trade agreement with the U.S.** That's why you pay full duty.

If you instead source from Mexico (USMCA), the same sneakers can enter at **0% duty**.

| Country | MFN | Section 122 | Total | Duty on $10,000 |
|---|---|---|---|---|
| Vietnam | 20% | 10% | 30% | $3,000 |
| Indonesia | 20% | 10% | 30% | $3,000 |
| China | 20% | 10% (+ Section 301 if applicable) | 30%+ | $3,000+ |
| Cambodia | 20% | 10% | 30% | $3,000 |
| **Mexico (USMCA)** | **0%** | **0%** | **0%** | **$0** |

#### Practical reality:

- Mexico's footwear industry is small for athletic shoes (focused more on western boots and casual leather).
- **Adidas opened a Mexico factory** in 2022; **Skechers** has Mexican production.
- Per-pair labor cost in Mexico is **2–3× higher than Vietnam** ($5–8 vs. $2–3).
- BUT, you save 30% in duty + half the shipping time + no ocean freight.

For a $30 FOB sneaker:

- Vietnam: $30 + 30% duty + $1.50 shipping = $40.50 landed
- Mexico: $40 (higher labor) + 0% duty + $0.30 trucking = $40.30 landed

**Mexico can be cost-competitive** especially when you factor in shorter lead times (3 weeks vs. 12+ weeks) and lower inventory carrying cost.

---

### Option D: Foreign-Trade Zone (FTZ)

Set up your warehouse in an FTZ near the port of Long Beach (where most Vietnamese footwear lands).

#### Saving scenarios:

1. **Re-export to Canada/Mexico:** No U.S. duty paid at all on those units.
2. **Cash flow:** Delay the 30% duty until goods leave the FTZ for U.S. retail.
3. **Inverted tariff:** Some shoe components (laces, insoles, foam) have higher duty than the finished shoe. If you import components and assemble in the FTZ, you pay the lower finished-shoe rate. (This is rare for footwear but possible.)

#### When FTZ pays off for footwear:

- Importing $1M+/year of footwear.
- Holding inventory for >60 days before sale.
- Re-exporting >5% of inventory to other countries.

---

### Option E: Bonded Warehouse

For seasonal footwear (e.g., back-to-school, holiday gift sneakers), use a bonded warehouse to delay duty payment.

- Useful for inventory-heavy brands that pre-order for a season.
- Less powerful than FTZ but easier to set up.

---

### Option F: Duty Drawback (and the Re-Export Reality Check)

If you re-export sneakers, recover 99% of the duty paid.

#### **Re-Export Reality Check for Vietnamese Sneakers:**

Let's say you want to sell to **Canada**.

**Option 1: Vietnam → U.S. → Canada (drawback)**
- Vietnam → U.S. ocean freight: ~$1.00/pair
- U.S. duty (30%): $9 on a $30 FOB shoe
- U.S. → Canada trucking: ~$0.40/pair
- Canada import duty: ~17.5% on athletic footwear from non-FTA partners = $5.25
- Drawback refund: **-$8.91** (99% of $9)
- Net duty cost: $5.25 + ~$0.50 admin
- **Total per pair: $32.34**

**Option 2: Vietnam → Canada directly**
- Vietnam → Canada ocean freight: ~$1.20/pair
- Canada import duty: ~17.5% = $5.25
- **Total per pair: $36.45?** Wait, not quite — let's recompute more carefully.

Actually, with the cost added correctly:
- Vietnam → Canada direct: $30 + $1.20 freight + $5.25 duty = **$36.45**
- Vietnam → U.S. → Canada (with drawback): $30 + $1.00 freight + $9 duty + $0.40 freight + $5.25 Canada duty + $0.50 admin - $8.91 drawback = **$37.24**

**Direct shipping is still cheaper by ~$0.79/pair** because you skip the second freight leg and U.S. broker fees.

**For Canada specifically**, drawback only makes sense if you're already importing to the U.S. for U.S. customers, and a small portion (returns, B2B redistribution) ends up in Canada.

#### Better destination for re-export?

If your destination is **Mexico**, Mexico has **its own free trade agreements** with Vietnam through the **CPTPP**. Direct shipping Vietnam → Mexico = **0% duty** under CPTPP. Re-exporting through the U.S. wastes money.

If your destination is **the EU**, EU has GSP+ for Vietnam, and the EU-Vietnam FTA gives 0% duty on most footwear. Direct = always cheaper.

**Conclusion for sneakers:** Drawback is only worth using when you naturally have re-export volume. Don't import to the U.S. just to ship out again.

---

### Option G: Components Strategy — Shoe Parts at Different Rates

Some brands import **separate components** (uppers, soles, laces) and assemble in the U.S. (often in an FTZ).

- Uppers (HTS 6406): typically 10–15%
- Soles (HTS 6406): often lower
- Laces (HTS 6307): low

If the assembled shoe pays 30% but components average 12%, you save 18 percentage points. **But** you need U.S. assembly capacity, which is expensive.

This works best for **high-end shoes where U.S. final assembly is part of the marketing story** (e.g., New Balance "Made in USA" line, premium boots).

---

## 6. Summary Table — Saving Potential on $10,000 Order

| Strategy | Saving | Difficulty | Best For |
|---|---|---|---|
| Tariff engineering (leather upper) | up to $1,150 | Medium-High (redesign) | Brands with design control |
| Felt-sole trick | $700–$1,000 | Medium | Casual/fashion sneakers |
| First Sale Rule | ~$1,200 | Medium (need invoices) | Brands with agent supply chain |
| Move to Mexico (USMCA) | Up to $3,000 | High (cost & capacity) | Major brands with NA focus |
| FTZ | Variable | High setup | Importers >$1M/year |
| Drawback | Marginal | Medium | Brands with NA-wide distribution |
| Component import + U.S. assembly | $1,500+ | Very High | Premium brands, "Made in USA" |

---

## 7. The Best Practical Option for Sneakers

### **Recommendation: First Sale Rule + Tariff Engineering**

**Why:**

- **First Sale Rule alone saves ~$1,200 on $10,000** (12% of import value) and requires no product redesign.
- Combined with tariff engineering (leather upper or felt sole), savings can exceed **20% of import value**.
- Both are well-established legal practices used by every major brand (Nike, Adidas, Skechers, New Balance).
- No huge capital investment like FTZ setup or moving production.

**Implementation order (start small, expand):**

1. **Month 1:** Talk to your customs broker about first-sale eligibility. Get factory invoices.
2. **Month 2:** File a CBP binding ruling on your current product to confirm classification.
3. **Month 3–6:** Pilot with one product line. Track refunds/savings.
4. **Year 2:** If first-sale works, expand to other lines. Consider tariff engineering for new designs.
5. **Year 3+:** If volume justifies, evaluate FTZ and Mexico sourcing.

**When to skip these and just move sourcing:**

- If your brand is small (<$200k/year imports) and doesn't have an agent in the supply chain.
- If you have major sales in Canada/Mexico and Mexico-made + USMCA gives you 0% duty.

---

## 8. Sources

- [USITC HTS Chapter 64 (footwear)](https://hts.usitc.gov/)
- [CBP CROSS — search "athletic footwear" rulings](https://rulings.cbp.gov/)
- [Vietnam Tariff Rates 2026](https://www.tariffcentral.org/tariffs/vietnam)
- [Importing Shoes — Shoemakers Academy guide](https://shoemakersacademy.com/importing-shoes-hts-shoe-import-duty-shoe-tariffs/)
- [White & Case — IEEPA Tariffs Terminated](https://www.whitecase.com/insight-alert/united-states-terminates-ieepa-based-tariffs-following-supreme-court-decision)
- [Nissho Iwai American Corp. v. United States](https://en.wikipedia.org/wiki/Nissho_Iwai_American_Corp._v._United_States) (case establishing first sale rule)

**Always verify with a licensed customs broker before placing your order.**
