"""Authored content for the Chapter 32 content file (used by fill32.py). Facts from official sources only."""

CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH32 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2032"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FR = "https://www.federalregister.gov/documents/"


def ecfr(title, sec):
    return f"https://www.ecfr.gov/current/title-{title}/section-{sec}"


def ecfr_part(title, part):
    return f"https://www.ecfr.gov/current/title-{title}/part-{part}"


# ---------------------------------------------------------------------------------------------- sources
NEW_SOURCES = [
    {
        "id": "hts-ch32",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 32",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 32",
        "signed": None,
        "published": "2026-10-07",
        "url": CH32,
    },
    {
        "id": "procl-10947",
        "publisher": "Federal Register",
        "citation": "90 FR 24199",
        "document": "Proclamation 10947",
        "title": "Adjusting Imports of Aluminum and Steel Into the United States",
        "signed": "2025-06-03",
        "published": "2025-06-09",
        "url": FR + "2025/06/09/2025-10524/adjusting-imports-of-aluminum-and-steel-into-the-united-states",
    },
    {
        "id": "procl-11021",
        "publisher": "Federal Register",
        "citation": "91 FR 18201",
        "document": "Proclamation 11021",
        "title": "Strengthening Actions Taken To Adjust Imports of Aluminum, Steel, and Copper Into the United States",
        "signed": "2026-04-02",
        "published": "2026-04-09",
        "url": FR + "2026/04/09/2026-06960/strengthening-actions-taken-to-adjust-imports-of-aluminum-steel-and-copper-into-the-united-states",
    },
    {
        "id": "fr-2026-16143",
        "publisher": "Federal Register",
        "citation": "91 FR 51155",
        "document": "Notice (Commerce)",
        "title": "Carbazole Violet Pigment 23 from India and the People's Republic of China: Final Results of Sunset Reviews and Revocation of the Antidumping Duty Orders",
        "signed": None,
        "published": "2026-08-07",
        "url": FR + "2026/08/07/2026-16143/carbazole-violet-pigment-23-from-india-and-the-peoples-republic-of-china-final-results-of-sunset",
    },
    {
        "id": "fr-2026-16146",
        "publisher": "Federal Register",
        "citation": "91 FR 51149",
        "document": "Notice (Commerce)",
        "title": "Carbazole Violet Pigment 23 From India: Final Results of Fourth Sunset Review and Revocation of Countervailing Duty Order",
        "signed": None,
        "published": "2026-08-07",
        "url": FR + "2026/08/07/2026-16146/carbazole-violet-pigment-23-from-india-final-results-of-fourth-sunset-review-and-revocation-of",
    },
    {
        "id": "fr-2026-16581",
        "publisher": "Federal Register",
        "citation": "91 FR 52713",
        "document": "Notice (USITC)",
        "title": "Carbazole Violet Pigment 23 From China and India; Termination of Five-Year Reviews",
        "signed": None,
        "published": "2026-08-14",
        "url": FR + "2026/08/14/2026-16581/carbazole-violet-pigment-23-from-china-and-india-termination-of-five-year-reviews",
    },
    {
        "id": "fr-2012-11219",
        "publisher": "Federal Register",
        "citation": "77 FR 27423",
        "document": "Notice (Commerce)",
        "title": "Certain Stilbenic Optical Brightening Agents From the People's Republic of China: Amended Final Determination of Sales at Less Than Fair Value and Antidumping Duty Order",
        "signed": None,
        "published": "2012-05-10",
        "url": FR + "2012/05/10/2012-11219/certain-stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-amended-final",
    },
    {
        "id": "fr-2012-11223",
        "publisher": "Federal Register",
        "citation": "77 FR 27419",
        "document": "Notice (Commerce)",
        "title": "Certain Stilbenic Optical Brightening Agents From Taiwan: Amended Final Determination of Sales at Less Than Fair Value and Antidumping Duty Order",
        "signed": None,
        "published": "2012-05-10",
        "url": FR + "2012/05/10/2012-11223/certain-stilbenic-optical-brightening-agents-from-taiwan-amended-final-determination-of-sales-at",
    },
    {
        "id": "fr-2024-14029",
        "publisher": "Federal Register",
        "citation": "89 FR 53392",
        "document": "Notice (Commerce)",
        "title": "Stilbenic Optical Brightening Agents From Taiwan and the People's Republic of China: Notice of Court Decision Not in Harmony With the Results of Antidumping Sunset Reviews, Reinstatement of Antidumping Duty Orders, and Reconduction of Sunset Reviews",
        "signed": None,
        "published": "2024-06-26",
        "url": FR + "2024/06/26/2024-14029/stilbenic-optical-brightening-agents-from-taiwan-and-the-peoples-republic-of-china-notice-of-court",
    },
    {
        "id": "fr-2025-03715",
        "publisher": "Federal Register",
        "citation": "90 FR 11511",
        "document": "Notice (Commerce)",
        "title": "Stilbenic Optical Brightening Agents From the People's Republic of China and Taiwan: Continuation of Antidumping Duty Orders",
        "signed": None,
        "published": "2025-03-07",
        "url": FR + "2025/03/07/2025-03715/stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-and-taiwan-continuation-of",
    },
    {
        "id": "fr-2026-08957",
        "publisher": "Federal Register",
        "citation": "91 FR 24511",
        "document": "Notice (Commerce)",
        "title": "Certain Stilbenic Optical Brightening Agents From Taiwan: Final Results of Antidumping Duty Administrative Review; 2023-2024",
        "signed": None,
        "published": "2026-05-06",
        "url": FR + "2026/05/06/2026-08957/certain-stilbenic-optical-brightening-agents-from-taiwan-final-results-of-antidumping-duty",
    },
    {
        "id": "fr-2026-14140",
        "publisher": "Federal Register",
        "citation": "91 FR 43086",
        "document": "Notice (Commerce)",
        "title": "Stilbenic Optical Brightening Agents From Taiwan: Preliminary Affirmative Determination of Antidumping Duty Administrative Review; 2024-2025",
        "signed": None,
        "published": "2026-07-14",
        "url": FR + "2026/07/14/2026-14140/stilbenic-optical-brightening-agents-from-taiwan-preliminary-affirmative-determination-of",
    },
]

# ---------------------------------------------------------------------------------------------- headings
GROUP_INFO = {
    "3201": {
        "label": "Tanning extracts & tannins",
        "short": "Tanning extracts",
        "blurb": "Quebracho, wattle, chestnut and other vegetable tanning extracts and tannic acid: 5 lines, Free to 3.1%. Used to tan leather.",
        "search": ["quebracho extract", "wattle extract", "tannic acid", "chestnut extract", "tara tannin"],
        "eng_note": "Quebracho extract (3201.10) from Russia pays 35% in place of the Column 2 rate (U.S. note 30). Argentina was the largest 2025 supplier.",
    },
    "3202": {
        "label": "Synthetic tanning agents",
        "short": "Tanning agents",
        "blurb": "Synthetic organic and inorganic tanning substances, tanning preparations and enzymatic pre-tanning preparations: 4 lines, Free to 6.5%.",
        "search": ["syntans", "synthetic tanning agent", "chrome tanning", "pre-tanning enzymes"],
        "eng_note": None,
    },
    "3203": {
        "label": "Natural colorants (plant & animal)",
        "short": "Natural colors",
        "blurb": "Annatto, cochineal, logwood, marigold meal and other coloring matter of vegetable or animal origin: 3 lines, Free or 3.1%. Colorants used in food, drugs or cosmetics must also meet FDA's color additive rules.",
        "search": ["annatto", "cochineal", "carmine", "marigold extract", "natural food color", "logwood"],
        "eng_note": "Colorants sold for food, drug, cosmetic or medical-device use must be FDA-listed color additives (21 CFR parts 70–74). Other colorants (3203.00.80) used in pharmaceutical applications can skip the 2026 Section 301 duty (U.S. note 52(e)).",
    },
    "3204": {
        "label": "Synthetic organic dyes & pigments",
        "short": "Synthetic dyes",
        "blurb": "Disperse, acid, basic, direct, vat, reactive and solvent dyes, organic pigments such as phthalocyanine blue, FD&C food colors, carotenoids and optical brighteners: 89 lines, mostly 6.5%. Optical brighteners from China and Taiwan also pay antidumping duties.",
        "search": ["reactive dyes", "disperse dyes", "acid dyes", "pigment blue 15:3", "FD&C Red 40", "optical brightener", "synthetic indigo", "solvent dyes"],
        "eng_note": "Stilbenic optical brighteners (3204.20.80) from China and Taiwan are under antidumping orders. FD&C colors (3204.12.50.10–.30) need FDA batch certification for food, drug or cosmetic use. Lines described in additional U.S. note 3 to section VI are products not in the Chemical Appendix; the importer certifies the CAS number.",
    },
    "3205": {
        "label": "Color lakes",
        "short": "Lakes",
        "blurb": "Color lakes and preparations based on them, including food coloring solutions with cochineal carmine lake: 11 lines, Free or 6.5%.",
        "search": ["color lake", "aluminum lake", "carmine lake", "FD&C lake"],
        "eng_note": "Lakes of FD&C colors used in food, drugs or cosmetics are color additives under FDA rules (21 CFR parts 74 and 82).",
    },
    "3206": {
        "label": "Titanium dioxide & other pigments",
        "short": "TiO2 & pigments",
        "blurb": "Titanium dioxide pigments (3206.11, 80% or more TiO2), chrome, cadmium, iron-oxide, ultramarine and zinc pigments, carbon-black preparations, color masterbatches and luminophores: 16 lines, Free to 6.5%. TiO2 pigments are exempt from the 2026 Section 301 tariffs.",
        "search": ["titanium dioxide", "TiO2", "rutile pigment", "iron oxide pigment", "carbon black preparation", "color masterbatch", "ultramarine blue"],
        "eng_note": "Titanium dioxide pigments (3206.11, 3206.19) are on the 2026 Section 301 exemption list (U.S. note 52(b)) and pay only their 6% base rate, plus 25% if Chinese. Titanium dioxide itself, not prepared as a pigment, is 2823.00.00 (5.5%) in Chapter 28.",
    },
    "3207": {
        "label": "Ceramic colors, glazes & glass frit",
        "short": "Glazes & frit",
        "blurb": "Prepared pigments and opacifiers for ceramics, vitrifiable enamels and glazes, engobes, liquid lustres and glass frit: 5 lines, 3.1% to 6.5%.",
        "search": ["ceramic glaze", "glass frit", "enamel frit", "engobe", "ceramic pigment"],
        "eng_note": None,
    },
    "3208": {
        "label": "Solvent-based paints & varnishes",
        "short": "Solvent paints",
        "blurb": "Paints, enamels, lacquers and varnishes based on polyesters, acrylic/vinyl or other polymers in a non-aqueous medium (including solvent-based polymer solutions): 3 lines, 3.2% to 3.7%. Canadian 3208.90 pays the 50% Section 338 duty.",
        "search": ["solvent based paint", "epoxy paint", "polyurethane varnish", "spray paint", "lacquer", "automotive paint"],
        "eng_note": "Consumer paint must meet the 0.009% lead limit (16 CFR part 1303); architectural coatings must meet EPA VOC limits and labeling (40 CFR part 59, subpart D); spray paints the aerosol-coating reactivity limits (subpart E). Flammable paint is a hazardous material in transport. Canadian 3208.90 pays the 50% Section 338 duty, USMCA or not.",
    },
    "3209": {
        "label": "Water-based paints & varnishes",
        "short": "Water paints",
        "blurb": "Latex and other water-based paints and varnishes on acrylic/vinyl or other polymers: 2 lines, 5.1% and 5.9%.",
        "search": ["latex paint", "acrylic house paint", "water based paint", "emulsion paint", "water based varnish"],
        "eng_note": "Same consumer lead limit (16 CFR part 1303) and EPA VOC rules for architectural coatings (40 CFR part 59) as solvent-based paints.",
    },
    "3210": {
        "label": "Other paints, distempers & leather finishes",
        "short": "Other paints",
        "blurb": "Other paints and varnishes (including enamels, lacquers and distempers) and prepared water pigments for finishing leather: 1 line, 1.8%.",
        "search": ["oil paint", "distemper", "leather finish", "shellac varnish"],
        "eng_note": None,
    },
    "3211": {
        "label": "Paint driers",
        "short": "Driers",
        "blurb": "Prepared driers that speed the curing of oil-based paints: 1 line, 3.7%.",
        "search": ["paint drier", "cobalt drier", "siccative"],
        "eng_note": None,
    },
    "3212": {
        "label": "Pigment dispersions, stamping foils & retail dyes",
        "short": "Dispersions & foils",
        "blurb": "Pigments (including metallic aluminum pigments) dispersed in non-aqueous media for paint making, hot stamping foils, and dyes put up for retail sale: 3 lines, 3.1% or 4.7%.",
        "search": ["hot stamping foil", "aluminum paste pigment", "pigment dispersion", "fabric dye retail"],
        "eng_note": None,
    },
    "3213": {
        "label": "Artists' & students' colors",
        "short": "Artists' colors",
        "blurb": "Artists', students' and signboard painters' colors in tubes, jars, bottles or pans: 6.5% on the entire set for color sets, 3.4% for other colors. China is the largest supplier.",
        "search": ["acrylic paint set", "watercolor set", "oil paints artist", "poster paint", "gouache", "face paint"],
        "eng_note": "Art materials must carry the chronic-hazard labeling of ASTM D-4236 (16 CFR 1500.14(b)(8)); artists' paints are exempt from the consumer lead-paint ban (16 CFR 1303.3).",
    },
    "3214": {
        "label": "Caulk, putty, mastics & fillers",
        "short": "Caulk & putty",
        "blurb": "Glazier's and grafting putty, resin cements, caulking compounds, other mastics and painters' fillings (3214.10), and non-refractory surfacing preparations for walls and floors (3214.90): 5 lines, Free to 3.7%.",
        "search": ["caulk", "sealant", "glazing putty", "wall putty", "wood filler", "spackle", "tile grout"],
        "eng_note": "Canadian 3214.90.50 pays the 50% Section 338 duty, USMCA or not. 3214.10 is on the Russian-aluminum list (200%, U.S. note 19).",
    },
    "3215": {
        "label": "Printing, writing & drawing inks",
        "short": "Inks",
        "blurb": "Black and colored printing inks (news, flexographic, gravure, letterpress, offset), solid inks shaped for printers, and writing, drawing and other inks: 18 lines, Free to 3.1%. Japan is the largest supplier.",
        "search": ["printing ink", "offset ink", "flexographic ink", "gravure ink", "drawing ink", "solid ink sticks", "tattoo ink"],
        "eng_note": "Flammable printing inks are hazardous materials in transport (49 CFR 172.101). Canadian colored printing ink of 3215.19.90 pays the 50% Section 338 duty, USMCA or not. Drawing ink sold as an art material needs ASTM D-4236 labeling.",
    },
}

