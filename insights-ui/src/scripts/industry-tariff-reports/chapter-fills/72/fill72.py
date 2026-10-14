"""Fill the writer TODOs of the generated Chapter 72 (Iron and Steel) content file.

usage: python3 fill72.py <generated.json> <out.json>

Facts come from: HTSUS 2026 Revision 21 (Chapter 72 + Chapter 99 notes 2(aa), 16, 20, 29, 30, 31, 50, 51, 52),
the Section 232 steel proclamations (9705 ... 11021, 11032), the IEEPA / Section 122 documents, the Commerce AD/CVD
notices listed in sources72.py, eCFR title 19 (up to date as of 2026-10-08) and UN Comtrade.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources72 import CH99, CH72, EXTRA  # noqa: E402
from trade72 import apply_trade  # noqa: E402

ASOF = "2026-10-12"
ECFR_AS_OF = "2026-10-08"
ECFR = "https://www.ecfr.gov/current/title-19"

d = json.load(open(sys.argv[1]))
d["chapter"]["title"] = "Iron and Steel"
d["asOf"] = ASOF

rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
LINE = {r["hts"]: r for r in leaf}

# ------------------------------------------------------------------ line sets (from the engine output)
ia = d["industryAreas"]
cn_row = next(c for c in ia["countries"] if c["country"] == "China")
in_row = next(c for c in ia["countries"] if c["country"] == "India")
S232 = set()  # lines charged Section 232 (9903.82.02)
for cell in in_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"] == "+50%" or "9903.82.02" in b["extra"]:
            S232.update(b["lines"])
NON232 = sorted(set(LINE) - S232)
S301 = set()  # non-232 lines that pay the 2026 Section 301 duty (India as the plain 10% example)
for cell in in_row["cells"].values():
    for b in cell["withoutUsmca"]["breakdown"]:
        if b["extra"].startswith("+10%"):
            S301.update(b["lines"])
assert len(S232) == 505, len(S232)
assert len(NON232) == 54, len(NON232)
assert len(S301) == 19, len(S301)
# Note 16(c)(iii) steel articles (9903.82.18 can apply) = 232 lines other than the (iv) derivative 7216.91.00.10
S232_ARTICLES = S232 - {"7216.91.00.10"}

# ------------------------------------------------------------------ product groups
G = {
    "7201": ("Pig iron & spiegeleisen", "Pig iron", "Nonalloy and alloy pig iron and spiegeleisen in pigs, blocks or other primary forms: 4 lines, all Free. Not covered by Section 232; one line (spiegeleisen) pays the 2026 Section 301 duty.", ["pig iron", "spiegeleisen", "foundry pig iron", "basic pig iron", "cast iron pigs"]),
    "7202": ("Ferroalloys", "Ferroalloys", "Ferromanganese, ferrosilicon, silicomanganese, ferrochromium, ferronickel, ferromolybdenum, ferrotungsten, ferrotitanium, ferrovanadium, ferroniobium: the only dutiable lines in the chapter (1.1% to 10%). Not covered by Section 232; ferrosilicon and ferrovanadium carry AD/CVD orders.", ["ferrosilicon", "ferromanganese", "silicomanganese", "ferrochrome", "ferronickel", "ferrovanadium", "ferromolybdenum", "ferroniobium"]),
    "7203": ("Direct-reduced iron (DRI, HBI)", "DRI / HBI", "Ferrous products from direct reduction of iron ore (DRI, hot-briquetted iron) and other spongy ferrous products: 2 lines, Free. Not covered by Section 232; DRI from Canada pays the 50% Section 338 duty.", ["DRI", "direct reduced iron", "HBI", "hot briquetted iron", "sponge iron"]),
    "7204": ("Ferrous waste & scrap", "Scrap", "Cast-iron, stainless, alloy and carbon steel scrap, turnings and remelting scrap ingots: 14 lines, all Free. Not covered by Section 232 and on the 2026 Section 301 exemption list, so only China pays extra.", ["steel scrap", "stainless scrap", "HMS", "shredded scrap", "turnings", "remelting scrap ingots"]),
    "7205": ("Iron & steel granules and powders", "Powders", "Granules and powders of pig iron, iron or steel: 3 lines, Free. Not covered by Section 232; pay the 2026 Section 301 duty.", ["iron powder", "steel shot", "steel grit", "granules", "alloy steel powder"]),
    "7206": ("Iron & nonalloy steel ingots", "Ingots", "Iron and nonalloy steel in ingots or other primary forms: 2 lines, Free; +50% Section 232.", ["steel ingots", "iron ingots", "primary forms"]),
    "7207": ("Semifinished steel (slabs, billets)", "Slabs & billets", "Semifinished nonalloy steel: slabs, billets, blooms and other semis: 9 lines, Free; +50% Section 232.", ["steel slab", "billet", "bloom", "semifinished steel"]),
    "7208": ("Hot-rolled flat steel (600 mm+)", "Hot-rolled flat", "Hot-rolled nonalloy flat products 600 mm or wider, in coils (HRC) or cut lengths, including plate: 32 lines, Free; +50% Section 232. Several AD/CVD orders (hot-rolled, cut-to-length plate).", ["hot-rolled coil", "HRC", "steel plate", "pickled and oiled", "floor plate", "hot rolled sheet"]),
    "7209": ("Cold-rolled flat steel (600 mm+)", "Cold-rolled flat", "Cold-rolled (cold-reduced) nonalloy flat products 600 mm or wider, not clad or coated: 22 lines, Free; +50% Section 232. Cold-rolled AD/CVD orders apply.", ["cold-rolled coil", "CRC", "cold rolled sheet", "full hard"]),
    "7210": ("Coated flat steel (600 mm+)", "Coated flat", "Galvanized, galvalume, tinplate, tin-free, electrolytic and painted nonalloy flat products 600 mm or wider: 21 lines, Free; +50% Section 232. Corrosion-resistant (CORE) orders and the 2026 tin mill investigations.", ["galvanized steel", "GI coil", "galvalume", "tinplate", "prepainted steel", "PPGI", "electrogalvanized"]),
    "7211": ("Narrow flat steel (under 600 mm)", "Narrow flat", "Hot- and cold-rolled nonalloy flat products under 600 mm wide, not clad or coated (strip, universal mill plate): 25 lines, Free; +50% Section 232.", ["steel strip", "hoop steel", "universal mill plate", "narrow strip"]),
    "7212": ("Narrow coated flat steel", "Narrow coated", "Clad, plated or coated nonalloy flat products under 600 mm wide (tinned, galvanized, painted strip): 10 lines, Free; +50% Section 232.", ["galvanized strip", "tinned strip", "coated strip"]),
    "7213": ("Wire rod (hot-rolled, in coils)", "Wire rod", "Hot-rolled nonalloy bars and rods in irregularly wound coils: wire rod and rebar in coils: 12 lines, Free; +50% Section 232. Wire rod AD/CVD orders apply.", ["wire rod", "rebar in coils", "tire cord rod", "welding rod"]),
    "7214": ("Hot-rolled bars & rebar", "Bars & rebar", "Other nonalloy bars and rods, hot-rolled or forged, including straight concrete reinforcing bar (rebar): 18 lines, Free; +50% Section 232. Rebar AD/CVD orders on seven countries.", ["rebar", "reinforcing bar", "forged bar", "round bar", "flat bar"]),
    "7215": ("Cold-finished bars", "Cold-finished bars", "Other nonalloy bars and rods, cold-formed or cold-finished (bright bar): 12 lines, Free; +50% Section 232.", ["cold drawn bar", "bright bar", "free-cutting steel bar"]),
    "7216": ("Angles, shapes & sections", "Shapes", "Nonalloy angles, shapes and sections: I-beams, H-beams, channels, angles, sheet piling profiles: 18 lines, Free. Hot-rolled shapes pay +50% Section 232; cold-formed shapes (7216.61, 7216.69, 7216.91.00.90) are outside it.", ["I-beam", "H-beam", "wide flange", "channel", "angle iron", "structural steel"]),
    "7217": ("Nonalloy steel wire", "Steel wire", "Wire of iron or nonalloy steel, uncoated, galvanized or copper-plated: 48 lines, Free; +50% Section 232.", ["steel wire", "galvanized wire", "spring wire", "binding wire", "high carbon wire"]),
    "7218": ("Stainless semifinished", "Stainless semis", "Stainless steel in ingots and semifinished products (slabs, billets): 9 lines, Free; +50% Section 232.", ["stainless slab", "stainless billet", "stainless ingot"]),
    "7219": ("Stainless flat (600 mm+)", "Stainless flat", "Flat-rolled stainless steel 600 mm or wider: hot-rolled plate, cold-rolled sheet (304, 316, 430): 76 lines, Free; +50% Section 232. Stainless sheet and strip AD/CVD orders apply.", ["stainless steel sheet", "stainless plate", "304 stainless", "316 stainless", "430 stainless", "2B finish"]),
    "7220": ("Stainless strip (under 600 mm)", "Stainless strip", "Flat-rolled stainless steel under 600 mm wide, including razor blade steel: 24 lines, Free; +50% Section 232.", ["stainless strip", "precision strip", "razor blade steel"]),
    "7221": ("Stainless wire rod", "Stainless rod", "Hot-rolled stainless bars and rods in irregularly wound coils: 6 lines, Free; +50% Section 232.", ["stainless wire rod", "stainless rod coil"]),
    "7222": ("Stainless bars & shapes", "Stainless bars", "Other stainless bars, rods, angles, shapes and sections: 31 lines, Free; +50% Section 232. Stainless bar from India is under an AD order.", ["stainless bar", "stainless round bar", "stainless angle", "stainless flat bar"]),
    "7223": ("Stainless wire", "Stainless wire", "Wire of stainless steel, including spring round wire: 8 lines, Free; +50% Section 232.", ["stainless wire", "spring wire", "304 wire"]),
    "7224": ("Alloy steel semifinished", "Alloy semis", "Other alloy steel in ingots and semifinished forms: 11 lines, Free; +50% Section 232.", ["alloy billet", "tool steel ingot", "alloy slab"]),
    "7225": ("Alloy flat steel (600 mm+)", "Alloy flat", "Flat-rolled other alloy steel 600 mm or wider, including grain-oriented and non-oriented electrical steel: 28 lines, Free; +50% Section 232.", ["electrical steel", "silicon steel", "GOES", "NOES", "alloy plate", "boron steel"]),
    "7226": ("Alloy flat steel (under 600 mm)", "Alloy narrow", "Flat-rolled other alloy steel under 600 mm wide, including electrical steel strip and high-speed steel: 26 lines, Free; +50% Section 232.", ["electrical steel strip", "high-speed steel strip", "alloy strip"]),
    "7227": ("Alloy wire rod", "Alloy rod", "Other alloy steel bars and rods, hot-rolled, in irregularly wound coils: 14 lines, Free; +50% Section 232.", ["alloy wire rod", "boron wire rod", "silico-manganese rod"]),
    "7228": ("Alloy bars, shapes & drill rods", "Alloy bars", "Other alloy steel bars and rods, angles, shapes and sections, and hollow drill bars: 35 lines, Free; +50% Section 232.", ["tool steel bar", "alloy round bar", "hollow drill bar", "high-speed steel bar"]),
    "7229": ("Alloy steel wire", "Alloy wire", "Wire of other alloy steel, including silico-manganese and high-speed steel wire: 11 lines, Free; +50% Section 232.", ["alloy wire", "welding wire", "silico-manganese wire"]),
}
o = d["overview"]
for pg in o["productGroups"]:
    label, short, blurb, ex = G[pg["heading"]]
    pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
for g in ia["groups"]:
    label, short, _, _ = G[g["heading"]]
    g["label"], g["shortLabel"] = label, short

# ------------------------------------------------------------------ overview
o["h1"] = "HTS Chapter 72: Iron and Steel — Tariff Rates"
o["seo"] = {
    "title": "HTS Chapter 72 Steel Tariffs: 50% Section 232 Rates, HS Codes & Import Duties | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 559 HTS Chapter 72 iron and steel lines: steel is Free at base but pays the 50% Section 232 tariff on its full value from every country (UK 25%), China 75%. Pig iron, ferroalloys and scrap are outside Section 232.",
    "keywords": [
        "HTS Chapter 72",
        "steel tariffs",
        "50% steel tariff",
        "Section 232 steel tariffs",
        "iron and steel tariffs",
        "HS code for steel",
        "steel import duty",
        "stainless steel tariff",
        "ferroalloy tariff",
    ],
}
CN301 = set()
for cell in cn_row["cells"].values():
    for bb in cell["withoutUsmca"]["breakdown"]:
        if any(code in bb["extra"] for code in ("9903.91.01", "9903.88.03", "9903.88.15")) or bb["extra"] == "+25%":
            CN301.update(bb["lines"])
o["stats"][2]["note"] = f"Section 232 (50%, all countries): {len(S232)}; 2026 Section 301: {len(S301)}; China Section 301: {len(CN301)}; Russia 70% in lieu of column 2: 120"
for ex_line in ["7208.39.00.30", "7210.49.00.91", "7219.33.00.20", "7225.11.00.00", "7202.21.50.00", "7204.49.00.20"]:
    assert ex_line in LINE, ex_line
o["intro"] = (
    "Chapter 72 covers iron and steel: pig iron, ferroalloys, direct-reduced iron and scrap (7201–7205), and the steel mill products "
    "made from them, from slabs and billets to hot-rolled, cold-rolled and galvanized sheet, plate, bars, rebar, wire rod, shapes and wire "
    "in carbon, stainless and alloy steel (7206–7229). **534 of the 559 tariff lines are Free** under the general rate; only the ferroalloys pay "
    "a base duty (1.1% to 10%).\n\n"
    "What decides the cost is **Section 232**. Every steel mill product (505 lines in 7206–7229) pays **an extra 50% of its full customs value** "
    "from every country (heading 9903.82.02): Canada, Mexico, the EU, Japan and Korea included. The only lower rate is **25% for UK steel** at least 95% melted and poured "
    "in the United Kingdom (9903.82.04). FTA and USMCA claims do not reduce it. Chinese steel pays another **25% under Section 301**, so 75% in total. "
    "Pig iron, ferroalloys, DRI, scrap and powders are **outside Section 232**; some of them pay the 2026 Section 301 duties instead.\n\n"
    "On top of the tariff, many steel products carry **antidumping and countervailing duties** set company by company by the Commerce Department "
    "(hot-rolled, cold-rolled and corrosion-resistant flat steel, plate, rebar, wire rod, stainless sheet). They are not part of this table or the "
    "tariff calculator; see Tariff updates and Import documents."
)
o["workedExamples"] = [
    {
        "title": "$700,000 of hot-rolled coil from South Korea",
        "line": "7208.39.00.30",
        "body": "Hot-rolled coil is **Free** under the general rate, but it is a Section 232 steel article, so it pays **+50% of its full value** (9903.82.02): **$350,000**. "
        "The KORUS FTA does not help, because note 16(b) collects the Section 232 duty on top of any FTA rate, and the 2026 Section 301 duty on Korea does not apply to "
        "Section 232 steel (note 52(f)(1)). Check also whether the producer is under the hot-rolled antidumping order on Korea.",
    },
    {
        "title": "Galvanized sheet from Mexico, with a USMCA certification",
        "line": "7210.49.00.91",
        "body": "Galvanized flat steel is **Free**, and USMCA makes it Free again, but Section 232 still charges **+50%** (9903.82.02): Mexican steel has had no "
        "Section 232 exemption since March 12, 2025. A lower 25% rate (9903.82.18) exists only for limited quantities that Commerce authorizes for Canadian or Mexican "
        "producers that commit to new U.S. steelmaking capacity. Since December 19, 2025, corrosion-resistant steel from Mexico is also under antidumping and countervailing duty orders.",
    },
    {
        "title": "Cold-rolled stainless sheet from China",
        "line": "7219.33.00.20",
        "body": "Free at base, plus **50%** Section 232 (9903.82.02) and **25%** Section 301 (note 31, 9903.91.01): **75%**, or $75,000 on $100,000. "
        "The 2026 Section 301 duty on China (12.5%) does not apply to Section 232 steel. Stainless sheet and strip from China is also under antidumping and countervailing duty orders.",
    },
    {
        "title": "UK steel melted and poured in the United Kingdom",
        "line": "7225.11.00.00",
        "body": "Grain-oriented electrical steel of the UK pays **+25%** (9903.82.04) instead of 50% when at least 95% of its steel was melted and poured in the UK (note 16(d)); "
        "Tata Steel UK steel melted in the Netherlands also counts until January 1, 2028. Without that proof it pays the full **50%**.",
    },
    {
        "title": "Ferrosilicon from Brazil",
        "line": "7202.21.50.00",
        "body": "Ferroalloys are outside Section 232. This line pays its **1.5%** base rate, **+25%** under the Section 301 action on Brazil (9903.05.01) and **+12.5%** "
        "under the 2026 Section 301 action (9903.05.27): **39%**. Ferrosilicon from Brazil, Kazakhstan and Malaysia is also under antidumping and countervailing duty orders (May 2025).",
    },
    {
        "title": "Heavy melting scrap from Canada",
        "line": "7204.49.00.20",
        "body": "Ferrous scrap is **Free**, is not a Section 232 steel article, and is on the 2026 Section 301 exemption list (9903.05.86), so Canadian scrap pays **no duty**, "
        "with or without a USMCA claim. Only Chinese scrap pays extra (25%, Section 301 List 3).",
    },
]
o["notes"] = {
    "chapterNotes": (
        "**Note 1 (definitions).** (a) *Pig iron*: iron-carbon alloys not usefully malleable, with more than 2% carbon (and limits on chromium, manganese, phosphorus, silicon and other elements). "
        "(b) *Spiegeleisen*: as pig iron, with more than 6% but not more than 30% manganese. "
        "(c) *Ferroalloys*: alloys in primary, continuously cast, granular or powder forms, used as additives, deoxidants or desulfurizing agents in ferrous metallurgy, generally not usefully malleable, "
        "with at least 4% iron and more than 10% chromium, 30% manganese, 3% phosphorus, 8% silicon or 10% other elements (copper at most 10%). "
        "(d) *Steel*: ferrous materials other than those of heading 7203 that are usefully malleable and contain 2% or less carbon (chromium steels may contain more). "
        "(e) *Stainless steel*: alloy steel with 1.2% or less carbon and 10.5% or more chromium. "
        "(f) *Other alloy steel*: steel that is not stainless and contains at least one element above a threshold (for example 0.3% chromium, 1.65% manganese, 0.08% molybdenum, 0.3% nickel, 0.6% silicon, 0.0008% boron). "
        "(g) *Remelting scrap ingots*; (h) *Granules*; (ij) *Semifinished products*: continuous cast or primary hot-rolled or roughly forged products of solid section, not in coils. "
        "(k) *Flat-rolled products*: rolled products of solid rectangular section in coils, or straight lengths at least 10 times as wide as thick (under 4.75 mm) or wider than 150 mm and at least twice the thickness (4.75 mm or more). "
        "(l) *Bars and rods, hot-rolled, in irregularly wound coils*; (m) *Other bars and rods*; (n) *Angles, shapes and sections* (not products of heading 7301 or 7302); "
        "(o) *Wire*: cold-formed products in coils; (p) *Hollow drill bars and rods*.\n\n"
        "**Note 2.** Ferrous metals clad with another ferrous metal are classified as the ferrous metal predominating by weight.\n\n"
        "**Note 3.** Iron or steel products obtained by electrolytic deposition, pressure casting or sintering are classified by form, composition and appearance with the similar hot-rolled products.\n\n"
        "**Subheading notes.** Define alloy pig iron, nonalloy free-cutting steel, silicon electrical steel (0.6% to 6% silicon, at most 0.08% carbon), high-speed steel and silico-manganese steel, "
        "and classify ferroalloys as binary, ternary or quaternary by how many elements exceed the note 1(c) minimums."
    ),
    "additionalUsNotes": (
        "**1.** Defines *high-strength steel* (flat-rolled, minimum yield point 275 MPa under 3 mm or 355 MPa at 3 mm or more), *universal mill plate*, *concrete reinforcing bars and rods*, "
        "*razor blade steel*, *tool steel*, *chipper knife steel*, *heat-resisting steel* and *ball-bearing steel*.\n\n"
        "**2.** \"Further worked\" means surface treatments such as polishing, artificial oxidation, phosphatizing, metal or nonmetallic coating, or cladding.\n\n"
        "**3.** No allowance or reduction of duties is made for partial damage or loss from discoloration or rust occurring before entry.\n\n"
        "Statistical notes define high-nickel alloy steel, the ISRI scrap grades used in 7204, advanced and ultra high-strength steel, tire cord-quality, cold-heading-quality and welding-quality wire rod, and spring round wire."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
src = {x["id"]: x for x in tu["sources"]}
for x in EXTRA:
    src.setdefault(x["id"], x)
src["hts-chapter-99"]["url"] = CH99


def need(*ids):
    for i in ids:
        assert i in src, i


tu["seo"] = {
    "title": "Steel Tariff Updates 2025–2026: 50% Section 232, Full-Value Rule, Canada, Mexico, UK (HTS Ch. 72) | KoalaGains",
    "shortDescription": "Every U.S. steel tariff change since 2025 with Federal Register citations: Section 232 restored to 25% for all countries (March 2025), raised to 50% (June 2025), rebuilt on full value (April 2026), the UK's 25% rate, the end of the IEEPA duties, and the new steel AD/CVD orders.",
    "keywords": [
        "steel tariffs 2026",
        "steel tariff 50 effective date",
        "is the 50 steel tariff still in effect",
        "section 232 steel tariffs",
        "steel tariffs canada",
        "steel tariffs mexico",
        "uk steel tariffs 2026",
        "steel tariff exemptions",
        "steel antidumping duty orders",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current **2026 Revision 21** "
    "(in force October 9, 2026), and lists every extra duty that reaches Chapter 72 today. Base rates barely moved: steel is Free in both, and the only change is that "
    "ferrosilicon manganese (7202.30.00.00) was split into two statistical lines at the same 3.9%.\n\n"
    "The extra duties changed a lot. In January 2025, steel paid 25% under Section 232, but Canada, Mexico, Argentina, Australia, Brazil, Korea, the EU, Japan, the UK "
    "and Ukraine were exempt or under quotas. Proclamation 10896 ended all of those arrangements and the product exclusions on **March 12, 2025**; Proclamation 10947 raised "
    "the rate to **50% on June 4, 2025** (UK stayed at 25%); and Proclamation 11021 rebuilt the program on **April 6, 2026** as heading 9903.82.02, charged on the "
    "**full customs value**. The IEEPA duties never added to Section 232 steel for most countries and **ended on February 24, 2026**; the Section 122 surcharge and the "
    "2026 Section 301 duties also leave Section 232 steel alone. China's Section 301 duty (25%) does stack.\n\n"
    "Antidumping and countervailing duty orders cover much of the chapter. They are company-specific, listed below for reference, and **not included in the tariff calculator**."
)
tu["scope"] = (
    "Chapter 99 measures that reach Chapter 72 from any country: Section 232 steel (note 16), China Section 301 (notes 20, 31), the 2026 Section 301 actions on 60 "
    "economies and Brazil (notes 50, 52), Canada Section 338 (note 51), Russia's rates in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and the "
    "ended IEEPA and Section 122 duties. The main antidumping and countervailing duty orders on Chapter 72 products are listed for reference; the calculator does not model them. "
    "For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "557 of 559 lines", "note": "2 new statistical lines (7202.30), same 3.9%"},
    {"label": "Section 232 on steel", "value": "50%", "note": "Full value, all countries; UK 25%"},
    {"label": "China, steel mill products", "value": "75%", "note": "50% Section 232 + 25% Section 301"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

need("procl-11021", "procl-10947", "fr-2026-08297", "procl-11032", "hts-chapter-99", "hts-now", "procl-10896", "csms-68253075")
S232_SRC = ["procl-11021", "procl-10947", "procl-10896", "fr-2026-08297", "procl-11032", "csms-68253075", "hts-chapter-99", "hts-now"]
tu["inEffect"] = [
    {
        "id": "all-section-232",
        "country": "All countries (Canada, Mexico, EU, Japan, Korea and Brazil included)",
        "measure": "Section 232 steel, on the full customs value",
        "ch99Code": "9903.82.02",
        "before": "+25% (9903.80.01), with Canada, Mexico, Argentina, Australia, Brazil and Korea exempt or under quotas, and the EU, Japan and UK under tariff-rate quotas",
        "now": "+50%",
        "exemption": "Covers 505 lines: all of 7206–7215, 7217–7229 and the hot-rolled shapes of 7216 (note 16(c)(iii); 7216.91.00.10 as a derivative under (iv)). "
        "Pig iron, ferroalloys, DRI, scrap and powders (7201–7205) and cold-formed shapes (7216.61, 7216.69, 7216.91.00.90) are not covered. There are no country "
        "exemptions, quotas or product exclusions: Proclamation 10896 ended them on March 12, 2025. Note 16(b): the duty is collected on top of any FTA or USMCA special rate. "
        "Lower rates only for UK steel at least 95% UK-melted (9903.82.04, 25%) and for limited Canadian or Mexican quantities that Commerce authorizes (9903.82.18, 25%). "
        "Russia uses 9903.82.14 (also 50%). Goods under 9903.82.02 do not pay the 2026 Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)).",
        "whatItMeans": "Steel mill products pay half their value again in duty: $500,000 of plate, sheet, bar or wire from any country owes $250,000, whatever the FTA claim.",
        "effectiveFrom": "2025-06-04",
        "effectiveSourceId": "procl-10947",
        "sourceIds": S232_SRC,
    },
    {
        "id": "gb-section-232",
        "country": "United Kingdom",
        "measure": "Section 232 steel, UK rate",
        "ch99Code": "9903.82.04",
        "before": "Tariff-rate quota: Free in quota, +25% over quota (Proclamation 10406)",
        "now": "+25% with ≥95% UK-melted steel; otherwise +50%",
        "exemption": "Note 16(d): applies only when at least 95% of the steel was melted and poured in the United Kingdom; Commerce (91 FR 23056) lets Tata Steel UK steel melted and "
        "poured in the Netherlands count as UK until January 1, 2028. Executive Order 14309 contemplates a quota at the normal tariff rate for UK steel, but none has been established. "
        "UK steel that does not meet the 95% test pays 50% under 9903.82.02.",
        "whatItMeans": "A UK mill that melts and pours its own steel ships at half the duty of every other country: $100,000 of UK-melted plate pays $25,000.",
        "effectiveFrom": "2026-04-06",
        "effectiveSourceId": "procl-11021",
        "sourceIds": ["procl-11021", "procl-10947", "fr-2026-08297", "eo-14309", "procl-10406", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-section-301",
        "country": "China",
        "measure": "Section 301: note 31 (2024 review), Lists 3 and 4A, and the 2026 action",
        "ch99Code": "9903.91.01 / 9903.88.03 / 9903.88.15 / 9903.05.31",
        "before": "+25% (note 31 and List 3) or +7.5% (List 4A)",
        "now": "+25% on steel (on top of 50% Section 232 = 75%); 25% to 37.5% extra on pig iron, ferroalloys, DRI, scrap and powders",
        "exemption": "Note 31 (9903.91.01) adds 25% to 486 lines, almost all steel mill products, since September 27, 2024; List 3 (9903.88.03) covers most of 7201–7205 and some 7216 lines; "
        "List 4A (9903.88.15, 7.5%) covers 20 wire, strip and bar lines. These stack with Section 232. Forged bars (7214.10), ferromolybdenum (7202.70) and two other ferroalloy lines are on none of these lists. The 12.5% 2026 Section 301 duty on China (9903.05.31) applies only to the 19 "
        "non-Section 232 lines outside the note 52(b) exemption list. The IEEPA duties on China ended February 24, 2026. USTR confirmed on October 7, 2026 that the 2018 actions continue during the four-year review.",
        "whatItMeans": "Chinese steel sheet, plate, bar or wire pays 75% of its value; Chinese ferrosilicon pays its base rate plus 37.5%.",
        "effectiveFrom": "2024-09-27",
        "effectiveSourceId": "fr-2024-21217",
        "sourceIds": ["fr-2024-21217", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s301-2026",
        "country": "60 Section 301 economies (Canada, Mexico, EU, Japan, Korea, Taiwan, Vietnam, India, Türkiye, UK, Russia and others)",
        "measure": "Section 301 (2026 actions on 60 economies)",
        "ch99Code": "9903.05.20–9903.05.84",
        "before": "None",
        "now": "+10% or +12.5% (EU, Japan, Korea, Taiwan: 10% or 12.5% in place of the base rate) on 19 lines",
        "exemption": "Does not apply to Section 232 steel (note 52(f)(1), 9903.05.90). Of the 54 other lines, pig iron, most ferroalloys, DRI and all scrap are on the general "
        "exemption list (note 52(b), 9903.05.86). It charges spiegeleisen (7201.50.60), ferrosilicon (7202.21, 7202.29), ferromolybdenum (7202.70), ferrovanadium (7202.92), "
        "other ferroalloys (7202.99), iron and steel powders (7205) and cold-formed shapes (7216.61, 7216.69, 7216.91.00.90). USMCA-qualifying goods of Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
        "whatItMeans": "Only a few non-steel inputs pay it: $100,000 of Indian ferrosilicon (7202.21.10) pays 1.1% + 10% = $11,100.",
        "effectiveFrom": "2026-07-24",
        "effectiveSourceId": "fr-2026-15181",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "br-section-301",
        "country": "Brazil",
        "measure": "Section 301 (Brazil)",
        "ch99Code": "9903.05.01",
        "before": "None",
        "now": "+25% on 25 non-Section 232 lines (plus 12.5% on 19 of them)",
        "exemption": "Does not apply to Section 232 steel (note 50(a)(vi)(1), 9903.05.07), so Brazilian slabs, sheet and bars pay only the 50% Section 232 duty. "
        "It does charge 25 other lines: ferrosilicon, ferromolybdenum, ferrovanadium and other ferroalloys (7202.21, 7202.29, 7202.70, 7202.92, 7202.99), cast-iron and carbon steel scrap "
        "(7204.10, 7204.29, 7204.49, 7204.50), powders (7205) and cold-formed shapes. Ferrosilicon from Brazil also carries AD/CVD.",
        "whatItMeans": "Brazilian ferrosilicon pays 1.5% + 25% + 12.5% = 39%; Brazilian slabs pay 50%.",
        "effectiveFrom": "2026-07-22",
        "effectiveSourceId": "fr-2026-14542",
        "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ca-section-338",
        "country": "Canada",
        "measure": "Section 338 (Canada), list 51(b)(3)",
        "ch99Code": "9903.03.14",
        "before": "None",
        "now": "+50% on 7203.10.00 (direct-reduced iron)",
        "exemption": "Charged even when USMCA is claimed (the heading's Special column is \"+ 50%\"). Of Chapter 72, only DRI (7203.10.00) is on the note 51(b)(3) list. "
        "Canadian steel mill products pay the 50% Section 232 duty instead.",
        "whatItMeans": "Canadian direct-reduced iron pays half its value; other Canadian Chapter 72 raw materials (pig iron, scrap, most ferroalloys) stay Free.",
        "effectiveFrom": "2026-08-22",
        "effectiveSourceId": "procl-11048",
        "sourceIds": ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "ru-section-232",
        "country": "Russia",
        "measure": "Section 232 steel (Russia) + 70% in lieu of column 2",
        "ch99Code": "9903.82.14 / 9903.90.09",
        "before": "70% in place of column 2 on 120 lines, +25% Section 232",
        "now": "+50% Section 232 on top of the column 2 rate, or of 70% on the 120 note 30(d) lines (120% in total for many flat products)",
        "exemption": "Russia has paid column 2 rates since April 9, 2022, and 70% in lieu of column 2 on the note 30(d) iron and steel, ferroalloy and other metal subheadings since "
        "April 1, 2023 (Proclamation 10523). Section 232 (9903.82.14, 50%) is added, and the 12.5% 2026 Section 301 duty (9903.05.66) on the non-Section 232 lines.",
        "whatItMeans": "Russian hot-rolled sheet pays 120% of its value; Russian pig iron 70%.",
        "effectiveFrom": "2026-04-06",
        "effectiveSourceId": "procl-11021",
        "sourceIds": ["procl-11021", "procl-10523", "fr-2026-15181", "hts-chapter-99", "hts-now"],
    },
]

need("fr-2025-22690", "fr-2025-23892", "hts-now-cr", "hts-before", "procl-11065", "csms-69851916", "procl-11056", "csms-69606660", "procl-11048", "fr-2026-14542", "fr-2026-15274")


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    need(*ids)
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


base = next(c for c in tu["changes"] if c["id"] == "base-rates")
base["title"] = "No Chapter 72 base-rate changes"
base["detail"] = (
    "557 of 559 Chapter 72 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. "
    "Ferrosilicon manganese 7202.30.00.00 was split into 7202.30.00.60 (not more than 0.10% carbon) and 7202.30.00.90 (other), both at the unchanged 3.9%."
)

changes = [
    base,
    ch("tin-mill-prelim", "pending", "2026-09-21", "Published", "Tin mill products from China: preliminary dumping and subsidy findings",
       "Commerce preliminarily found dumping (September 21, 2026) and countervailable subsidies (September 15, 2026) on tin mill products from China, with critical circumstances, and is investigating "
       "tin mill products from Taiwan and Türkiye (initiated May 5, 2026). Cash deposits apply from the preliminary determinations; orders depend on the final Commerce and ITC decisions. "
       "Tin mill products (tinplate and tin-free steel) enter mainly under 7210.11, 7210.12, 7210.50, 7212.10 and 7212.50, and 7225.99 or 7226.99 if of alloy steel.",
       None, "Provisional cash deposits (China)", "China, Taiwan, Türkiye", ["fr-2026-19274", "fr-2026-18792", "fr-2026-08745", "fr-2026-08744"]),
    ch("rebar-wirerod-2026-09", "reference", "2026-09-18", "Published", "New AD/CVD orders on rebar (Bulgaria, Egypt, Vietnam) and wire rod (Algeria)",
       "Commerce issued antidumping duty orders on steel concrete reinforcing bar from Bulgaria, Egypt and Vietnam, countervailing duty orders on rebar from Egypt and Vietnam, "
       "and a countervailing duty order on carbon and alloy steel wire rod from Algeria. Rebar is classified mainly in 7213.10, 7214.20 and 7228.30; wire rod in 7213 and 7227.",
       None, "AD/CVD cash deposits", "Bulgaria, Egypt, Vietnam, Algeria", ["fr-2026-19102", "fr-2026-19103", "fr-2026-19107"]),
    s338 := ch("section-338-canada", "extraDuty", "2026-08-22", "Effective", "Section 338 duty on Canadian direct-reduced iron",
       "Proclamation 11048 put a 50% duty (9903.03.14) on products of Canada in the note 51(b)(3) list, which includes direct-reduced iron (7203.10.00); it is charged even on USMCA goods. "
       "The start moved from August 19 to August 22, 2026 (Proclamation 11056), and from September 15, 2026 it applies in addition to any Section 232 duty (Proclamation 11065). "
       "No other Chapter 72 line is on the list.",
       None, "+50% (7203.10.00)", "Canada", ["procl-11048", "procl-11056", "csms-69606660", "procl-11065", "csms-69851916"]),
    ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: steel mill products exempt",
       "The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They do not apply to Section 232 steel (note 52(f)(1)), and pig iron, most ferroalloys, "
       "DRI and scrap are on the general exemption list (note 52(b)). In Chapter 72 they charge 19 lines: spiegeleisen, ferrosilicon, ferromolybdenum, ferrovanadium, other ferroalloys, "
       "iron and steel powders and cold-formed shapes. USMCA goods are exempt.",
       None, "+10% to +12.5% (19 lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
    ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
       "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It never applied to Section 232 steel (Proclamation 11012 clause 4; note 2(aa)(v)(2)), "
       "and most ferroalloys and stainless scrap (7204.21) were on its product exemption list (9903.03.03).",
       None, None, "All", ["procl-11012", "hts-chapter-99"]),
    ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: steel exempt, ferroalloys and scrap not",
       "The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 steel is excluded (note 50(a)(vi)(1)), so it reaches only some Brazilian ferroalloys "
       "(notably ferrosilicon), most scrap, powders and cold-formed shapes: 25 Chapter 72 lines.",
       None, "+25% (25 lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
    ch("rebar-algeria", "reference", "2026-07-06", "Published", "AD and CVD orders on rebar from Algeria",
       "Commerce issued an antidumping duty order (April 29, 2026) and a countervailing duty order (July 6, 2026) on steel concrete reinforcing bar from Algeria.",
       None, "AD/CVD cash deposits", "Algeria", ["fr-2026-13488", "fr-2026-08284"]),
    ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032 adjusts the metals program",
       "From June 8, 2026, steel content counts as U.S.-melted when at least 85% (by weight) was melted and poured in the United States, and new rates apply to "
       "industrial and mobile equipment derivatives. Nothing changed for Chapter 72 steel articles: they stay at 50% (UK 25%).",
       None, None, "All", ["procl-11032"]),
    ch("noes-continued", "reference", "2026-05-18", "Published", "Non-oriented electrical steel orders continued",
       "After second five-year reviews, Commerce continued the 2014 antidumping and countervailing duty orders on non-oriented electrical steel (7225.19, 7226.19) "
       "from China, Germany, Japan, Korea, Sweden and Taiwan, applicable May 13, 2026.",
       None, None, "China, Germany, Japan, Korea, Sweden, Taiwan", ["fr-2026-09826"]),
    ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce corrects the Section 232 annex; Tata Steel UK clarified",
       "Commerce added heading 9903.82.01 (articles on the lists with no steel, aluminum or copper pay no Section 232 duty) from April 6, 2026, and clarified that UK steel made by "
       "Tata Steel UK from steel melted and poured in the Netherlands may enter at the UK rate (9903.82.04) and count toward the 95% test until January 1, 2028.",
       None, None, "United Kingdom", ["fr-2026-08297"]),
    ch("camx-procedures", "reference", "2026-04-23", "Published", "Commerce opens the 25% route for Canadian and Mexican steel producers",
       "Commerce set out how steel and aluminum producers with plants in Canada or Mexico that supply U.S. vehicle makers can apply for a tariff reduction of up to half (not below 25%), "
       "limited to quantities equal to newly committed U.S. primary steel or aluminum capacity. Approved steel enters under 9903.82.18 (+25%) if it qualifies for USMCA and was melted and poured in Canada or Mexico.",
       None, "+25% for authorized quantities", "Canada, Mexico", ["fr-2026-07987", "procl-10984"]),
    ch("rebar-mx-tr", "reference", "2026-04-13", "Published", "Rebar orders on Mexico and Türkiye continued",
       "Commerce continued the antidumping duty order on rebar from Mexico and the antidumping and countervailing duty orders on rebar from Türkiye after five-year reviews.",
       None, None, "Mexico, Türkiye", ["fr-2026-07109"]),
    ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 metals program rebuilt on full value (Proclamation 11021)",
       "Proclamation 11021 replaced the earlier steel headings with 9903.82.02–9903.82.26, charged on the full customs value regardless of metal content. Steel articles of Chapter 72 "
       "stay at 50% (9903.82.02); UK products need at least 95% UK-melted steel for the 25% rate (9903.82.04); Russian steel uses 9903.82.14. Manufacturing drawback is allowed only for "
       "certain derivative articles of trade-agreement partners, not for Chapter 72 steel articles; goods entering a foreign-trade zone must take privileged foreign status. The derivatives inclusions process ended.",
       "+50%", "+50% (9903.82.02)", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
    ch("wire-rod-2026", "reference", "2026-03-02", "Published", "Wire rod orders continued",
       "Commerce continued the antidumping duty orders on carbon and certain alloy steel wire rod from Brazil, Indonesia, Mexico, Moldova and Trinidad and Tobago and the countervailing duty order on Brazil "
       "(March 2, 2026), and the antidumping and countervailing duty orders on China (January 27, 2026).",
       None, None, "Brazil, China, Indonesia, Mexico, Moldova, Trinidad and Tobago", ["fr-2026-04121", "fr-2026-01600"]),
    ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Section 232 steel outside it",
       "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Proclamation 11012 says it does not apply in addition to Section 232 duties, so steel mill "
       "products paid only the 50%. Most ferroalloys and stainless scrap (7204.21) were on its exemption list (9903.03.03), and USMCA goods were exempt; pig iron, DRI, other scrap, "
       "ferrosilicon, ferromolybdenum, ferrovanadium, powders and cold-formed shapes paid the 10%.",
       None, "Steel exempt", "All", ["procl-11012", "hts-chapter-99"]),
    ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end",
       "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and "
       "reciprocal duties, and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 steel duties are not IEEPA duties and continued unchanged. "
       "For Chapter 72, the IEEPA duties had mattered mainly for pig iron, ferroalloys, scrap and other non-Section 232 lines.",
       "Varied by country", "None", "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
    ch("core-2025", "reference", "2025-12-19", "Published", "New AD/CVD orders on corrosion-resistant steel from 10 countries",
       "Commerce issued antidumping duty orders on corrosion-resistant (galvanized and other coated) steel from Australia, Brazil, Canada, Mexico, the Netherlands, South Africa, Taiwan, "
       "Türkiye, the United Arab Emirates and Vietnam, and countervailing duty orders on Brazil, Canada, Mexico and Vietnam. They add to the 2016 orders on China, India, Italy, Korea and Taiwan, "
       "continued in 2022. In March and April 2026 Commerce opened circumvention inquiries on the CORE orders on China, Korea and Vietnam.",
       None, "AD/CVD cash deposits", "Australia, Brazil, Canada, Mexico, Netherlands, South Africa, Taiwan, Türkiye, UAE, Vietnam",
       ["fr-2025-23431", "fr-2025-23430", "fr-2022-17711", "fr-2026-05807", "fr-2026-06449", "fr-2026-05808"]),
    ch("procl-10984", "reference", "2025-10-17", "Signed", "Authority to halve Section 232 for some Canadian and Mexican steel",
       "Proclamation 10984 (medium- and heavy-duty vehicles) authorized Commerce to cut the Section 232 steel and aluminum duty by up to half, but not below 25%, for limited quantities from "
       "Canadian or Mexican producers that supply U.S. vehicle makers and commit to new U.S. capacity. The goods must qualify for USMCA and be melted and poured in Canada or Mexico (heading 9903.82.18).",
       None, None, "Canada, Mexico", ["procl-10984"]),
    ch("hr-2001-continued", "reference", "2025-10-03", "Published", "Hot-rolled steel orders on six countries continued",
       "Commerce continued the antidumping and countervailing duty orders on certain hot-rolled carbon steel flat products from India, Indonesia, China, Taiwan, Thailand and Ukraine.",
       None, None, "India, Indonesia, China, Taiwan, Thailand, Ukraine", ["fr-2025-19411"]),
    ch("uk-epd", "reference", "2025-06-16", "Signed", "UK Economic Prosperity Deal: UK steel stays at 25%",
       "Executive Order 14309, implementing the U.S.-UK Economic Prosperity Deal, directed Commerce to design a tariff-rate quota for UK steel at a time it deems appropriate; the deal's general terms "
       "speak of a quota at most-favored-nation rates once the UK meets U.S. supply-chain and ownership requirements. No quota has been established. UK steel stays at 25% under Proclamation 10947; "
       "since April 6, 2026 that rate requires at least 95% UK-melted steel.",
       "+25%", "+25% (UK)", "United Kingdom", ["eo-14309", "procl-10947"]),
    ch("s232-50", "extraDuty", "2025-06-04", "Effective", "Section 232 steel tariff doubled to 50%",
       "Proclamation 10947 raised the Section 232 steel and aluminum duties from 25% to 50% for goods entered from 12:01 a.m. EDT on June 4, 2025, except for the UK (25%). "
       "It also amended Executive Order 14289 so that steel subject to Section 232 no longer paid the Canada and Mexico IEEPA duties, and ruled out drawback.",
       "+25%", "+50% (UK +25%)", "All except UK", ["procl-10947"]),
    ch("ferrosilicon", "reference", "2025-05-20", "Published", "AD/CVD orders on ferrosilicon",
       "Commerce issued antidumping and countervailing duty orders on ferrosilicon (7202.21, 7202.29) from Brazil, Kazakhstan and Malaysia.",
       None, "AD/CVD cash deposits", "Brazil, Kazakhstan, Malaysia", ["fr-2025-08986", "fr-2025-08987"]),
    ch("eo-14289", "reference", "2025-04-29", "Signed", "Non-stacking order: Canada and Mexico IEEPA duty in place of Section 232",
       "Executive Order 14289, retroactive to March 4, 2025, said goods of Canada and Mexico subject to the IEEPA duties would not also pay the Section 232 steel duty. "
       "Proclamation 10947 reversed the order of precedence from June 4, 2025: Section 232 steel no longer paid the IEEPA duties.",
       None, None, "Canada, Mexico", ["eo-14289"]),
    ch("reciprocal", "reference", "2025-04-02", "Signed", "Reciprocal tariff excludes Section 232 steel",
       "Executive Order 14257 set the reciprocal tariffs from April 5, 2025 but excluded steel articles and derivatives subject to Section 232 (Annex II). Non-Section 232 Chapter 72 lines paid "
       "it unless exempted. Ended February 24, 2026.",
       None, "Steel exempt", "All except Canada, Mexico", ["eo-14257"]),
    ch("s232-reset", "extraDuty", "2025-03-12", "Effective", "All Section 232 steel exemptions, quotas and exclusions end",
       "Proclamation 10896 restored the full 25% Section 232 duty on steel from Argentina, Australia, Brazil, Canada, Mexico, South Korea, the EU, Japan, the UK and Ukraine by ending "
       "their exemptions, quotas and tariff-rate quotas, and stopped new product exclusions. General approved exclusions ended March 12, 2025; granted exclusions ran until they expired or were used up.",
       "Exempt or quota", "+25%", "Argentina, Australia, Brazil, Canada, Mexico, South Korea, EU, Japan, UK, Ukraine", ["procl-10896"]),
    ch("ca-mx-ieepa", "reference", "2025-02-01", "Signed", "IEEPA duties on Canada and Mexico",
       "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods were exempted from March 7, 2025. Ended February 24, 2026.",
       None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
    ch("melt-pour", "reference", "2024-11-21", "Effective", "Country of melt and pour reported for all steel imports",
       "Under Proclamation 10783, importers must report the country where the steel was melted and poured on every entry of Section 232 steel articles, from all countries, "
       "whether or not duty applies. From March 12, 2025 the field is mandatory for steel and steel derivatives in ACE.",
       None, None, "All", ["csms-62582900", "csms-64366327", "procl-10783"]),
    ch("cn-301-2024", "extraDuty", "2024-09-27", "Effective", "China Section 301: steel and aluminum products to 25%",
       "After its four-year review, USTR moved Chinese steel and aluminum products to U.S. note 31 (9903.91.01) at 25%, covering 213 Chapter 72 subheadings, from September 27, 2024.",
       "0% to +7.5%", "+25%", "China", ["fr-2024-21217"]),
    ch("mexico-melt-pour", "reference", "2024-07-10", "Signed", "Mexico: 25% on steel not melted and poured in North America",
       "Proclamation 10783 charged 25% on Mexican steel melted and poured outside Mexico, Canada or the United States, while Mexican steel melted in North America stayed exempt. "
       "Superseded on March 12, 2025, when all Mexican steel became dutiable.",
       None, None, "Mexico", ["procl-10783"]),
    ch("uk-trq", "reference", "2022-06-01", "Effective", "UK steel tariff-rate quota",
       "Proclamation 10406 let UK steel enter free of Section 232 duty within an annual quota, with 25% above it, from June 1, 2022. Ended March 12, 2025.",
       None, None, "United Kingdom", ["procl-10406"]),
    ch("japan-trq", "reference", "2022-04-01", "Effective", "Japan steel tariff-rate quota",
       "Proclamation 10356 set a duty-free quota for Japanese steel from April 1, 2022. Ended March 12, 2025.",
       None, None, "Japan", ["procl-10356"]),
    ch("eu-trq", "reference", "2022-01-01", "Effective", "EU steel tariff-rate quota",
       "Proclamation 10328 set a duty-free quota for EU steel melted and poured in the EU from January 1, 2022. Ended March 12, 2025.",
       None, None, "European Union", ["procl-10328"]),
    ch("camx-2019", "reference", "2019-05-20", "Effective", "Canada and Mexico exempted from Section 232 steel",
       "Proclamation 9894 removed the Section 232 steel duty on Canada and Mexico from May 20, 2019. The exemption lasted until March 12, 2025.",
       "+25%", "Exempt", "Canada, Mexico", ["procl-9894"]),
    ch("eu-ca-mx-2018", "reference", "2018-06-01", "Effective", "Section 232 extended to the EU, Canada and Mexico",
       "Proclamation 9759 ended the temporary exemptions of the EU, Canada and Mexico on June 1, 2018 and set quotas for Argentina, Australia and Brazil.",
       None, "+25%", "EU, Canada, Mexico", ["procl-9759"]),
    ch("s232-start", "extraDuty", "2018-03-23", "Effective", "Section 232 steel tariff begins at 25%",
       "Proclamation 9705 imposed a 25% duty on steel mill articles from March 23, 2018, with temporary exemptions for some countries.",
       None, "+25%", "All except temporarily exempted countries", ["procl-9705"]),
]
nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
nic["detail"] = (
    "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). "
    "Note 29 has no Section 232 carve-out, so it will add to the 50% on Nicaraguan steel. The rate is 0% in 2026."
)
nic["date"] = "2026-10-07"
changes.insert(1, nic)
changes.sort(key=lambda c: c["date"], reverse=True)
tu["changes"] = changes

used = set()
for e in tu["inEffect"]:
    used.update(e["sourceIds"])
for c in tu["changes"]:
    used.update(c["sourceIds"])
used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch72"])
tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ industryAreas
ia["seo"] = {
    "title": "Steel Tariffs by Country: Canada, Mexico, UK, China, EU, Japan, Korea, Brazil (HTS Ch. 72) | KoalaGains",
    "shortDescription": "The total U.S. tariff on iron and steel by country and product: 50% on steel from Canada, Mexico, Brazil, Korea, Japan, the EU, Vietnam, Taiwan, India and Türkiye; UK 25% with UK-melted steel; China 75%; Russia up to 120%. Pig iron, ferroalloys and scrap explained.",
    "keywords": [
        "steel tariffs by country",
        "steel tariffs canada",
        "steel tariffs mexico",
        "uk steel tariffs",
        "tariff on steel from china to usa",
        "steel tariffs eu",
        "us steel tariffs japan",
        "steel tariffs korea",
        "steel tariffs brazil",
        "steel tariffs india to usa",
    ],
}
ia["intro"] = (
    "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. "
    "For steel mill products (7206–7229) the answer is almost the same everywhere: **50%**, because Section 232 has no country exemptions and is collected on top of FTA and USMCA rates. "
    "China pays **75%** (Section 301 adds 25%), Russia up to **120%** (70% in place of column 2 plus 50%), and the UK **25%** when the steel was melted and poured in the UK "
    "(the cells show the 50% default).\n\n"
    "The raw-material groups differ: pig iron, ferroalloys, DRI, scrap and powders (7201–7205) are outside Section 232, so they pay their base rate plus, for some lines, "
    "the 2026 Section 301 duty (10% or 12.5%), the Brazil duty or China's Section 301 duty. The table does **not** include antidumping or countervailing duties, which apply "
    "company by company to many flat-rolled, rebar, wire rod, stainless and ferroalloy imports (see Tariff updates)."
)
S301_NOTE = "Pig iron, ferroalloys, DRI and scrap are outside Section 232."
R = {
    "Canada": ("usmca", "50% on steel mill products, with or without a USMCA claim: Section 232 (9903.82.02) has had no Canada exemption since March 12, 2025 and is collected on top of the USMCA rate (note 16(b)). "
               "Commerce can authorize limited quantities at 25% (9903.82.18). Pig iron, ferroalloys and scrap are outside Section 232; 19 non-steel lines pay 10% under Section 301 (9903.05.29) unless USMCA is claimed. "
               "DRI (7203.10) pays 50% under Section 338 (9903.03.14) even with USMCA.",
               ["procl-11021", "procl-10896", "fr-2026-15181", "procl-11048", "procl-11065", "fr-2026-07987", "hts-now"]),
    "Mexico": ("usmca", "50% on steel mill products, with or without a USMCA claim: Section 232 (9903.82.02) has applied to all Mexican steel since March 12, 2025 and is collected on top of the USMCA rate. "
               "Commerce can authorize limited quantities at 25% (9903.82.18). 19 non-steel lines pay 10% under Section 301 (9903.05.55) unless USMCA is claimed; pig iron, most ferroalloys and scrap are Free.",
               ["procl-11021", "procl-10896", "fr-2026-15181", "fr-2026-07987", "hts-now"]),
    "Brazil": ("additive", "50% on steel mill products (Section 232, 9903.82.02); the Brazil Section 301 duty does not apply to them (note 50(a)(vi)(1)). On 25 non-steel lines (some ferroalloys, most scrap, powders, cold-formed shapes) "
               "the 25% Brazil duty (9903.05.01) applies, plus 12.5% (9903.05.27) on 19 of them. Ferrosilicon also carries AD/CVD, not shown.",
               ["procl-11021", "fr-2026-14542", "fr-2026-15181", "fr-2025-08986", "hts-now"]),
    "South Korea": ("additive", "50% on steel mill products (Section 232, 9903.82.02); KORUS does not reduce it (note 16(b)). On 19 non-steel lines the 2026 Section 301 rate is 12.5% in place of the base rate when lower (9903.05.71). "
                    "Several Korean flat-rolled products also carry AD/CVD, not shown.",
                    ["procl-11021", "fr-2026-15181", "fr-2026-09707", "hts-now"]),
    "Japan": ("additive", "50% on steel mill products (Section 232, 9903.82.02); Japan's former tariff-rate quota ended March 12, 2025. On 19 non-steel lines the 2026 Section 301 rate is 12.5% in place of the base rate when lower (9903.05.49).",
              ["procl-11021", "procl-10896", "fr-2026-15181", "hts-now"]),
    "Germany": ("eu15", "EU: 50% on steel mill products (Section 232, 9903.82.02); the EU tariff-rate quota ended March 12, 2025. On 18 non-steel lines the 2026 Section 301 rate is 10% in place of the base rate when lower (9903.05.39). "
                "German cut-to-length plate and non-oriented electrical steel carry AD/CVD, not shown.",
                ["procl-11021", "procl-10896", "fr-2026-15181", "fr-2017-10757", "hts-now"]),
    "Vietnam": ("additive", "50% on steel mill products (Section 232, 9903.82.02); 12.5% Section 301 (9903.05.84) on 19 non-steel lines. Vietnamese corrosion-resistant steel and rebar carry AD/CVD (2025, 2026), not shown.",
                ["procl-11021", "fr-2026-15181", "fr-2025-23431", "fr-2026-19102", "hts-now"]),
    "Taiwan": ("additive", "50% on steel mill products (Section 232, 9903.82.02). On 18 non-steel lines the 2026 Section 301 rate is 10% in place of the base rate when lower (9903.05.76). Taiwanese corrosion-resistant steel carries AD orders, not shown.",
               ["procl-11021", "fr-2026-15181", "fr-2025-23431", "hts-now"]),
    "United Kingdom": ("additive", "50% shown: UK steel pays 25% instead (9903.82.04) when at least 95% of it was melted and poured in the UK (note 16(d)); Tata Steel UK steel melted in the Netherlands counts until January 1, 2028. "
                       "10% Section 301 (9903.05.81) on 19 non-steel lines.",
                       ["procl-11021", "fr-2026-08297", "eo-14309", "fr-2026-15181", "hts-now"]),
    "China": ("additive", "75% on almost all steel mill products: 50% Section 232 (9903.82.02) + 25% Section 301 (note 31, 9903.91.01, or List 3); 57.5% on 20 wire, strip and bar lines on List 4A (7.5%); 50% on forged bars (7214.10). "
              "Pig iron, ferroalloys, DRI, scrap and powders pay 25% (List 3 or note 31) on most lines, plus 12.5% (9903.05.31) on the 19 lines outside the 2026 exemption list; ferromolybdenum and some other ferroalloys pay only the 12.5%. "
              "Many Chinese steel products also carry AD/CVD, not shown.",
              ["procl-11021", "fr-2024-21217", "fr-2018-20610", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
    "Russia": ("additive", "Column 2 rate, or 70% in its place on the 120 note 30(d) lines (9903.90.09), plus 50% Section 232 (9903.82.14) on steel mill products: up to 120%. 12.5% Section 301 (9903.05.66) on 19 non-steel lines.",
               ["procl-11021", "procl-10523", "fr-2026-15181", "hts-now"]),
    "India": ("additive", "50% on steel mill products (Section 232, 9903.82.02); 10% Section 301 (9903.05.44) on 19 non-steel lines. Indian hot-rolled, cold-rolled, corrosion-resistant steel and stainless bar carry AD/CVD, not shown.",
              ["procl-11021", "fr-2026-15181", "fr-2025-19411", "hts-now"]),
    "Ukraine": ("additive", "50% on steel mill products (Section 232, 9903.82.02): Ukraine's Section 232 exemption ended March 12, 2025. Ukraine is not one of the 60 economies of the 2026 Section 301 actions, so pig iron, ferroalloys, scrap and other non-steel lines pay only their base rate. "
                "Ukrainian hot-rolled flat steel is under the AD order continued in 2025, not shown.",
                ["procl-11021", "procl-10896", "fr-2025-19411", "hts-now"]),
    "Türkiye (Turkey)": ("additive", "50% on steel mill products (Section 232, 9903.82.02); 12.5% Section 301 (9903.05.79) on 19 non-steel lines. Turkish rebar and corrosion-resistant steel carry AD/CVD, not shown.",
                         ["procl-11021", "fr-2026-15181", "fr-2026-07109", "fr-2025-23431", "hts-now"]),
}
for c in ia["countries"]:
    rule = c["rule"]
    if c["country"] in R:
        kind, label, ids = R[c["country"]]
        rule["label"], rule["sourceIds"] = label, ids
    else:  # Any other country
        rule["label"] = (
            "At least 50% on steel mill products from every other country (Section 232 has no exemptions). The other columns show the range: base rate only, up to 12.5% more "
            "under the 2026 Section 301 actions on 19 non-steel lines. Column 2 countries (Belarus, Cuba, North Korea) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
        )
        rule["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Section 232 is shown at its default rate: 50% (9903.82.02). UK steel with at least 95% UK-melted content pays 25% (9903.82.04), and Canadian or Mexican steel authorized by Commerce "
    "under 9903.82.18 pays 25%; the cells do not show these variants.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Antidumping and countervailing duties are not included. They apply company by company to many Chapter 72 products: hot-rolled, cold-rolled and corrosion-resistant flat steel, plate, "
    "non-oriented electrical steel, rebar, wire rod, stainless sheet and strip, stainless bar, ferrosilicon and ferrovanadium.",
    "Entry rules apply to every steel line: a Commerce SIMA steel import license and the country of melt and pour (19 CFR part 360; CBP CSMS 62582900).",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2(aa), 16, 20, 29, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c)(iii) lists all of 7206–7215, 7217–7229 and the hot-rolled "
    "shapes of 7216 as steel articles (7216.91.00.10 under (iv)); it has no country exemption, and note 16(b) collects the duty on top of FTA rates. Section 232 steel is excluded from the "
    "2026 Section 301 duties (note 52(f)(1)), the Brazil duty (note 50(a)(vi)(1)) and the expired Section 122 surcharge (note 2(aa)(v)(2)), but not from China Section 301 (notes 20, 31) or "
    "the 2027 Nicaragua duty (note 29). Of the 54 other lines, 35 are on the 2026 Section 301 general exemption list (note 52(b)); only 7203.10.00 is on the Canada Section 338 list (note 51(b)(3))."
)
for x in ["procl-10896", "fr-2026-07987", "fr-2026-14542", "fr-2025-08986", "fr-2026-09707", "fr-2017-10757", "fr-2025-23431", "fr-2026-19102", "eo-14309", "fr-2018-20610",
          "fr-2026-20510", "fr-2024-21217", "procl-10523", "fr-2025-19411", "fr-2026-07109", "fr-2025-23892", "procl-11048", "procl-11065"]:
    need(x)
ia_ids = set()
for c in ia["countries"]:
    ia_ids.update(c["rule"]["sourceIds"])
ia_ids.add("hts-now")
ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Steel: SIMA License, Melt-and-Pour, Section 232 Entry Rules & Ways to Lower Duty (HTS Ch. 72) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 72 iron and steel line: Commerce SIMA steel import license, country of melt and pour, mill test certificates, Section 232 entry (9903.82.02), FTZ status, marking, AD/CVD scope, plus the legal ways to pay less: UK-melted steel, the Canada/Mexico 25% route, correct classification and drawback.",
    "keywords": [
        "steel import license",
        "SIMA steel license",
        "melt and pour steel",
        "section 232 steel csms",
        "steel tariff exclusion",
        "steel tariff exemptions",
        "steel antidumping scope ruling",
        "import steel requirements",
    ],
}
te["intro"] = (
    "For steel, the paperwork is part of the duty. Every entry of a Chapter 72 steel mill product needs a **Commerce steel import license (SIMA)** and must report the **country "
    "where the steel was melted and poured**, and the invoice must carry the **mill test certificate**. The Section 232 heading (9903.82.02, or 9903.82.04 for UK-melted steel) is "
    "reported next to the Chapter 72 line, and the duty is charged on the full value with no FTA reduction.\n\n"
    "The legal ways to pay less are narrow: the Section 232 product exclusion process and the country quotas are gone, and drawback is not available for Section 232 duty on Chapter 72 "
    "steel. What remains: UK-melted steel (25%), Commerce-authorized Canadian or Mexican quantities (25%), avoiding Chinese origin (25% Section 301), classifying correctly, and checking "
    "AD/CVD scope before you buy. Each rule and lever links to its regulation or proclamation."
)
te["regulationsAsOf"] = ECFR_AS_OF
te["levers"] = [
    {
        "id": "uk-melt",
        "title": "Buy UK steel melted and poured in the UK",
        "saves": "Half the Section 232 duty: 25% (9903.82.04) instead of 50% (9903.82.02) of the full value",
        "appliesTo": "Section 232 steel lines (7206–7229) of the United Kingdom",
        "document": "Mill test certificates showing the country of melt and pour, and ACE reporting of the melt-and-pour country; at least 95% of the steel must be UK-melted (Tata Steel UK steel melted in the Netherlands counts until January 1, 2028).",
        "caveat": "Origin must be the UK and the 95% test must be met; otherwise 50%. The tariff-rate quota for UK steel contemplated by Executive Order 14309 has not been set up.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d), heading 9903.82.04", "url": CH99},
            {"label": "Proclamation 11021 (91 FR 18201)", "url": src["procl-11021"]["url"]},
            {"label": "Commerce notice on Tata Steel UK (91 FR 23056)", "url": src["fr-2026-08297"]["url"]},
        ],
    },
    {
        "id": "camx-25",
        "title": "Canada or Mexico: the Commerce-authorized 25% rate",
        "saves": "Half the Section 232 duty (25% instead of 50%) on authorized quantities",
        "appliesTo": "Section 232 steel articles of Canada or Mexico (note 16(c)(iii)) that qualify for USMCA and were melted and poured in Canada or Mexico",
        "document": "Commerce authorization for the producer (submission under the April 23, 2026 procedures), USMCA certification of origin, and entry under heading 9903.82.18.",
        "caveat": "Only for producers that supply U.S. automobile or heavy-vehicle makers and commit to new U.S. primary steel capacity; limited to the quantity Commerce sets. Everything else from Canada or Mexico pays 50%.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(h), heading 9903.82.18", "url": CH99},
            {"label": "Proclamation 10984, clause 13 (90 FR 48451)", "url": src["procl-10984"]["url"]},
            {"label": "Commerce procedures (91 FR 21790)", "url": src["fr-2026-07987"]["url"]},
        ],
    },
    {
        "id": "origin",
        "title": "Avoid Chinese origin",
        "saves": "25% of value: Chinese steel pays Section 301 (9903.91.01) on top of Section 232, 75% in total, against 50% from other countries; on pig iron, ferroalloys and scrap 25% to 37.5% more",
        "appliesTo": "All 559 lines, for goods of China",
        "document": "Mill certificates and production records showing where the product was made. For the tariff, origin follows the last substantial transformation; for steel flat products, cold-rolling hot-rolled steel makes the cold-rolled product a good of the country where it was cold-rolled under the 19 CFR 102.20 rules. Ask CBP for a binding ruling.",
        "caveat": "Third-country processing does not change the Section 232 rate (50% everywhere) and can fall under AD/CVD circumvention findings: Commerce opened circumvention inquiries on corrosion-resistant steel from China, Korea and Vietnam in 2026.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 31", "url": CH99},
            {"label": "19 CFR 102.20 (Chapter 72 note)", "url": f"{ECFR}/section-102.20"},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "classify",
        "title": "Classify shapes and raw materials correctly",
        "saves": "The 50% Section 232 duty on lines that are not on the note 16(c) lists: cold-formed shapes (7216.61, 7216.69, 7216.91.00.90), pig iron, ferroalloys, DRI, scrap and powders",
        "appliesTo": "7201–7205 and 7216",
        "document": "Technical specifications (how the shape was formed: hot-rolled vs cold-formed; chemistry for ferroalloys vs alloy steel under chapter note 1) and, if unsure, a CBP binding ruling.",
        "caveat": "Classification follows the product, not the duty: misclassifying a hot-rolled shape as cold-formed is a penalty case. Cold-formed shapes still pay the 2026 Section 301 duty for most countries.",
        "citations": [
            {"label": "HTSUS Chapter 72, note 1", "url": CH72},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c)(iii)", "url": CH99},
            {"label": "19 CFR part 177 (rulings)", "url": f"{ECFR}/part-177"},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA for the non-steel lines",
        "saves": "The 10% Section 301 duty on Canadian and Mexican spiegeleisen, ferrosilicon, ferromolybdenum, ferrovanadium, other ferroalloys, powders and cold-formed shapes (9903.05.93, 9903.05.94)",
        "appliesTo": "The 19 Chapter 72 lines that pay the 2026 Section 301 duty, for originating goods of Canada or Mexico",
        "document": "A USMCA certification of origin from the importer, exporter or producer (no set format), available to CBP on request.",
        "caveat": "A USMCA claim does not reduce Section 232 on steel (note 16(b)) or the Section 338 duty on Canadian DRI. USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": f"{ECFR}/section-182.12"},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check AD/CVD scope before you buy",
        "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
        "appliesTo": "Flat-rolled (hot-rolled, cold-rolled, corrosion-resistant, plate, electrical steel, tinplate), rebar, wire rod, stainless sheet and bar, ferrosilicon and ferrovanadium",
        "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
        "caveat": "A product in scope pays the cash deposit even if entered under another HTS line. AD/CVD rates change with each administrative review.",
        "citations": [
            {"label": "19 CFR 351.225 (scope rulings)", "url": "https://www.ecfr.gov/current/title-19/section-351.225"},
            {"label": "Corrosion-resistant steel AD orders (90 FR 59494)", "url": src["fr-2025-23431"]["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Drawback: only for the non-Section 232 duties",
        "saves": "Up to 99% of the base rate, Section 301 and other ordinary duties on goods that are exported or used in exported products",
        "appliesTo": "All lines, but not the Section 232 duty on Chapter 72 steel",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Proclamation 11021 allows manufacturing drawback of Section 232 duty only for certain derivative articles (Annex I-B, III) of trade-agreement partners; Chapter 72 steel articles (Annex I-A) get none. AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
        "citations": [
            {"label": "19 CFR part 191", "url": f"{ECFR}/part-191"},
            {"label": "19 CFR 191.3", "url": f"{ECFR}/section-191.3"},
            {"label": "Proclamation 11021, clauses 13–14", "url": src["procl-11021"]["url"]},
        ],
    },
]
ADCVD = {
    "adcvd-flat": ("Commerce (ITA) / CBP", "Flat-rolled steel AD/CVD orders: hot-rolled (India, Indonesia, China, Taiwan, Thailand, Ukraine; Japan, Korea, the Netherlands), cold-rolled (China, India, Japan, Korea, UK), "
                   "corrosion-resistant (China, India, Italy, Korea, Taiwan; and since December 2025 Australia, Brazil, Canada, Mexico, the Netherlands, South Africa, Taiwan, Türkiye, UAE, Vietnam), "
                   "cut-to-length plate, non-oriented electrical steel; tin mill investigations (China, Taiwan, Türkiye). Not in the tariff calculator",
                   [("90 FR 48046 (hot-rolled, continued 2025)", "fr-2025-19411"), ("81 FR 67962 (hot-rolled, 2016)", "fr-2016-23836"), ("91 FR 27268 (hot-rolled Korea, 2026 review)", "fr-2026-09707"), ("91 FR 10079 (hot-rolled Netherlands, 2026 review)", "fr-2026-03999"), ("90 FR 39372 (hot-rolled Japan, 2025 review)", "fr-2025-15504"), ("87 FR 52360 (cold-rolled)", "fr-2022-18348"),
                    ("87 FR 50601 (CORE, 2016 orders)", "fr-2022-17711"), ("90 FR 59494 (CORE, 2025 AD)", "fr-2025-23431"), ("90 FR 59488 (CORE, 2025 CVD)", "fr-2025-23430"),
                    ("82 FR 24096 (cut-to-length plate)", "fr-2017-10757"), ("91 FR 28573 (non-oriented electrical steel)", "fr-2026-09826"), ("91 FR 24157 (tin mill investigations)", "fr-2026-08745")]),
    "adcvd-long": ("Commerce (ITA) / CBP", "Rebar and wire rod AD/CVD orders: rebar (Mexico, Türkiye; Algeria, Bulgaria, Egypt, Vietnam in 2026), wire rod (China; Brazil, Indonesia, Mexico, Moldova, Trinidad and Tobago; Algeria CVD 2026). Not in the tariff calculator",
                   [("91 FR 18817 (rebar Mexico, Türkiye)", "fr-2026-07109"), ("91 FR 59104 (rebar 2026 AD)", "fr-2026-19102"), ("91 FR 59102 (rebar 2026 CVD)", "fr-2026-19103"),
                    ("91 FR 23062 (rebar Algeria)", "fr-2026-08284"), ("91 FR 10071 (wire rod)", "fr-2026-04121"), ("91 FR 3418 (wire rod China)", "fr-2026-01600"), ("91 FR 59107 (wire rod Algeria)", "fr-2026-19107")]),
    "adcvd-stainless": ("Commerce (ITA) / CBP", "Stainless steel AD/CVD orders: sheet and strip (China; Japan, Korea, Taiwan), plate in coils (Belgium, South Africa, Taiwan), bar (India). Not in the tariff calculator",
                        [("87 FR 66651 (sheet and strip, China)", "fr-2022-24023"), ("88 FR 85232 (sheet and strip in coils, Japan, Korea, Taiwan)", "fr-2023-26884"),
                         ("87 FR 47706 (plate in coils)", "fr-2022-16642"), ("89 FR 17819 (bar, India)", "fr-2024-05172")]),
    "adcvd-ferro": ("Commerce (ITA) / CBP", "Ferroalloy AD/CVD orders: ferrosilicon (Brazil, Kazakhstan, Malaysia, 2025) and ferrovanadium (China, South Africa). Not in the tariff calculator",
                    [("90 FR 21456 (ferrosilicon AD)", "fr-2025-08986"), ("90 FR 21446 (ferrosilicon CVD)", "fr-2025-08987"), ("91 FR 11037 (ferrovanadium)", "fr-2026-04483")]),
}
te["rules"] = [
    {"id": "sima", "agency": "Commerce (ITA)", "title": "Steel import license (SIMA) before filing the entry summary, with the country of melt and pour; needed for consumption and FTZ entries, not for informal entries under $2,000",
     "citations": [{"label": "19 CFR 360.101", "url": f"{ECFR}/section-360.101"}, {"label": "19 CFR 360.103", "url": f"{ECFR}/section-360.103"}]},
    {"id": "melt-pour", "agency": "CBP", "title": "Report the ISO code of the country where the steel was melted and poured on every Section 232 steel entry (mandatory since March 12, 2025)",
     "citations": [{"label": "CBP CSMS # 62582900", "url": src["csms-62582900"]["url"]}, {"label": "CBP CSMS # 64366327", "url": src["csms-64366327"]["url"]}]},
    {"id": "mill-cert", "agency": "CBP", "title": "Invoice must state the percentages by weight of carbon and metallic elements, as a mill analysis or mill test certificate",
     "citations": [{"label": "19 CFR 141.89", "url": f"{ECFR}/section-141.89"}]},
    {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.02 (or 9903.82.04 UK, 9903.82.14 Russia, 9903.82.18 authorized Canada/Mexico) with the Chapter 72 line; duty on the full value, on top of any FTA rate",
     "citations": [{"label": "CBP CSMS # 68253075", "url": src["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
    {"id": "ftz", "agency": "CBP", "title": "Section 232 steel admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
     "citations": [{"label": "19 CFR 146.41", "url": f"{ECFR}/section-146.41"}, {"label": "Proclamation 11021, clause 12", "url": src["procl-11021"]["url"]}]},
    {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container; hoop steel, steel bands and wire (except barbed) are on the J-list, but their outermost container must be marked",
     "citations": [{"label": "19 CFR 134.11", "url": f"{ECFR}/section-134.11"}, {"label": "19 CFR 134.33", "url": f"{ECFR}/section-134.33"}]},
    {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 70% in lieu of column 2 on note 30(d) metals, plus Section 232 (9903.82.14)",
     "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. note 30", "url": CH99}, {"label": "Proclamation 10523 (88 FR 13277)", "url": src["procl-10523"]["url"]}]},
]
for rid, (agency, title, cites) in ADCVD.items():
    te["rules"].append({"id": rid, "agency": agency, "title": title, "citations": [{"label": lab, "url": src[sid]["url"]} for lab, sid in cites]})

BASE_RULES = ["sima", "melt-pour", "mill-cert", "s232-entry", "ftz", "marking"]
RAW_RULES = ["mill-cert", "marking"]
GROUP_RULES = {
    "7201": RAW_RULES, "7202": RAW_RULES + ["adcvd-ferro"], "7203": RAW_RULES, "7204": RAW_RULES, "7205": RAW_RULES,
    "7208": BASE_RULES + ["adcvd-flat"], "7209": BASE_RULES + ["adcvd-flat"], "7210": BASE_RULES + ["adcvd-flat"], "7211": BASE_RULES + ["adcvd-flat"],
    "7212": BASE_RULES + ["adcvd-flat"], "7225": BASE_RULES + ["adcvd-flat"], "7226": BASE_RULES + ["adcvd-flat"],
    "7213": BASE_RULES + ["adcvd-long"], "7214": BASE_RULES + ["adcvd-long"], "7227": BASE_RULES + ["adcvd-long"], "7228": BASE_RULES + ["adcvd-long"],
    "7219": BASE_RULES + ["adcvd-stainless"], "7220": BASE_RULES + ["adcvd-stainless"], "7222": BASE_RULES + ["adcvd-stainless"],
}
GROUP_NOTES = {
    "7201": "Outside Section 232 and the SIMA license. Free; spiegeleisen (7201.50.60) pays the 2026 Section 301 duty. Russian pig iron pays 70% in lieu of column 2.",
    "7202": "Outside Section 232; the only dutiable lines (1.1% to 10%). Ferrosilicon (Brazil, Kazakhstan, Malaysia) and ferrovanadium (China, South Africa) are under AD/CVD orders.",
    "7203": "Outside Section 232. Canadian DRI (7203.10) pays the 50% Section 338 duty, USMCA or not.",
    "7204": "Outside Section 232 and on the 2026 Section 301 exemption list: Free except for China (List 3, 25%) and Russia (column 2).",
    "7205": "Outside Section 232; pays the 2026 Section 301 duty for most countries.",
    "7206": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7207": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%. Slabs are the main input for U.S. rolling mills.",
    "7208": "Hot-rolled flat and plate: hot-rolled AD/CVD orders (two groups of countries) and cut-to-length plate orders.",
    "7209": "Cold-rolled flat: AD orders on China, India, Japan, Korea and the UK; CVD on China, India and Korea.",
    "7210": "Coated flat: corrosion-resistant AD/CVD orders (15 countries) and the 2026 tin mill investigations (China, Taiwan, Türkiye) on tinplate and tin-free steel.",
    "7211": "Narrow flat: may fall within the hot-rolled or cold-rolled order scopes depending on dimensions; check the scope.",
    "7212": "Narrow coated flat: may fall within the corrosion-resistant or tin mill scopes; check the scope.",
    "7213": "Wire rod and rebar in coils: wire rod AD/CVD orders and the rebar orders.",
    "7214": "Rebar: AD/CVD orders on Mexico, Türkiye, Algeria, Bulgaria, Egypt and Vietnam.",
    "7215": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7216": "Hot-rolled shapes pay Section 232; cold-formed shapes (7216.61, 7216.69, 7216.91.00.90) do not, so the SIMA, melt-and-pour and Section 232 entry rules apply to the others only.",
    "7217": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7218": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7219": "Stainless flat: AD/CVD orders on stainless sheet and strip (China; Japan, Korea, Taiwan) and stainless plate in coils (Belgium, South Africa, Taiwan).",
    "7220": "Stainless strip: within the stainless sheet and strip orders (China; Japan, Korea, Taiwan).",
    "7221": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7222": "Section 232 steel; stainless bar from India is under an AD order (check the scope).",
    "7223": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7224": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
    "7225": "Alloy flat, including electrical steel: non-oriented electrical steel orders (six countries) and alloy coverage in the flat-rolled orders.",
    "7226": "Alloy narrow flat, including electrical steel strip: non-oriented electrical steel orders.",
    "7227": "Alloy wire rod: within the wire rod orders.",
    "7228": "Alloy bars: rebar of alloy steel can fall within the rebar orders.",
    "7229": "Section 232 steel: SIMA license, melt-and-pour reporting, 50%.",
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = G[h][0]
    g["ruleIds"] = list(GROUP_RULES.get(h, BASE_RULES)) + ["russia"]
    g["note"] = GROUP_NOTES[h]
ADCVD_HEADINGS = {h for h, r in GROUP_RULES.items() if any(x.startswith("adcvd") for x in r)}
for ln in te["lines"]:
    hts = ln["hts"]
    h = ln.get("heading") or LINE[hts]["heading"]
    if hts in S232:
        rules = list(GROUP_RULES.get(h, BASE_RULES))
    else:
        rules = ["mill-cert", "marking"] + [r for r in GROUP_RULES.get(h, []) if r.startswith("adcvd")]
    ln["ruleIds"] = list(dict.fromkeys(rules))
    levers = []
    if hts in S232:
        levers.append("uk-melt")
        if hts in S232_ARTICLES:
            levers.append("camx-25")
    levers.append("origin")
    if h == "7216" or hts in NON232:
        levers.append("classify")
    if hts in S301:
        levers.append("usmca")
    if h in ADCVD_HEADINGS:
        levers.append("adcvd-scope")
    levers.append("drawback")
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings change often, and AD/CVD rates are company-specific "
    "and change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
)

# ------------------------------------------------------------------ trade-dependent text + finalConclusion
apply_trade(d, src)

json.dump(d, open(sys.argv[2], "w"), ensure_ascii=False, indent=2)
print("wrote", sys.argv[2])
