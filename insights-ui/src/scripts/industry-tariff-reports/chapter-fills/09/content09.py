# Executed inside build09.py (shares its globals: d, TITLE, TODAY, CH99, te09).
# Writer content for Chapter 09 — coffee, tea, maté and spices.

ov = d["overview"]
tu = d["tariffUpdates"]
ui = d["understandIndustry"]
ia = d["industryAreas"]
te = d["tariffEngineering"]
fc = d["finalConclusion"]

NO_DUTY_DATA = "Duty-collected figures aren't available from an official source yet."

# ======================================================================== overview
ov["seo"] = {
    "title": "HTS Chapter 09: Coffee, Tea, Maté & Spices — Tariff Rates & Import Duties | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 91 HTS Chapter 09 lines — green and roasted coffee, tea, maté, pepper, vanilla, cinnamon, cumin, ginger and other spices — with General, FTA and Column 2 rates and the 2026 Section 301 exemption for coffee, tea and spices.",
    "keywords": [
        "HTS Chapter 09",
        "coffee tariff",
        "tariff on coffee beans",
        "green coffee HTS code",
        "tea import duty",
        "tariff on spices",
        "HTS code for spices",
        "is coffee exempt from tariffs",
        "tariff on vanilla",
        "tariff on matcha",
    ],
}
ov["intro"] = (
    "Chapter 09 covers coffee (green, roasted and decaffeinated), tea, maté and the dried spices: pepper, chilies and paprika, vanilla, "
    "cinnamon, cloves, nutmeg and cardamom, cumin and other seeds, ginger, turmeric, saffron, thyme and spice mixtures. Its **91 tariff lines** "
    "are almost all **Free** at the base rate. Only 19 carry a duty, all small: 6.4% on flavored green tea, 1.9%–4.8% on spice mixtures, thyme, "
    "bay leaves and origanum, and 1¢–7.4¢/kg on ground ginger, dried capsicum and Bombay mace.\n\n"
    "The extra duties by country mostly skip this chapter. Since **July 24, 2026** the Section 301 tariff on 60 economies (10% or 12.5%) and "
    "Brazil's 25% Section 301 tariff both exempt **every Chapter 09 line except crude thyme and bay leaves (0910.99.05) and thyme (0910.99.06)** "
    "(U.S. notes 52(b) and 50(a)(ii) to Chapter 99). So green coffee from Brazil, Colombia or Vietnam enters free. The one broad extra duty is "
    "China's **+7.5%** Section 301 List 4A, which covers every line. The 2025 IEEPA tariffs, which had put 50% on Brazilian coffee from August 6 "
    "to November 12, 2025, ended on February 24, 2026. The U.S. imported **$15.51B** of Chapter 09 goods in 2025, 83% of it coffee."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "91"},
    {"label": "Lines with a base-rate duty", "value": "19 of 91"},
    {"label": "Lines exempt from the 2026 Section 301 duty", "value": "89 of 91", "note": "U.S. note 52(b); only 0910.99.05 and 0910.99.06 pay"},
    {"label": "2025 imports", "value": "$15.51B"},
    {"label": "Coffee share", "value": "83%", "note": "Heading 0901, $12.80B"},
]