# ---------------------------------------------------------------------------------------------- in effect
COMMON_EXEMPT = (
    "Three subheadings are exempt for every country (U.S. note 52(b), 9903.05.86): titanium dioxide pigments 3206.11 and 3206.19 and crude copper "
    "phthalocyanine 3204.17.20. Five colorant subheadings (3203.00.80, 3204.13.60, 3204.13.80, 3204.18 carotenoids and 3204.90) are exempt only when "
    "the goods are for use in pharmaceutical applications (note 52(e), 9903.05.89)."
)

IN_EFFECT = {
    "ca-section-301": {
        "measure": "Section 301 tariff (2026) + Section 338 duty on Canada",
        "ch99Code": "9903.05.29 / 9903.03.14",
        "now": "+10%; +50% on 3 subheadings",
        "exemption": "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.93). "
        + COMMON_EXEMPT
        + " The 50% Section 338 duty (9903.03.14, U.S. note 51(b)(3)) covers other solvent-based paints and varnishes (3208.90.00), other mastics and "
        "surfacing preparations (3214.90.50) and colored printing inks (3215.19.90), and is charged even when USMCA is claimed. The 2025 IEEPA duty on "
        "Canada (35% from August 1, 2025) ended February 24, 2026.",
        "whatItMeans": "USMCA-qualifying Canadian titanium dioxide pigment, latex paint or caulk pays $0. A $100,000 USMCA shipment of solvent-based "
        "industrial paint (3208.90) pays $50,000; without a USMCA claim it pays $63,200 (3.2% + 10% + 50%). Non-USMCA goods on other lines pay the base "
        "rate plus 10%.",
    },
    "eu-section-301": {
        "now": "10% total",
        "exemption": "The EU rate is a floor: goods pay 10% in total in place of a lower base rate (U.S. note 52(k)); every Chapter 32 base rate is below "
        "10%. "
        + COMMON_EXEMPT
        + " The exempt lines pay only their base rate (6% for titanium dioxide pigments). The 2025 IEEPA reciprocal duty (15% including the base rate "
        "from August 7, 2025) ended February 24, 2026.",
        "whatItMeans": "German, Italian or Spanish paints, inks, dyes and pigments pay 10% of value in total: $100,000 of German acrylic paint (3208.20, "
        "3.6% base) pays $10,000 instead of $3,600. EU titanium dioxide pigment pays 6%.",
    },
    "in-section-301": {
        "exemption": COMMON_EXEMPT + " The 2025 IEEPA duties on India — 25% from August 7, 2025 plus another 25% from August 27, 2025 — ended February 7, "
        "2026 (the extra 25%) and February 24, 2026.",
        "whatItMeans": "Indian dyes and pigments at a 6.5% base rate pay 16.5%: $50,000 of reactive dyes pays $8,250. Natural colorants of 3203.00.10 "
        "(Free) pay 10%.",
    },
    "jp-section-301": {
        "now": "12.5% total",
        "exemption": "Japan's rate is a floor: goods pay 12.5% in total in place of a lower base rate (U.S. note 52(k)). "
        + COMMON_EXEMPT
        + " The 2025 IEEPA reciprocal duty on Japan ended February 24, 2026.",
        "whatItMeans": "Japanese printing ink (1.8% base) pays 12.5%: $100,000 of offset ink pays $12,500. Japanese titanium dioxide pigment pays its 6% "
        "base rate.",
    },
    "mx-section-301": {
        "exemption": "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94). "
        + COMMON_EXEMPT
        + " No Chapter 32 line is subject to a Section 338 or other Mexico-only duty. The 2025 IEEPA duty on Mexico (25%) ended February 24, 2026.",
        "whatItMeans": "USMCA-qualifying Mexican paint, pigment or ceramic glaze pays $0. Goods that do not qualify pay the base rate plus 10%, e.g. "
        "15.1% on latex paint (3209.10).",
    },
    "cn-section-301": {
        "measure": "Section 301 tariffs: China lists 3 and 4A (2018–2019) + 2026 action",
        "now": "+37.5% on most lines",
        "exemption": "List 3 (+25%, 9903.88.03, U.S. note 20(f)) covers 163 of the 168 lines; synthetic indigo and other vat dyes of 3204.15.10 and "
        "3204.15.80 are on List 4A (+7.5%, 9903.88.15) instead. 3204.11.15, 3204.19.40 and 3204.20.40 are on neither list (only on the suspended List "
        "4B). No List 3 or 4A product exclusion for a Chapter 32 product is in effect. The 2026 duty of 12.5% (9903.05.31) is added on top except for "
        "the note 52(b) subheadings — titanium dioxide pigments (3206.11, 3206.19) and crude copper phthalocyanine (3204.17.20) — and for "
        "pharmaceutical-use colorants (note 52(e)). USTR confirmed on October 7, 2026 that the 2018 actions continue during their four-year review. The "
        "2025 IEEPA duties on China ended February 24, 2026. Optical brighteners of 3204.20.80 also pay an antidumping duty (not shown).",
        "whatItMeans": "Most Chinese dyes, pigments, paints and inks pay the base rate plus 37.5%: $50,000 of pigment blue 15:3 (6.5%) pays $22,000 "
        "(44%). Chinese titanium dioxide pigment pays 31% (6% + 25%), synthetic indigo 26.5%.",
    },
    "gb-section-301": {
        "exemption": COMMON_EXEMPT + " The 2025 IEEPA reciprocal duty on the United Kingdom ended February 24, 2026.",
        "whatItMeans": "British printing ink (1.8%) pays 11.8%; British paint (3.2–5.9%) pays 13.2–15.9%.",
    },
    "kr-section-301": {
        "now": "12.5% total",
        "exemption": "Korea's rate is a floor: goods pay 12.5% in total in place of a lower rate (U.S. note 52(k)), so a KORUS claim does not lower the "
        "total on these lines. "
        + COMMON_EXEMPT
        + " Exempt lines enter Free under KORUS. The 2025 IEEPA reciprocal duty on Korea ended February 24, 2026.",
        "whatItMeans": "Korean paints, inks and pigments pay 12.5% of value; $100,000 of Korean industrial paint pays $12,500. KORUS-originating titanium "
        "dioxide pigment enters Free.",
    },
    "tw-section-301": {
        "now": "10% total",
        "exemption": "Taiwan's rate is a floor: goods pay 10% in total in place of a lower base rate (U.S. note 52(k)). "
        + COMMON_EXEMPT
        + " The 2025 IEEPA reciprocal duty on Taiwan ended February 24, 2026. Stilbenic optical brighteners (3204.20.80) from Taiwan also pay an "
        "antidumping cash deposit (7.61% for Teh Fong Min, 6.19% all others), not shown.",
        "whatItMeans": "Taiwanese pigment dispersions, paints and inks pay 10% of value in total: $50,000 of aluminum paste pigment (3212.90, 3.1%) pays "
        "$5,000.",
    },
    "ch-section-301": {
        "now": "12.5% total",
        "exemption": "Switzerland's rate is a floor: goods pay 12.5% in total in place of a lower base rate (U.S. note 52(k)). "
        + COMMON_EXEMPT
        + " The 2025 IEEPA reciprocal duty on Switzerland ended February 24, 2026.",
        "whatItMeans": "Swiss dyes and ceramic colors pay 12.5% of value: $100,000 of Swiss pigments pays $12,500.",
    },
    "br-section-301": {
        "measure": "Section 301 tariffs: Brazil action + 2026 action",
        "now": "+37.5%",
        "exemption": "The 25% Brazil duty (9903.05.01) and the 12.5% 2026 duty (9903.05.27) stack. Titanium dioxide pigments (3206.11, 3206.19) and crude "
        "copper phthalocyanine (3204.17.20) are exempt from both (U.S. notes 50(a)(ii) and 52(b)); the five pharmaceutical-use colorant subheadings are "
        "exempt from both when for pharmaceutical use (notes 50(a)(v) and 52(e)). The 2025 IEEPA duties on Brazil (10% plus 40% from August 6, 2025) "
        "ended February 24, 2026.",
        "whatItMeans": "Brazilian tanning agents, paints and dyes pay the base rate plus 37.5%: $50,000 of synthetic tanning agents (3202.10, 6.5%) pays "
        "$22,000.",
    },
    "ru-section-301": {
        "measure": "Column 2 rates, 35% rate (U.S. note 30), 2026 Section 301 and Section 232 aluminum (Russia)",
        "ch99Code": "9903.90.08 / 9903.05.66 / 9903.85.68",
        "before": "Column 2; 35% on 4 subheadings",
        "now": "Column 2 or 35%, +12.5%; +200% on 7 subheadings",
        "exemption": "Russia pays Column 2 rates (general note 3(b)); quebracho extract (3201.10), water-based acrylic paint (3209.10), rubber-based "
        "mastics (3214.90.10) and other inks (3215.90.50) pay 35% instead (U.S. note 30(b), 9903.90.08). The 12.5% 2026 Section 301 duty (9903.05.66) is "
        "added except on the note 52(b) subheadings. The 200% Section 232 aluminum duty (9903.85.68) covers 3208.10, 3208.20, 3208.90, 3209.10, 3209.90, "
        "3213.90 and 3214.10, and applies to those goods from any country when their primary aluminum was smelted or cast in Russia (U.S. note 19(m)). "
        "The U.S. imported no Chapter 32 goods from Russia in 2025.",
        "whatItMeans": "Russian paint is effectively priced out: water-based acrylic paint (3209.10) would pay 35% + 12.5% + 200% = 247.5% of value.",
        "extraSources": ["procl-10522"],
    },
    "other-section-301": {
        "exemption": "Each listed economy pays +10% or +12.5% on top of the base rate (U.S. note 52), e.g. +12.5% for Israel, Peru, Vietnam, Thailand, "
        "Türkiye and Australia, +10% for Malaysia and Indonesia. "
        + COMMON_EXEMPT
        + " An FTA claim (Israel, Peru, Australia …) removes the base rate but not the Section 301 duty (note 52(a)). The 2025 IEEPA duties ended February "
        "24, 2026.",
        "whatItMeans": "Israeli printing ink (1.8%) pays 14.3%; Peruvian cochineal-based colorants (3203.00.10, Free) pay 12.5%; Vietnamese artists' colors "
        "pay 15.9% (3213.90) or 19% (sets).",
    },
}

