"""Fill the writer parts of the generated Chapter 62 content file (woven apparel and clothing accessories).

Usage: python3 fill.py <generated.json> <out.json>   (run.sh does generate -> fill -> compact -> prettier)
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, OUT = sys.argv[1], sys.argv[2]
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH62 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2062"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def ecfr_part(t, p):
    return f"https://www.ecfr.gov/current/title-{t}/part-{p}"


d = json.load(open(SRC))
pool = json.load(open(os.path.join(HERE, "pool.json")))

# ---------------------------------------------------------------- trade numbers (from the generated understandIndustry)
NAMES = {"Viet Nam": "Vietnam", "Rep. of Korea": "South Korea", "Other Asia, nes": "Taiwan", "Dominican Rep.": "Dominican Republic"}


def m(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M" if v >= 1e7 else f"${v / 1e6:.1f}M"


ui = d["understandIndustry"]
YEAR = ui["latestYear"]
TOTAL = d["overview"]["tradeSnapshot"]["totalImportsUsd"]
BC = {NAMES.get(c["country"], c["country"]): c for c in ui["byCountry"]}
top = [NAMES.get(c["country"], c["country"]) for c in ui["byCountry"][:10]]
assert top[:6] == ["Vietnam", "Bangladesh", "China", "India", "Indonesia", "Mexico"], top
assert YEAR == 2025 and abs(TOTAL - 35113871538) < 1, (YEAR, TOTAL)


def sh(n):
    return f"{BC[n]['sharePct']:.1f}%" if BC[n]["sharePct"] < 10 else f"{round(BC[n]['sharePct'])}%"


def imp(n):
    return m(BC[n]["importsUsd"])


# ---------------------------------------------------------------- sources not in the shared pool
def fr(dn, citation, published, title, url, document="Notice (USTR)", signed=None):
    return {
        "id": "fr-" + dn.lower(),
        "publisher": "Federal Register",
        "citation": citation,
        "document": document,
        "title": title,
        "signed": signed,
        "published": published,
        "url": url,
    }


NEW = [
    fr("2026-05214", "91 FR 12886", "2026-03-17",
       "Initiation of Section 301 Investigations: Acts, Policies, and Practices of Certain Economies Relating to Structural Excess Capacity and Production in Manufacturing Sectors",
       "https://www.federalregister.gov/documents/2026/03/17/2026-05214/initiation-of-section-301-investigations-acts-policies-and-practices-of-certain-economies-relating"),
    {
        "id": "fr-2011-6253",
        "publisher": "Federal Register",
        "citation": "76 FR 14575",
        "document": "Final rule (CBP Dec. 11-09)",
        "title": "Country of Origin of Textile and Apparel Products (textile declaration requirement eliminated; manufacturer identification code required)",
        "signed": None,
        "published": "2011-03-17",
        "url": "https://www.federalregister.gov/documents/2011/03/17/2011-6253/country-of-origin-of-textile-and-apparel-products",
    },
]
NEW_SOURCES = {s["id"]: s for s in NEW}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(src(sid))
            have.add(sid)


ENDED = "The 2025 IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
CANADA_338 = (
    "17 subheadings (74 lines): down-filled and padded sleeveless man-made-fibre anoraks and coats (6201.40.55, .60, 6202.40.10, "
    ".55, .60), wool suits, blazers and other trousers (6203.11.90, 6203.31.50, .90, 6203.41.60), synthetic dresses and silk "
    "dresses (6204.43.40, 6204.49.10), coated or rubberised man-made-fibre garments (6210.20.50, 6210.40.55, 6210.50.55) and "
    "coveralls and jumpsuits (6211.32.90, 6211.33.90, 6211.43.10)"
)
CANADA_338_SHORT = "down and padded synthetic coats, wool suits and blazers, synthetic dresses, coated garments and coveralls (17 subheadings)"
NOT_4A = (
    "37 subheadings (102 lines) are not on List 4A — they were on List 4B, which never took effect — among them men's synthetic "
    "and 'other' ensembles (6203.23.00, 6204.29.40), rubberised and plastic-coated rainwear (6210.20.30, 6210.30.30, 6210.40.35, "
    "6210.50.35), nonwoven disposable hospital apparel (6210.10.50), synthetic scarves (6214.30), man-made-fibre ties (6215.20), "
    "cotton and man-made-fibre handkerchiefs, some gloves and headbands (6217.10.85)"
)

LABELS = {
    "6201": ("Men's and boys' overcoats, anoraks, ski jackets, windbreakers and padded vests", "Men's coats & jackets"),
    "6202": ("Women's and girls' overcoats, anoraks, ski jackets, windbreakers and padded vests", "Women's coats & jackets"),
    "6203": ("Men's and boys' suits, ensembles, blazers, trousers, jeans and shorts", "Men's suits & trousers"),
    "6204": ("Women's and girls' suits, ensembles, blazers, dresses, skirts, trousers and jeans", "Women's dresses & trousers"),
    "6205": ("Men's and boys' shirts", "Men's shirts"),
    "6206": ("Women's and girls' blouses and shirts", "Women's blouses"),
    "6207": ("Men's and boys' underpants, pajamas, nightshirts and bathrobes", "Men's sleep & underwear"),
    "6208": ("Women's and girls' slips, panties, nightdresses, pajamas and robes", "Women's sleep & lingerie"),
    "6209": ("Babies' garments and clothing accessories", "Babies' garments"),
    "6210": ("Garments of felt, nonwovens or coated and rubberised fabric (disposable gowns, rainwear)", "Coated & nonwoven garments"),
    "6211": ("Track suits, ski-suits, swimwear, coveralls and other garments", "Swimwear, ski-suits & other"),
    "6212": ("Bras, girdles, corsets, braces and suspenders (woven or knitted)", "Bras & corsetry"),
    "6213": ("Handkerchiefs", "Handkerchiefs"),
    "6214": ("Shawls, scarves, mufflers, mantillas and veils", "Scarves & shawls"),
    "6215": ("Ties, bow ties and cravats", "Ties"),
    "6216": ("Gloves, mittens and mitts (not knitted)", "Gloves"),
    "6217": ("Other clothing accessories and parts of garments", "Accessories & parts"),
}

# ---------------------------------------------------------------- overview
ov = d["overview"]
ov["h1"] = "HTS Chapter 62: Woven Apparel — Suits, Jeans, Trousers, Shirts, Dresses, Coats & Bras Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 62 Tariff Rates 2026: Woven Apparel, Jeans, Shirts, Dresses & Jackets Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 1,247 HTS Chapter 62 lines — woven coats, suits, jeans, trousers, shirts, blouses, "
    "dresses, sleepwear, swimwear, bras, scarves, ties and gloves — with General, FTA and Column 2 rates and the 2026 "
    "extra duty for Vietnam, Bangladesh, China, India and others."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 62",
    "HTS Chapter 62 tariff rates",
    "apparel tariffs",
    "US apparel tariffs 2026",
    "hs code for jeans",
    "hs code 6203",
    "hs code 6204",
    "hs code for shirts",
    "woven apparel import duty",
    "clothing import duty usa",
    "China tariffs apparel",
    "textile import duties",
]
ov["intro"] = (
    "Chapter 62 covers clothing that is **woven, not knitted**: men's and women's coats and anoraks (6201–6202), **suits, "
    "ensembles, blazers, trousers, jeans, shorts, dresses and skirts** (6203–6204), **shirts and blouses** (6205–6206), "
    "underwear, sleepwear and robes (6207–6208), babies' garments (6209), coated and nonwoven garments such as disposable "
    "hospital gowns and rainwear (6210), swimwear, ski-suits and coveralls (6211), **bras** and corsetry (6212) and "
    "accessories — handkerchiefs, scarves, ties, gloves (6213–6217). Knitted garments are chapter 61. Its **1,247 lines** "
    "carry base rates from Free to **28.6%** (synthetic women's trousers and ski pants), plus compound rates on wool-blend "
    "lines; cotton jeans are 16.6%, men's cotton shirts 19.7%.\n\n"
    "Suit and ensemble lines (6203.22–.29, 6204.21–.29) have no rate of their own: each garment pays **the rate it would "
    "pay if entered separately**, so the importer gives each garment's line and value. On top of the base rate, since "
    "**July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%** — Bangladesh, India, Indonesia, "
    "Cambodia, Pakistan and Sri Lanka 10%, Vietnam 12.5%. **China pays 12.5% plus 7.5%** (List 4A) on most lines. Central "
    "American apparel entered duty-free under **CAFTA-DR** and Jordanian apparel pay no Section 301 duty, and USMCA goods "
    "from Mexico pay none; Canada pays **50%** under Section 338 on 17 subheadings even with USMCA. "
    f"The U.S. imported **{m(TOTAL)}** of Chapter 62 goods in {YEAR}: Vietnam {imp('Vietnam')} ({sh('Vietnam')}), "
    f"Bangladesh {imp('Bangladesh')} ({sh('Bangladesh')}), China {imp('China')} ({sh('China')}) and India {imp('India')}."
)
BLURBS = {
    "6201": (
        "Men's overcoats, raincoats, anoraks, ski jackets, windbreakers and padded vests. Cotton 4.4%–9.4%; man-made-fibre "
        "anoraks 27.7% unless water resistant (7.1%) or down-filled (4.4%); wool coats 41¢/kg + 16.3%. Recreational "
        "performance outerwear (U.S. note 3) has its own lines.",
        ["men's jacket", "puffer jacket", "down jacket", "windbreaker", "ski jacket", "raincoat", "parka", "overcoat"],
    ),
    "6202": (
        "The same garments for women and girls: man-made-fibre anoraks and coats 27.7%, water-resistant 7.1%, down-filled "
        "4.4%; cotton 4.4%–8.9%; wool anoraks 14% or 36¢/kg + 16.3%.",
        ["women's jacket", "women's coat", "puffer jacket", "trench coat", "rain jacket", "down coat"],
    ),
    "6203": (
        "The chapter's largest heading: men's suits, ensembles, blazers, trousers, jeans and shorts. Cotton trousers and "
        "jeans 16.6%, synthetic trousers 27.9% (7.1% if water resistant), wool suits 17.5%, synthetic blazers 27.3%. "
        "Ensembles pay each garment's own rate.",
        ["jeans", "men's jeans", "denim jeans", "chinos", "trousers", "pants", "shorts", "cargo pants", "suit", "blazer"],
    ),
    "6204": (
        "Women's suits, ensembles, blazers, dresses, skirts, trousers, jeans and shorts: cotton jeans and trousers 16.6%, "
        "synthetic trousers 28.6%, cotton dresses 8.4%–11.8%, synthetic dresses 16%, wool suits 14%. Ensembles pay each "
        "garment's own rate.",
        ["women's jeans", "dress", "maxi dress", "skirt", "women's trousers", "shorts", "pantsuit", "blazer"],
    ),
    "6205": (
        "Men's and boys' woven shirts: cotton 19.7% (8.7% for certified hand-loomed), man-made fibres 29.1¢/kg + 25.9%, silk "
        "1.1%–7.1%. Knitted polo and T-shirts are chapter 61.",
        ["men's shirt", "dress shirt", "flannel shirt", "oxford shirt", "button-down shirt", "linen shirt"],
    ),
    "6206": (
        "Women's blouses and shirts: cotton 15.4%, man-made fibres 26.9%, silk 6.9%, wool 17%, other (linen) 6.7%.",
        ["blouse", "women's shirt", "silk blouse", "tunic", "linen shirt"],
    ),
    "6207": (
        "Men's underpants, nightshirts, pajamas and bathrobes: cotton pajamas 8.9%, man-made-fibre pajamas 16%, "
        "man-made-fibre bathrobes 14.9%.",
        ["boxer shorts", "men's pajamas", "bathrobe", "robe", "nightshirt"],
    ),
    "6208": (
        "Women's slips, panties, nightdresses, pajamas and robes: cotton nightdresses and pajamas 8.9%, man-made fibres 16%, "
        "silk 1.1%–7.1%. Children's sleepwear must meet the CPSC flammability standards.",
        ["pajamas", "nightgown", "sleepwear", "robe", "slip", "panties"],
    ),
    "6209": (
        "Garments and accessories for babies up to 86 cm tall (chapter note 5): cotton 9.3%–14.9%, synthetic up to 28.6%. "
        "Heading 6209 wins over every other heading of the chapter.",
        ["baby clothes", "baby dress", "infant romper", "baby pajamas", "baby sunsuit"],
    ),
    "6210": (
        "Garments of felt or nonwovens (5602–5603) or of coated, rubberised or laminated fabrics (5903, 5906, 5907): "
        "nonwoven disposable hospital gowns Free, rainwear with a fully coated surface 3.3%–3.8%, other 6.2%–16%.",
        ["surgical gown", "isolation gown", "disposable coverall", "rain suit", "rain jacket", "tyvek suit"],
    ),
    "6211": (
        "Track suits, ski-suits, swimwear, coveralls and other garments: man-made-fibre men's swim trunks 27.8%, women's "
        "swimwear 11.8%, ski-suit parts up to 28.6%, coveralls 8.1%–16%.",
        ["swim trunks", "board shorts", "swimsuit", "ski suit", "coveralls", "jumpsuit", "track suit", "scrubs"],
    ),
    "6212": (
        "Bras, girdles, corsets, braces and suspenders, knitted or not: bras 16.9% (2.7%–4.8% for some cotton lines), girdles "
        "20%, corsets 23.5%. Sri Lanka is a leading source.",
        ["bra", "brassiere", "sports bra", "shapewear", "girdle", "corset", "suspenders"],
    ),
    "6213": (
        "Handkerchiefs and scarf-type squares with no side over 60 cm (chapter note 8): cotton 7.1%–13.2%, man-made fibres "
        "10.8%, silk 1.1%–3.8%.",
        ["handkerchief", "bandana", "pocket square"],
    ),
    "6214": (
        "Shawls, scarves, mufflers, mantillas and veils: silk 1.2%–3.9%, wool 6.7%, synthetic or artificial fibres 5.3%, "
        "other 11.3%.",
        ["scarf", "silk scarf", "wool scarf", "shawl", "pashmina", "hijab", "veil"],
    ),
    "6215": (
        "Ties, bow ties and cravats: silk 7.2%, man-made fibres 24.8¢/kg + 12.7%, other 5%.",
        ["necktie", "silk tie", "bow tie", "cravat"],
    ),
    "6216": (
        "Woven gloves, mittens and mitts — work, sports, ski and dress gloves: Free to 23.5%; coated or impregnated work "
        "gloves 12.5%–23.5%, hockey gloves Free. Knitted gloves are 6116; leather gloves 4203.",
        ["work gloves", "ski gloves", "gardening gloves", "mittens", "hockey gloves"],
    ),
    "6217": (
        "Other made-up clothing accessories (headbands, sweatbands, pads) and parts of garments: 14.6%, or 2.3% if 70% "
        "silk or more.",
        ["headband", "shoulder pads", "garment parts", "collar", "sleeve"],
    ),
}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Men's blue denim jeans from Bangladesh",
        "line": "6203.42.45.11",
        "body": "Men's cotton jeans are 16.6% at the general rate, and Bangladesh pays 10% Section 301 (9903.05.26) on top: "
        "26.6%, **$2,660** on a $10,000 shipment. Bangladesh's exception list names no Chapter 62 code, and GSP has been "
        "expired since December 31, 2020.",
    },
    {
        "title": "Women's polyester trousers from Vietnam",
        "line": "6204.63.90.11",
        "body": "Synthetic women's trousers carry the chapter's top ad valorem rate, 28.6%. Vietnam adds 12.5% (9903.05.84): "
        "41.1%, **$4,110** on $10,000. The same trousers made water resistant under additional U.S. note 2 enter under "
        "6204.63.75 at 7.1% — 19.6% with the Section 301 duty.",
    },
    {
        "title": "Men's cotton shirts from China",
        "line": "6205.20.20.16",
        "body": "Woven cotton shirts are 19.7%. China pays 7.5% under List 4A (9903.88.15) and 12.5% under the 2026 action "
        "(9903.05.31): 39.7% in all, **$3,970** on $10,000. The IEEPA duties on China ended February 24, 2026.",
    },
    {
        "title": "A men's polyester jacket-and-trousers ensemble from Vietnam",
        "line": "6203.23.00.60",
        "body": "6203.23.00 has no rate of its own: each garment pays the rate it would pay if entered separately. On a "
        "$10,000 ensemble, the importer reports the jacket ($6,000, 6203.33.20, 27.3% = $1,638) and the trousers ($4,000, "
        "6203.43.90, 27.9% = $1,116), and the values must add up to the shipment value. Base duty $2,754, plus 12.5% "
        "Section 301 on the whole $10,000 ($1,250): **$4,004**. The tariff calculator asks for those lines and values.",
    },
    {
        "title": "Men's cotton shirts from Honduras, with a CAFTA-DR claim",
        "line": "6205.20.20.16",
        "body": "Shirts that originate under CAFTA-DR (General Note 29: yarn and fabric from the region, cut and sewn there) "
        "and are entered with the SPI \"P\" are Free, and U.S. note 52(i) (9903.05.95) removes Honduras's 10% Section 301 "
        "duty: **$0**. Without a valid claim they pay 29.7% ($2,970).",
    },
    {
        "title": "Men's wool blazers from Canada, with a USMCA claim",
        "line": "6203.31.90.20",
        "body": "Wool blazers are 17.5%, Free under USMCA, and USMCA also removes Canada's 10% Section 301 duty "
        "(9903.05.93). But 6203.31.90 is on the Section 338 list (U.S. note 51(b)(3), 9903.03.14), whose 50% applies with or "
        "without USMCA: **$5,000** on $10,000 ($7,750 without a USMCA claim).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 62 ({YEAR})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, so this page does not say which 10-digit line each country ships."
)
ts["topCountries"] = [{"name": n, "importsUsd": BC[n]["importsUsd"]} for n in top[:5]]
ts["biggestLines"] = [
    {"hts": "6203.42", "label": "Men's and boys' cotton trousers, jeans and shorts"},
    {"hts": "6204.62", "label": "Women's and girls' cotton trousers, jeans and shorts"},
    {"hts": "6203.43", "label": "Men's and boys' synthetic trousers and shorts"},
    {"hts": "6212.10", "label": "Brassieres"},
]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** Chapter 62 covers made-up articles of any textile fabric other than wadding, but not knitted or crocheted "
    "articles (except bras and corsetry of heading 6212, which may be knitted).\n\n"
    "**Note 2.** It does not cover worn clothing of heading 6309 or orthopedic and surgical belts and trusses (9021).\n\n"
    "**Note 3.** A **suit** is a set of a suit coat or jacket (outer shell of four or more panels, possibly with a tailored "
    "waistcoat) and one lower garment, all in identical fabric of the same construction, color and composition; morning "
    "dress, evening dress (tailcoat) and dinner jacket suits are suits too. An **ensemble** is a set of several pieces in "
    "identical fabric, put up for retail sale: one upper garment (a waistcoat may be a second) and one or two different "
    "lower garments — trousers, overalls, breeches, shorts, a skirt or divided skirt. Track suits and ski-suits are not "
    "ensembles.\n\n"
    "**Note 4.** Shirts and blouses (6205, 6206) exclude garments with pockets below the waist or a ribbed or tightening "
    "waistband; men's shirts cannot be sleeveless.\n\n"
    "**Notes 5–6.** Babies' garments are for a body height of 86 cm or less; heading 6209 takes priority over other "
    "headings, and 6210 over all others except 6209.\n\n"
    "**Note 7.** Ski-suits (6211) are ski overalls or ski ensembles identifiable as worn principally for skiing.\n\n"
    "**Note 8.** Scarf-type squares with no side over 60 cm are handkerchiefs (6213); larger ones are 6214.\n\n"
    "**Note 9.** Left-over-right closure means men's or boys'; right-over-left women's or girls'. Garments that cannot be "
    "identified are classified as women's or girls'."
)
ov["notes"]["additionalUsNotes"] = (
    "**Note 1.** For 6209, \"sets\" are two or more different garments of 6111, 6209 or 6505 imported together, of "
    "corresponding sizes, to be worn together by the same person.\n\n"
    "**Note 2. Water resistant.** The water-resistant lines (for example 6201.40.45, 6203.43.11, 6204.63.09, 6211.20.15) need "
    "a rubber or plastics application such that not more than 1.0 g of water penetrates after two minutes under a 600 mm "
    "head of water (AATCC Test Method 35).\n\n"
    "**Note 3. Recreational performance outerwear.** Trousers, overalls, jackets, windbreakers and padded vests of cotton, "
    "wool, hemp, bamboo, silk or man-made fibres that are water resistant or treated with plastics, have critically sealed "
    "seams and at least five listed features (insulation, zippered pockets, tightening hems, venting, articulated elbows or "
    "knees, reinforcement, weatherproof closure, adjustable hood or collar, powder skirt, arm gusset, odor control). "
    "Occupational outerwear is excluded, and the importer must keep records proving the features.\n\n"
    "**Statistical notes.** Garments of an ensemble are reported separately under the ensemble's 8-digit subheading "
    "(note 1); prefixes \"H\" and \"S\" identify garments entered under a special access or outward processing program "
    "(notes 2–3). The three-digit numbers in brackets (347 cotton trousers, 648 synthetic women's trousers) are textile "
    "categories."
)

# ---------------------------------------------------------------- tariffUpdates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 62 Tariff Updates: Woven Apparel, Jeans, Shirts & Dresses (2025–2026)"
tu["seo"]["title"] = "Apparel Tariff Updates 2026: Section 301 on 60 Economies, China List 4A, CAFTA-DR, Canada 338 (HTS Chapter 62) | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for U.S. imports of woven apparel since January 2025: unchanged base rates, the end of the IEEPA tariffs "
    "and the Section 122 surcharge, the 2026 Section 301 tariffs on Vietnam, Bangladesh, India and 57 other economies, "
    "China List 4A, CAFTA-DR and Jordan exemptions, and Canada's Section 338 duty."
)
tu["seo"]["keywords"] = [
    "US apparel tariffs",
    "apparel tariff updates 2026",
    "China tariffs apparel",
    "tariff on clothing from Vietnam",
    "tariff on clothing from India",
    "Bangladesh apparel tariffs",
    "Section 301 apparel",
    "Mexico USMCA tariffs",
    "CBP tariff updates",
    "fashion import duties",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 1,247 Chapter 62 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. The 2025 IEEPA duties — 20% on Vietnamese and Bangladeshi apparel, up to "
    "50% on Indian — **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July "
    "23, 2026. Since **July 24, 2026**, goods from 60 economies pay a **Section 301 tariff of 10% or 12.5%**. For Chapter "
    "62 there is no general exemption; CAFTA-DR apparel entered duty-free (note 52(i)) and Jordanian apparel (note 52(j)) "
    "are exempt, and USMCA goods are exempt. China keeps List 4A (7.5%) on 358 of 395 subheadings. Since **August 22, "
    "2026 Canada pays 50%** under Section 338 on 17 subheadings, USMCA or not."
)
tu["scope"] = (
    "Measures that reach Chapter 62 from any country: the 2026 Section 301 tariffs on 60 economies with their CAFTA-DR, USMCA "
    "and Jordan exemptions, the Brazil Section 301 tariff, China Section 301 List 4A and its exclusion for disposable "
    "hospital apparel, the Canada Section 338 duty, Russia's rates in place of column 2, the Nicaragua Section 301 phase-in, "
    "the open Section 301 excess-capacity investigations, and the 2025–2026 IEEPA and Section 122 duties that have ended. "
    "No antidumping or countervailing duty order and no Section 232 action covers a Chapter 62 line. For the rate each "
    "supplier pays, see Rates by country."
)
IE = {x["id"]: x for x in tu["inEffect"]}
GSP_GONE = "GSP (SPI A, A*), still printed on a few lines, has been expired since December 31, 2020."
EXEMPT = {
    "cn-section-301": (
        "List 4A (+7.5%, 9903.88.15, since February 14, 2020) covers 358 of the chapter's 395 eight-digit subheadings; "
        + NOT_4A + ". The 2026 action adds +12.5% (9903.05.31) on every line. One List 4A exclusion (9903.88.69, note "
        "20(vvv)(iv)) names whole lines — nonwoven disposable surgical and isolation gowns and other hospital apparel "
        "(6210.10.50.10, .90) — and runs through November 9, 2026. Note 20(dd)–(ff) keeps List 4A off ensemble entries whose "
        "rate comes from a List 1–3 subheading. The IEEPA duties on China ended February 24, 2026.",
        "Most Chinese woven apparel pays 20% on top of the base rate — 39.7% on cotton shirts, 36.6% on cotton jeans; "
        "synthetic ensembles, rainwear, scarves, ties and disposable gowns pay 12.5%.",
        ["fr-2025-21671", "eo-14389"],
    ),
    "vn-section-301": (
        "Vietnam has no exception list for Chapter 62. The 2025 IEEPA reciprocal rate (+20%, 9903.02.69) ended February 24, "
        "2026, and the 10% Section 122 surcharge expired July 23, 2026.",
        "Vietnamese jackets, trousers and dresses pay the base rate plus 12.5%: 29.1% on cotton jeans, 41.1% on synthetic women's trousers.",
        ["eo-14326", "eo-14389"],
    ),
    "bd-section-301": (
        "Bangladesh's exception list (note 52(j)(9), 9903.06.12) names no Chapter 62 subheading. " + GSP_GONE + " The 2025 "
        "IEEPA rate (+20%, 9903.02.05) ended February 24, 2026; the Section 122 surcharge expired July 23, 2026.",
        "Bangladeshi trousers, jeans and shirts pay the base rate plus 10%: 26.6% on cotton jeans.",
        ["cbp-gsp", "eo-14326", "eo-14389"],
    ),
    "in-section-301": (
        "India has no exception list. " + GSP_GONE + " The 2025 IEEPA duties (25% reciprocal plus 25% over Russian oil "
        "purchases) ended in February 2026.",
        "Indian dresses, blouses and shirts pay the base rate plus 10%: 18.4% on cotton dresses, 25.4% on cotton blouses.",
        ["cbp-gsp", "eo-14384", "eo-14389"],
    ),
    "id-section-301": (
        "Indonesia's exception list (note 52(j)(11), 9903.06.16) names no Chapter 62 subheading. " + GSP_GONE + " The 2025 "
        "IEEPA rate (+19%) ended February 24, 2026.",
        "Indonesian apparel pays the base rate plus 10%.",
        ["cbp-gsp", "eo-14389"],
    ),
    "kh-section-301": (
        "Cambodia's exception list (note 52(j)(5), 9903.06.02) names no Chapter 62 subheading. " + ENDED,
        "Cambodian apparel pays the base rate plus 10%.",
        ["eo-14389"],
    ),
    "pk-section-301": (
        "Pakistan has no exception list. " + GSP_GONE + " " + ENDED,
        "Pakistani trousers and shirts pay the base rate plus 10%.",
        ["cbp-gsp", "eo-14389"],
    ),
    "lk-section-301": (
        "Sri Lanka has no exception list. " + GSP_GONE + " The 2025 IEEPA rate (+20%) ended February 24, 2026.",
        "Sri Lankan bras and garments pay the base rate plus 10%: 26.9% on most bras.",
        ["cbp-gsp", "eo-14389"],
    ),
    "mx-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.94), including goods entered under the USMCA tariff "
        "preference levels (Chapter 98 subchapter XXIII). Under USMCA a Chapter 62 garment qualifies only if it is cut and "
        "sewn in North America from regional yarn and fabric (General Note 11). The 2025 IEEPA duty on Mexico (+25%) ended "
        "February 24, 2026.",
        "Mexican jeans and trousers pay nothing with a valid USMCA claim; without one, the base rate plus 10%.",
        ["eo-14389"],
    ),
    "ca-section-301": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93), but the 50% Section 338 duty (U.S. note 51(b)(3), "
        "9903.03.14) on " + CANADA_338 + " applies with or without a USMCA claim. No Chapter 62 line is on the September 29, "
        "2026 import-ban annexes. The IEEPA duty on Canada ended February 24, 2026.",
        "Canadian apparel pays nothing extra with USMCA except the 17 Section 338 subheadings, which pay 50% (60% without "
        "a USMCA claim).",
        ["procl-11061", "procl-11062", "procl-11063", "eo-14389"],
    ),
    "hn-section-301": (
        "CAFTA-DR textile and apparel goods entered duty-free under CAFTA-DR (SPI P) are exempt (note 52(i), 9903.05.95). The "
        "26 lines whose General rate is already Free (silk-rich garments, down-filled trousers, disposable hospital apparel, "
        "hockey gloves) print no P, so they pay 10%. " + ENDED,
        "Honduran shirts, trousers and other apparel that qualify under CAFTA-DR enter with no duty at all; non-qualifying "
        "goods pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "ni-section-301": (
        "CAFTA-DR apparel entered duty-free is exempt (note 52(i), 9903.05.95); the 26 lines Free at the general rate pay "
        "12.5%. Nicaraguan goods that do not originate under CAFTA-DR will also pay the Nicaragua Section 301 duty "
        "(9903.89.01): 0% in 2026, 10% from January 1, 2027, 15% from January 1, 2028. The 18% IEEPA rate ended February "
        "24, 2026.",
        "Nicaraguan trousers and shirts that qualify under CAFTA-DR enter duty-free; other goods pay the base rate plus 12.5%.",
        ["fr-2025-22690", "eo-14389"],
    ),
    "gt-section-301": (
        "Guatemala's CAFTA-DR list (note 52(j)(6)(iii), 9903.06.06) covers all 395 Chapter 62 subheadings when CAFTA-DR is "
        "claimed, and note 52(i) (9903.05.95) exempts apparel entered duty-free under CAFTA-DR. The 26 lines Free at the "
        "general rate print no P and pay 10%. " + ENDED,
        "Guatemalan apparel that qualifies under CAFTA-DR enters with no duty; other goods pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "sv-section-301": (
        "El Salvador's CAFTA-DR list (note 52(j)(7)(iii), 9903.06.09) covers all 395 Chapter 62 subheadings when CAFTA-DR is "
        "claimed, and note 52(i) exempts apparel entered duty-free under CAFTA-DR. The 26 lines Free at the general rate "
        "print no P and pay 10%. " + ENDED,
        "Salvadoran apparel that qualifies under CAFTA-DR enters with no duty; other goods pay the base rate plus 10%.",
        ["eo-14389"],
    ),
    "eu-section-301": (
        "EU goods pay 10% in total in place of the base rate (note 52(k)), so lines with a base rate of 10% or more (wool "
        "suits 17.5%, cotton jeans 16.6%, synthetic trousers 28.6%) pay only the base rate. The EU exception list (note "
        "52(j)(2)) names no Chapter 62 subheading. " + ENDED,
        "Italian and other EU suits, trousers and dresses pay 10% in total, or the base rate where it is higher.",
        ["eo-14389"],
    ),
    "br-section-301": (
        "Brazil's 25% (9903.05.01, from July 22, 2026) reaches every Chapter 62 line — Brazil's exemption list (note "
        "50(a)(ii)) names none — and the 2026 action adds 12.5% (9903.05.27). The 2025 IEEPA duties (10% reciprocal and 40%) "
        "ended February 24, 2026.",
        "Brazilian apparel pays 37.5% on top of the base rate.",
        ["eo-14323", "eo-14389"],
    ),
    "ru-section-301": (
        "Russian goods on two glove lines (6216.00.13, 6216.00.38) pay 35% in place of the column 2 rate (9903.90.08, U.S. "
        "note 30); all Russian goods pay the 12.5% 2026 Section 301 duty.",
        "Russian apparel pays the column 2 rate (or 35%) plus 12.5%; trade is negligible.",
        [],
    ),
    "other-section-301": (
        "Jordan's exception list (note 52(j)(13), 9903.06.20) covers all 395 Chapter 62 subheadings. CAFTA-DR textile goods "
        "of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua entered duty-free under "
        "CAFTA-DR are exempt (note 52(i), 9903.05.95). Goods properly entered under Chapter 98 — Haiti HOPE/HELP "
        "(9820.62.xx), AGOA (9819.11.xx), USMCA tariff preference levels — are outside the duty, except 9802 entries (note "
        "52(a)). No other country list names a Chapter 62 code. " + ENDED,
        "Most other suppliers pay the base rate plus 10% or 12.5%; Jordanian apparel and CAFTA-DR-claimed Central American "
        "apparel pay none, and Haiti and AGOA countries such as Kenya are not among the 60 economies.",
        ["eo-14389", "procl-11030"],
    ),
}
for k, (ex, wim, extra) in EXEMPT.items():
    if k not in IE:
        continue
    IE[k]["exemption"] = ex
    IE[k]["whatItMeans"] = wim
    for sid in extra:
        if sid not in IE[k]["sourceIds"]:
            IE[k]["sourceIds"].insert(len(IE[k]["sourceIds"]) - 1, sid)
add_sources(tu, [s for k, v in EXEMPT.items() if k in IE for s in v[2]])
for k, x in IE.items():
    assert "TODO" not in x["exemption"] + x["whatItMeans"], k

gen_changes = {c["id"]: c for c in tu["changes"]}
base = gen_changes["base-rates"]
base["title"] = "No Chapter 62 base-rate changes"
base["detail"] = (
    "All 1,247 Chapter 62 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
    "Edition; no line was added, split or renumbered."
)


def ch(id, type, date, label, title, detail, before, now, countries, sids):
    return {
        "id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail,
        "before": before, "now": now, "countries": countries, "sourceIds": sids,
    }


changes = [
    base,
    ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 List 4A continues",
       "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
       "four-year review. For Chapter 62 this keeps +7.5% (9903.88.15) on 358 of 395 subheadings, including cotton "
       "trousers, jeans, shirts and dresses.",
       None, None, "China", ["fr-2026-20510", "hts-now"]),
    ch("ca-ban", "reference", "2026-09-29", "Effective", "Canadian import bans do not reach Chapter 62",
       "Proclamations 11061–11063 banned some Canadian alcoholic beverages, dairy-scope products and motorcycles over 800 cc "
       "from September 29, 2026. No Chapter 62 line is on their annexes.",
       None, None, "Canada", ["procl-11061", "procl-11062", "procl-11063", "hts-now"]),
    ch("ca-338-scope", "reference", "2026-09-15", "Effective", "Section 338 list revised; 17 Chapter 62 subheadings listed",
       "Proclamations 11064 and 11065 changed the products on the 9903.03.14 list from September 15, 2026. Revision 21 "
       "lists " + CANADA_338 + " in U.S. note 51(b)(3).",
       "+50%", "+50%", "Canada", ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"]),
    ch("ca-338", "extraDuty", "2026-08-22", "Effective", "Canada Section 338 duty of 50% on Chapter 62 apparel",
       "Proclamation 11048 put a 50% duty (9903.03.14) on Canadian goods in U.S. note 51(b)(3), which names "
       + CANADA_338_SHORT + ". It is charged even when USMCA is claimed and on top of the 10% Section 301 duty on non-USMCA "
       "goods. Planned for August 19, it took effect August 22 after a 3-day suspension (Proclamation 11056).",
       None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"]),
    ch("s301-fl", "extraDuty", "2026-07-24", "Effective", "Section 301 tariffs on 60 economies reach every Chapter 62 line",
       "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84) — 10% for Bangladesh, India, Indonesia, "
       "Cambodia, Pakistan, Sri Lanka, Honduras, Guatemala, El Salvador, Mexico and Canada, 12.5% for China, Vietnam, "
       "Nicaragua, Egypt and Türkiye, 10% in total for the EU. No Chapter 62 code is on the general exemption list. "
       "Exempt: CAFTA-DR textile and apparel goods entered duty-free (note 52(i)), Jordan's list (all Chapter 62), "
       "Guatemala's and El Salvador's CAFTA-DR lists, USMCA goods (9903.05.93, 9903.05.94) and Chapter 98 entries such as "
       "Haiti HOPE/HELP and AGOA apparel. Other FTA claims remove the base rate but not this duty.",
       None, "+10% / +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "hts-chapter-99", "hts-now"]),
    ch("s122-end", "extraDuty", "2026-07-23", "Expired", "Section 122 import surcharge expired",
       "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
       "+10%", None, "All", ["procl-11012", "hts-now"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on products of Brazil",
       "25% on all goods of Brazil (9903.05.01); no Chapter 62 code is on Brazil's exemption list (U.S. note 50(a)(ii)). From "
       "July 24 the 12.5% 2026 action (9903.05.27) is added on top.",
       None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99", "hts-now"]),
    ch("usmca-review", "reference", "2026-07-01", "Announced", "USMCA joint review: not renewed, still in force",
       "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force "
       "pending resolution of the issues or until termination, so USMCA claims (SPI S) and the tariff preference levels "
       "still apply.",
       None, None, "Canada, Mexico", ["ustr-usmca-review"]),
    ch("de-minimis", "reference", "2026-06-24", "Effective", "De minimis exemption suspended indefinitely",
       "CBP's interim final rules keep duty-free de minimis treatment ($800) suspended for shipments by all modes, including "
       "mail, so low-value apparel orders pay duty and the extra duties like any other entry. On October 8, 2026 CBP "
       "proposed a new low-value shipment entry process.",
       "Suspended since August 29, 2025", "Suspended indefinitely", "All",
       ["cbp-ifr-dm", "cbp-ifr-mail", "cbp-nprm-lvs", "eo-14324"]),
    ch("uflpa-guidance", "reference", "2026-06-12", "Published", "CBP forced-labor guidance: apparel and cotton are high-priority sectors",
       "CBP's operational guidance lists the supply-chain tracing documents it expects for the UFLPA high-priority sectors, "
       "which include apparel and cotton products. Garments made wholly or in part in Xinjiang or by a listed entity — "
       "including with Xinjiang cotton spun or woven elsewhere — are presumed barred unless the importer rebuts the "
       "presumption.",
       None, None, "China (and goods with Chinese cotton)", ["cbp-fl-guidance", "pl-117-78"]),
    ch("haiti-agoa-hts", "reference", "2026-05-22", "Published", "AGOA and Haiti HOPE/HELP written into the schedule through 2026",
       "Proclamation 11030 put the Consolidated Appropriations Act, 2026 extensions into the HTS: AGOA duty-free treatment, "
       "the regional apparel and third-country fabric programs (9819.11.xx), and Haiti's HOPE/HELP apparel preferences "
       "(9820.62.xx, Chapter 98 subchapter XX note 6) all run through December 31, 2026. It also re-designated Gabon.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA countries, Haiti",
       ["procl-11030", "hts-now"]),
    ch("s301-excess", "pending", "2026-03-17", "Published", "Section 301 investigations of structural excess capacity",
       "USTR opened Section 301 investigations of 16 economies — among them China, Vietnam, Bangladesh, Cambodia, Indonesia, "
       "India and Mexico, the main apparel suppliers — over excess manufacturing capacity. No action has been announced.",
       None, "Investigation open", "16 economies", ["fr-2026-05214"]),
    ch("s122-start", "extraDuty", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs",
       "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 62 subheading was on the product "
       "exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico (9903.03.07, 9903.03.08) and CAFTA-DR "
       "textile and apparel goods entered duty-free (9903.03.09) were exempt.",
       None, "+10% (until July 23, 2026)", "All", ["procl-11012", "hts-now"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize "
       "tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped "
       "collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still "
       "printed in Revision 21 but are no longer in effect.",
       "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("agoa-renewed", "reference", "2026-02-03", "Signed", "AGOA and Haiti HOPE/HELP reauthorized through December 31, 2026",
       "The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025, with "
       "the third-country fabric program that lets apparel from lesser-developed AGOA countries such as Kenya use fabric "
       "from anywhere, and extended Haiti's HOPE/HELP apparel preferences to the same date. GSP remains expired since "
       "December 31, 2020.",
       "Lapsed (from September 30, 2025)", "In force to December 31, 2026", "AGOA countries, Haiti",
       ["ustr-agoa-2026", "crs-agoa", "procl-11030", "cbp-gsp"]),
    ch("india-oil-end", "extraDuty", "2026-02-07", "Effective", "India's extra 25% IEEPA duty removed",
       "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's "
       "25% reciprocal rate ended with the other IEEPA duties on February 24.",
       "+50%", "+25% (until February 24, 2026)", "India", ["eo-14384"]),
    ch("nicaragua-301", "pending", "2025-12-29", "Published", "Nicaragua Section 301 tariff phases in from 2027",
       "USTR's action on Nicaragua adds a duty on Nicaraguan goods that do not originate under CAFTA-DR (9903.89.01): 0% in "
       "2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 62 line; CAFTA-DR-originating "
       "apparel is not covered.",
       None, "0% in 2026 → 10% (2027) → 15% (2028)", "Nicaragua", ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"]),
    ch("cn-exclusions-extended", "reference", "2025-12-01", "Published", "China List 4A exclusions extended to November 9, 2026",
       "USTR extended 178 China Section 301 product exclusions, including the one for nonwoven disposable surgical and "
       "isolation gowns and other hospital apparel of 6210.10.50. It removes the 7.5% List 4A duty (9903.88.69) but not the "
       "12.5% 2026 duty.",
       None, "Excluded through November 9, 2026", "China", ["fr-2025-21671", "hts-chapter-99", "hts-now"]),
    ch("cn-ieepa-cut", "extraDuty", "2025-11-10", "Effective", "China fentanyl duty cut to 10%",
       "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 62 "
       "line on top of List 4A until it ended on February 24, 2026.",
       "+20%", "+10% (ended)", "China", ["eo-14357"]),
    ch("india-oil", "extraDuty", "2025-08-27", "Effective", "Extra 25% on products of India",
       "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% "
       "reciprocal rate in force since August 7, 2025: 50% in all on Indian garments. Ended February 7, 2026.",
       "+25%", "+50% (ended)", "India", ["eo-14329", "eo-14326"]),
    ch("de-minimis-2025", "reference", "2025-08-29", "Effective", "De minimis duty-free treatment suspended for all countries",
       "Executive Order 14324 suspended duty-free entry of shipments valued at $800 or less from all countries, so "
       "direct-to-consumer apparel parcels became dutiable.",
       "Free under $800", "Dutiable", "All", ["eo-14324", "cbp-dm-2025"]),
    ch("reciprocal-rates", "extraDuty", "2025-08-07", "Effective", "Country-specific reciprocal rates",
       "Executive Order 14326 replaced the 10% baseline with country rates: Vietnam, Bangladesh and Sri Lanka +20%, "
       "Cambodia, Indonesia, Pakistan and Thailand +19%, Nicaragua +18%, Jordan and Türkiye +15%, India +25%, and 15% in total "
       "for EU goods. Ended February 24, 2026.",
       "+10%", "+10% to +41% (ended)", "All except Canada, Mexico", ["eo-14326", "hts-now"]),
    ch("br-40", "extraDuty", "2025-08-06", "Effective", "40% IEEPA duty on products of Brazil",
       "Executive Order 14323 added 40% on goods of Brazil, on top of the 10% reciprocal duty. Ended February 24, 2026.",
       "+10%", "+50% (ended)", "Brazil", ["eo-14323"]),
    ch("ca-amended", "extraDuty", "2025-07-31", "Signed", "Canada additional duty raised to 35%",
       "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
       "+25%", "+35% (ended)", "Canada", ["eo-14325"]),
    ch("cn-reciprocal-10", "extraDuty", "2025-05-14", "Effective", "China reciprocal duty cut from 125% to 10%",
       "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for 90 days (later extended). Ended February 24, 2026.",
       "+125%", "+10% (ended)", "China", ["eo-14298"]),
    ch("cn-125", "extraDuty", "2025-04-10", "Effective", "China reciprocal duty raised to 125%",
       "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125%, on top of List 4A and the fentanyl duty.",
       "+84%", "+125% (ended)", "China", ["eo-14266"]),
    ch("reciprocal", "extraDuty", "2025-04-02", "Signed", "Reciprocal tariff on products of all countries",
       "10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. No Chapter 62 subheading was on "
       "the exemption list. Ended February 24, 2026.",
       None, "+10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
    ch("cn-ieepa", "extraDuty", "2025-03-04", "Effective", "China fentanyl duty raised to 20%",
       "The IEEPA duty on products of China and Hong Kong went from +10% (from February 4, 2025) to +20%, on top of List 4A.",
       "+10%", "+20% (ended)", "China", ["eo-14195", "eo-14228"]),
    ch("mx-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Mexico",
       "+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Mexico", ["eo-14194"]),
    ch("ca-imposed", "extraDuty", "2025-02-01", "Signed", "Additional duty on products of Canada",
       "+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt. Ended February 24, 2026.",
       None, "+25% (ended)", "Canada", ["eo-14193"]),
]
tu["changes"] = sorted(changes, key=lambda c: c["date"], reverse=True)
add_sources(tu, [s for c in changes for s in c["sourceIds"]])
for st in tu["stats"]:
    if st["label"] == "Base rates unchanged":
        st["value"] = "1,247 of 1,247"

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
te["h1"] = "Importing Woven Apparel (HTS Ch. 62): Origin Rules, UFLPA, Labeling, Flammability & Ways to Lower Duty"
te["seo"]["title"] = "Importing Clothing: Apparel Origin Rules, UFLPA, FTC Labels, CPSC & Ways to Lower Duty (HTS Chapter 62) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The CBP, FTC and CPSC rules for each HTS Chapter 62 line — apparel country of origin (19 CFR 102.21), manufacturer ID, "
    "UFLPA, fibre-content and care labels, clothing and children's sleepwear flammability — and the legal ways to pay less: "
    "USMCA and its preference levels, CAFTA-DR, Jordan, AGOA, Haiti HOPE/HELP, classification, first sale and drawback."
)
te["seo"]["keywords"] = [
    "apparel country of origin rules",
    "19 CFR 102.21 apparel",
    "clothing import requirements usa",
    "UFLPA apparel",
    "FTC textile labeling apparel",
    "care labeling rule",
    "16 CFR 1610 clothing flammability",
    "CAFTA-DR apparel rules of origin",
    "first sale for export apparel",
    "apparel sourcing",
]
te["intro"] = (
    "For most Chapter 62 garments **the country of origin is the country where the garment was wholly assembled** — cut "
    "panels sewn together — whatever the origin of the fabric (19 CFR 102.21); scarves, shawls and handkerchiefs (6213–6214) "
    "take the origin of the fabric instead. Every entry names the manufacturer by manufacturer identification code, garments "
    "with cotton face the UFLPA presumption, and garments sold at retail need fibre-content, origin and care labels (16 CFR "
    "parts 303 and 423). Clothing textiles must meet the CPSC flammability standard, and children's sleepwear the stricter "
    "sleepwear standards.\n\n"
    "The ways to pay less are in the schedule: **USMCA** (with tariff preference levels for non-regional fabric), **CAFTA-DR** "
    "for Central American apparel (also exempt from the 2026 Section 301 duty), **Jordan**, **AGOA** and **Haiti HOPE/HELP** "
    "through 2026, line-by-line classification (water-resistant and recreational performance outerwear lines), "
    "**first-sale valuation**, **drawback** and **foreign-trade zones**. Each depends on a document, listed below with its "
    "regulation."
)
te["regulationsAsOf"] = ECFR_DATE
te["levers"] = [
    {
        "id": "assembly-origin",
        "title": "Know where the garment is assembled — that is usually the country of origin",
        "saves": "The difference between country rates: 0% for Haiti or Kenya, +10% for Bangladesh or India, +12.5% for Vietnam, +20% for China",
        "appliesTo": "Headings 6201–6212 and 6215–6217 (where wholly assembled); 6213–6214 take the origin of the fabric",
        "document": "Production records showing where the panels were cut and sewn, and the MID of the assembling factory on the entry.",
        "caveat": "Origin moves only with real assembly: pressing, packing, labeling or minor sewing in a third country does not "
        "change it, and CBP denies entry to goods from factories it cannot verify (19 CFR 102.24). Moving assembly does not "
        "remove the UFLPA presumption for Xinjiang cotton.",
        "citations": [
            {"label": "19 CFR 102.21(c)", "url": ecfr(19, "102.21")},
            {"label": "19 CFR 102.23 (MID)", "url": ecfr(19, "102.23")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA — or a USMCA tariff preference level — on garments cut and sewn in Mexico or Canada",
        "saves": "The base rate (up to 28.6%) and the 10% Section 301 duty for Mexico or Canada",
        "appliesTo": "All lines, for garments cut and sewn in North America from regional yarn and fabric (General Note 11, chapter "
        "62 rules, with the pocket-bag and sewing-thread rules); garments of non-regional fabric within the annual tariff "
        "preference levels (9823.52.01, 9823.53.01)",
        "document": "A certification of origin from the importer, exporter or producer, with the SPI \"S\" on the entry line; "
        "for a tariff preference level, the TPL heading and its eligibility requirements.",
        "caveat": "Asian fabric sewn in Mexico qualifies only within a TPL. For Canada, USMCA does not remove the 50% Section 338 "
        "duty on " + CANADA_338_SHORT + ". The USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 62 rules)", "url": GN},
            {"label": "HTSUS Ch. 98 subch. XXIII, U.S. note 11 (TPLs)", "url": CH98},
            {"label": "HTSUS 9903.05.93 / 9903.05.94, U.S. note 51", "url": CH99},
        ],
    },
    {
        "id": "cafta",
        "title": "Claim CAFTA-DR — it also removes the 2026 Section 301 duty",
        "saves": "The base rate and the 10%–12.5% Section 301 duty on Central American and Dominican apparel",
        "appliesTo": "Garments of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua that originate "
        "under General Note 29 (yarn-forward, with the short-supply list) and are entered duty-free under CAFTA-DR (SPI P)",
        "document": "A CAFTA-DR claim with the SPI \"P\" on the entry line and records supporting origin; for Guatemala and El "
        "Salvador the exemption heading 9903.06.06 or 9903.06.09, for the others 9903.05.95.",
        "caveat": "Lines already Free at the general rate print no P and keep the Section 301 duty. Non-originating Nicaraguan "
        "goods will pay 10% from 2027 and 15% from 2028 (9903.89.01).",
        "citations": [
            {"label": "19 CFR 10.583 (claim)", "url": ecfr(19, "10.583")},
            {"label": "19 CFR 10.594 (originating goods)", "url": ecfr(19, "10.594")},
            {"label": "HTSUS General Note 29", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(i), (j)", "url": CH99},
        ],
    },
    {
        "id": "jordan",
        "title": "Source from Jordan",
        "saves": "The base rate under the Jordan FTA, and the 10% Section 301 duty for every Chapter 62 subheading",
        "appliesTo": "Garments that are products of Jordan under the FTA rules (General Note 18), entered with the SPI \"JO\"; "
        "Jordan's exception list (9903.06.20) covers all 395 Chapter 62 subheadings",
        "document": "Proof of origin under the U.S.–Jordan FTA and the SPI \"JO\" on the entry line.",
        "caveat": "The exception list removes the Section 301 duty even without an FTA claim, but the base rate stays unless "
        "the goods qualify.",
        "citations": [
            {"label": "HTSUS General Note 18", "url": GN},
            {"label": "HTSUS U.S. note 52(j)(13), 9903.06.20", "url": CH99},
        ],
    },
    {
        "id": "agoa-haiti",
        "title": "Use AGOA or Haiti HOPE/HELP for African and Haitian apparel (through December 31, 2026)",
        "saves": "The full base rate — up to 28.6% — on garments that would otherwise pay it; neither Haiti nor AGOA countries "
        "such as Kenya, Madagascar or Lesotho are among the 60 Section 301 economies",
        "appliesTo": "Apparel assembled in AGOA beneficiary countries (9819.11.03–9819.11.30; lesser-developed countries may use "
        "third-country fabric under 9819.11.12) and apparel assembled in Haiti under the HOPE/HELP rules (9820.62.05–9820.62.30)",
        "document": "The Chapter 98 heading with the Chapter 62 number; for AGOA, a textile certificate of origin and a visa "
        "from the beneficiary country.",
        "caveat": "Both programs are authorized only through December 31, 2026 (Proclamation 11030). Haiti's preferences have "
        "value-content rules or annual quantity limits.",
        "citations": [
            {"label": "19 CFR 10.213 (AGOA apparel)", "url": ecfr(19, "10.213")},
            {"label": "19 CFR 10.843 (Haiti)", "url": ecfr(19, "10.843")},
            {"label": "HTSUS Chapter 98, subchapters XIX and XX", "url": CH98},
            {"label": "Proclamation 11030 (91 FR 30469)", "url": src("procl-11030")["url"]},
        ],
    },
    {
        "id": "classify",
        "title": "Check the classification line by line — fibre, water resistance and outerwear features move the rate",
        "saves": "Up to 21 points of base rate: synthetic trousers are 27.9%–28.6%, but 7.1% if water resistant (additional U.S. "
        "note 2); man-made-fibre anoraks 27.7%, but 7.1% if water resistant and 4.4% if down-filled; recreational performance "
        "outerwear has its own lines",
        "appliesTo": "Coats and anoraks (6201, 6202), trousers (6203.4x, 6204.6x), ski-suits (6211.20) and any blend",
        "document": "A binding ruling request to CBP (19 CFR part 177) with fibre content by weight, construction and test "
        "results (AATCC 35 for water resistance); for recreational performance outerwear, records proving each feature "
        "(additional U.S. note 3(c)).",
        "caveat": "Classification follows the garment as imported and its real construction; a coating or feature added only to "
        "change the line must still meet the note's test. Rulings bind only the transaction described.",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Chapter 62 notes and additional U.S. notes 2–3", "url": CH62},
        ],
    },
    {
        "id": "ensemble",
        "title": "Report ensembles garment by garment",
        "saves": "Nothing on its own — but it gets the duty right: each garment of a suit-less ensemble pays its own rate on its "
        "own value, so the cheaper-rated pieces are not charged the higher rate",
        "appliesTo": "Ensembles of 6203.22.30, 6203.23.00, 6203.29.10–.30, 6204.21.00, 6204.22.30, 6204.23.00 and 6204.29.20–.40",
        "document": "An invoice that values each garment of the set separately, with the 10-digit line each garment would be "
        "entered under (statistical note 1).",
        "caveat": "The pieces must be of identical fabric and put up for retail sale (chapter note 3(b)); otherwise each garment is "
        "classified on its own. For China, 6203.23.00 and 6204.29.40 are not on List 4A even though their garments are.",
        "citations": [{"label": "HTSUS Chapter 62 note 3 and statistical note 1", "url": CH62}],
    },
    {
        "id": "us-components",
        "title": "Assemble abroad from U.S.-cut components (9802.00.80)",
        "saves": "Duty only on the value added abroad, not on the U.S. fabric and components",
        "appliesTo": "Garments assembled abroad from fabricated components cut in the United States and exported ready for assembly",
        "document": "A foreign assembler's declaration and the endorsed importer's declaration with costs of the U.S. components.",
        "caveat": "The 2026 Section 301 duty still applies to the value of the assembly (note 52(a)); bleaching, garment-dyeing or "
        "stone-washing abroad can disqualify the goods.",
        "citations": [
            {"label": "19 CFR 10.14", "url": ecfr(19, "10.14")},
            {"label": "19 CFR 10.24 (documentation)", "url": ecfr(19, "10.24")},
        ],
    },
    {
        "id": "china-exclusion",
        "title": "Use the China List 4A exclusion for disposable hospital apparel",
        "saves": "The 7.5% List 4A duty (the 12.5% 2026 duty still applies)",
        "appliesTo": "Nonwoven disposable surgical and isolation gowns and other hospital apparel of 6210.10.50.10 and .90, "
        "entered by November 9, 2026",
        "document": "Heading 9903.88.69 reported with the statistical number.",
        "caveat": "The exclusion ends after November 9, 2026 unless USTR extends it again.",
        "citations": [
            {"label": "HTSUS U.S. note 20(vvv)(iv), heading 9903.88.69", "url": CH99},
            {"label": "90 FR 55232 (exclusions extended)", "url": src("fr-2025-21671")["url"]},
        ],
    },
    {
        "id": "first-sale",
        "title": "Value at the first sale for export when you buy through a middleman",
        "saves": "Every ad valorem duty — base rate and Section 301 — is charged on a lower value when the factory's price to a "
        "trading company is lower than the price you pay",
        "appliesTo": "All lines bought through a trading company, agent-buyer or vendor rather than straight from the factory",
        "document": "Proof that the first sale was a bona fide sale for export to the United States at arm's length: the "
        "factory invoice, contracts and payment records.",
        "caveat": "Only a sale clearly destined for the U.S. qualifies, and the importer must be able to show the earlier price at entry.",
        "citations": [{"label": "19 CFR 152.103", "url": ecfr(19, "152.103")}],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when garments are exported or destroyed",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on garments re-exported unused or destroyed",
        "appliesTo": "All lines — useful for unsold or returned stock shipped to Canadian, Mexican or other markets",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export.",
        "caveat": "Only duties actually paid are refunded; USMCA limits drawback on goods exported to Canada or Mexico.",
        "citations": [{"label": "19 CFR part 190", "url": ecfr_part(19, 190)}],
    },
    {
        "id": "ftz",
        "title": "Hold, relabel or kit garments in a foreign-trade zone",
        "saves": "No duty on garments re-exported from the zone, and duty deferred until they enter the U.S. market",
        "appliesTo": "Any line — useful for apparel distributed to Canada, Mexico and the U.S. from one stock",
        "document": "Zone admission (CBP Form 214) and the zone operator's inventory records.",
        "caveat": "Garments entered for U.S. consumption from a zone pay the duties in force on the entry date.",
        "citations": [{"label": "19 CFR part 146", "url": ecfr_part(19, 146)}],
    },
]
te["rules"] = [
    {
        "id": "textile-origin",
        "agency": "CBP",
        "title": "Apparel country of origin: for 6201–6212 and 6215–6217 the country where the garment was wholly assembled "
        "(one-piece articles: where the fabric was formed); for handkerchiefs, scarves and shawls (6213–6214) the country where "
        "the fabric was formed, or for some silk and man-made-fibre ones the country that dyed and printed it (102.21(e)(2))",
        "citations": [{"label": "19 CFR 102.21(c), (e)", "url": ecfr(19, "102.21")}],
    },
    {
        "id": "textile-mid",
        "agency": "CBP",
        "title": "Manufacturer identification code (MID) of the company that performed the origin-conferring operation on every "
        "entry — this replaced the textile declaration, eliminated in 2011",
        "citations": [
            {"label": "19 CFR 102.23", "url": ecfr(19, "102.23")},
            {"label": "76 FR 14575 (textile declarations eliminated)", "url": src("fr-2011-6253")["url"]},
        ],
    },
    {
        "id": "cita-transship",
        "agency": "CBP / CITA",
        "title": "Entry is denied for apparel from a company named in the Federal Register for illegal transshipment or for "
        "being unable to verify production",
        "citations": [{"label": "19 CFR 102.24", "url": ecfr(19, "102.24")}],
    },
    {
        "id": "invoice",
        "agency": "CBP",
        "title": "Invoice details for wearing apparel: fibre content by weight, whether woven or knit, the manufacturer and the "
        "country where made, among the textile-specific data",
        "citations": [
            {"label": "19 CFR 141.86", "url": ecfr(19, "141.86")},
            {"label": "19 CFR 141.89 (Wearing apparel)", "url": ecfr(19, "141.89")},
        ],
    },
    {
        "id": "uflpa",
        "agency": "CBP",
        "title": "UFLPA: goods made wholly or in part in Xinjiang or by an entity on the UFLPA Entity List are presumed made "
        "with forced labor and excluded unless the importer rebuts it; apparel and cotton are high-priority sectors, so "
        "garments need tracing documents back to the cotton or fibre",
        "citations": [
            {"label": "P.L. 117-78 (UFLPA)", "url": src("pl-117-78")["url"]},
            {"label": "CBP forced labor operational guidance (June 2026)", "url": src("cbp-fl-guidance")["url"]},
        ],
    },
    {
        "id": "ftc-labeling",
        "agency": "FTC",
        "title": "Textile Act labels on every garment sold at retail: generic fibre content by percentage, the RN or company "
        "name, and the country where made (\"Made in Vietnam\")",
        "citations": [
            {"label": "16 CFR 303.16 (label contents)", "url": ecfr(16, "303.16")},
            {"label": "16 CFR 303.33 (country of origin)", "url": ecfr(16, "303.33")},
        ],
    },
    {
        "id": "ftc-care",
        "agency": "FTC",
        "title": "Care Labeling Rule: a permanent label with washing or dry-cleaning instructions on textile wearing apparel; "
        "gloves and hats are outside the definition, and fully reversible garments without pockets are exempt",
        "citations": [
            {"label": "16 CFR 423.1(g) (definition)", "url": ecfr(16, "423.1")},
            {"label": "16 CFR 423.6", "url": ecfr(16, "423.6")},
            {"label": "16 CFR 423.8 (exemptions)", "url": ecfr(16, "423.8")},
        ],
    },
    {
        "id": "ftc-wool",
        "agency": "FTC",
        "title": "Wool Products Labeling Act: wool and cashmere coats, suits, blazers and scarves must show wool fibre content "
        "and origin; fur trim needs a Fur Act label",
        "citations": [
            {"label": "16 CFR part 300", "url": ecfr_part(16, 300)},
            {"label": "16 CFR part 301 (fur)", "url": ecfr_part(16, 301)},
        ],
    },
    {
        "id": "cpsc-1610",
        "agency": "CPSC",
        "title": "Flammability of clothing textiles: fabrics used in apparel must not be Class 3 (dangerously flammable). Plain "
        "fabrics of 2.6 oz/yd² or more and all-acrylic, modacrylic, nylon, olefin, polyester or wool fabrics need no testing to "
        "support a guaranty; gloves up to 14 inches and interlinings are outside the standard",
        "citations": [
            {"label": "16 CFR 1610.1", "url": ecfr(16, "1610.1")},
            {"label": "16 CFR 1610.4", "url": ecfr(16, "1610.4")},
        ],
    },
    {
        "id": "cpsc-sleepwear",
        "agency": "CPSC",
        "title": "Children's sleepwear sizes 0–14 (nightgowns, pajamas, robes) must meet the stricter sleepwear flammability "
        "standards unless tight-fitting or an infant garment of 9 months or smaller",
        "citations": [
            {"label": "16 CFR part 1615 (sizes 0–6X)", "url": ecfr_part(16, 1615)},
            {"label": "16 CFR part 1616 (sizes 7–14)", "url": ecfr_part(16, 1616)},
        ],
    },
    {
        "id": "cpsc-children",
        "agency": "CPSC",
        "title": "Children's apparel (12 and under) needs a Children's Product Certificate based on third-party testing (lead in "
        "paint and accessories, flammability), and upper outerwear in sizes 2T–16 with neck or hood drawstrings is a "
        "substantial product hazard",
        "citations": [
            {"label": "16 CFR part 1110", "url": ecfr_part(16, 1110)},
            {"label": "16 CFR 1120.3(b) (drawstrings)", "url": ecfr(16, "1120.3")},
        ],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the garment (in practice, the FTC label) or its retail container",
        "citations": [
            {"label": "19 CFR part 134", "url": ecfr_part(19, 134)},
            {"label": "19 CFR 134.11", "url": ecfr(19, "134.11")},
        ],
    },
]
BASE_RULES = ["textile-origin", "textile-mid", "cita-transship", "invoice", "uflpa", "ftc-labeling", "ftc-care", "cbp-marking", "cpsc-1610"]
CHILD = ["cpsc-children"]
GROUP_RULES = {
    "6201": BASE_RULES + ["ftc-wool"] + CHILD,
    "6202": BASE_RULES + ["ftc-wool"] + CHILD,
    "6203": BASE_RULES + ["ftc-wool"] + CHILD,
    "6204": BASE_RULES + ["ftc-wool"] + CHILD,
    "6205": BASE_RULES + CHILD,
    "6206": BASE_RULES + CHILD,
    "6207": BASE_RULES + ["cpsc-sleepwear"] + CHILD,
    "6208": BASE_RULES + ["cpsc-sleepwear"] + CHILD,
    "6209": BASE_RULES + ["cpsc-sleepwear"] + CHILD,
    "6210": BASE_RULES,
    "6211": BASE_RULES + ["ftc-wool"] + CHILD,
    "6212": BASE_RULES,
    "6213": BASE_RULES,
    "6214": BASE_RULES + ["ftc-wool"],
    "6215": BASE_RULES,
    "6216": [r for r in BASE_RULES if r not in ("cpsc-1610", "ftc-care")] + ["ftc-wool"],
    "6217": BASE_RULES,
}
GROUP_NOTES = {
    "6201": "Origin is where the coat was assembled. Down-filled, water-resistant and recreational performance outerwear lines "
    "carry much lower rates than plain man-made-fibre anoraks (27.7%). Children's jackets with hood drawstrings are a "
    "substantial product hazard. Five subheadings are on Canada's Section 338 list.",
    "6202": "As 6201, for women's and girls' coats. Down-filled and padded man-made-fibre coats (6202.40.10, .55, .60) are on "
    "Canada's Section 338 list.",
    "6203": "Origin is where assembled. Ensembles pay each garment's rate and must be valued garment by garment. Men's cotton "
    "jeans are 6203.42.45.11 (6203.42.07.11 if recreational performance outerwear). Wool suits and blazers are on Canada's "
    "Section 338 list.",
    "6204": "Origin is where assembled. Ensembles pay each garment's rate. Women's jeans are 6204.62.80.11. Synthetic and silk "
    "dresses (6204.43.40, 6204.49.10) are on Canada's Section 338 list.",
    "6205": "Origin is where assembled. Cotton shirts carry 19.7% and need UFLPA cotton tracing; man-made-fibre shirts carry a "
    "compound rate.",
    "6206": "Origin is where assembled. Cotton blouses 15.4%, man-made fibres 26.9%.",
    "6207": "Children's pajamas and robes must meet the sleepwear flammability standards (16 CFR parts 1615, 1616).",
    "6208": "Children's nightgowns, pajamas and robes must meet the sleepwear flammability standards; adult sleepwear meets 16 "
    "CFR part 1610.",
    "6209": "Babies' garments (body height up to 86 cm) are children's products needing a Children's Product Certificate; "
    "sleepwear for infants of 9 months or smaller is outside the sleepwear standards but must meet part 1610.",
    "6210": "Nonwoven disposable hospital apparel (6210.10.50) is Free and excluded from China List 4A through November 9, 2026. "
    "Coated man-made-fibre garments (6210.20.50, 6210.40.55, 6210.50.55) are on Canada's Section 338 list.",
    "6211": "Swimwear, ski-suits and coveralls; ski-suits must meet chapter note 7. Coveralls of 6211.32.90, 6211.33.90 and "
    "6211.43.10 are on Canada's Section 338 list.",
    "6212": "Bras are classified here whether woven or knitted. Origin is where assembled.",
    "6213": "Handkerchiefs take the origin of the fabric. Squares over 60 cm a side are 6214.",
    "6214": "Scarves and shawls take the origin of the country where the fabric was formed; wool and cashmere need Wool Act labels.",
    "6215": "Origin is where assembled. Man-made-fibre ties (6215.20) are not on China List 4A.",
    "6216": "Gloves up to 14 inches are outside the clothing flammability standard. Two lines carry Russia's 35% rate.",
    "6217": "Accessories of two or more parts take the origin of assembly; one-piece accessories and parts take the origin of the fabric.",
}
for g in te["groups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["ruleIds"] = GROUP_RULES[g["heading"]]
    g["note"] = GROUP_NOTES[g["heading"]]
ENSEMBLE = ("6203.22.30", "6203.23.00", "6203.29.10", "6203.29.15", "6203.29.20", "6203.29.30", "6204.21.00", "6204.22.30",
            "6204.23.00", "6204.29.20", "6204.29.40")
CLASSIFY = ("6201", "6202", "6203.4", "6204.6", "6211.2", "6210")
for ln in te["lines"]:
    h = ln["hts"]
    hd = h[:4]
    ln["ruleIds"] = GROUP_RULES[hd]
    lev = ["assembly-origin", "usmca", "cafta", "jordan", "agoa-haiti"]
    if h.startswith(CLASSIFY):
        lev.append("classify")
    if h.startswith(ENSEMBLE):
        lev.append("ensemble")
    if h.startswith("6210.10.50"):
        lev.append("china-exclusion")
    lev += ["us-components", "first-sale", "drawback", "ftz"]
    ln["leverIds"] = lev
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Exception lists, China exclusions, "
    "the Canada Section 338 list and the AGOA and Haiti programs change by proclamation and notice; check them before each "
    "shipment."
)

# ---------------------------------------------------------------- finalConclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 62 FAQ: HS Codes & Import Tariffs for Jeans, Trousers, Shirts, Dresses, Jackets & Bras"
fc["seo"]["title"] = "Jeans, Shirt, Dress & Jacket HS Code and Apparel Tariff FAQ 2026 (HTS Chapter 62) | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about importing woven clothing: the HS code for jeans, pants, shirts, dresses, jackets, "
    "suits, bras, scarves and gloves, and the 2026 tariffs on clothing from China, Vietnam, Bangladesh, India and Mexico."
)
fc["seo"]["keywords"] = [
    "hs code for jeans",
    "hs code for pants",
    "hs code for shirts",
    "hs code for dress",
    "hs code for jacket",
    "hs code 6203",
    "hs code 6204",
    "hs code for bra",
    "tariff on clothing from china",
    "tariff on clothing from india to usa",
    "apparel tariffs by country",
    "us apparel imports by country",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing woven clothing into the U.S. — HS codes, tariffs by "
    "country and entry rules. Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Chapter 62 base rates run from Free to 28.6% and are unchanged since January 2025: cotton jeans and trousers 16.6%, "
    "synthetic trousers 27.9%–28.6%, men's cotton shirts 19.7%, cotton blouses 15.4%, bras 16.9%. Ensembles pay each "
    "garment's own rate.",
    "Since July 24, 2026 Bangladesh, India, Indonesia, Cambodia, Pakistan and Sri Lanka pay 10% Section 301 on top of the base "
    "rate, Vietnam 12.5%, EU suppliers 10% in total. China pays 20% on most lines (12.5% plus List 4A).",
    "CAFTA-DR apparel entered duty-free, Jordanian apparel and USMCA goods pay no Section 301 duty; Haiti and AGOA countries "
    "are outside it, with their apparel preferences in force through December 31, 2026.",
    "Canada pays 50% under Section 338 on 17 Chapter 62 subheadings, even with USMCA. The IEEPA tariffs ended February 24, "
    "2026 and the Section 122 surcharge July 23, 2026.",
    "Origin is where the garment is sewn, not where the fabric came from (19 CFR 102.21), but cotton garments still face the "
    "UFLPA presumption for Xinjiang cotton. No antidumping or countervailing order covers Chapter 62.",
]
fc["questionSource"] = "Google search suggestions, collected October 13, 2026"
fc["faqs"] = [
    {
        "id": "hts-chapter-62",
        "question": "What does HTS Chapter 62 cover?",
        "searchedAs": ["hts chapter 62", "htsus chapter 62", "hs code 62", "us hts chapter 62", "2026 hts chapter 62", "hts code chapter 62"],
        "answer": "Woven (not knitted) clothing and accessories: coats and anoraks (6201–6202), suits, ensembles, blazers, "
        "trousers, jeans, shorts, dresses and skirts (6203–6204), shirts and blouses (6205–6206), underwear and sleepwear "
        "(6207–6208), babies' garments (6209), coated and nonwoven garments (6210), swimwear and ski-suits (6211), bras "
        "(6212), handkerchiefs, scarves, ties, gloves and other accessories (6213–6217). Knitted clothing is chapter 61.",
        "link": "",
    },
    {
        "id": "jeans-hs-code",
        "question": "What is the HS code and tariff for jeans?",
        "searchedAs": ["hs code for jeans", "hts code for denim jeans", "denim pants hs code", "hs code for jeans women", "hs code for jeans mens", "hs code 6203.42", "hs code 6204.62"],
        "answer": "Men's blue denim jeans of cotton are 6203.42.45.11, women's 6204.62.80.11 (boys' and girls' have their own "
        "lines); both carry 16.6%. Denim jeans of synthetic fibres are 6203.43 or 6204.63 at 27.9%–28.6%; knitted jeggings "
        "are chapter 61. From Bangladesh jeans pay 26.6% in all, from Vietnam 29.1%, from China 36.6%.",
        "link": "industry-areas",
    },
    {
        "id": "pants-hs-code",
        "question": "What is the HS code for pants and trousers?",
        "searchedAs": ["hs code for pants", "hs code for trousers", "hs code for pants cotton", "hs code for pants polyester", "hs code 6203.43", "hs code 6204.63"],
        "answer": "Men's and boys' woven trousers and shorts are 6203.41 (wool), 6203.42 (cotton, 16.6%), 6203.43 (synthetic, "
        "27.9%) and 6203.49 (other); women's and girls' are 6204.61–6204.69 (cotton 16.6%, synthetic 28.6%). Water-resistant "
        "synthetic trousers meeting additional U.S. note 2 are 7.1%.",
        "link": "",
    },
    {
        "id": "shirts-hs-code",
        "question": "What is the HS code for shirts and blouses?",
        "searchedAs": ["hs code for shirts", "hs code for shirts men", "hs code for shirts cotton", "hs code 6205", "hs code 6206", "hs code for shirt women"],
        "answer": "Men's and boys' woven shirts are 6205: cotton 6205.20 (19.7%), man-made fibres 6205.30 (29.1¢/kg + 25.9%). "
        "Women's and girls' blouses and shirts are 6206: cotton 6206.30 (15.4%), man-made fibres 6206.40 (26.9%), silk "
        "6206.10 (6.9%). Knitted shirts, polos and T-shirts are chapter 61.",
        "link": "",
    },
    {
        "id": "dress-hs-code",
        "question": "What is the HS code for dresses?",
        "searchedAs": ["hs code for dress", "hs code for dress cotton", "hs code for dress polyester", "hs code 6204.43", "hs code 6204.42"],
        "answer": "Woven women's and girls' dresses are 6204.41–6204.49: cotton 6204.42 (mostly 8.4%), synthetic 6204.43 (16%), "
        "artificial fibres such as rayon 6204.44, silk and other 6204.49. Synthetic and silk dresses (6204.43.40, 6204.49.10) "
        "from Canada pay a 50% Section 338 duty.",
        "link": "",
    },
    {
        "id": "jacket-hs-code",
        "question": "What is the HS code for jackets and coats?",
        "searchedAs": ["hs code for jacket", "hs code for jacket women's", "hs code for down jacket", "hs code for puffer jacket", "hs code 6201", "hs code 6202", "hs code 6201.40"],
        "answer": "Woven coats, anoraks, windbreakers and padded vests are 6201 (men's) and 6202 (women's). Man-made-fibre "
        "anoraks are 27.7%, 7.1% if water resistant and 4.4% if down-filled (15% or more down and plumage); cotton 4.4%–9.4%. "
        "Suit-type jackets and blazers are 6203.3x and 6204.3x; leather jackets are 4203.",
        "link": "",
    },
    {
        "id": "suit-ensemble",
        "question": "What is the HS code for suits, blazers and ensembles, and how are ensembles taxed?",
        "searchedAs": ["hs code for suit", "hs code for blazer", "hs code for suit jacket", "ensemble hs code", "men ensemble hs code", "women ensemble hs code"],
        "answer": "Suits are 6203.11–.19 and 6204.11–.19 (wool 17.5% men's, 14% women's); blazers 6203.31–.39 and "
        "6204.31–.39. Ensembles (6203.22–.29, 6204.21–.29) pay the rate of each garment as if entered separately: the importer "
        "lists each garment's line and value, each is charged its own rate, and extra duties apply to the whole value.",
        "link": "",
    },
    {
        "id": "bra-hs-code",
        "question": "What is the HS code for bras?",
        "searchedAs": ["hs code for bra", "hs code 6212", "hs code 6212.10", "hs code 6212.90"],
        "answer": "Brassieres are 6212.10 whether woven or knitted, mostly at 16.9%. Girdles are 6212.20 (20%), corsets 6212.30 "
        "(23.5%), braces and suspenders 6212.90 (6.6%). Sri Lankan bras pay 26.9% in all with the 10% Section 301 duty.",
        "link": "",
    },
    {
        "id": "scarf-gloves",
        "question": "What are the HS codes for scarves and gloves?",
        "searchedAs": ["hs code for scarf", "hs code for silk scarf", "hs code for scarf wool", "hs code 6214", "hs code for gloves"],
        "answer": "Woven scarves and shawls are 6214: silk 6214.10 (1.2%–3.9%), wool 6214.20 (6.7%), synthetic 6214.30 and "
        "artificial 6214.40 (5.3%). Squares no more than 60 cm a side are handkerchiefs (6213). Woven gloves are 6216 (Free "
        "to 23.5%); knitted gloves are 6116 and leather gloves 4203.",
        "link": "",
    },
    {
        "id": "china-clothing",
        "question": "What is the tariff on clothing from China in 2026?",
        "searchedAs": ["tariff on clothing from china", "tariff on apparel from china to usa", "current tariff on clothing from china", "are there tariffs on clothing from china", "china apparel tariffs"],
        "answer": "For Chapter 62, every line pays 12.5% under the 2026 Section 301 action (9903.05.31), and 358 of 395 "
        "subheadings also pay 7.5% under List 4A: 20% on top of the base rate — 39.7% on cotton shirts, 36.6% on cotton "
        "jeans. Synthetic ensembles, rainwear, synthetic scarves and ties pay 12.5% extra. The IEEPA duties ended February "
        "24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "india-clothing",
        "question": "What is the tariff on clothing from India to the USA?",
        "searchedAs": ["tariff on clothing from india to usa", "us tariff on garments from india", "tariffs on clothes from india to us", "india apparel tariffs"],
        "answer": "Indian woven apparel pays the base rate plus 10% Section 301 (9903.05.44), with no exception list: 18.4% on "
        "most cotton dresses, 25.4% on cotton blouses, 26.6% on cotton trousers. India's 50% IEEPA rate of late 2025 ended "
        "in February 2026; GSP has been expired since 2020.",
        "link": "industry-areas",
    },
    {
        "id": "vietnam-bangladesh",
        "question": "What are the tariffs on clothing from Vietnam and Bangladesh?",
        "searchedAs": ["tariffs on clothing from vietnam", "bangladesh apparel tariffs", "apparel tariffs by country", "us apparel imports bangladesh vs india"],
        "answer": "Vietnam pays the base rate plus 12.5% (9903.05.84) and Bangladesh plus 10% (9903.05.26) under the 2026 "
        "Section 301 action; neither has an exception list for Chapter 62. Cotton jeans pay 29.1% from Vietnam and 26.6% "
        "from Bangladesh. Their 20% IEEPA rates ended February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "mexico-canada",
        "question": "Are there tariffs on clothing from Mexico and Canada?",
        "searchedAs": ["tariffs on clothing from mexico", "mexico apparel tariffs", "tariff on clothing from canada"],
        "answer": "Garments that qualify under USMCA — cut and sewn in North America from regional yarn and fabric, or within a "
        "tariff preference level — enter Free and pay no Section 301 duty. Other Mexican and Canadian garments pay the base "
        "rate plus 10%. Canada also pays 50% under Section 338 on 17 subheadings (wool suits, down coats, synthetic dresses), "
        "with or without USMCA.",
        "link": "industry-areas",
    },
    {
        "id": "cafta-haiti",
        "question": "Is apparel from Central America and Haiti duty-free?",
        "searchedAs": ["cafta apparel", "haiti hope apparel", "us apparel imports by country"],
        "answer": "CAFTA-DR apparel from Honduras, Nicaragua, Guatemala, El Salvador, the Dominican Republic and Costa Rica "
        "that meets the yarn-forward rule enters Free with the SPI P and is exempt from the 2026 Section 301 duty (note "
        "52(i)). Haitian apparel can enter Free under HOPE/HELP (9820.62.xx) through December 31, 2026, and Haiti is not "
        "among the Section 301 economies.",
        "link": "tariff-engineering",
    },
    {
        "id": "importing-countries",
        "question": "Where does the U.S. import woven apparel from?",
        "searchedAs": ["us apparel imports by country", "us clothing imports by country", "us apparel imports", "apparel imports by country"],
        "answer": f"In {YEAR} the U.S. imported {m(TOTAL)} of Chapter 62 goods: Vietnam {imp('Vietnam')} ({sh('Vietnam')}), "
        f"Bangladesh {imp('Bangladesh')} ({sh('Bangladesh')}), China {imp('China')} ({sh('China')}, down 34% on 2024), India "
        f"{imp('India')}, Indonesia {imp('Indonesia')} and Mexico {imp('Mexico')}, then Italy, Cambodia, Pakistan and Sri "
        "Lanka. Trousers and jeans (6203–6204) are more than half of the total.",
        "link": "understand-industry",
    },
]

# ---------------------------------------------------------------- understandIndustry
ui["h1"] = "HTS Chapter 62: Woven Apparel — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = "U.S. Apparel Imports by Country: Vietnam, Bangladesh, China, India — HTS Chapter 62 Statistics | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of woven coats, suits, jeans, trousers, shirts, dresses, bras and accessories 2020–2025 by country and "
    f"product: {m(TOTAL)} in 2025. Vietnam supplied {sh('Vietnam')}, Bangladesh {sh('Bangladesh')} and China {sh('China')}."
)
ui["seo"]["keywords"] = [
    "us apparel imports by country",
    "us clothing imports by country",
    "Vietnam apparel imports",
    "Bangladesh apparel exports to US",
    "China apparel imports 2025",
    "apparel sourcing",
    "woven apparel imports",
]
for st in ui["stats"]:
    st["label"] = st["label"].replace("Viet Nam", "Vietnam")
    if st["label"] == "Largest product":
        st["note"] = "Men's and boys' cotton trousers, jeans and shorts (6203.42)"
ui["byYearPartners"] = ["Vietnam", "Bangladesh"]
ui["byYearCaption"] = (
    "U.S. imports of Chapter 62 goods each year, split into the two largest 2025 suppliers (Vietnam and Bangladesh) and "
    "everyone else. 2022 was the post-pandemic restocking peak."
)
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["why"] = (
    f"U.S. imports of Chapter 62 goods were **{m(TOTAL)} in {YEAR}**, 3.4% less than the $36.33B of 2024 and well below the "
    f"$44.57B peak of 2022. **Vietnam** shipped **{imp('Vietnam')}** ({sh('Vietnam')}, up 5.4%) and **Bangladesh** "
    f"**{imp('Bangladesh')}** ({sh('Bangladesh')}, up 9.6%), mostly trousers, jeans and jackets. **China** fell 34% to "
    f"**{imp('China')}** ({sh('China')}) — it was the top supplier in 2020 at $10.19B. India ({imp('India')}), Indonesia "
    f"({imp('Indonesia')}) and Mexico ({imp('Mexico')}) follow; Italy ({imp('Italy')}) ships mostly tailored and luxury "
    f"garments, Sri Lanka ({imp('Sri Lanka')}) mostly bras.\n\n"
    "By product, trousers, jeans and shorts dominate: men's cotton trousers 6203.42 ($4.42B), women's cotton trousers "
    "6204.62 ($4.06B) and men's synthetic trousers 6203.43 ($2.20B), then bras 6212.10 ($1.88B) and men's cotton shirts "
    "6205.20 ($1.68B). Headings 6203 and 6204 together were $18.40B — more than half the chapter.\n\n"
    "Imports kept shifting away from China in 2025, when Chinese garments carried List 4A, the IEEPA fentanyl duty and, from "
    "April, the reciprocal tariff; Cambodia rose 16% to $1.40B and Bangladesh 10%. Central American suppliers using "
    "CAFTA-DR (Honduras $408M, Nicaragua $285M, Guatemala $133M, El Salvador $90M), Jordan ($528M, up 15%), Kenya ($311M) "
    "and Haiti ($135M) ship largely duty-free under trade preferences. The IEEPA duties ended on February 24, 2026; since "
    "July 24, 2026 a Section 301 tariff of 10% or 12.5% applies to most Asian suppliers instead. 2025 is the latest full "
    "year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 62 (retrieved 2026-10-13)", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level, for calendar years 2020–2025. \"Viet Nam\" is UN Comtrade's name for Vietnam."
)

# ---------------------------------------------------------------- industryAreas
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 62 Tariff Rates by Country: Vietnam, Bangladesh, China, India, Mexico & CAFTA-DR"
ia["seo"]["title"] = "Apparel Tariffs by Country 2026: Vietnam, Bangladesh, China, India, Mexico, Honduras — HTS Chapter 62 | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on woven coats, suits, jeans, shirts, dresses and bras by country: base rate plus the 2026 "
    "Section 301 duty, China List 4A, Canada's 50% Section 338 duty, with USMCA, CAFTA-DR and Jordan applied."
)
ia["seo"]["keywords"] = [
    "apparel tariffs by country",
    "tariff on clothing from Vietnam",
    "tariff on clothing from Bangladesh",
    "tariff on clothing from China",
    "tariff on clothing from India to USA",
    "Mexico apparel tariffs",
    "CAFTA-DR apparel duty free",
    "USMCA tariffs apparel",
    "apparel industry tariffs",
]
ia["intro"] = (
    "The total rate on a pair of trousers or a shirt depends as much on **where it was sewn** as on the line. Each cell below "
    "is the base rate for that product group plus the extra duty for that country, minus any preference — computed from "
    "the current tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** "
    "(from July 24, 2026): **Bangladesh, India, Indonesia, Cambodia, Pakistan and Sri Lanka +10%**, **Vietnam +12.5%**, EU "
    "goods 10% in total. **China pays +20%** on most lines (12.5% plus List 4A). **Jordan** and **CAFTA-DR** suppliers "
    "claiming duty-free entry pay nothing, **USMCA goods from Mexico pay nothing**, and Canada pays 50% on 17 Section 338 "
    "subheadings even with USMCA.\n\n"
    "Ensemble lines show the HTS wording \"the rate applicable to each garment in the ensemble if separately entered\" plus "
    "the extra duty: the base part depends on which garments are in the set and their values, which the tariff calculator "
    "asks for."
)
EU_RULE = ("EU: 10% in total in place of the base rate (9903.05.39), or the base rate where it is 10% or more — so most "
           "cotton and synthetic garments pay only the base rate; no exception list for Chapter 62. The 15% IEEPA rate ended "
           "February 24, 2026.")
CAFTA_RULE = ("With a CAFTA-DR claim (SPI P), as shown: Free and no Section 301 duty on the 1,221 lines that print P — "
              "apparel entered duty-free under CAFTA-DR is exempt (note 52(i), 9903.05.95){extra}. The 26 lines already Free "
              "at the general rate (silk-rich garments, down-filled trousers, disposable hospital apparel, hockey gloves) "
              "print no P and pay {pct} ({code}). Goods that do not qualify pay the base rate plus {pct}.")
RULES = {
    "Vietnam": "Base rate plus 12.5% Section 301 (9903.05.84) on every line; no exception list. The 20% IEEPA rate ended "
    "February 24, 2026.",
    "Bangladesh": "Base rate plus 10% Section 301 (9903.05.26); Bangladesh's exception list names no Chapter 62 subheading. "
    "GSP has expired.",
    "China": "Base rate plus 12.5% (9903.05.31) on every line, plus 7.5% List 4A (9903.88.15) on 358 of 395 subheadings: +20% "
    "on cotton jeans, shirts, dresses and most others; +12.5% on synthetic ensembles (6203.23.00), rainwear, synthetic "
    "scarves, ties, handkerchiefs and the List 4A-excluded disposable hospital gowns.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on every line; no exception list. GSP has expired; the IEEPA duties "
    "(up to 50%) ended in February 2026.",
    "Indonesia": "Base rate plus 10% Section 301 (9903.05.45); Indonesia's exception list names no Chapter 62 subheading.",
    "Mexico": "USMCA-qualifying: base rate only (9903.05.94), and the base rate is Free under USMCA — for garments cut and sewn "
    "in North America from regional yarn and fabric, or within a tariff preference level. Otherwise the base rate plus 10% "
    "(9903.05.55).",
    "Italy": EU_RULE,
    "Cambodia": "Base rate plus 10% Section 301 (9903.05.28); Cambodia's exception list names no Chapter 62 subheading.",
    "Pakistan": "Base rate plus 10% Section 301 (9903.05.62); no exception list. GSP has expired.",
    "Sri Lanka": "Base rate plus 10% Section 301 (9903.05.72); no exception list. GSP has expired.",
    "Jordan": "No Section 301 duty: Jordan's exception list (9903.06.20) covers every Chapter 62 subheading. With the Jordan "
    "FTA claim (SPI JO), as shown, garments are Free; without it, the base rate only.",
    "Honduras": CAFTA_RULE.format(extra="", pct="10%", code="9903.05.42"),
    "Nicaragua": CAFTA_RULE.format(extra="", pct="12.5%", code="9903.05.58")
    + " Non-originating goods will also pay 10% from 2027 (9903.89.01).",
    "Guatemala": CAFTA_RULE.format(extra="; Guatemala's CAFTA-DR list (9903.06.06) also covers every subheading", pct="10%",
                                   code="9903.05.40"),
    "El Salvador": CAFTA_RULE.format(extra="; El Salvador's CAFTA-DR list (9903.06.09) also covers every subheading",
                                     pct="10%", code="9903.05.37"),
    "Canada": "USMCA-qualifying: no Section 301 duty (9903.05.93), but 50% Section 338 (9903.03.14) on " + CANADA_338_SHORT +
    " even with USMCA. Otherwise the base rate plus 10% (9903.05.29), and 50% more on those subheadings.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies, such as Haiti and Kenya) "
    "to base rate plus 12.5% (9903.05.20–9903.05.84), and 37.5% for Brazil. Shown without preferences: Haitian HOPE/HELP "
    "and AGOA apparel entered under Chapter 98, and CAFTA-DR apparel of the Dominican Republic and Costa Rica, enter Free.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULES[c["country"]]
    extra = {"India": ["cbp-gsp", "eo-14384"], "Bangladesh": ["cbp-gsp"], "Pakistan": ["cbp-gsp"], "Sri Lanka": ["cbp-gsp"],
             "China": ["fr-2025-21671"], "Nicaragua": ["fr-2025-22690"], "Any other country": ["procl-11030"]}.get(c["country"], [])
    if c["country"] != "Any other country":
        extra = extra + ["eo-14389"]
    for sid in extra:
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].append(sid)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the "
    "Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Ensemble lines (6203.22.30–6203.29.30, 6204.21.00–6204.29.40) are shown in the HTS wording: the base rate is each "
    "garment's own rate on its own value, so it cannot be priced without the garments; the extra duty is added on the whole value.",
    "EU rates of \"10% in total\" replace the base rate when it is lower (U.S. note 52(k)); where the base rate is higher, only "
    "the base rate applies.",
    "Honduras, Nicaragua, Guatemala and El Salvador are priced with a CAFTA-DR claim (SPI P): apparel entered duty-free under "
    "CAFTA-DR is exempt from the 2026 Section 301 duty (note 52(i)). Jordan is priced with its FTA claim.",
    "Not in the grid: Haiti HOPE/HELP (9820.62.xx) and AGOA (9819.11.xx) apparel entered under Chapter 98, USMCA tariff "
    "preference levels, the 9802.00.80 U.S.-components provision, and the UFLPA presumption and FTC/CPSC rules — see Import "
    "documents.",
    "No antidumping or countervailing duty order and no Section 232 action covers a Chapter 62 line.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III and subchapter II in the 2026 Revision 21. Note "
    "52(b) (9903.05.86) names no Chapter 62 code. Note 52(i) (9903.05.95) exempts CAFTA-DR textile and apparel goods entered "
    "duty-free. Note 52(j) lists name Chapter 62 codes only for Jordan (all 395 subheadings, 9903.06.20) and, for CAFTA-DR "
    "claims, Guatemala and El Salvador (all 395, 9903.06.06, 9903.06.09); the UK, EU, Swiss, Malaysian, Cambodian, Argentine, "
    "Bangladeshi, Taiwanese, Indonesian and Ecuadorian lists name none. Note 52(a) leaves Chapter 98 entries (AGOA, Haiti) "
    "outside the duty except 9802. Note 50(a)(ii) names no Chapter 62 code for Brazil. Note 51(b)(3) puts 17 Chapter 62 "
    "subheadings on the Canada Section 338 list. Note 20(s) puts 358 of 395 subheadings on China List 4A; the other 37 were "
    "on the suspended List 4B; note 20(vvv)(iv) excludes 6210.10.50.10 and .90 through November 9, 2026; note 20(dd)–(ff) "
    "limits List 4A on ensemble entries. Note 31 names no Chapter 62 code. Note 30 lists two glove lines for Russia. The "
    "Section 122 exemption list (9903.03.03) named no Chapter 62 code. The subchapter II duty suspension for babies' linen "
    "apparel (9902.13.67) expired December 31, 2020. No Section 232 heading reaches a Chapter 62 line, and a Federal Register "
    "search of Commerce notices found no antidumping or countervailing duty order on Chapter 62 goods."
)
add_sources(ia, [s for c in ia["countries"] for s in c["rule"]["sourceIds"]])

SPI_NAMES = {
    "A": "Generalized System of Preferences (GSP) — expired December 31, 2020",
    "A*": "GSP, some beneficiary countries excluded — expired December 31, 2020",
    "D": "African Growth and Opportunity Act (AGOA) — through December 31, 2026",
    "NP": "Nepal Preference Program (expired December 31, 2025)",
}
for x in ov["spiLegend"]:
    x["name"] = SPI_NAMES.get(x["code"], x["name"])

# ---------------------------------------------------------------- dates, write
for page in ("tariffUpdates", "understandIndustry", "industryAreas", "tariffEngineering", "finalConclusion"):
    d[page]["lastCheckedAt"] = CHECKED
d["asOf"] = CHECKED


def todo_paths(x, p=""):
    if isinstance(x, dict):
        for k, v in x.items():
            yield from todo_paths(v, f"{p}.{k}")
    elif isinstance(x, list):
        for i, v in enumerate(x):
            yield from todo_paths(v, f"{p}[{i}]")
    elif isinstance(x, str) and "TODO" in x:
        yield p


left = list(todo_paths(d))
assert not left, left[:10]
json.dump(d, open(OUT, "w"), indent=2, ensure_ascii=False)
print("filled", OUT)