GROUPS = {
    "0901": (
        "Green, roasted and decaffeinated coffee is Free from every country except China (+7.5%). Coffee lines are split by arabica, robusta and certified organic since July 1, 2025. Only coffee substitutes containing coffee carry a duty (1.5¢/kg).",
        ["green coffee beans", "arabica", "robusta", "roasted coffee", "decaf coffee", "organic coffee", "coffee husks"],
    ),
    "0902": (
        "Plain green and black tea are Free. Flavored green tea pays 6.4% (Free with most FTAs, 3.2% for Japan). Lines are split by packing size (3 kg) and organic status.",
        ["green tea", "matcha", "black tea", "tea bags", "oolong", "flavored tea", "organic tea"],
    ),
    "0903": ("Maté (yerba mate) is Free from every country except China (+7.5%).", ["yerba mate", "mate"]),
    "0904": (
        "Black and white peppercorns, whole or ground, are Free. Dried capsicum (paprika, cayenne, ancho, chili) pays 2.5¢–5¢/kg unless an FTA applies; allspice is Free.",
        ["black pepper", "white pepper", "paprika", "chili powder", "cayenne", "ancho", "allspice"],
    ),
    "0905": ("Vanilla beans and ground vanilla are Free.", ["vanilla beans", "vanilla powder"]),
    "0906": ("Cinnamon and cassia, whole or ground, are Free.", ["cinnamon sticks", "ground cinnamon", "cassia", "Ceylon cinnamon"]),
    "0907": ("Cloves, whole or ground, are Free.", ["cloves", "ground cloves"]),
    "0908": (
        "Nutmeg, mace and cardamom are Free, except ground Bombay or wild mace at 7.4¢/kg.",
        ["nutmeg", "mace", "cardamom"],
    ),
    "0909": ("Coriander, cumin, anise, star anise, caraway and fennel seeds and juniper berries are Free.", ["cumin", "coriander seed", "fennel seed", "star anise", "caraway", "juniper berries"]),
    "0910": (
        "Ginger, saffron, turmeric and curry are Free (ground ginger 1¢/kg). Spice mixtures pay 1.9%, manufactured thyme 4.8%, bay leaves 3.2% and origanum 3.4%. The two thyme and bay-leaf lines 0910.99.05 and 0910.99.06 are the only Chapter 09 lines that pay the 2026 Section 301 duty.",
        ["ginger", "turmeric", "saffron", "curry powder", "thyme", "bay leaves", "mixed spices"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUPS[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "A container of green arabica coffee from Brazil",
        "line": "0901.11.00.25",
        "body": "Green coffee is Free at the base rate. Brazil's 25% Section 301 duty (9903.05.01) and the 12.5% forced-labor Section 301 duty (9903.05.27) both exempt it (9903.05.03, 9903.05.86), so a $150,000 container pays **$0** in duty. Between August 6 and November 12, 2025 the same container paid 10% reciprocal plus 40% Brazil IEEPA duty: **$75,000**.",
    },
    {
        "title": "Flavored green tea from Japan",
        "line": "0902.10.10.50",
        "body": "The general rate is 6.4%, but Japan's agreement rate is **3.2%** (SPI JP). Japan's 12.5% Section 301 rate does not apply because the line is on the U.S. note 52(b) exemption list. A $20,000 shipment pays $640 with the JP claim, or $1,280 without it. Plain (unflavored) green tea and matcha in 0902.10.90 are Free.",
    },
    {
        "title": "Dried thyme from India",
        "line": "0910.99.06.00",
        "body": "Manufactured thyme is 4.8%, and it is one of the two Chapter 09 lines not exempt from the 2026 Section 301 duty, so India's +10% (9903.05.44) applies: **14.8%**, or $1,480 on a $10,000 shipment. Crude thyme (0910.99.05) has a Free base rate but still pays the 10%.",
    },
    {
        "title": "Ground cinnamon from China",
        "line": "0906.20.00.00",
        "body": "Free at the base rate and exempt from the 2026 Section 301 duty, but China's Section 301 List 4A adds **7.5%** (9903.88.15): $750 on a $10,000 shipment. Ground cinnamon is also on FDA Import Alert 99-42 for lead, so shipments from listed firms are detained.",
    },
]
ov["tradeSnapshot"]["totalDutyCollectedUsd"] = None
ov["tradeSnapshot"]["effectiveDutyRateNote"] = NO_DUTY_DATA + " 72 of the 91 lines are Free at the base rate and almost all are exempt from the 2026 Section 301 duty, so the effective rate is close to zero."
ov["tradeSnapshot"]["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ov["notes"] = {
    "chapterNotes": (
        "**Note 1.** Mixtures of the products of headings 0904 to 0910 are classified as follows: (a) mixtures of two or more products of the same "
        "heading go in that heading; (b) mixtures of products of different headings go in heading 0910. Adding other substances does not change the "
        "classification if the mixture keeps the essential character of the spices; otherwise mixed condiments and seasonings go in heading 2103.\n\n"
        "**Note 2.** This chapter does not cover cubeb pepper (Piper cubeba) or other products of heading 1211."
    ),
    "additionalUsNotes": (
        "**1.** Unless stated otherwise, the provisions cover the named products whole, crushed or powdered.\n\n"
        "**2.** No allowance is made for dirt or other foreign matter.\n\n"
        "**3.** The rates for 0901.11 to 0901.22 do not apply to coffee imported into Puerto Rico on which Puerto Rico imposes a duty under section 319 of the Tariff Act of 1930.\n\n"
        "**4.** Containers and wrappings of tea in packages under 2.3 kg net are dutiable as if imported empty, except for tea from Australia, Canada, Chile, Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras, Mexico, Nicaragua and Singapore.\n\n"
        "**5.** The import ban on impure tea (21 U.S.C. 41) is shaded as expired: the Tea Importation Act was repealed effective April 9, 1996.\n\n"
        "**6.** Pepper shells, ground or unground, may not be imported."
    ),
}

# ======================================================================== tariff updates
tu["seo"] = {
    "title": "HTS Chapter 09 Coffee, Tea & Spice Tariff Updates — What Changed Since January 2025 | KoalaGains",
    "shortDescription": "What changed for U.S. coffee, tea and spice tariffs since January 2025: the 50% Brazil coffee tariff and its removal, the November 2025 agricultural exemption, the end of IEEPA tariffs, and the 2026 Section 301 exemption, with Federal Register citations.",
    "keywords": [
        "coffee tariffs 2026",
        "coffee tariff exemption",
        "brazil coffee tariffs lifted",
        "is coffee still exempt from tariffs",
        "tariff on coffee from colombia",
        "tariffs on spices from india",
        "section 301 coffee exemption",
        "tea tariffs china",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current "
    "**2026 Revision 21** (in force October 9, 2026). No Chapter 09 base rate changed. The only line changes are statistical: on July 1, 2025 "
    "the coffee lines were split by arabica, robusta and other, which renumbered 24 lines. All of them are Free.\n\n"
    "The big changes were extra duties by country. In 2025 coffee, tea and spices paid the IEEPA reciprocal tariff, and Brazilian coffee "
    "paid **50%** from August 6. On **November 13, 2025** coffee, tea and spices were exempted from the reciprocal tariff for every country and "
    "from Brazil's 40% duty. All IEEPA tariffs **ended on February 24, 2026**. The 10% Section 122 surcharge that followed and the 2026 Section 301 "
    "tariffs both exempt every Chapter 09 line except two thyme and bay-leaf lines (0910.99.05 and 0910.99.06). Today the only broad extra "
    "duty is **China's +7.5%** (Section 301 List 4A)."
)
tu["scope"] = (
    "Measures that reach Chapter 09 from any country: the 2026 Section 301 tariffs on 60 economies and on Brazil (with the coffee, tea and spice "
    "exemption), the China Section 301 List 4A, the Nicaragua Section 301 duty scheduled for 2027, and the 2025–2026 IEEPA and Section 122 duties that "
    "have ended. For the rate each supplier pays, see Rates by country."
)

THYME = "only crude thyme and bay leaves (0910.99.05) and thyme (0910.99.06)"
EXEMPT_52B = (
    "Every other Chapter 09 line, including all coffee, tea and maté, is on the U.S. note 52(b) exemption list (9903.05.86) and pays no Section 301 duty."
)
IEEPA_END = "The 2025 IEEPA duties ended February 24, 2026; coffee, tea and spices had been exempt from the reciprocal tariff since November 13, 2025."

IN_EFFECT = {
    "co-section-301": (
        "+12.5% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} The 10% IEEPA reciprocal duty of 2025 (9903.01.25) ended February 24, 2026.",
        "Colombian coffee enters free: Free base rate, exempt from Section 301. With a Colombia TPA claim (SPI CO) the dutiable spice lines are Free too, but thyme still pays 12.5%.",
    ),
    "br-section-301": (
        "+37.5% on 2 of 91 lines",
        f"Brazil's 25% Section 301 duty (9903.05.01) exempts the same lines under U.S. note 50(a)(ii) (9903.05.03), and the 12.5% forced-labor duty (9903.05.27) under note 52(b); both apply to {THYME}. The 2025 IEEPA duties (10% reciprocal plus 40% under 9903.01.77) reached Brazilian coffee from August 6 to November 12, 2025 and ended February 24, 2026.",
        "Green coffee from Brazil pays nothing today; in fall 2025 it paid 50%. Only Brazilian thyme pays the 37.5% stack.",
    ),
    "ch-section-301": (
        "12.5% (in place of base) on 2 of 91 lines",
        f"Swiss goods pay 12.5% in total when the base rate is lower (9903.05.74), but only on {THYME[5:]}. {EXEMPT_52B} The 2025 IEEPA reciprocal duty on Switzerland ended February 24, 2026.",
        "Coffee from Switzerland enters free.",
    ),
    "vn-section-301": (
        "+12.5% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} The 20% IEEPA reciprocal rate on Vietnam (9903.02.69) ended February 24, 2026.",
        "Vietnamese robusta coffee and black pepper enter free; dried capsicum keeps its 2.5¢–5¢/kg base rate.",
    ),
    "mx-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}, and not at all to USMCA-qualifying goods (9903.05.94). {EXEMPT_52B} The 25% IEEPA duty on non-USMCA Mexican goods (9903.01.01) ended February 24, 2026.",
        "Mexican coffee and chilies enter free with a USMCA claim; without it, coffee is still free and dried capsicum pays its base rate.",
    ),
    "pe-section-301": (
        "+12.5% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} The 10% IEEPA reciprocal duty (9903.01.25) ended February 24, 2026.",
        "Peruvian coffee, paprika and ginger enter free with a Peru TPA claim (SPI PE).",
    ),
    "hn-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} {IEEPA_END}",
        "Honduran coffee enters free.",
    ),
    "gt-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} {IEEPA_END}",
        "Guatemalan coffee and cardamom enter free.",
    ),
    "id-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} The 19% IEEPA reciprocal rate on Indonesia (9903.02.27) ended February 24, 2026.",
        "Indonesian coffee, cinnamon (cassia), cloves and nutmeg enter free.",
    ),
    "ca-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}, and not at all to USMCA-qualifying goods (9903.05.93). {EXEMPT_52B} The 35% IEEPA duty on non-USMCA Canadian goods (9903.01.10) ended February 24, 2026. No Chapter 09 line is on the 2026 Canada Section 338 lists (9903.03.12–9903.03.14).",
        "Coffee roasted in Canada enters free whether or not it qualifies for USMCA.",
    ),
    "in-section-301": (
        "+10% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} India's 25% IEEPA reciprocal duty (9903.02.26) ended February 24, 2026, and the additional 25% duty (9903.01.84) ended February 7, 2026.",
        "Indian black pepper, cumin, turmeric and tea enter free; Indian thyme pays 10% on top of its 4.8% base rate.",
    ),
    "ni-section-301": (
        "+12.5% on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} A separate Nicaragua Section 301 duty (9903.89.01) starts at 10% on January 1, 2027 and 15% on January 1, 2028; it is not covered by note 52(b) but does not apply to goods entered under CAFTA-DR.",
        "Nicaraguan coffee enters free today. From 2027, claim CAFTA-DR (SPI P) to keep it free.",
    ),
    "cn-section-301": (
        "+7.5% on all 91 lines; +20% on 2",
        "Section 301 List 4A (9903.88.15) covers every Chapter 09 subheading at +7.5%; USTR kept the China actions in place on October 7, 2026. The 12.5% forced-labor duty (9903.05.31) adds to it only on 0910.99.05 and 0910.99.06; the rest of the chapter is exempt under note 52(b). The 2025 IEEPA duties on China ended February 24, 2026.",
        "Chinese ginger, cinnamon, tea and paprika pay their base rate plus 7.5%; Chinese thyme pays 4.8% + 20%.",
    ),
    "jp-section-301": (
        "12.5% (in place of base) on 2 of 91 lines",
        f"Japanese goods pay 12.5% in total when the base rate is lower (9903.05.49), but only on {THYME[5:]}. {EXEMPT_52B}",
        "Matcha and plain green tea from Japan are Free; flavored green tea pays 3.2% with the JP claim.",
    ),
    "eu-section-301": (
        "10% (in place of base) on 2 of 91 lines",
        f"EU goods pay 10% in total when the base rate is lower (9903.05.39), but only on {THYME[5:]}. {EXEMPT_52B}",
        "Spanish paprika, German roasted coffee and Italian espresso blends pay only their base rate (Free for coffee).",
    ),
    "other-section-301": (
        "+10% or +12.5% (or 10%–12.5% in place of base) on 2 of 91 lines",
        f"Applies to {THYME}. {EXEMPT_52B} Countries outside the 60 economies, such as Ethiopia, Madagascar, Sri Lanka and Uganda, pay only the base rate.",
        "For coffee, tea and almost every spice the country makes no difference today, except China.",
    ),
}
for e in tu["inEffect"]:
    now, ex, what = IN_EFFECT[e["id"]]
    e["now"], e["exemption"], e["whatItMeans"] = now, ex, what
    if e["id"] == "cn-section-301" and "fr-2026-20510" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "fr-2026-20510")
    if e["id"] in ("in-section-301",):
        e["sourceIds"] = e["sourceIds"][:-1] + ["eo-14389", "eo-14384", "hts-now"]
    if e["id"] in ("br-section-301",):
        e["sourceIds"] = e["sourceIds"][:-1] + ["eo-14323", "eo-14361", "eo-14389", "hts-now"]
    if e["id"] in ("ni-section-301",):
        e["sourceIds"] = e["sourceIds"][:-1] + ["fr-2025-22690", "fr-2025-23892", "hts-now"]