# ---------------------------------------------------------------------------------------------- change log
CHANGE_DETAILS = {
    "base-rates": {
        "title": "No Chapter 32 base-rate changes",
        "sourceIds": ["hts-before", "hts-now", "hts-now-cr", "hts-chapter-99", "hts-ch32"],
        "detail": "All 168 Chapter 32 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic "
        "Edition; no line was added, removed or renumbered. The temporary duty suspensions for specific dyes, pigments and paints in Chapter 99 "
        "subchapter II (9902.xx) expired on December 31, 2020 and have not been renewed.",
    },
    "section-301-nicaragua-scheduled-2027-01-01": {
        "title": "Section 301 tariff on Nicaragua phases in from 2027",
        "detail": "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 "
        "(9903.89.01, U.S. note 29), with no Chapter 32 exemption. The rate is 0% in 2026.",
    },
    "section-338-canada-2026-08-22": {
        "title": "50% Section 338 duty on Canadian paints, mastics and printing inks",
        "detail": "Proclamation 11048 (signed July 20, 2026, in response to Canada's surtax on U.S. motor vehicles) imposed 50% on a list of Canadian "
        "products (U.S. note 51(b)(3), 9903.03.14) that includes other solvent-based paints and varnishes (3208.90.00), other mastics and surfacing "
        "preparations (3214.90.50) and colored printing inks (3215.19.90). The duty applies even to USMCA-qualifying goods, on top of the 10% Section 301 "
        "duty for non-USMCA goods. Proclamation 11056 moved the start from August 19 to August 22, 2026.",
        "countries": "Canada",
    },
    "section-301-2026-60-economies-2026-07-24": {
        "title": "2026 Section 301 tariffs on 60 economies take effect",
        "detail": "+10% or +12.5% on goods of 60 economies (9903.05.20–9903.05.84), or a 10% / 12.5% floor for the EU, Japan, Korea, Switzerland and "
        "Taiwan. 165 of the 168 Chapter 32 lines are covered; titanium dioxide pigments (3206.11, 3206.19) and crude copper phthalocyanine (3204.17.20) "
        "are on the note 52(b) exemption list, and five colorant subheadings are exempt for pharmaceutical use (note 52(e)). USMCA goods of Canada and "
        "Mexico are exempt.",
        "now": "+10% to +12.5%",
    },
    "section-301-brazil-2026-07-22": {
        "title": "Brazil Section 301 tariff takes effect",
        "detail": "+25% on goods of Brazil (9903.05.01) on 165 of the 168 Chapter 32 lines; the same three subheadings as in note 52(b) are exempt (U.S. "
        "note 50(a)(ii)). From July 24 the 12.5% 2026 duty is added, for +37.5% in total.",
    },
    "section-232-aluminum-russia-2025-08-18": {
        "title": "Paints, varnishes and mastics added to the Section 232 aluminum derivative list",
        "detail": "Commerce added 3208.10, 3208.20, 3208.90, 3209.10, 3209.90, 3213.90 and 3214.10 to the aluminum derivative list (U.S. note 19(k)). From "
        "August 18, 2025 these goods paid the 50% aluminum duty on the value of their aluminum content (9903.85.08), and Russian goods 200% "
        "(9903.85.68). The all-country duty ended April 6, 2026; the Russian 200% remains.",
        "now": "+50% on aluminum content (ended); Russia +200%",
        "countries": "All; Russia",
        "sourceIds": ["fr-2025-15819", "procl-10947", "procl-10522", "hts-chapter-99"],
    },
}

