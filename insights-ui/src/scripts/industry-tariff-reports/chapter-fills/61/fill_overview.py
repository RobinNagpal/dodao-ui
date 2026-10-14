# Chapter 61 overview (exec'd by fill.py; uses d, LABELS, trade helpers)
ov = d["overview"]
ov["h1"] = "HTS Chapter 61: Knitted Apparel — T-Shirts, Sweaters, Sweatshirts, Socks, Underwear & Baby Clothes Tariff Rates (2026)"
ov["seo"]["title"] = "HTS Chapter 61 Tariff Rates 2026: Knit Clothing Import Duty — T-Shirts, Sweaters, Hoodies, Socks | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable 2026 duty table for all 838 HTS Chapter 61 knitted apparel lines — T-shirts, sweaters, hoodies, leggings, "
    "underwear, socks, baby clothes, swimwear, gloves — with General, FTA and Column 2 rates and the extra duty for "
    "Vietnam, China, Cambodia, Bangladesh, India and CAFTA-DR suppliers."
)
ov["seo"]["keywords"] = [
    "hts chapter 61",
    "hts chapter 61 import duties",
    "htsus chapter 61",
    "knitted apparel import duty rates",
    "us import duty on knitted t-shirts and sweaters",
    "t shirt hs code usa",
    "hs code 6109.10",
    "hs code 6110.20",
    "sweatshirt hs code",
    "socks hs code 6115",
    "china tariff on knitted apparel",
    "knitted apparel de minimis exemption",
]
ov["intro"] = (
    "Chapter 61 covers clothing and accessories that are **knitted or crocheted**: coats and anoraks (6101–6102), suits, "
    "ensembles, trousers, leggings, dresses and skirts (6103–6104), knit shirts and blouses (6105–6106), underwear and "
    "sleepwear (6107–6108), **T-shirts** (6109), **sweaters, sweatshirts and hoodies** (6110), babies' clothing (6111), "
    "track suits and swimwear (6112), other garments (6113–6114), **socks and hosiery** (6115), gloves (6116) and "
    "scarves and other accessories (6117). Woven garments are Chapter 62. Its **838 lines** carry some of the highest "
    "base rates in the schedule, and the rate turns on **fibre and garment type**: a cotton T-shirt or sweatshirt is "
    "16.5%, the same T-shirt or sweater of man-made fibres **32%**, cotton socks 13.5%, a cashmere sweater 4%. Knit suit "
    "ensembles (6103.2x, 6104.2x) have no rate of their own: each garment pays the rate it would pay if entered "
    "separately.\n\n"
    "On top of the base rate, since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of 10% or "
    "12.5%** — Vietnam, Egypt and the Dominican Republic 12.5%, Cambodia, Bangladesh, Indonesia, India, Pakistan and "
    "Sri Lanka 10%. **China pays 12.5% plus 7.5%** under List 4A on 714 of the 838 lines. Apparel entered duty-free under "
    "**CAFTA-DR** (Honduras, Nicaragua, Guatemala, El Salvador, the Dominican Republic, Costa Rica) and **Jordan's** "
    "apparel are exempt, and USMCA goods pay nothing extra — except six Canadian subheadings, including cotton T-shirts "
    "and sweaters, that owe **50% under Section 338** even with USMCA. The U.S. imported **"
    + TOTAL
    + f"** of knitted apparel in {Y}: Vietnam {m(imp('Vietnam'))}, China {m(imp('China'))}, Cambodia "
    f"{m(imp('Cambodia'))}, Bangladesh {m(imp('Bangladesh'))}."
)
BLURBS = {
    "6101": (
        "Men's and boys' knit overcoats, anoraks, ski jackets, windbreakers and similar outerwear (not suit jackets): "
        "cotton 15.9%, man-made fibres 28.2%, wool 61.7¢/kg + 16%. Fleece jackets of polyester are 6101.30.20.",
        ["fleece jacket", "knit jacket", "windbreaker", "anorak", "ski jacket", "softshell jacket", "zip-up jacket"],
    ),
    "6102": (
        "The same outerwear for women and girls: cotton 15.9%, man-made fibres 28.2%, wool 55.9¢/kg + 16.4%. Garments that "
        "close right over left are women's (chapter note 9).",
        ["women's fleece jacket", "knit coat", "women's windbreaker", "girls' jacket", "parka"],
    ),
    "6103": (
        "Men's and boys' knit suits, ensembles, suit-type jackets and blazers, trousers and shorts. Cotton trousers and "
        "shorts 16.1%, synthetic 28.2%; cotton blazers 13.5%. Ensembles (6103.22–6103.29) pay each garment's own rate.",
        ["jogger pants", "knit shorts", "sweatpants", "knit blazer", "men's track pants", "knit suit"],
    ),
    "6104": (
        "Women's and girls' knit suits, ensembles, jackets, dresses, skirts, trousers, leggings and shorts. Synthetic "
        "trousers and leggings 28.2%, cotton 14.9%; cotton dresses 11.5%, synthetic 16%; cotton skirts 8.3%. Ensembles "
        "(6104.22–6104.29) pay each garment's own rate.",
        ["leggings", "yoga pants", "knit dress", "maxi dress", "skirt", "women's joggers", "bike shorts", "hs code 6104.63"],
    ),
    "6105": (
        "Men's and boys' knit shirts with a neckline opening, such as polo shirts: cotton 19.7%, man-made fibres 32%. "
        "Garments with a ribbed waistband or under 10 stitches per cm are not here (chapter note 4).",
        ["polo shirt", "golf shirt", "henley", "knit dress shirt", "rugby shirt"],
    ),
    "6106": (
        "Women's and girls' knit blouses and shirts: cotton 19.7%, man-made fibres 32%, wool 13.6%, silk 0.9%.",
        ["women's polo", "knit blouse", "women's knit shirt", "tunic top"],
    ),
    "6107": (
        "Men's and boys' underpants, briefs, boxers, nightshirts, pajamas, bathrobes and dressing gowns: cotton briefs "
        "7.4%, man-made fibre briefs 14.9%, cotton pajamas 8.9%, man-made fibre pajamas 16%.",
        ["boxer briefs", "men's underwear", "men's pajamas", "bathrobe", "lounge pants", "boxers"],
    ),
    "6108": (
        "Women's and girls' slips, briefs and panties, nightdresses, pajamas, negligees and robes: cotton panties 7.6%, "
        "man-made fibre panties 15.6%, cotton nightwear 8.5%, man-made fibre nightwear 16%. Bras are heading 6212.",
        ["panties", "women's underwear", "nightgown", "women's pajamas", "robe", "sleepwear", "thong"],
    ),
    "6109": (
        "T-shirts, singlets and tank tops — the largest-volume knit line. Cotton 16.5%, man-made fibres 32%. Garments with "
        "a drawstring or ribbed waistband at the bottom are not T-shirts (chapter note 5).",
        ["t-shirt", "graphic tee", "tank top", "undershirt", "crew neck tee", "v-neck", "hs code 6109.10"],
    ),
    "6110": (
        "Sweaters, pullovers, sweatshirts, hoodies, cardigans and vests — the chapter's largest heading by value. Cotton "
        "16.5%, man-made fibres 32%, wool 16%, wholly cashmere 4%. Sweatshirts and hoodies are statistical lines of "
        "6110.20.20 (cotton) and 6110.30.30 (man-made fibres).",
        ["hoodie", "sweatshirt", "sweater", "cardigan", "pullover", "cashmere sweater", "fleece pullover", "hs code 6110.20"],
    ),
    "6111": (
        "Garments and accessories for babies — body height up to 86 cm (chapter note 6), which take this heading before "
        "any other: cotton sets, sunsuits and other babies' wear 8.1%, cotton T-shirts and trousers 14.9%, synthetic T-shirts and shirts 32%.",
        ["baby clothes", "onesie", "baby bodysuit", "romper", "baby sleep sack", "baby socks", "infant clothes"],
    ),
    "6112": (
        "Track suits, ski suits and swimwear. Cotton track suits 14.9%, synthetic 28.2%; men's synthetic swimwear 25.9%, "
        "women's synthetic swimwear and bikinis 24.9%.",
        ["swimsuit", "bikini", "swim trunks", "tracksuit", "ski suit", "rash guard"],
    ),
    "6113": (
        "Garments of knit fabric that is coated, covered or laminated with rubber or plastics (heading 5903, 5906 or "
        "5907): 3.8% or 7.1%. This heading wins over the other headings of the chapter except babies' wear (note 8).",
        ["rain jacket knit", "coated jacket", "rubberized garment", "laminated jacket"],
    ),
    "6114": (
        "Knit garments not covered elsewhere — tops, bodysuits, jumpsuits, scrubs and coveralls. Cotton 10.8%; man-made "
        "fibre tops 28.2%, bodysuits 32%, other 14.9%.",
        ["bodysuit", "jumpsuit", "knit scrubs", "coverall", "knit top"],
    ),
    "6115": (
        "Socks, tights, pantyhose, stockings and compression hosiery, including footwear without applied soles. Cotton "
        "socks 13.5%, synthetic socks 14.6% (18.8% with lace), pantyhose 16%; surgical compression stockings Free.",
        ["socks", "compression socks", "tights", "pantyhose", "stockings", "knee-high socks", "socks hs code 6115"],
    ),
    "6116": (
        "Knit gloves, mittens and mitts: synthetic gloves 18.6%, cotton machine-knit 23.5% or 9.4%, coated work gloves "
        "7%–23.5%, ice- and field-hockey gloves Free. Leather gloves are 4203, rubber and nitrile gloves 4015.",
        ["knit gloves", "winter gloves", "work gloves", "mittens", "touchscreen gloves", "coated gloves"],
    ),
    "6117": (
        "Scarves, shawls, mufflers and veils, ties, headbands and other made-up knit accessories, and knit parts of "
        "garments: man-made fibre scarves 11.3%, headbands and other accessories 14.6%, ties 5%.",
        ["scarf", "knit scarf", "headband", "neck gaiter", "necktie", "shawl", "hair scrunchie"],
    ),
}
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
    g["blurb"], g["searchExamples"] = BLURBS[g["heading"]]