tu["stats"] = [
    {"label": "Base rates unchanged", "value": "67 of 91 lines", "note": "24 coffee lines renumbered July 1, 2025, all Free"},
    {"label": "Exempt from 2026 Section 301", "value": "89 of 91 lines"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

CHANGES_KEEP = {}
for c in tu["changes"]:
    CHANGES_KEEP[c["id"]] = c

base = CHANGES_KEEP["base-rates"]
base["title"] = "No Chapter 09 base-rate changes"
base["detail"] = (
    "Every Chapter 09 line that exists in both editions carries the same General rate in the 2026 Revision 21 as in the 2025 Basic Edition. "
    "The 24 new statistical lines are the coffee lines renumbered on July 1, 2025; all are Free."
)

s301 = CHANGES_KEEP["section-301-2026-60-economies-2026-07-24"]
s301["title"] = "Section 301 tariffs on 60 economies; coffee, tea and spices exempt"
s301["detail"] = (
    "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), including Brazil, Colombia, Vietnam, India, Indonesia, Peru and "
    "the Central American coffee producers. U.S. note 52(b) (9903.05.86) exempts every Chapter 09 line except 0910.99.05 (crude thyme and bay leaves) "
    "and 0910.99.06 (thyme). USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94)."
)
s301["now"] = "+10% / +12.5% (2 of 91 lines)"
s301["countries"] = "60 economies"

br = CHANGES_KEEP["section-301-brazil-2026-07-22"]
br["title"] = "25% Section 301 tariff on Brazil; coffee, tea and spices exempt"
br["detail"] = (
    "USTR imposed 25% on all products of Brazil (9903.05.01). U.S. note 50(a)(ii) (9903.05.03) exempts every Chapter 09 line except 0910.99.05 and "
    "0910.99.06, so Brazilian coffee, pepper and maté stay free. From July 24 those two lines also pay Brazil's 12.5% under 9903.05.27."
)
br["now"] = "+25% (2 of 91 lines)"

ni_src = next(c for k, c in CHANGES_KEEP.items() if k.startswith("section-301-nicaragua-"))["sourceIds"]  # generator id changed (#1863)
NEW_CHANGES = [
    {
        "id": "cn-301-continue", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 4A continues",
        "detail": "USTR announced that the China Section 301 actions continue during the four-year review. For Chapter 09 this keeps +7.5% (9903.88.15) on every line from China.",
        "before": "+7.5%", "now": "+7.5%", "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    s301,
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10% (2 of 91 lines)", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    br,
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs; coffee, tea and spices exempt",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. Its product exemption list (9903.03.03) carried over the agricultural exemption, covering every Chapter 09 line except 0910.99.05 and 0910.99.06. USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).",
        "before": "None", "now": "+10% on 2 of 91 lines (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-25-end", "type": "extraDuty", "date": "2026-02-07", "dateLabel": "Effective",
        "title": "Additional 25% duty on products of India ended",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) that had applied since August 27, 2025.",
        "before": "+25%", "now": "None", "countries": "India", "sourceIds": ["eo-14384", "eo-14329", "hts-now"],
    },
    {
        "id": "agoa-renewed", "type": "reference", "date": "2026-02-03", "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "AGOA was renewed retroactively from September 30, 2025, when it had lapsed. AGOA (SPI D) makes the dutiable spice and flavored-tea lines Free for eligible sub-Saharan countries. GSP (SPI A, A+, A*) remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)", "now": "In force to December 31, 2026", "countries": "AGOA beneficiary countries", "sourceIds": ["ustr-agoa-2026", "hts-now"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-29", "dateLabel": "Published",
        "title": "Nicaragua Section 301 duty scheduled for 2027 and 2028",
        "detail": "USTR set a duty on products of Nicaragua under 9903.89.01: 0% in 2026, +10% from January 1, 2027 and +15% from January 1, 2028. It reaches every Chapter 09 line (the note 52(b) exemption does not cover it) but applies only to goods not entered under CAFTA-DR, so Nicaraguan coffee claimed under CAFTA-DR (SPI P) stays free.",
        "before": None, "now": "+10% (2027), +15% (2028)", "countries": "Nicaragua", "sourceIds": ni_src,
    },
    {
        "id": "ag-exemption", "type": "extraDuty", "date": "2025-11-13", "dateLabel": "Effective",
        "title": "Coffee, tea and spices exempted from the reciprocal tariff",
        "detail": "Executive Order 14360 (signed November 14, 2025, effective for goods entered from November 13) added coffee, tea, maté and spices to the reciprocal-tariff exemption list in U.S. note 2(v)(iii) — every Chapter 09 line except 0910.99.05 and 0910.99.06 — for all countries. Duties paid from November 13 were refundable.",
        "before": "+10% or more by country", "now": "Exempt (2 lines still covered)", "countries": "All countries subject to the reciprocal tariff", "sourceIds": ["eo-14360", "hts-now"],
    },
    {
        "id": "br-coffee-exempt", "type": "extraDuty", "date": "2025-11-13", "dateLabel": "Effective",
        "title": "Brazil's 40% duty lifted from coffee and other farm goods",
        "detail": "Executive Order 14361 (signed November 20, 2025) took coffee, tea, maté and spices off Brazil's 40% IEEPA duty (9903.01.77) for goods entered from November 13, 2025. With EO 14360 removing the 10% reciprocal duty, Brazilian green coffee went from 50% to Free.",
        "before": "+50% (10% + 40%)", "now": "Free", "countries": "Brazil", "sourceIds": ["eo-14361", "eo-14360", "hts-now"],
    },
    {
        "id": "cn-ieepa-cut", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. Unlike the reciprocal tariff, it had no agricultural exemption, so it applied to Chinese ginger, tea and spices until it ended on February 24, 2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "in-25", "type": "extraDuty", "date": "2025-08-27", "dateLabel": "Effective",
        "title": "Additional 25% duty on products of India",
        "detail": "Executive Order 14329 added 25% (9903.01.84) on products of India on top of the 25% reciprocal rate. Ended February 7, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "India", "sourceIds": ["eo-14329", "eo-14384"],
    },
    {
        "id": "reciprocal-rates", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates",
        "detail": "Executive Order 14326 replaced the 10% baseline with country rates for listed countries, for example Vietnam +20% (9903.02.69), Indonesia +19% (9903.02.27) and India +25% (9903.02.26). Coffee, tea and spices were not exempt until November 13, 2025. Ended February 24, 2026.",
        "before": "+10%", "now": "+10% to +25% (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "br-40", "type": "extraDuty", "date": "2025-08-06", "dateLabel": "Effective",
        "title": "40% duty on products of Brazil, coffee included",
        "detail": "Executive Order 14323 (signed July 30, 2025) added 40% on products of Brazil (9903.01.77) on top of the 10% reciprocal duty. Its exemption list did not include coffee, so Brazilian green coffee paid 50% until November 13, 2025. Ended February 24, 2026.",
        "before": "+10%", "now": "+50% (ended)", "countries": "Brazil", "sourceIds": ["eo-14323", "eo-14361"],
    },
    {
        "id": "coffee-stat-lines", "type": "reference", "date": "2025-07-01", "dateLabel": "Effective",
        "title": "Coffee statistical lines split by arabica, robusta and other",
        "detail": "HTS 2025 Revision 16 discontinued the old 0901.11–0901.22 statistical suffixes and set up new ones for arabica, robusta and other coffee, each with a certified-organic line. Rates did not change; all are Free.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-2025-rev16-cr"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-05", "dateLabel": "Effective",
        "title": "Reciprocal tariff reaches coffee, tea and spices",
        "detail": "10% baseline on products of all countries (9903.01.25), with no exemption for Chapter 09 at first; Canada and Mexico were excluded. Coffee, tea and spices were exempted on November 13, 2025, and the tariff ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-ieepa", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top of the 7.5% List 4A duty.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14195", "eo-14228"],
    },
    {
        "id": "ca-mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duties on products of Canada and Mexico",
        "detail": "+25% on non-USMCA goods of Canada (9903.01.10, raised to +35% from August 1, 2025) and Mexico (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
        "before": "None", "now": "+25% / +35% (ended)", "countries": "Canada, Mexico", "sourceIds": ["eo-14193", "eo-14194", "eo-14325"],
    },
]
base_change = base
NEW_CHANGES.insert(0, base_change)
tu["changes"] = sorted(NEW_CHANGES, key=lambda c: c["date"], reverse=True)