CHANGES_EXTRA = [
    {
        "id": "cn-301-continued",
        "type": "reference",
        "date": "2026-10-07",
        "dateLabel": "Published",
        "title": "China Section 301 duties continue during the four-year review",
        "detail": "USTR received requests to continue the 2018 China actions, so they did not terminate on their July 6 and August 23, 2026 anniversaries "
        "and remain in effect pending the statutory review. The 25% List 3 duty on Chinese dyes, pigments, paints and inks continues.",
        "before": None,
        "now": None,
        "countries": "China",
        "sourceIds": ["fr-2026-20510"],
    },
    {
        "id": "cvp23-revoked",
        "type": "reference",
        "date": "2026-08-07",
        "dateLabel": "Published",
        "title": "Carbazole violet pigment 23 orders revoked",
        "detail": "No U.S. producer took part in the fourth five-year reviews, so Commerce revoked the 2004 antidumping orders on carbazole violet pigment "
        "23 (3204.17.90.40) from China and India and the countervailing duty order on India, effective for entries from June 15, 2026. The ITC "
        "terminated its reviews on August 14, 2026.",
        "before": "AD (China, India) and CVD (India)",
        "now": "No order",
        "countries": "China, India",
        "sourceIds": ["fr-2026-16143", "fr-2026-16146", "fr-2026-16581"],
    },
    {
        "id": "s122-end",
        "type": "reference",
        "date": "2026-07-23",
        "dateLabel": "Expired",
        "title": "Section 122 surcharge expired",
        "detail": "The 150-day 10% surcharge on goods of all countries (9903.03.01) expired at the close of July 23, 2026, the day before the 2026 Section "
        "301 tariffs began.",
        "before": "+10%",
        "now": "None",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-chapter-99"],
    },
    {
        "id": "soba-tw-prelim",
        "type": "reference",
        "date": "2026-07-14",
        "dateLabel": "Published",
        "title": "Optical brighteners from Taiwan: 1.96% preliminary margin",
        "detail": "In the 2024–2025 administrative review, Commerce preliminarily found a 1.96% dumping margin for Teh Fong Min. The 7.61% cash deposit "
        "stays in force until the final results.",
        "before": None,
        "now": None,
        "countries": "Taiwan",
        "sourceIds": ["fr-2026-14140"],
    },
    {
        "id": "usmca-review",
        "type": "reference",
        "date": "2026-07-01",
        "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of "
        "the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None,
        "now": None,
        "countries": "Canada, Mexico",
        "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "soba-tw-final",
        "type": "reference",
        "date": "2026-05-06",
        "dateLabel": "Published",
        "title": "Optical brighteners from Taiwan: 7.61% cash deposit",
        "detail": "Final results of the 2023–2024 administrative review of the antidumping order on stilbenic optical brighteners from Taiwan: 7.61% for "
        "Teh Fong Min, collected as a cash deposit on later entries; 6.19% for all other exporters.",
        "before": None,
        "now": "7.61% (Teh Fong Min)",
        "countries": "Taiwan",
        "sourceIds": ["fr-2026-08957"],
    },
    {
        "id": "s232-derivatives-end",
        "type": "extraDuty",
        "date": "2026-04-06",
        "dateLabel": "Effective",
        "title": "Section 232 aluminum duty on paints and mastics ends",
        "detail": "Proclamation 11021 replaced the aluminum derivative headings (9903.85.01–9903.85.15 terminated) with a new metals list (U.S. note 16, "
        "9903.82.xx) that includes no Chapter 32 line. Paints, varnishes, artists' colors and mastics no longer pay a Section 232 duty, except the 200% on "
        "Russian aluminum (9903.85.68).",
        "before": "+50% on aluminum content",
        "now": "None (Russia +200%)",
        "countries": "All",
        "sourceIds": ["procl-11021", "hts-chapter-99"],
    },
    {
        "id": "s122-start",
        "type": "reference",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Six Chapter 32 subheadings were on its product "
        "exemption list (9903.03.03): 3203.00.80, 3204.13.80, 3204.17.20, 3204.18.00, 3206.11.00 and 3206.19.00. USMCA goods of Canada and Mexico were "
        "exempt (9903.03.07, 9903.03.08).",
        "before": None,
        "now": "+10% (most lines)",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-chapter-99"],
    },
    {
        "id": "ieepa-end",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive "
        "Order 14389 ended the Canada, Mexico, China, Brazil, India and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 "
        "a.m. ET on February 24.",
        "before": "Varied by country",
        "now": "None",
        "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-25-end",
        "type": "extraDuty",
        "date": "2026-02-07",
        "dateLabel": "Effective",
        "title": "India's extra 25% IEEPA duty removed",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) from February 7, 2026. India's 25% reciprocal "
        "rate ended with the other IEEPA duties on February 24.",
        "before": "+50% (25% + 25%)",
        "now": "+25% (ended Feb 24)",
        "countries": "India",
        "sourceIds": ["eo-14384"],
    },
    {
        "id": "cn-fentanyl-10",
        "type": "extraDuty",
        "date": "2025-11-10",
        "dateLabel": "Effective",
        "title": "China IEEPA duty cut to 10%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%, on top of the 10% reciprocal duty and the 25% "
        "List 3 duty. Ended February 24, 2026.",
        "before": "+20%",
        "now": "+10% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14357"],
    },
    {
        "id": "in-25",
        "type": "extraDuty",
        "date": "2025-08-27",
        "dateLabel": "Effective",
        "title": "Extra 25% duty on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84) over India's purchases of Russian oil, on top of the 25% reciprocal rate: "
        "Indian dyes at a 6.5% base rate paid 56.5%. Removed February 7, 2026.",
        "before": "+25%",
        "now": "+50% (ended)",
        "countries": "India",
        "sourceIds": ["eo-14329", "eo-14326"],
    },
    {
        "id": "reciprocal-country",
        "type": "extraDuty",
        "date": "2025-08-07",
        "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates replace the 10% baseline",
        "detail": "Executive Order 14326 set each country's reciprocal rate (9903.02.xx), for example 25% for India and 15% for the EU including the base "
        "rate. Six Chapter 32 subheadings are on the reciprocal-tariff exemption list (U.S. note 2(v)(iii)(a), 9903.01.32): 3203.00.80, 3204.13.80, 3204.17.20, 3204.18.00, "
        "3206.11.00 and 3206.19.00. Ended February 24, 2026.",
        "before": "+10%",
        "now": "Country rates (ended)",
        "countries": "All except Canada, Mexico, China",
        "sourceIds": ["eo-14326", "hts-chapter-99"],
    },
    {
        "id": "br-40",
        "type": "extraDuty",
        "date": "2025-08-06",
        "dateLabel": "Effective",
        "title": "40% IEEPA duty on products of Brazil",
        "detail": "Executive Order 14323 (signed July 30, 2025) added 40% on goods of Brazil on top of the 10% reciprocal duty. Ended February 24, 2026.",
        "before": "+10%",
        "now": "+50% (ended)",
        "countries": "Brazil",
        "sourceIds": ["eo-14323"],
    },
    {
        "id": "ca-35",
        "type": "extraDuty",
        "date": "2025-08-01",
        "dateLabel": "Effective",
        "title": "Canada IEEPA duty raised to 35%",
        "detail": "The IEEPA duty on non-USMCA Canadian goods (9903.01.10) rose from 25% to 35%. USMCA goods stayed exempt. Ended February 24, 2026.",
        "before": "+25%",
        "now": "+35% (ended)",
        "countries": "Canada",
        "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-10",
        "type": "extraDuty",
        "date": "2025-05-14",
        "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10%. Chinese pigments and paints then paid 10% + 20% (fentanyl) + 25% "
        "(List 3) on top of the base rate. Ended February 24, 2026.",
        "before": "+125%",
        "now": "+10% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14298"],
    },
    {
        "id": "cn-reciprocal-125",
        "type": "extraDuty",
        "date": "2025-04-10",
        "dateLabel": "Effective",
        "title": "China reciprocal duty raised to 125%",
        "detail": "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125%. With the 20% fentanyl duty and the 25% List 3 duty, most "
        "Chinese Chapter 32 goods paid 170% on top of the base rate until May 13, 2025.",
        "before": None,
        "now": "+125% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14266"],
    },
    {
        "id": "reciprocal",
        "type": "extraDuty",
        "date": "2025-04-05",
        "dateLabel": "Effective",
        "title": "10% reciprocal tariff on most Chapter 32 goods",
        "detail": "A 10% baseline duty (9903.01.25) on products of all countries except Canada and Mexico, signed April 2, 2025 (Executive Order 14257). "
        "Ended February 24, 2026.",
        "before": "None",
        "now": "+10% (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257"],
    },
    {
        "id": "soba-continued",
        "type": "reference",
        "date": "2025-03-07",
        "dateLabel": "Published",
        "title": "Optical brightener antidumping orders continued",
        "detail": "After the Court of International Trade set aside their 2022 revocation (orders reinstated June 2024) and the second five-year reviews, Commerce continued the 2012 antidumping orders on stilbenic optical brighteners from China and "
        "Taiwan (classified in 3204.20.80), effective February 27, 2025. The China-wide rate set in the 2012 order is 106.17%.",
        "before": None,
        "now": None,
        "countries": "China, Taiwan",
        "sourceIds": ["fr-2025-03715", "fr-2024-14029", "fr-2012-11219", "fr-2012-11223"],
    },
    {
        "id": "usmca-exempt",
        "type": "extraDuty",
        "date": "2025-03-07",
        "dateLabel": "Effective",
        "title": "USMCA goods exempted from the Canada and Mexico duties",
        "detail": "Goods entered under USMCA were exempted from the 25% IEEPA duties on Canada and Mexico. Ended February 24, 2026.",
        "before": "+25%",
        "now": "USMCA goods exempt",
        "countries": "Canada, Mexico",
        "sourceIds": ["eo-14231", "eo-14232"],
    },
    {
        "id": "cn-fentanyl-20",
        "type": "extraDuty",
        "date": "2025-03-04",
        "dateLabel": "Effective",
        "title": "China IEEPA duty raised to 20%",
        "detail": "The IEEPA duty on products of China and Hong Kong went from +10% (from February 4, 2025) to +20%, on top of the Section 301 lists.",
        "before": "+10%",
        "now": "+20% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14195", "eo-14228"],
    },
    {
        "id": "ca-mx-imposed",
        "type": "extraDuty",
        "date": "2025-02-01",
        "dateLabel": "Signed",
        "title": "Additional duties on products of Canada and Mexico",
        "detail": "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025, including paints, pigments and inks. Ended "
        "February 24, 2026.",
        "before": "None",
        "now": "+25% (ended)",
        "countries": "Canada, Mexico",
        "sourceIds": ["eo-14193", "eo-14194"],
    },
    {
        "id": "list4a",
        "type": "extraDuty",
        "date": "2020-02-14",
        "dateLabel": "Effective",
        "title": "List 4A duty on Chinese vat dyes cut to 7.5%",
        "detail": "The List 4A duty (9903.88.15) on synthetic indigo (3204.15.10) and other vat dyes (3204.15.80) from China fell from 15% to 7.5%.",
        "before": "+15%",
        "now": "+7.5%",
        "countries": "China",
        "sourceIds": ["fr-2019-17865", "fr-2020-00904"],
    },
    {
        "id": "list3",
        "type": "extraDuty",
        "date": "2019-05-10",
        "dateLabel": "Effective",
        "title": "List 3 duty on Chinese Chapter 32 goods raised to 25%",
        "detail": "The List 3 duty (9903.88.03), in force at 10% since September 24, 2018, rose to 25%. It covers 163 of the 168 Chapter 32 lines.",
        "before": "+10%",
        "now": "+25%",
        "countries": "China",
        "sourceIds": ["fr-2018-20610", "fr-2019-09681"],
    },
]