for st in ov["stats"]:
    if st["label"] == "Lines with an extra duty for some origins":
        st["note"] = (
            "Section 301 (2026, 60 economies): 838, but CAFTA-DR goods entered duty-free and Jordan's apparel are exempt; "
            "Brazil: 838; China List 4A: 714 (the other 124 were on the suspended List 4B); Canada Section 338: 55 lines in "
            "6 subheadings, USMCA or not"
        )

ov["workedExamples"] = [
    {
        "title": "Cotton T-shirts from Vietnam",
        "line": "6109.10.00.12",
        "body": "Men's cotton T-shirts are 16.5% at the general rate, and Vietnam adds 12.5% Section 301 (9903.05.84): "
        "**29%**, $2,900 on a $10,000 shipment. The same T-shirts pay 26.5% from Bangladesh, Cambodia or India, 36.5% from "
        "China (List 4A adds 7.5%), and nothing from Honduras or Guatemala under CAFTA-DR. In late 2025 Vietnam's rate was "
        "36.5% (20% IEEPA).",
    },
    {
        "title": "Polyester sweatshirts and hoodies from China",
        "line": "6110.30.30.41",
        "body": "Man-made-fibre sweatshirts carry the chapter's top rate, 32%. China adds 12.5% (9903.05.31) and 7.5% under "
        "List 4A (9903.88.15): **52%**, $5,200 on $10,000. From Cambodia the same hoodies pay 42%; a cotton hoodie "
        "(6110.20.20.41, 16.5%) from China pays 36.5%. The fibre that predominates by weight decides the line.",
    },
    {
        "title": "Men's cotton knit ensemble from China — priced garment by garment",
        "line": "6103.22.00.30",
        "body": "6103.22.00's rate is \"the rate applicable to each garment in the ensemble if separately entered\". For a "
        "$10,000 shipment of jackets ($6,000, 6103.32.00, 13.5%) and matching trousers ($4,000, 6103.42.10, 16.1%) the "
        "base duty is $810 + $644 = $1,454. China's 12.5% and 7.5% apply to the whole $10,000 ($2,000): **$3,454**. The "
        "calculator asks for each garment's 10-digit line and value; the values must add up to the shipment value.",
    },
    {
        "title": "Cotton T-shirts from Honduras under CAFTA-DR",
        "line": "6109.10.00.12",
        "body": "With a CAFTA-DR claim (SPI P) the base rate is Free, and CAFTA-DR textile and apparel goods entered free of "
        "duty are exempt from the 10% Section 301 duty (note 52(i), 9903.05.95): **$0**. Without the claim — for "
        "example T-shirts sewn from Asian fabric that do not meet the yarn-forward rule — they pay 16.5% + 10% = 26.5% "
        "($2,650).",
    },
    {
        "title": "Cotton sweatshirts from Canada, with a USMCA claim",
        "line": "6110.20.20.41",
        "body": "USMCA removes the 16.5% base rate and the 10% Section 301 duty (9903.05.93). But 6110.20.20 is on the "
        "Section 338 list (U.S. note 51(b)(3), 9903.03.14), whose 50% applies even with USMCA: **$5,000** on $10,000. "
        "Without a USMCA claim: 16.5% + 10% + 50% = 76.5%. Mexican USMCA sweatshirts pay nothing.",
    },
    {
        "title": "Cotton socks from Pakistan",
        "line": "6115.95.90.00",
        "body": "Cotton socks without lace are 13.5%, plus 10% Section 301 for Pakistan (9903.05.62): **23.5%**, $2,350 on "
        "$10,000. From China they pay 33.5%; from Jordan they are Free (JO, and Jordan's exception list); from Italy 13.5% "
        "(the EU's 10% in-total rate is below the base rate).",
    },
]
ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["source"] = f"UN Comtrade, United States imports, HS chapter 61 ({Y})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the "
    f"6-digit level for calendar {Y} — before the 2026 tariff changes — so this page does not say which 10-digit line "
    "each country ships."
)
ts["topCountries"] = [{"name": n, "importsUsd": imp(n)} for n in ranked[:5]]
ts["biggestLines"] = [
    {"hts": "6110.20", "label": "Cotton sweaters, sweatshirts, hoodies and cardigans"},
    {"hts": "6109.10", "label": "Cotton T-shirts, singlets and tank tops"},
    {"hts": "6110.30", "label": "Man-made-fibre sweaters, sweatshirts and hoodies"},
]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter applies only to made up knitted or crocheted articles.\n\n"
    "**Note 2.** It does not cover goods of heading 6212 (bras, girdles, corsets, suspenders), worn clothing of heading "
    "6309, or orthopedic appliances, surgical belts and trusses (heading 9021).\n\n"
    "**Note 3.** For headings 6103 and 6104: (a) a **suit** is a set of two or three pieces with an outer surface of "
    "identical fabric — a suit coat or jacket of four or more panels (with or without a tailored waistcoat) and trousers, "
    "breeches, shorts (not swimwear), a skirt or a divided skirt — of the same fabric construction, color, composition "
    "and style; morning dress, evening dress and dinner-jacket suits are suits too. (b) An **ensemble** is a set of "
    "garments of identical fabric, put up for retail sale, of one upper garment (a pullover may be a second upper garment "
    "only in a twin set, and a waistcoat may also be a second one) and one or two different lower garments (trousers, "
    "bib and brace overalls, breeches, shorts, a skirt or a divided skirt), all of the same fabric construction, style, "
    "color and composition and of corresponding size. Articles of 6107, 6108 and 6109, track suits and ski suits are not "
    "ensembles.\n\n"
    "**Note 4.** Headings 6105 and 6106 do not cover garments with pockets below the waist, a ribbed waistband or other "
    "tightening at the bottom, or under 10 stitches per linear cm in each direction; 6105 does not cover sleeveless "
    "garments.\n\n"
    "**Note 5.** Heading 6109 does not cover garments with a drawstring, ribbed waistband or other tightening at the "
    "bottom.\n\n"
    "**Note 6.** \"Babies' garments\" (6111) are for young children of a body height not over 86 cm, and articles "
    "classifiable both in 6111 and elsewhere in the chapter go to 6111.\n\n"
    "**Note 7.** \"Ski-suits\" (6112) are ski overalls, or ski ensembles of an anorak or windbreaker closed by a zipper "
    "and trousers, breeches or a bib and brace overall.\n\n"
    "**Note 8.** Garments classifiable both in 6113 (coated or laminated fabric) and elsewhere, except 6111, go to "
    "6113.\n\n"
    "**Note 9.** Garments closing left over right are men's or boys', right over left women's or girls', unless the cut "
    "clearly shows otherwise; garments that cannot be identified as either are classified as women's or girls'.\n\n"
    "**Note 10.** Articles of this chapter may be made of metal thread."
)
ov["notes"]["additionalUsNotes"] = (
    "**Additional U.S. note 1.** For heading 6111, \"sets\" means two or more different garments of headings 6111, 6209 "
    "or 6505 imported together, of corresponding sizes and intended to be worn together by the same person.\n\n"
    "**Statistical notes.** (1) Garments entered together and classified as an ensemble (6103.21–6103.29.10, "
    "6104.21–6104.29.10) or a track suit (6112.11, 6112.12) are reported as separate articles under the most appropriate "
    "10-digit number within the same 8-digit subheading. (2) For 6103, 6104 and 6112, \"shirts\" means garments of 6105, "
    "6106 and 6110 other than sweaters. (3) \"Sweaters\" are garments whose outer surface has 9 or fewer stitches per 2 "
    "cm in the direction the stitches were formed. (4) Garments assembled abroad from U.S.-formed and cut components and "
    "then bleached, garment-dyed or perma-pressed may enter under a Special Access Regime, reported with the prefix "
    "\"H\". (5) Garments cut and assembled from U.S.-formed fabric under the Outward Processing Program are reported with "
    "the prefix \"S\". (6) \"Knit to shape\" in 6110 means garments knit to shape on flat-knitting machines with 10 to 18 "
    "stitches per 2 cm, all components knit to shape and assembled by looping and linking.\n\n"
    "The three-digit numbers in brackets (for example 338 cotton knit shirts, 345 cotton sweaters, 645 man-made-fibre "
    "sweaters) are textile category numbers used to monitor shipments and to count AGOA, Haiti and USMCA quantity limits. "
    "No Chapter 61 line carries a footnote to the Russia heading 9903.90.08."
)

SPI_NAMES = {
    "A": "Generalized System of Preferences (GSP) — expired December 31, 2020",
    "A*": "GSP, some beneficiary countries excluded — expired December 31, 2020",
    "D": "African Growth and Opportunity Act (AGOA) — through December 31, 2026",
    "NP": "Nepal Preference Program (expired December 31, 2025)",
    "E": "Caribbean Basin Economic Recovery Act (CBERA)",
    "E*": "CBERA, some beneficiary countries excluded",
}
for x in ov["spiLegend"]:
    x["name"] = SPI_NAMES.get(x["code"], x["name"])