# ======================================================================== understand industry
ui["h1"] = "HTS Chapter 09: Coffee, tea, maté and spices — U.S. Import Statistics"
ui["seo"] = {
    "title": "HTS Chapter 09 Coffee, Tea & Spice Import Statistics by Country & Product | KoalaGains",
    "shortDescription": "U.S. imports of coffee, tea, maté and spices 2020–2025 by country, product and year: $15.51B in 2025, up 32.5%, led by Colombian and Brazilian coffee, Vietnamese pepper and Japanese tea.",
    "keywords": [
        "where does the us import coffee from",
        "US coffee imports by country",
        "coffee imports Colombia Brazil",
        "US spice imports by country",
        "US tea imports",
        "HTS Chapter 09 import statistics",
    ],
}
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = NO_DUTY_DATA + " 72 of the 91 Chapter 09 lines are Free at the base rate, so the duty paid is a very small share of the value."
ui["why"] = (
    "U.S. imports of Chapter 09 goods rose from **$11.70B in 2024 to $15.51B in 2025** (+32.5%). Coffee (heading 0901) explains almost all of it: "
    "$8.99B to $12.80B, and green coffee alone (0901.11) rose 55.5% to $9.83B. Comtrade values measure dollars, not tonnes, so the rise mixes higher "
    "coffee prices with volume.\n\n"
    "The supplier mix moved too. Imports from **Colombia** rose 81.5% to $2.76B and passed **Brazil** ($2.56B, +24.4%). From August 6 to "
    "November 12, 2025 Brazilian coffee paid a 50% IEEPA duty, while Colombian coffee paid 10% and, like all coffee, nothing from November 13. "
    "Honduras (+75.2%), Mexico (+56.6%) and Peru (+54.5%) also grew fast; imports from Canada fell 16.2%.\n\n"
    "Outside coffee the chapter is spread thin: pepper and capsicum $1.15B (Vietnam 39%), tea $620M (Japan 31%), ginger, turmeric and other "
    "0910 spices $458M (India, China, Peru), cinnamon $169M (Indonesia, Vietnam, Sri Lanka) and vanilla $101M (Madagascar 70%). "
    "2025 is the latest full year of U.S. trade data."
)
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty paid is not part of the Comtrade data."
ui["sources"] = ui["sources"] + [
    {"label": "Federal Register 90 FR 37739 (Executive Order 14323, 40% duty on products of Brazil)", "url": "https://www.federalregister.gov/documents/2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"},
    {"label": "Federal Register 90 FR 54091 (Executive Order 14360, agricultural exemption from the reciprocal tariff)", "url": "https://www.federalregister.gov/documents/2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products"},
]