# ---------------------------------------------------------------------------------------------- matrix
S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]
END = "eo-14389"
MATRIX_RULES = {
    "Canada": {
        "label": "USMCA-qualifying: Free, except 50% Section 338 duty on 3208.90, 3214.90.50 and 3215.19.90 (9903.03.14), which applies with or without "
        "USMCA. Otherwise base rate +10% Section 301 (9903.05.29), and +60% on those three subheadings. TiO2 pigments and crude copper phthalocyanine "
        "are exempt from the 10% (note 52(b)). The 2025 IEEPA duty (35%) ended February 24, 2026.",
        "sourceIds": S301 + ["procl-11048", "procl-11056", END, "hts-now"],
    },
    "Germany": {
        "label": "EU: 10% in total in place of the lower base rate (9903.05.39). TiO2 pigments (6%) and crude copper phthalocyanine (6.5%) pay only the "
        "base rate (note 52(b)). The 15% IEEPA reciprocal rate ended February 24, 2026.",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "India": {
        "label": "Base rate +10% Section 301 (9903.05.44); TiO2 pigments and crude copper phthalocyanine exempt (note 52(b)). The 2025 IEEPA duties "
        "(25% + 25%) ended February 2026.",
        "sourceIds": S301 + ["eo-14384", END, "hts-now"],
    },
    "Japan": {
        "label": "12.5% in total in place of the lower base rate (9903.05.49); TiO2 pigments and crude copper phthalocyanine pay only the base rate (note "
        "52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "Mexico": {
        "label": "USMCA-qualifying: Free (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55); TiO2 pigments and crude copper phthalocyanine "
        "exempt (note 52(b)). No Section 338 duty applies to Mexico. The 2025 IEEPA duty (25%) ended February 24, 2026.",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "China": {
        "label": "Base rate +25% List 3 (9903.88.03) +12.5% 2026 Section 301 (9903.05.31): +37.5% on most lines. Vat dyes 3204.15.10/.80: +7.5% List 4A "
        "+12.5%. TiO2 pigments and crude copper phthalocyanine: +25% only (note 52(b)). 3204.11.15, 3204.19.40, 3204.20.40: +12.5% only. Optical "
        "brighteners also pay antidumping duty, not shown.",
        "sourceIds": S301 + ["fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "hts-now"],
    },
    "United Kingdom": {
        "label": "Base rate +10% Section 301 (9903.05.81); TiO2 pigments and crude copper phthalocyanine exempt (note 52(b)). The 10% IEEPA reciprocal "
        "duty ended February 24, 2026.",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "South Korea": {
        "label": "12.5% in total in place of the lower rate (9903.05.71), even with a KORUS claim; TiO2 pigments and crude copper phthalocyanine are "
        "exempt (note 52(b)) and enter Free under KORUS (KR).",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "Italy": {
        "label": "EU: 10% in total in place of the lower base rate (9903.05.39). TiO2 pigments and crude copper phthalocyanine pay only the base rate "
        "(note 52(b)).",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "Spain": {
        "label": "EU: 10% in total in place of the lower base rate (9903.05.39). TiO2 pigments and crude copper phthalocyanine pay only the base rate "
        "(note 52(b)).",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "Taiwan": {
        "label": "10% in total in place of the lower base rate (9903.05.76); TiO2 pigments and crude copper phthalocyanine pay only the base rate (note "
        "52(b)). Optical brighteners (3204.20.80) also pay an antidumping deposit (Teh Fong Min 7.61%), not shown.",
        "sourceIds": S301 + ["fr-2026-08957", "hts-now"],
    },
    "Switzerland": {
        "label": "12.5% in total in place of the lower base rate (9903.05.74); TiO2 pigments and crude copper phthalocyanine pay only the base rate (note "
        "52(b)). The IEEPA reciprocal duty ended February 24, 2026.",
        "sourceIds": S301 + [END, "hts-now"],
    },
    "Brazil": {
        "label": "Base rate +25% Brazil Section 301 (9903.05.01) +12.5% (9903.05.27) = +37.5%; TiO2 pigments and crude copper phthalocyanine exempt from "
        "both (notes 50(a)(ii), 52(b)). The 2025 IEEPA duties ended February 24, 2026.",
        "sourceIds": S301 + ["fr-2026-14542", END, "hts-now"],
    },
    "Any other country": {
        "label": "Base rate plus 0% to +12.5% depending on the country: the other 2026 Section 301 economies (e.g. Israel, Peru, Vietnam +12.5%; "
        "Malaysia, Indonesia +10%) pay extra, all others only the base rate. Nicaragua's Section 301 duty starts January 1, 2027.",
        "sourceIds": S301 + ["fr-2025-23892", "hts-now"],
    },
}

# ---------------------------------------------------------------------------------------------- engineering
RULES = [
    {
        "id": "tsca",
        "agency": "EPA / CBP",
        "title": "TSCA import certification (positive or negative) for every chemical substance or mixture: dyes, pigments, paints, inks and mastics",
        "citations": [
            {"label": "19 CFR 12.121", "url": ecfr(19, "12.121")},
            {"label": "19 CFR 12.118", "url": ecfr(19, "12.118")},
        ],
    },
    {
        "id": "fda-color",
        "agency": "FDA",
        "title": "Color additives for food, drugs, cosmetics or medical devices must be FDA-listed (e.g. FD&C Red No. 40, titanium dioxide, annatto, "
        "carmine), and FD&C colors need FDA batch certification",
        "citations": [
            {"label": "21 CFR part 80 (certification)", "url": ecfr_part(21, 80)},
            {"label": "21 CFR 74.340 (FD&C Red No. 40)", "url": ecfr(21, "74.340")},
            {"label": "21 CFR 74.705 (FD&C Yellow No. 5)", "url": ecfr(21, "74.705")},
            {"label": "21 CFR 73.575 (titanium dioxide)", "url": ecfr(21, "73.575")},
            {"label": "21 CFR 73.100 (cochineal extract; carmine)", "url": ecfr(21, "73.100")},
        ],
    },
    {
        "id": "cpsc-lead",
        "agency": "CPSC",
        "title": "Paint and similar surface coatings for consumer use may not contain more than 0.009% lead (90 ppm); artists' paints are exempt",
        "citations": [
            {"label": "16 CFR 1303.1", "url": ecfr(16, "1303.1")},
            {"label": "16 CFR 1303.3 (exemptions)", "url": ecfr(16, "1303.3")},
        ],
    },
    {
        "id": "epa-voc-arch",
        "agency": "EPA",
        "title": "Architectural coatings: importers must meet the national VOC content limits and label each container with the manufacture date and the other required information",
        "citations": [
            {"label": "40 CFR 59.402 (VOC limits)", "url": ecfr(40, "59.402")},
            {"label": "40 CFR 59.405 (labeling)", "url": ecfr(40, "59.405")},
        ],
    },
    {
        "id": "epa-voc-aerosol",
        "agency": "EPA",
        "title": "Aerosol coatings (spray paint): reactivity-based VOC limits for regulated entities, including importers",
        "citations": [{"label": "40 CFR 59.504", "url": ecfr(40, "59.504")}],
    },
    {
        "id": "cpsc-art",
        "agency": "CPSC",
        "title": "Art materials (artists' colors, drawing inks): chronic-hazard review and labeling under ASTM D-4236",
        "citations": [{"label": "16 CFR 1500.14(b)(8)", "url": ecfr(16, "1500.14")}],
    },
    {
        "id": "dot-hazmat",
        "agency": "U.S. DOT (PHMSA)",
        "title": "Flammable paints, printing inks, driers and pigment dispersions in solvent are hazardous materials for shipping papers, marking and "
        "packaging",
        "citations": [{"label": "49 CFR 172.101 (Hazardous Materials Table)", "url": ecfr(49, "172.101")}],
    },
    {
        "id": "adcvd-soba",
        "agency": "Commerce (ITA) / CBP",
        "title": "Stilbenic optical brighteners from China (China-wide 106.17%) and Taiwan (Teh Fong Min 7.61%, others 6.19%): antidumping cash deposit "
        "(not in the tariff calculator)",
        "citations": [
            {"label": "90 FR 11511 (orders continued, 2025)", "url": FR + "2025/03/07/2025-03715/stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-and-taiwan-continuation-of"},
            {"label": "77 FR 27423 (China order)", "url": FR + "2012/05/10/2012-11219/certain-stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-amended-final"},
            {"label": "91 FR 24511 (Taiwan, 7.61%)", "url": FR + "2026/05/06/2026-08957/certain-stilbenic-optical-brightening-agents-from-taiwan-final-results-of-antidumping-duty"},
        ],
    },
    {
        "id": "ru-aluminum",
        "agency": "Commerce / CBP",
        "title": "200% Section 232 duty when the product is Russian or its primary aluminum was smelted or cast in Russia (paints, varnishes, artists' colors "
        "and mastics on the aluminum derivative list)",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 19(m), heading 9903.85.68", "url": CH99},
            {"label": "Proclamation 10522 (88 FR 13267)", "url": FR + "2023/03/02/2023-04470/adjusting-imports-of-aluminum-into-the-united-states"},
        ],
    },
]

LEVERS = [
    {
        "id": "usmca",
        "title": "Claim USMCA for Canadian and Mexican goods",
        "saves": "The base rate (up to 6.5%) and the 10% Section 301 duty on goods of Canada (9903.05.29) or Mexico (9903.05.55)",
        "appliesTo": "All 168 lines, for USMCA-originating goods",
        "document": "A USMCA certification of origin from the importer, exporter or producer; it need not follow a prescribed format and CBP can ask for "
        "it.",
        "caveat": "The 50% Section 338 duty on Canadian 3208.90, 3214.90.50 and 3215.19.90 applies even with a USMCA claim. The USMCA was not renewed at "
        "the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS Ch. 99, U.S. notes 51 and 52(g)–(h)", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
        ],
    },
    {
        "id": "fta",
        "title": "Claim the FTA rate for other partner countries",
        "saves": "The base rate (1.5%–6.5%) for goods of Israel, Peru, Chile, Colombia, Australia, Singapore and the other FTA partners listed in the "
        "Special column",
        "appliesTo": "Lines with a base-rate duty",
        "document": "Proof of origin under the agreement (certificate or importer's knowledge, as the agreement requires), claimed with its SPI code.",
        "caveat": "An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)); for Korea, the 12.5% floor applies whatever the KORUS rate. "
        "GSP (A, A+) has been expired since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Notes (FTA programs)", "url": GN},
            {"label": "HTSUS Ch. 99, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "pharma-use",
        "title": "Declare pharmaceutical use for qualifying colorants",
        "saves": "The 10%–12.5% 2026 Section 301 duty (and Brazil's 25%) on colorants used in pharmaceutical applications",
        "appliesTo": "3203.00.80, 3204.13.60, 3204.13.80, 3204.18 (carotenoids) and 3204.90",
        "document": "Entry under heading 9903.05.89 (Brazil: 9903.05.06), with records showing the goods are for use in pharmaceutical applications.",
        "caveat": "Only for the pharmaceutical end use; the same colorants for food or industrial use pay the duty. China's 25% List 3 duty still applies.",
        "citations": [
            {"label": "HTSUS Ch. 99, U.S. notes 52(e) and 50(a)(v)", "url": CH99},
            {"label": "91 FR 47318 (USTR notice)", "url": FR + "2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"},
        ],
    },
    {
        "id": "origin",
        "title": "Know the country of origin — China pays 37.5% extra",
        "saves": "Up to 27.5 points: most Chinese Chapter 32 goods pay +37.5%, the same goods from India or the UK +10%, from the EU 10% in total",
        "appliesTo": "All 168 lines",
        "document": "Production records showing where the dye, pigment or paint was made. Mere dilution or simple repacking abroad does not change origin "
        "under the 19 CFR part 102 rules (19 CFR 102.17); for other cases ask CBP for a binding ruling.",
        "caveat": "Antidumping orders follow their own scope and country rules. Goods made with Russian-smelted aluminum pay 200% on 7 subheadings whatever "
        "the origin.",
        "citations": [
            {"label": "19 CFR 102.17", "url": ecfr(19, "102.17")},
            {"label": "19 CFR part 177 (rulings)", "url": ecfr_part(19, 177)},
            {"label": "HTSUS Ch. 99, U.S. note 20", "url": CH99},
        ],
    },
    {
        "id": "adcvd-scope",
        "title": "Check the optical-brightener antidumping scope before you buy",
        "saves": "The whole antidumping deposit (China-wide 106.17%), when the product is outside the order",
        "appliesTo": "3204.20.80 (fluorescent brightening agents), from China and Taiwan",
        "document": "The order's written scope covers triazinylaminostilbenes; it, not the HTS number, decides. When unsure, request a scope ruling from "
        "Commerce.",
        "caveat": "Covered goods pay the deposit even when entered under another HTS number (the orders also list 2933.69, 2921.59).",
        "citations": [
            {"label": "90 FR 11511 (scope)", "url": FR + "2025/03/07/2025-03715/stilbenic-optical-brightening-agents-from-the-peoples-republic-of-china-and-taiwan-continuation-of"},
            {"label": "19 CFR 351.225 (scope rulings)", "url": ecfr(19, "351.225")},
        ],
    },
    {
        "id": "first-sale",
        "title": "Declare the right transaction value",
        "saves": "Duty on the part of the price that is not dutiable value, for every ad valorem duty on the entry",
        "appliesTo": "All dutiable lines and every country with a Section 301 or 338 duty",
        "document": "Invoices and contracts showing the sale for exportation to the United States; in a multi-tier chain, an earlier sale can be the basis "
        "when it was a bona fide sale for export to the U.S.",
        "caveat": "CBP can reject a value that is not supported by the sale documents.",
        "citations": [{"label": "19 CFR 152.103", "url": ecfr(19, "152.103")}],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on exported goods",
        "saves": "Up to 99% of the duties paid on imported dyes, pigments or paints that are re-exported or used to make exported products",
        "appliesTo": "All 168 lines",
        "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
        "caveat": "Antidumping and countervailing duties cannot be refunded as drawback (19 CFR 191.3).",
        "citations": [
            {"label": "19 CFR part 191", "url": ecfr_part(19, 191)},
            {"label": "19 CFR 191.3", "url": ecfr(19, "191.3")},
        ],
    },
    {
        "id": "ftz",
        "title": "Use a foreign-trade zone to defer or avoid duty on re-exports",
        "saves": "Duty is paid only when goods leave the zone for U.S. consumption; none on goods exported from the zone",
        "appliesTo": "All 168 lines",
        "document": "Admission to an FTZ (CBP Form 214).",
        "caveat": "Goods subject to the 2026 Section 301 duties must be admitted in privileged foreign status, so making paint in a zone does not avoid the "
        "Section 301 duty on its foreign inputs.",
        "citations": [
            {"label": "19 CFR 146.41", "url": ecfr(19, "146.41")},
            {"label": "91 FR 47318 (USTR notice)", "url": FR + "2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies"},
        ],
    },
    {
        "id": "goods-returned",
        "title": "Enter returned U.S. goods under Chapter 98",
        "saves": "The full duty, including the 2026 Section 301 duty, on U.S.-made pigments, paints or inks returned without being advanced in value",
        "appliesTo": "All 168 lines, for products of the United States",
        "document": "Declaration and export records required for American goods returned (19 CFR 10.1).",
        "caveat": "Goods processed abroad do not qualify under 9801.00.10; 9802 provisions pay duty on the foreign processing value.",
        "provisions": [
            {"code": "9801.00.10", "rate": "Free", "text": "Products of the United States returned without having been advanced in value or improved in condition abroad"}
        ],
        "citations": [
            {"label": "HTSUS Chapter 98", "url": CH98},
            {"label": "19 CFR 10.1", "url": ecfr(19, "10.1")},
        ],
    },
]

# ---------------------------------------------------------------------------------------------- text blocks
TEXT = {}
TEXT["overview_seo"] = {
    "title": "HTS Chapter 32 Tariffs: Paint, Pigment, Dye, Titanium Dioxide & Ink Import Duties | KoalaGains",
    "shortDescription": "Searchable duty table for all 168 HTS Chapter 32 lines — dyes, pigments, titanium dioxide, paints, varnishes, caulk, artists' "
    "colors and printing ink. Base rates Free to 6.5%, plus the 2026 Section 301 tariffs (China +37.5%), Canada's 50% Section 338 duty and USMCA.",
    "keywords": [
        "HTS Chapter 32",
        "paint tariffs",
        "tariff on paint",
        "titanium dioxide tariff code",
        "pigment tariff code",
        "dye tariff code",
        "hs code for paint",
        "printing ink tariff code",
        "chemical import tariffs",
        "Section 301 tariffs",
        "USMCA",
    ],
}
TEXT["overview_intro"] = (
    "Chapter 32 covers coloring products and coatings: tanning extracts (3201–3202), natural and synthetic dyes and pigments (3203–3206), ceramic glazes "
    "and glass frit (3207), paints and varnishes (3208–3210), driers, pigment dispersions and stamping foils (3211–3212), artists' colors (3213), "
    "caulk, putty and mastics (3214) and inks (3215). Its **168 tariff lines** carry base rates from **Free to 6.5%**, and the U.S. imported **$5.01B** "
    "of them in 2025 — most from Canada, Germany, India, Japan and Mexico.\n\n"
    "Since **July 24, 2026** the 2026 Section 301 tariffs add 10% or 12.5% for 60 economies, or set a 10% / 12.5% floor for the EU, Japan, Korea, "
    "Switzerland and Taiwan; **titanium dioxide pigments** and crude copper phthalocyanine are exempt. Chinese goods also pay the 2018–2019 List 3 "
    "duty, **+37.5% in all on most lines**. USMCA-qualifying goods from Canada and Mexico are Free, except that three Canadian subheadings — other "
    "solvent-based paints (3208.90), mastics (3214.90.50) and colored printing ink (3215.19.90) — pay a **50% Section 338 duty** from August 22, 2026, "
    "USMCA or not. An antidumping order on optical brighteners from China and Taiwan (3204.20.80) is not included in the rates shown."
)
TEXT["overview_extra_note"] = (
    "2026 Section 301: 165 (TiO2 pigments and crude copper phthalocyanine exempt); China lists: 165; Brazil: 165; Canada Section 338: 8; "
    "Russia-only measures: 12"
)
TEXT["worked_examples"] = [
    {
        "title": "$200,000 of titanium dioxide pigment",
        "line": "3206.11.00.00",
        "body": "TiO2 pigment pays a **6%** base rate and is on the 2026 Section 301 exemption list (U.S. note 52(b)), so German, Japanese or Indian "
        "pigment pays **$12,000**. USMCA-qualifying Canadian pigment is **Free**. Chinese pigment still pays the 25% List 3 duty: 31% in all, "
        "**$62,000**.",
    },
    {
        "title": "$100,000 of solvent-based industrial paint from Canada",
        "line": "3208.90.00.00",
        "body": "3208.90.00 is on the Section 338 list for Canada (9903.03.14), so even a USMCA-qualifying shipment pays **50% — $50,000**. Without a "
        "USMCA claim it pays 3.2% + 10% Section 301 + 50% = **63.2%, $63,200**. The same paint from Mexico under USMCA is Free, and acrylic or "
        "polyester solvent paints from Canada (3208.10, 3208.20) are Free under USMCA.",
    },
    {
        "title": "$50,000 of pigment blue 15:3",
        "line": "3204.17.90.02",
        "body": "The base rate is **6.5%**. From India or the UK it pays 6.5% + 10% = **$8,250**; from Germany the EU's 10% total applies, **$5,000**; "
        "from Japan 12.5%, **$6,250**; from China 6.5% + 25% (List 3) + 12.5% = 44%, **$22,000**.",
    },
]
TEXT["chapter_notes"] = (
    "**Note 1.** This chapter does not cover: (a) separate chemically defined elements or compounds (except those of heading 3203 or 3204, inorganic "
    "products of a kind used as luminophores (heading 3206), glass obtained from fused quartz or other fused silica in the forms provided for in heading "
    "3207, and also dyes and other coloring matter put up in forms or packings for retail sale, of heading 3212); (b) tannates or other tannin "
    "derivatives of products of headings 2936 to 2939, 2941 or 3501 to 3504; or (c) mastics of asphalt or other bituminous mastics (heading 2715).\n\n"
    "**Note 2.** Heading 3204 includes mixtures of stabilized diazonium salts and couplers for the production of azo dyes.\n\n"
    "**Note 3.** Headings 3203, 3204, 3205 and 3206 apply also to preparations based on coloring matter (including, in the case of heading 3206, coloring "
    "pigments of heading 2530 or chapter 28, metal flakes and metal powders), of a kind used for coloring any material or used as ingredients in the "
    "manufacture of coloring preparations. The headings do not apply, however, to pigments dispersed in nonaqueous media, in liquid or paste form, of a "
    "kind used in the manufacture of paints, including enamels (heading 3212), or to other preparations of heading 3207, 3208, 3209, 3210, 3212, 3213 or "
    "3215.\n\n"
    "**Note 4.** Heading 3208 includes solutions (other than collodions) consisting of any of the products specified in headings 3901 to 3913 in volatile "
    "organic solvents when the weight of the solvent exceeds 50 percent of the weight of the solution.\n\n"
    "**Note 5.** The expression \"coloring matter\" in this chapter does not include products of a kind used as extenders in oil paints, whether or not "
    "they are also suitable for coloring distempers.\n\n"
    "**Note 6.** The expression \"stamping foils\" in heading 3212 applies only to thin sheets of a kind used for printing, for example, book covers or hat "
    "bands, and consisting of — (a) metallic powder (including powder of precious metal) or pigment, agglomerated with glue, gelatin or other binder; or "
    "(b) metal (including precious metal) or pigment, deposited on a supporting sheet of any material."
)
TEXT["additional_us_notes"] = (
    "**Additional U.S. note 1.** For the purposes of subheadings 3204.11.10, 3204.12.20 and 3204.16.20, the term \"dyes containing, by weight\" means "
    "those products which contain as the only dye components, the specified components listed therewith, each of which must be present in the product. "
    "A tolerance of plus or minus two percentage points from the named percentages is allowable.\n\n"
    "Many dye and pigment lines are split into \"products described in additional U.S. note 3 to section VI\" — products not listed in the Chemical "
    "Appendix to the Tariff Schedule, for which the importer furnishes the CAS number and certifies it is not listed (or certifies it has none) — and "
    "\"other\"."
)

TEXT["tu_seo"] = {
    "title": "HTS Chapter 32 Tariff Updates 2025–2026: Paint, Pigment, Dye & Ink Duties | KoalaGains",
    "shortDescription": "What changed for dye, pigment, paint and ink imports since January 2025: the IEEPA duties and their end, the 2026 Section 301 "
    "tariffs and TiO2 exemption, Canada's 50% Section 338 duty, the aluminum duty on paints, and the AD orders on optical brighteners and CVP-23.",
    "keywords": [
        "paint tariffs 2026",
        "chemical import tariffs",
        "Section 301 tariffs",
        "titanium dioxide tariffs",
        "trump tariffs on chemicals",
        "Canada paint tariff",
        "USMCA tariffs",
        "optical brightener antidumping",
    ],
}
TEXT["tu_intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision "
    "21** (in force October 9, 2026). All 168 Chapter 32 lines have the same base rates in both — Free to 6.5%.\n\n"
    "What changed were the extra duties. In 2025 the IEEPA duties hit almost every supplier — up to 170% on top of the base rate for Chinese goods in "
    "April–May 2025 — and from August 18, 2025 paints, varnishes, artists' colors and mastics also paid the Section 232 aluminum duty on their aluminum "
    "content. The IEEPA duties **ended on February 24, 2026**, the Section 232 duty on these goods on **April 6, 2026**, and the Section 122 surcharge "
    "that followed expired on **July 23, 2026**. Since **July 24, 2026** the **2026 Section 301 tariffs** apply to 60 economies (titanium dioxide "
    "pigments exempt), China still pays its 2018–2019 List 3 duty, and since **August 22, 2026** three Canadian subheadings pay a **50% Section 338 "
    "duty**.\n\n"
    "Separately, the **antidumping orders** on stilbenic optical brighteners from China and Taiwan remain in force, and the orders on carbazole violet "
    "pigment 23 were revoked from June 15, 2026. Antidumping duties are set company by company by the Commerce Department, are listed below for "
    "reference, and are **not included in the tariff calculator**."
)
TEXT["tu_scope"] = (
    "Chapter 99 measures that reach Chapter 32 from any country (the 2026 Section 301 action on 60 economies, China lists 3 and 4A, the Brazil action, "
    "the Canada Section 338 duty, the Russia measures, and the ended IEEPA, Section 122 and Section 232 aluminum duties), plus the antidumping and "
    "countervailing duty orders on Chapter 32 products, which the tariff calculator does not model. For the rate each supplier pays, see Rates by country."
)

TEXT["ui_seo"] = {
    "title": "U.S. Paint, Pigment, Dye & Ink Imports by Country — HTS Chapter 32 Statistics | KoalaGains",
    "shortDescription": "Where U.S. imports of dyes, pigments, titanium dioxide, paints, caulk and inks come from, 2020–2025: $5.01B in 2025, led by "
    "Canada, Germany, India, Japan and Mexico. By country, by product and over time, from UN Comtrade.",
    "keywords": [
        "paint imports by country",
        "titanium dioxide imports",
        "us pigment imports",
        "dye imports from india",
        "printing ink imports",
        "HTS Chapter 32 import statistics",
    ],
}
TEXT["ui_why"] = (
    "U.S. imports of Chapter 32 goods were **$5.01B in 2025**, down 6.1% from $5.33B in 2024 and below the 2022 peak of $5.91B. The largest products "
    "are titanium dioxide pigments ($510M, 3206.11, down 15.9%), caulking compounds, mastics and painters' fillings ($483M, 3214.10), colored printing "
    "inks ($448M, 3215.19), organic pigments ($418M, 3204.17) and other solvent-based paints ($384M, 3208.90).\n\n"
    "**Canada** ($977M, 19.5%) is the largest supplier: $363M of other coloring matter (heading 3206, which includes TiO2 pigments), $358M of paints "
    "and varnishes (3208–3209) and $119M of mastics. **Germany** ($644M) ships paints, dyes, pigments and mastics; **India** ($387M) is the main "
    "source of synthetic dyes ($254M of heading 3204) and natural colorants ($64M); **Japan** ($386M) led by printing ink ($173M); **Mexico** ($366M) "
    "paints, pigments, mastics and ceramic glazes. **China** ($293M) supplies pigments, dyes and artists' colors (largest supplier of heading 3213, $52M); its share fell from 9.5% in 2020 to 5.8% in 2025, a period in which Chinese goods paid the 25% List 3 duty.\n\n"
    "2025 is the latest full year of U.S. trade data, so the 2026 Section 301 and Section 338 duties are not yet reflected. Duty-collected figures "
    "aren't available from an official source yet."
)
TEXT["ui_sources"] = []

TEXT["ia_seo"] = {
    "title": "Paint, Pigment & Ink Tariff Rates by Country — Canada, Germany, India, China, Japan (HTS Ch. 32) | KoalaGains",
    "shortDescription": "The total U.S. tariff on dyes, pigments, paints, caulk and inks by country and product group: Free under USMCA (except 50% on "
    "three Canadian lines), 10% total for the EU, 12.5% for Japan and Korea, base +10% for India and the UK, base +37.5% for China.",
    "keywords": [
        "tariff on paint from canada",
        "paint tariffs china",
        "tariffs on chemicals from china",
        "tariff on chemicals from india",
        "us tariffs on specialty chemicals",
        "chemical tariffs by country",
    ],
}
TEXT["ia_intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff "
    "schedule. Three rules decide most of the table: the **2026 Section 301 tariffs** (+10% or +12.5%, or a 10% / 12.5% total for the EU, Japan, Korea, "
    "Switzerland and Taiwan), **USMCA** (Free for qualifying Canadian and Mexican goods) and **China's List 3** (+25% more). Titanium dioxide pigments "
    "and crude copper phthalocyanine are exempt from the 2026 duties for every country.\n\n"
    "Canada is the exception to USMCA: other solvent-based paints (3208.90), mastics (3214.90.50) and colored printing ink (3215.19.90) pay a **50% "
    "Section 338 duty** with or without a USMCA claim. The table does **not** include antidumping duties on optical brighteners from China and Taiwan "
    "(see Tariff updates and Import documents)."
)
TEXT["ia_assumptions"] = [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026; the Section 122 surcharge (9903.03.01) "
    "expired July 23, 2026; the Section 232 aluminum derivative duty on paints and mastics (9903.85.08) ended April 6, 2026. None is applied.",
    "Antidumping duties are not included: stilbenic optical brighteners (3204.20.80) from China (China-wide 106.17%) and Taiwan (Teh Fong Min 7.61%, "
    "others 6.19%). The orders on carbazole violet pigment 23 were revoked from June 15, 2026.",
    "Russia is not shown (no imports in 2025): it pays Column 2 rates or 35%, +12.5% Section 301 and +200% on 7 paint, artists'-color and mastic "
    "subheadings.",
    "Entry rules still apply: TSCA certification for all chemicals, FDA color-additive rules for food, drug and cosmetic colors, the CPSC lead-paint limit "
    "and EPA VOC limits for paints.",
]
TEXT["ia_exemption_check"] = (
    "Read U.S. notes 2, 19, 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Three Chapter 32 subheadings (3204.17.20, "
    "3206.11.00, 3206.19.00) are on the Section 301 general exemption list (note 52(b), 9903.05.86) and the Brazil list (note 50(a)(ii), 9903.05.03); "
    "five (3203.00.80, 3204.13.60, 3204.13.80, 3204.18.00, 3204.90.00) are exempt only for pharmaceutical use (notes 52(e), 50(a)(v)). No Chapter 32 "
    "line is on the descriptive or civil-aircraft lists (notes 52(c)–(d)) or a country list in note 52(j). Three subheadings (3208.90.00, 3214.90.50, "
    "3215.19.90) are on the Canada Section 338 list (note 51(b)(3)); none is on the Canadian import-ban lists. List 3 (note 20(f)) covers 163 lines and "
    "List 4A two; no List 3 or 4A product exclusion for a Chapter 32 product is in effect (notes 20(vvv), 20(www))."
)

TEXT["te_seo"] = {
    "title": "Importing Paint, Pigments, Dyes & Ink: Rules and Legal Ways to Lower Duty (HTS Ch. 32) | KoalaGains",
    "shortDescription": "The rules for each HTS Chapter 32 line — TSCA certification, FDA color additives, CPSC lead-paint limit, EPA VOC rules, art "
    "material labeling, hazmat shipping, the optical-brightener antidumping order — and the legal ways to pay less: USMCA, FTAs, pharmaceutical "
    "use, drawback, FTZ, first sale.",
    "keywords": [
        "tariff engineering",
        "import paint requirements",
        "TSCA import certification",
        "FDA color additive import",
        "lead paint regulations",
        "VOC rules architectural coatings",
        "duty drawback",
        "foreign trade zone",
        "first sale valuation",
    ],
}
TEXT["te_intro"] = (
    "What a Chapter 32 import costs depends mostly on **origin**: USMCA goods from Canada and Mexico are Free (except three Canadian lines at 50%), "
    "the EU pays 10% in total, Japan and Korea 12.5%, India and the UK the base rate plus 10%, and China the base rate plus 37.5%. The legal ways to pay "
    "less are claiming USMCA or another FTA, declaring pharmaceutical use for certain colorants, drawback on exported goods and a correct customs "
    "value.\n\n"
    "The paperwork depends on the product: every dye, pigment, paint and ink needs a **TSCA** certification, colors for food, drugs and cosmetics must "
    "meet **FDA** color-additive rules, consumer paints the **CPSC** lead limit, architectural and spray paints **EPA** VOC limits, artists' colors the "
    "art-material labeling rule, and flammable paints and inks the **DOT** hazmat rules. Each rule and lever below links to its regulation."
)
TEXT["te_disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Antidumping rates are company-specific and change with each "
    "administrative review; check Commerce's latest notice and CBP's cash-deposit instructions before importing."
)

TEXT["fc_seo"] = {
    "title": "Paint, Pigment, Dye & Ink Tariffs FAQ: HS Codes, Titanium Dioxide, China, Canada (HTS Ch. 32) | KoalaGains",
    "shortDescription": "Answers to what people search about Chapter 32 tariffs: is there a tariff on paint, HS codes for paint, pigments, dyes, "
    "titanium dioxide, printing ink and caulk, tariffs on art supplies, and chemicals from China and India.",
    "keywords": [
        "tariff on paint",
        "is there a tariff on paint",
        "hs code for paint",
        "titanium dioxide tariff code",
        "hs code for pigment",
        "hs code for dyes",
        "printing ink tariff code",
        "art supplies tariffs",
        "hs code for caulk",
        "tariffs on chemicals from china",
        "hts chapter 32",
    ],
}
TEXT["fc_intro"] = (
    "Straight answers to the most common questions about U.S. tariffs on dyes, pigments, paints, caulk and inks — by product, by HS code and by country. "
    "Each answer links to the page with the full detail."
)
TEXT["fc_takeaways"] = [
    "Chapter 32 base rates run from Free to 6.5%. Since July 24, 2026 the 2026 Section 301 tariffs add 10% or 12.5% for 60 economies, or set a 10% "
    "total for the EU and Taiwan and 12.5% for Japan, Korea and Switzerland.",
    "China pays the base rate plus 37.5% on most lines (25% List 3 + 12.5%). Titanium dioxide pigments are exempt from the 2026 duties for every country.",
    "USMCA goods from Canada and Mexico are Free, except Canadian 3208.90 paints, 3214.90.50 mastics and 3215.19.90 printing inks, which pay 50% under "
    "Section 338 from August 22, 2026.",
    "The 2025 IEEPA duties ended February 24, 2026. Optical brighteners from China and Taiwan still pay antidumping duties, which the tariff calculator "
    "does not include.",
]

FAQS = [
    {
        "id": "tariff-on-paint",
        "question": "Is there a tariff on paint imported into the U.S.?",
        "searchedAs": ["tariff on paint", "is there a tariff on paint", "paint tariffs", "paint prices tariffs", "spray paint tariffs"],
        "answer": "Yes. Paints and varnishes have base rates of 3.2%–3.7% (solvent-based, 3208), 5.1%–5.9% (water-based, 3209) and 1.8% (other, 3210). "
        "Since July 24, 2026 the 2026 Section 301 tariffs apply: German and other EU paint pays 10% in total, Japanese and Korean 12.5%, British and "
        "Indian the base rate plus 10%, Chinese the base rate plus 37.5%. USMCA paint from Mexico is Free; from Canada it is Free except 3208.90, "
        "which pays 50% under Section 338.",
        "link": "industry-areas",
    },
    {
        "id": "paint-china",
        "question": "What is the tariff on paint from China?",
        "searchedAs": ["paint from china", "spray paint from china", "acrylic paint from china", "lead paint from china"],
        "answer": "The base rate plus 37.5%: 25% under Section 301 List 3 and 12.5% under the 2026 Section 301 action. Solvent-based paint (3208) pays "
        "40.7%–41.2%, water-based paint (3209) 42.6%–43.4%, and artists' acrylic colors (3213) 40.9%, or 44% for sets. Consumer paint must also meet "
        "the 0.009% lead limit (16 CFR part 1303), and spray paint the EPA aerosol-coating VOC rules.",
        "link": "industry-areas",
    },
    {
        "id": "hs-paint",
        "question": "What is the HS code for paint?",
        "searchedAs": [
            "hs code for paint",
            "hs code for paints and varnishes",
            "paint tariff code",
            "hs code for spray paint",
            "hs code for epoxy paint",
            "hs code for acrylic paint",
            "hs code for varnish",
            "hs code 3208",
            "hs code 3209",
        ],
        "answer": "Paints and varnishes are headings 3208–3210. Solvent-based paints are 3208: 3208.10 polyester, 3208.20 acrylic or vinyl, 3208.90 "
        "others such as epoxy and polyurethane (3.2%–3.7%). Water-based (latex) paints are 3209: 3209.10 acrylic or vinyl (5.1%), 3209.90 others (5.9%). "
        "Other paints, distempers and leather finishes are 3210.00 (1.8%). Artists' paints are 3213, and paint thinners and removers are classified "
        "outside Chapter 32.",
        "link": "",
    },
    {
        "id": "tio2",
        "question": "What is the HS code and tariff for titanium dioxide?",
        "searchedAs": [
            "titanium dioxide tariff code",
            "titanium dioxide tariffs",
            "tio2 tariffs",
            "hs code for titanium dioxide",
            "hs code for titanium dioxide pigment",
            "hs code for titanium dioxide rutile",
            "hs code 320611",
        ],
        "answer": "Titanium dioxide pigments with 80% or more TiO2 are 3206.11.00; other TiO2-based pigments and preparations are 3206.19.00. Both pay 6% "
        "and are on the 2026 Section 301 exemption list, so they pay no extra duty from the EU, Japan, India or other countries; USMCA pigment from "
        "Canada is Free, and Chinese pigment pays 31% (6% + 25% List 3). Titanium oxide not prepared as a pigment is 2823.00.00 (5.5%).",
        "link": "",
    },
    {
        "id": "tio2-ad",
        "question": "Is there a U.S. antidumping duty on titanium dioxide from China?",
        "searchedAs": ["anti dumping duty on titanium dioxide from china", "titanium dioxide anti dumping duty", "titanium dioxide anti dumping", "titanium dioxide import from china"],
        "answer": "No. No U.S. antidumping or countervailing duty order on titanium dioxide pigment is in force. Chinese TiO2 "
        "pigment pays the 6% base rate and the 25% Section 301 List 3 duty, 31% in all. The Chapter 32 antidumping order in force covers stilbenic "
        "optical brighteners (3204.20.80) from China and Taiwan.",
        "link": "tariff-updates",
    },
    {
        "id": "hs-pigment",
        "question": "What is the HS code for pigments?",
        "searchedAs": [
            "pigment tariff code",
            "hs code for pigment",
            "hs code for pigment powder",
            "hs code for pigment paste",
            "hs code for pigment dispersion",
            "hs code for iron oxide pigment",
            "hs code for carbon black pigment",
        ],
        "answer": "Organic pigments are 3204.17 (6.5% for most, with named pigments such as pigment blue 15:3 or pigment red 122 in their own lines). "
        "Inorganic pigments are in 3206: titanium dioxide 3206.11/.19 (6%), chrome pigments 3206.20 (3.7%), ultramarine 3206.41 (1.5%), iron oxide "
        "preparations 3206.49.20 (6.5%), carbon black preparations 3206.49.40 (Free), concentrated dispersions in plastics 3206.49.10 (5.9%). Pigments "
        "dispersed in non-aqueous media for paint making are 3212.90 (3.1%). Plain iron oxides (2821.10) and carbon black (2803.00) are in Chapter 28.",
        "link": "",
    },
    {
        "id": "hs-dyes",
        "question": "What is the HS code for dyes?",
        "searchedAs": [
            "dye tariff code",
            "hs code for dyes",
            "hs code for dyestuff",
            "hs code for dye powder",
            "hs code for reactive dyes",
            "hs code for disperse dyes",
            "hs code for solvent dyes",
        ],
        "answer": "Synthetic dyes are heading 3204: disperse 3204.11, acid 3204.12, basic 3204.13, direct 3204.14, vat 3204.15, reactive 3204.16, solvent "
        "and other dyes 3204.19 — mostly 6.5%. Natural dyes of plant or animal origin are 3203 (Free or 3.1%); dyes put up for retail sale are "
        "3212.90 (3.1%); hair dyes are cosmetics in Chapter 33. Indian dyes pay 16.5% in total, Chinese dyes 44%.",
        "link": "",
    },
    {
        "id": "food-coloring",
        "question": "What is the HS code for food coloring?",
        "searchedAs": ["hs code for food coloring", "tariff code for food coloring", "hs code for synthetic food colours", "hs code carmine"],
        "answer": "Synthetic food colors are in 3204.12.50, with their own lines for FD&C Red 40, Yellow 5 and Yellow 6 (6.5%); carotenoids are 3204.18 "
        "(3.1%). Natural colors such as annatto and cochineal are 3203.00.10 (Free); color lakes and food coloring solutions with carmine lake are 3205. "
        "FD&C colors must come from FDA-certified batches for use in food (21 CFR part 80).",
        "link": "tariff-engineering",
    },
    {
        "id": "chemicals-china-india",
        "question": "What are the U.S. tariffs on dyes and pigments from China and India?",
        "searchedAs": ["tariffs on chemicals from china", "tariff on chemicals from india", "trump tariffs on chemicals", "us tariffs on specialty chemicals", "us tariffs india chemicals"],
        "answer": "For Chapter 32 goods, China pays the base rate plus 37.5% (25% List 3 + 12.5% 2026 Section 301), so most dyes and pigments pay 44%. "
        "India pays the base rate plus 10%, 16.5% on most dyes. In 2025 IEEPA duties reached 50% extra on Indian goods (August 27, 2025 to February 7, "
        "2026) and 145% on Chinese goods (April 10 to May 13, 2025, plus List 3); all IEEPA duties ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "hs-ink",
        "question": "What is the HS code for printing ink?",
        "searchedAs": [
            "printing ink tariff code",
            "hs code for printing ink",
            "hs code for offset printing ink",
            "hs code for printer ink",
            "hs tariff code for printer ink",
            "hs code 3215",
        ],
        "answer": "Printing ink is 3215.11 (black) and 3215.19 (other colors), with statistical lines for news, flexographic, gravure, letterpress and "
        "offset ink (1.8%). Solid ink in engineered shapes for printers of heading 8443 is 3215.11.10 or 3215.19.10 (Free). Writing, drawing and "
        "other inks are 3215.90 (drawing ink 3.1%, others 1.8%).",
        "link": "",
    },
    {
        "id": "ink-tariff",
        "question": "Is there a tariff on printer ink?",
        "searchedAs": ["tariff on ink", "tariff on printer ink", "printer ink tariffs"],
        "answer": "Yes. Most ink lines have a 1.8% base rate. Japanese ink pays 12.5% in total, German 10%, British 11.8%, Israeli 14.3% and Chinese "
        "39.3%. USMCA ink from Mexico and Canada is Free, except Canadian colored printing ink of 3215.19.90, which pays 50% under Section 338 from "
        "August 22, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "art-supplies",
        "question": "Are there tariffs on art supplies like paints?",
        "searchedAs": ["art supplies tariffs", "are there tariffs on art supplies", "tariffs on art supplies", "art supplies tariff code"],
        "answer": "Artists' and students' colors are 3213: 6.5% on the entire set for color sets, 3.4% for other colors. From China they pay 44% and "
        "40.9%, from Vietnam 19% and 15.9%, from France or other EU countries 10%. Art materials must carry ASTM D-4236 chronic-hazard labeling (16 CFR "
        "1500.14(b)(8)). Brushes and canvas are classified in other chapters.",
        "link": "tariff-engineering",
    },
    {
        "id": "caulk",
        "question": "What is the HS code for caulk, sealant and putty?",
        "searchedAs": ["caulking compounds hs code", "hs code for caulk", "hs code for putty", "hs code for wall putty", "hs code 3214.10", "sealant tariff code"],
        "answer": "Glazier's putty, resin cements, caulking compounds, other mastics and painters' fillings are 3214.10 (3.7%), with statistical lines for "
        "caulking compounds, other mastics and painters' fillings. Non-refractory surfacing preparations such as wall putty are 3214.90 (rubber-based "
        "Free, others 3.25%). Products sold as adhesives are classified in heading 3506.",
        "link": "",
    },
    {
        "id": "hts-chapter-32",
        "question": "What does HTS Chapter 32 cover?",
        "searchedAs": ["hts chapter 32", "htsus chapter 32", "hts code chapter 32", "us hts chapter 32"],
        "answer": "Chapter 32 covers tanning and dyeing extracts, tannins, dyes, pigments and other coloring matter, paints and varnishes, putty and "
        "other mastics, and inks: 15 headings (3201–3215) and 168 U.S. tariff lines with base rates from Free to 6.5%. The U.S. imported $5.01B of "
        "these goods in 2025.",
        "link": "",
    },
]
