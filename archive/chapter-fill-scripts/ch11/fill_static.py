# Trade-independent content for Chapter 11 (imported by fill.py).

ECFR_DATE = "2026-10-08"

CHAPTER_NOTES = (
    "**Note 1.** This chapter does not cover: (a) roasted malt put up as coffee substitutes (heading 0901 or 2101); "
    "(b) prepared flours, groats, meals or starches of heading 1901; (c) corn flakes or other products of heading 1904; "
    "(d) vegetables, prepared or preserved, of heading 2001, 2004 or 2005; (e) pharmaceutical products (chapter 30); or "
    "(f) starches having the character of perfumery, cosmetic or toilet preparations (chapter 33).\n\n"
    "**Note 2.** Milling products of wheat, rye, barley, oats, corn, grain sorghum, rice and buckwheat belong in this chapter "
    "only if, by dry weight, their starch content is above 45% and their ash content is under a set limit (2.5% for wheat and rye, "
    "3% barley, 5% oats, 2% corn and sorghum, 1.6% rice, 4% buckwheat); otherwise they are bran or residues of heading 2302. "
    "Germ of cereals always stays in heading 1104. Products that pass the sieve test (80% through a 315-micron sieve, or 90% through "
    "500 microns for corn and sorghum) are flours of heading 1101 or 1102; the rest are groats, meal or worked grains of 1103 or 1104.\n\n"
    "**Note 3.** For heading 1103, \"groats\" and \"meal\" are fragmented cereal grains of which at least 95% by weight passes a 2 mm "
    "sieve (corn) or a 1.25 mm sieve (other cereals)."
)

ADDITIONAL_US_NOTES = (
    "**Additional U.S. Note 1.** Mixtures of products of headings 1101, 1102, 1103 or 1104 (other than mixtures of subheading "
    "1102.90.30) are dutiable at **12.8%** (general), Free for AU, CL, E, IL, P and SG, and 20% (column 2), whatever the rates of "
    "the separate products."
)

PRODUCT_GROUPS = {
    "1101": (
        "Wheat flour — bread, durum and pastry flours — carries one specific rate, 0.7¢/kg, on every line. On a $0.60/kg flour that "
        "is barely 1%; the extra duty by country is what moves the cost.",
        ["wheat flour", "bread flour", "durum flour", "pastry flour", "atta", "00 flour", "organic flour"],
    ),
    "1102": (
        "Flours of other cereals. Corn, rice and rye flours pay fractions of a cent per kg and buckwheat flour is Free, but the residual "
        "line (oat, sorghum, barley flour) is 9% and blended cereal flours are 12.8%.",
        ["corn flour", "rice flour", "rye flour", "buckwheat flour", "oat flour", "flour blend"],
    ),
    "1103": (
        "Groats, meal and pellets: semolina, cornmeal, grits and steel-cut pieces. Mostly cents per kg; groats and meal of other "
        "cereals are 9%, and cereal pellets are Free.",
        ["semolina", "cornmeal", "polenta", "grits", "oat groats", "farina"],
    ),
    "1104": (
        "Rolled, flaked, hulled and pearled grains plus cereal germ. Rolled oats are 1.2¢/kg, barley flakes 2¢/kg, pearled barley "
        "1.2% and wheat germ 4.5%.",
        ["rolled oats", "oat flakes", "pearled barley", "barley flakes", "wheat germ", "hulled oats"],
    ),
    "1105": (
        "Potato flour and dehydrated potato flakes and granules — the base for instant mashed potatoes and snack doughs. 1.7¢/kg "
        "and 1.3¢/kg.",
        ["potato flakes", "potato flour", "dehydrated potato", "potato granules"],
    ),
    "1106": (
        "Flours of pulses, roots and fruit. Chickpea, pea and lentil flour is 8.3% and most fruit and nut flours 9.6%; cassava and "
        "other root flours are Free and banana flour is 2.8%.",
        ["chickpea flour", "pea flour", "besan", "cassava flour", "almond flour", "banana flour"],
    ),
    "1107": (
        "Malt for brewing and distilling. Unroasted (base and pale) malt is 0.3¢/kg and roasted (specialty) malt 0.42¢/kg — the "
        "chapter's biggest import by value.",
        ["malt", "barley malt", "brewing malt", "roasted malt", "malted barley", "specialty malt"],
    ),
    "1108": (
        "Native (unmodified) starches and inulin. Wheat, corn and potato starch pay about half a cent per kg; cassava (tapioca) starch "
        "and other starches are Free; inulin is 2.6%. Modified starches are chapter 35, not here.",
        ["corn starch", "tapioca starch", "cassava starch", "potato starch", "wheat starch", "rice starch", "inulin"],
    ),
    "1109": (
        "Wheat gluten (vital wheat gluten). 6.8% for food use, 1.8% when it will be used as animal feed — the widest gap in the "
        "chapter for the same product.",
        ["wheat gluten", "vital wheat gluten", "gluten for feed"],
    ),
}

ENGINEERING_GROUP_NOTES = {
    "1101": "Flour sold as \"flour\", \"enriched flour\", \"whole wheat flour\" or \"durum flour\" must meet its FDA standard of identity (21 CFR part 137); organic lines need an NOP import certificate.",
    "1102": "Corn and rice flours are covered by the same FDA food rules; mixed cereal flours are 12.8% (subheading 1102.90.30).",
    "1103": "Semolina, farina and corn meals have FDA standards of identity (21 CFR part 137).",
    "1104": "Organic rolled oats (1104.12.00.10) need an NOP import certificate.",
    "1105": None,
    "1106": None,
    "1107": "Malt is a food ingredient for FDA purposes: brewers and distillers that import it are the FSVP importer unless another U.S. owner is named.",
    "1108": "Native starches only — chemically modified starches, dextrins and starch glues are heading 3505.",
    "1109": "Vital wheat gluten from China is on FDA Import Alert 99-29 (melamine). The 1.8% feed line is an actual-use provision.",
}