# ======================================================================== industry areas
ia["seo"] = {
    "title": "Coffee, Tea & Spice Tariff Rates by Country — Brazil, Colombia, Vietnam, India, China (HTS Ch. 09) | KoalaGains",
    "shortDescription": "The total U.S. tariff on coffee, tea, maté and spices by country and product group: base rate plus the 2026 Section 301 duty, with the coffee and spice exemption and FTA claims applied. Brazil, Colombia, Vietnam, Mexico, India, China, Japan and more.",
    "keywords": [
        "coffee tariffs by country",
        "tariff on coffee from brazil",
        "tariff on coffee from colombia",
        "tariff on coffee from vietnam",
        "us tariff on indian spices",
        "tariff on tea from china",
        "tariff on matcha from japan",
    ],
}
ia["intro"] = (
    "For Chapter 09 the country matters much less than for most chapters. Each cell below is the base rate for that product group plus the "
    "extra duty for that country, minus any preference, from the current tariff schedule.\n\n"
    "The 2026 Section 301 tariffs on 60 economies and on Brazil exempt **every Chapter 09 line except crude thyme and bay leaves (0910.99.05) and "
    "thyme (0910.99.06)**, so **coffee, tea, maté and nearly all spices pay only their base rate** — Free for most lines — from Brazil, Colombia, "
    "Vietnam, Switzerland or anywhere else. The exception is **China**, where Section 301 List 4A adds **7.5%** to every line. The extra "
    "duties show up only in the 0910 column, on those two thyme and bay-leaf lines."
)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "U.S. note 52(b) (9903.05.86) and, for Brazil, note 50(a)(ii) (9903.05.03) are applied: 89 of 91 Chapter 09 lines pay no 2026 Section 301 duty. 0910.99.05 and 0910.99.06 are not on either list.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "The Nicaragua duty under 9903.89.01 starts January 1, 2027 and is not applied; it does not reach goods entered under CAFTA-DR.",
    "The rate is not the only gate: FDA prior notice and import alerts (Salmonella in spices, lead in ground cinnamon) can stop a shipment whatever the tariff.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 20, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. The Section 301 general exemption list (note 52(b), "
    "9903.05.86) and the Brazil exemption list (note 50(a)(ii), 9903.05.03) name every Chapter 09 subheading except 0910.99.05 and 0910.99.06. "
    "The same two are missing from the Section 122 exemption list (9903.03.03) and the reciprocal-tariff agricultural list (note 2(v)(iii)). All Chapter 09 "
    "subheadings, including the two thyme lines, are on China List 4A (note 20(s)(i)). No Chapter 09 line is on the Canada Section 338 lists (note 51)."
)
RULE_LABELS = {
    "Colombia": "Base rate only: every Chapter 09 line except 0910.99.05 and 0910.99.06 is exempt from Section 301 (9903.05.86); those two pay +12.5% (9903.05.32). Colombia TPA claim (SPI CO) applied, which makes the dutiable lines Free. The 10% IEEPA reciprocal duty ended February 24, 2026.",
    "Brazil": "Base rate only on 89 of 91 lines: exempt from Brazil's 25% (9903.05.03) and the 12.5% forced-labor duty (9903.05.86). 0910.99.05 and 0910.99.06 pay +37.5% (9903.05.01 + 9903.05.27). The 50% IEEPA duties on Brazilian coffee ended November 13, 2025.",
    "Switzerland": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay 12.5% in place of the base rate (9903.05.74).",
    "Vietnam": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +12.5% (9903.05.84). The 20% IEEPA reciprocal rate ended February 24, 2026.",
    "Mexico": "USMCA-qualifying: free, no extra duty (9903.05.94). Otherwise the base rate, plus 10% (9903.05.55) on 0910.99.05 and 0910.99.06 only. The 25% IEEPA duty ended February 24, 2026.",
    "Peru": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +12.5% (9903.05.63). Peru TPA claim (SPI PE) applied, which makes the dutiable lines Free.",
    "Honduras": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +10% (9903.05.42). CAFTA-DR claim (SPI P) applied.",
    "Guatemala": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +10% (9903.05.40). CAFTA-DR claim (SPI P) applied.",
    "Indonesia": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +10% (9903.05.45). The 19% IEEPA reciprocal rate ended February 24, 2026.",
    "Canada": "USMCA-qualifying: free, no extra duty (9903.05.93). Otherwise the base rate, plus 10% (9903.05.29) on 0910.99.05 and 0910.99.06 only. The 35% IEEPA duty ended February 24, 2026.",
    "India": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +10% (9903.05.44). India's 25% reciprocal and 25% additional IEEPA duties have ended.",
    "Nicaragua": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay +12.5% (9903.05.58). CAFTA-DR claim (SPI P) applied. From January 1, 2027 non-CAFTA-DR goods also pay +10% (9903.89.01).",
    "Ethiopia": "Base rate only. Ethiopia is not one of the 60 economies in the 2026 Section 301 action, and the 10% IEEPA reciprocal duty ended February 24, 2026.",
    "China": "Base rate + 7.5% Section 301 List 4A (9903.88.15) on every line. 0910.99.05 and 0910.99.06 also pay +12.5% (9903.05.31): +20% in total. The 2025 IEEPA duties on China ended February 24, 2026.",
    "Japan": "Base rate only on 89 of 91 lines (9903.05.86); 0910.99.05 and 0910.99.06 pay 12.5% in place of the base rate (9903.05.49). Japan agreement rate (SPI JP) applied: flavored green tea 3.2%.",
    "Any other country": "Countries outside the 60 Section 301 economies (for example Ethiopia, Madagascar, Sri Lanka, Uganda) pay only the base rate. The 60 pay +10% or +12.5% only on 0910.99.05 and 0910.99.06 (9903.05.20–9903.05.84); China adds 7.5% on every line.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]

# ======================================================================== tariff engineering
te["seo"] = {
    "title": "Importing Coffee, Tea & Spices: FDA Rules, Documents & Legal Ways to Lower Duty (HTS Ch. 09) | KoalaGains",
    "shortDescription": "The FDA, USDA and CBP rules for each HTS Chapter 09 line — prior notice, FSVP, spice import alerts, organic certificates, APHIS coffee and khapra rules — and the legal ways to pay less: the Section 301 exemption, FTA and AGOA claims, drawback.",
    "keywords": [
        "coffee import requirements",
        "coffee import regulations us",
        "how to import coffee beans to usa",
        "importing roasted coffee into us",
        "import spices into us fda",
        "do you need a license to import coffee",
    ],
}
te["intro"] = (
    "Coffee, tea and spices are food, so **FDA rules decide whether a shipment is released**: prior notice before arrival, a registered foreign "
    "facility, a Foreign Supplier Verification Program, and import alerts that detain spices from listed firms for Salmonella or lead. USDA adds "
    "a few plant-health rules, and organic goods need an NOP Import Certificate. No import license is needed for coffee, tea or spices.\n\n"
    "Most lines are already Free, so the ways to pay less are narrow: make sure the **Section 301 exemption** (9903.05.86) is reported, claim an "
    "FTA, USMCA or AGOA on the 19 dutiable lines, and choose the form (whole or crude) that carries the lower rate where that is an option."
)
te["regulationsAsOf"] = "2026-10-08"
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. FDA import alerts change often; check the current "
    "alert and your supplier's status before each shipment."
)

# ======================================================================== final conclusion
fc["seo"] = {
    "title": "Coffee, Tea & Spice Tariffs FAQ: Brazil, Colombia, India, Matcha, HS Codes (HTS Ch. 09) | KoalaGains",
    "shortDescription": "Answers to what people search about coffee, tea and spice tariffs: is coffee exempt, Brazil and Colombia coffee tariffs, Indian spices, matcha from Japan, tea from China, HS codes for green coffee, tea and spices.",
    "keywords": [
        "is coffee exempt from tariffs",
        "is coffee still exempt from tariffs",
        "coffee tariff brazil",
        "brazil coffee tariffs lifted",
        "tariff on coffee from colombia",
        "tariff on spices from india to usa",
        "tariff on matcha from japan",
        "tariff on tea from china",
        "hs code for green coffee beans",
        "hts code for tea",
        "hs code for spices",
        "is there a tariff on vanilla",
    ],
}
fc["intro"] = (
    "Straight answers to the most common questions about U.S. tariffs on coffee, tea and spices — by country, HS codes and import rules. "
    "Each answer links to the page with the full detail."
)
fc["keyTakeaways"] = [
    "Coffee, tea, maté and almost all spices pay no extra U.S. tariff today: the 2026 Section 301 tariffs exempt every Chapter 09 line except two thyme and bay-leaf lines.",
    "Brazilian coffee paid 50% from August 6 to November 12, 2025; since November 13, 2025 it has been free, and all IEEPA tariffs ended on February 24, 2026.",
    "China is the exception: +7.5% (Section 301 List 4A) on every Chapter 09 line. From 2027, Nicaraguan goods not entered under CAFTA-DR pay +10%.",
    "For spices, FDA import alerts (Salmonella, lead in ground cinnamon) decide more shipments than the tariff does.",
]
fc["questionSource"] = "Google search suggestions, collected October 11, 2026"
fc["faqs"] = [
    {
        "id": "coffee-exempt",
        "question": "Is coffee exempt from tariffs?",
        "searchedAs": ["is coffee exempt from tariffs", "is coffee still exempt from tariffs", "is coffee exempt from us tariffs", "are coffee beans exempt from tariffs", "is green coffee exempt from tariffs"],
        "answer": "Yes, from every country except China. Coffee has a Free base rate, and every coffee line is on the U.S. note 52(b) exemption list (9903.05.86), so the 10%–12.5% Section 301 tariffs that started July 24, 2026 do not apply. Coffee from China pays 7.5% under Section 301 List 4A. The 2025 IEEPA tariffs, from which coffee was exempted on November 13, 2025, ended on February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "brazil-coffee",
        "question": "What is the tariff on coffee from Brazil?",
        "searchedAs": ["coffee tariff brazil", "tariff on coffee brazil", "brazil coffee tariffs lifted", "is brazilian coffee exempt from tariffs", "coffee tariff exemption brazil"],
        "answer": "Zero. Green and roasted coffee are Free, and Brazil's 25% Section 301 tariff (9903.05.01) and its 12.5% forced-labor tariff exempt coffee (9903.05.03, 9903.05.86). From August 6 to November 12, 2025 Brazilian coffee paid 50% (10% reciprocal plus 40% under Executive Order 14323); Executive Orders 14360 and 14361 removed both for coffee from November 13, 2025. The U.S. imported $2.52B of coffee from Brazil in 2025.",
        "link": "industry-areas",
    },
    {
        "id": "colombia-coffee",
        "question": "Are there tariffs on coffee from Colombia?",
        "searchedAs": ["tariff on coffee from colombia", "colombian coffee tariff", "are there tariffs on coffee from colombia", "what is the current tariff on coffee from colombia"],
        "answer": "No. Coffee is Free, and Colombia's 12.5% Section 301 tariff (9903.05.32) does not apply to coffee (9903.05.86). The 10% reciprocal tariff of 2025 stopped applying to coffee on November 13, 2025 and ended on February 24, 2026. Colombia was the largest supplier of Chapter 09 goods in 2025, with $2.76B.",
        "link": "industry-areas",
    },
    {
        "id": "vietnam-coffee",
        "question": "What is the tariff on coffee and pepper from Vietnam?",
        "searchedAs": ["tariff on coffee from vietnam", "coffee tariffs brazil vietnam colombia", "how to import coffee from vietnam"],
        "answer": "None on coffee or black pepper: both are Free and exempt from Vietnam's 12.5% Section 301 tariff (9903.05.84). Dried chilies and paprika keep their 2.5¢–5¢/kg base rate. The 20% reciprocal rate on Vietnam ended on February 24, 2026. Vietnam supplied $1.11B of Chapter 09 goods in 2025, including 39% of U.S. pepper and capsicum imports.",
        "link": "industry-areas",
    },
    {
        "id": "india-spices",
        "question": "What is the U.S. tariff on spices from India?",
        "searchedAs": ["tariff on spices from india to usa", "tariffs on spices from india", "us tariff on indian spices", "indian spices tariff", "trump tariff on spices"],
        "answer": "Only the base rate, which is Free for black pepper, cumin, turmeric, cardamom and most other spices. India's 10% Section 301 tariff (9903.05.44) applies only to thyme and bay leaves (0910.99.05, 0910.99.06). The 2025 IEEPA duties on India — 25% reciprocal plus an additional 25% — ended in February 2026. Indian spices still need FDA prior notice, and Indian black pepper falls under FDA Import Alert 28-02, which requires an Export Inspection Council certificate for each lot.",
        "link": "industry-areas",
    },
    {
        "id": "japan-matcha",
        "question": "Is there a tariff on matcha or tea from Japan?",
        "searchedAs": ["tariff on matcha", "tariff on matcha from japan", "is there a tariff on matcha", "tariff on japanese tea", "us tariffs on japanese tea", "tea tariff japan"],
        "answer": "Plain green tea and matcha (0902.10.90, 0902.20.90) are Free. Flavored green tea is 6.4%, or 3.2% with a Japan agreement claim. Japan's 12.5% Section 301 rate does not apply to tea (9903.05.86). Japan supplied $190M of tea in 2025, 31% of U.S. tea imports.",
        "link": "industry-areas",
    },
    {
        "id": "china-tea",
        "question": "What is the tariff on tea and spices from China?",
        "searchedAs": ["tariff on tea from china", "tea tariffs china"],
        "answer": "The base rate plus 7.5%. Section 301 List 4A (9903.88.15) covers every Chapter 09 line from China, and USTR kept it in place on October 7, 2026. Plain tea is Free at base, so it pays 7.5%; flavored green tea pays 6.4% + 7.5% = 13.9%; thyme pays 4.8% + 20%. The 2025 IEEPA duties on China ended on February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "canada-coffee",
        "question": "Is there a tariff on coffee from Canada?",
        "searchedAs": ["tariff on coffee canada", "coffee tariffs canada", "tariff on tea from canada"],
        "answer": "No. Coffee and tea are Free, and they are exempt from the 10% Section 301 tariff on Canadian goods whether or not they qualify for USMCA. No Chapter 09 line is on the 2026 Canada Section 338 lists. The 35% IEEPA duty on non-USMCA Canadian goods ended on February 24, 2026.",
        "link": "industry-areas",
    },
    {
        "id": "vanilla-cinnamon",
        "question": "Is there a tariff on vanilla, cinnamon or black pepper?",
        "searchedAs": ["tariff on vanilla", "tariff on vanilla beans", "tariff on madagascar vanilla", "is there a tariff on vanilla", "tariff on cinnamon", "is there a tariff on cinnamon", "is there a tariff on black pepper"],
        "answer": "Vanilla, cinnamon and black pepper are Free, whole or ground, and exempt from the 2026 Section 301 tariffs. Madagascar, which supplied 70% of U.S. vanilla imports in 2025, is not one of the 60 economies anyway. Only goods from China pay extra (+7.5%). Ground cinnamon from firms on FDA Import Alert 99-42 is detained for lead.",
        "link": "",
    },
    {
        "id": "hs-coffee",
        "question": "What is the HTS code for green coffee beans?",
        "searchedAs": ["hts code for green coffee beans", "hs code for green coffee beans", "hs code green bean coffee arabica", "hs code green bean coffee robusta", "green coffee hs code", "coffee beans hs code"],
        "answer": "Green (not roasted) coffee is 0901.11 if not decaffeinated and 0901.12 if decaffeinated. The 10-digit lines are split by type: 0901.11.00.15 (arabica, certified organic), 0901.11.00.25 (arabica, other), 0901.11.00.35 and .40 (robusta), 0901.11.00.50 and .65 (other). Roasted coffee is 0901.21 and 0901.22. All are Free.",
        "link": "",
    },
    {
        "id": "hs-tea",
        "question": "What is the HTS code for tea and tea bags?",
        "searchedAs": ["hts code for tea", "hts code for tea bags", "harmonized tariff code for tea", "hs code for tea", "hs code for tea bags", "hs code for tea leaves"],
        "answer": "Green tea is 0902.10 in packings of 3 kg or less and 0902.20 in larger packings; black and partly fermented (oolong) tea is 0902.30 in packings of 3 kg or less and 0902.40 otherwise. Black tea in tea bags is 0902.30.00.15 (organic) or 0902.30.00.50. Herbal infusions without tea leaves are not in Chapter 09.",
        "link": "",
    },
    {
        "id": "hs-spices",
        "question": "What is the HTS code for spices and spice powders?",
        "searchedAs": ["hs code for spices", "hs code for spices powder", "hs code for spices masala", "hs code for spices chili powder", "us hts code for spices", "seasoning hs code"],
        "answer": "Each spice has its own heading, whole or ground: pepper and chili 0904, vanilla 0905, cinnamon 0906, cloves 0907, nutmeg and cardamom 0908, seeds such as cumin and coriander 0909, ginger, turmeric, curry and thyme 0910. Mixtures of spices from different headings are 0910.91 (1.9%). Mixed seasonings that lose the character of spices, such as many masalas with salt or other ingredients, go to heading 2103 (Chapter 09 note 1).",
        "link": "",
    },
    {
        "id": "import-coffee",
        "question": "Do you need a license to import coffee into the U.S.?",
        "searchedAs": ["do you need a license to import coffee", "coffee import requirements", "coffee import regulations us", "importing coffee into the us", "how to import coffee beans to usa", "importing roasted coffee into us"],
        "answer": "No import license is needed. FDA requires prior notice of each shipment before arrival, a registered foreign facility (roaster, packer or warehouse) and a Foreign Supplier Verification Program kept by the U.S. importer. Organic coffee needs an NOP Import Certificate, and unroasted coffee may not be shipped into Hawaii or Puerto Rico.",
        "link": "tariff-engineering",
    },
]
