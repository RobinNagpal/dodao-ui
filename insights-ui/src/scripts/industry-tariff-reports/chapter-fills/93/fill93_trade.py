# Trade-dependent text and FAQ for Chapter 93 (exec'd by fill93.py with d, ov, ia, LABELS, money in scope).
# Figures checked against src/tariff-data/trade/chapter-93.json (UN Comtrade, retrieved 2026-10-13); the asserts stop a
# re-run on changed data.
SHORT = {"Other Asia, nes": "Taiwan", "Rep. of Korea": "South Korea", "Russian Federation": "Russia"}


def nm(c):
    return SHORT.get(c, c)


ui = d["understandIndustry"]
ly = ui["latestYear"]
bc = ui["byCountry"]
BYC = {c["country"]: c for c in bc}
total = ov["tradeSnapshot"]["totalImportsUsd"]
assert ly == 2025 and round(total / 1e6, 1) == 3858.4, total
assert round(BYC["Türkiye"]["importsUsd"] / 1e6, 1) == 418.7
assert round(BYC["Italy"]["importsUsd"] / 1e6, 1) == 366.4

ui["h1"] = "HTS Chapter 93: Firearms, Gun Parts & Ammunition — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 93 Import Statistics: Firearms & Ammunition from Türkiye, the UK, Italy, Germany, Austria | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of firearms, gun parts and ammunition 2020–{ly}, by country, product and year: {money(total)} in {ly}, down "
    "13.3%; Türkiye, the UK, Italy, Germany and Austria supplied 45%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 93 import statistics",
    "us firearms imports by country",
    "ammunition imports by country",
    "hts 9306 ammunition trade impact",
    "civilian firearms customs duty",
    "military weapons import duty rates",
]
for c in bc:
    if c["country"] in SHORT:
        c["country"] = nm(c["country"])
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][1]
for c in ui["byHeadingCountry"]:
    if c["country"] in SHORT:
        c["country"] = nm(c["country"])
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearCaption"] = (
    f"U.S. imports of Chapter 93 goods each year, split into the two largest {ly} suppliers ({ui['byYearPartners'][0]} and "
    f"{ui['byYearPartners'][1]}) and everyone else."
)
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
for x in ui["byLine"]:
    if "searchText" in x:
        x["searchText"] = f"{x['hs6'].replace('.', '')} {x['hs6']} {x['description'].lower()} {LABELS[x['heading']][0].lower()}"

ui["why"] = (
    "U.S. imports of Chapter 93 goods fell from **$4.45B in 2024 to $3.86B in 2025** (−13.3%), below every year since 2020 "
    "and well under the 2021 peak of $5.57B. **Ammunition is the largest group** at $1.34B (35%): other ammunition and parts "
    "(9306.90, $759M, +16%), rifle and pistol cartridges (9306.30, $468M, down from $827M) and shotgun cartridges ($71M). "
    "**Pistols and revolvers** were $660M (−19%), **sporting shotguns** $347M and **rifles** $254M. **Gun parts** were $1.02B — "
    "parts of military weapons $363M, of shotguns and rifles $319M, of pistols $268M — and air guns $171M.\n\n"
    "Supply is spread out. **Türkiye** led with $419M (shotguns and rifles $156M, pistols $118M, ammunition $88M), then the **UK** $389M "
    "(ammunition $195M, parts $159M), **Italy** $366M (−23%, mostly shotguns and rifles), **Germany** $318M (ammunition $161M), "
    "**Austria** $249M (pistols $189M), **Canada** $247M (ammunition $154M) and **Brazil** $203M (−37%). Croatia ($102M) ships "
    "almost only pistols and Czechia ($137M) pistols and ammunition; Taiwan and China ship mostly air guns and parts. Imports from **Russia** fell from $183M in "
    "2021 to $66M in 2022 and under $0.3M a year since; ATF has had to deny permits for Russian firearms and ammunition since "
    "September 7, 2021.\n\n"
    "Through 2025 most of these goods paid the IEEPA duties — 15% in total for EU goods, 15% more for Türkiye and Israel, "
    "50% more for Brazil from August 6 — while USMCA-qualifying goods from Canada and Mexico paid nothing extra. Those "
    "duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies instead. 2025 is the "
    "latest full year of U.S. trade data."
)

ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": nm(c["country"]), "importsUsd": c["importsUsd"]} for c in bc[:5]]
ts["source"] = f"UN Comtrade, United States imports, HS chapter 93 ({ly})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; Comtrade does not split 9306.30 or 9305.20 into the 8- and 10-digit U.S. lines, so this page does not say which of "
    "them each country ships."
)
ts["biggestLines"] = [
    {"hts": "9306.90", "label": "Other ammunition, projectiles and parts"},
    {"hts": "9302.00", "label": "Revolvers and pistols"},
    {"hts": "9306.30", "label": "Rifle and pistol cartridges and parts"},
    {"hts": "9305.91", "label": "Parts of military weapons"},
]

ov["intro"] = (
    "Chapter 93 covers **firearms** — pistols and revolvers, sporting shotguns and rifles, military weapons — **air guns, "
    "airsoft guns and paintball markers**, **gun parts and accessories**, **ammunition** of every kind, and **swords and "
    "bayonets**. Its **67 tariff lines** are mostly low: all ammunition and most military weapons are Free, shotguns pay 2.6%, "
    "pistols 14¢ each + 3%. **Rifles entered with a telescopic sight** pay a two-part rate — for example 3.1% on the value of "
    "the rifle + 13% on the value of the sight — so the importer declares both values.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff** on "
    "every line, with no exemption list for this chapter: **EU goods pay 10% in total**, Türkiye the base rate plus 12.5%, the "
    "UK plus 10%, **Brazil plus 37.5%** and China plus 20%; **USMCA-qualifying goods from Canada and Mexico enter free**. Every "
    "firearm and cartridge also needs an **ATF import permit**, and **Russian firearms and ammunition are denied**. U.S. imports "
    f"were **{money(total)} in {ly}**, led by Türkiye, the UK, Italy and Germany."
)

fc = d["finalConclusion"]
fc["keyTakeaways"] = [
    "Chapter 93 base rates are low and unchanged since January 2025: ammunition and most military weapons Free, shotguns 2.6%, pistols 14¢ each + 3%, rifles 3.1%–4.7% on the rifle plus 10%–20% on any telescopic sight.",
    "Since July 24, 2026 every line pays the Section 301 tariff on 60 economies with no exemption list for this chapter: EU goods 10% in total, Türkiye the base rate plus 12.5%, the UK plus 10%, Brazil plus 37.5% (25% + 12.5%), China plus 20% (with List 4A).",
    "USMCA-qualifying goods from Canada and Mexico enter free; no Chapter 93 line is on the Canada Section 338 lists. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Every firearm, firearm barrel and cartridge needs an ATF import permit (Form 6, released with Form 6A), and ATF must deny permits for Russian firearms and ammunition — a restriction the tariff calculator does not model.",
    "U.S. imports were $3.86B in 2025 (−13.3%), led by Türkiye, the UK, Italy, Germany and Austria; the importer also owes the 10% or 11% federal excise tax on its sale of firearms and cartridges.",
]
fc["faqs"] = [
    {
        "id": "what-is-ch93",
        "question": "What does HTS Chapter 93 cover?",
        "searchedAs": ["hts chapter 93", "htsus chapter 93", "hs code 93", "arms and ammunition; parts and accessories thereof tariff"],
        "answer": "Arms and ammunition: military weapons (9301), revolvers and pistols (9302), sporting shotguns, rifles and other firearms (9303), air guns and other arms (9304), parts and accessories (9305), ammunition and munitions (9306), and swords and bayonets (9307) — 67 tariff lines. Percussion caps and flares (chapter 36), telescopic sights entered alone (chapter 90), bows and toys (chapter 95) and antiques (9705/9706) are classified elsewhere.",
        "link": "",
    },
    {
        "id": "hs-firearms",
        "question": "What is the HS code for firearms — pistols, rifles and shotguns?",
        "searchedAs": ["hs code for firearms", "hs code for guns", "hs code for weapons", "hs code for pistol", "hs code for rifle", "hunting rifles hs code", "hs code for shotgun", "hs code 9303"],
        "answer": "Pistols and revolvers are 9302.00.00 (14¢ each + 3%). Sporting and hunting shotguns are 9303.20.00 (2.6%) and sporting rifles 9303.30 (3.8% or 3.1% on the rifle plus 10% or 13% on any scope). Muzzle-loaders are 9303.10 (Free), and military rifles, shotguns and machine guns 9301.90.",
        "link": "",
    },
    {
        "id": "hs-ammo",
        "question": "What is the HS code for ammunition and cartridges?",
        "searchedAs": ["hs code for ammunition", "hs code for cartridge", "hs code for bullets", "shotgun cartridges hs code", "hs code 9306", "hs code 9306.30", "hs code 9306.90", "hs code 9306.29"],
        "answer": "Heading 9306, all Free at the base rate: shotgun cartridges 9306.21, their parts and air gun pellets 9306.29, rifle and pistol cartridges and empty cases 9306.30.41 (.22 caliber under suffix 10), other cartridge parts 9306.30.80, and bombs, grenades, missiles, other projectiles and plastic BBs 9306.90 (NY N146796). The duty is the country's extra duty: 10% from the UK or the EU, 12.5% from Türkiye, 37.5% from Brazil.",
        "link": "",
    },
    {
        "id": "hs-parts",
        "question": "What is the HS code for gun parts and accessories?",
        "searchedAs": ["hs code for gun parts", "hs code gun accessories", "shotgun barrels hs code", "hs code 9305", "hs code 9305.99", "hs code 9305.10"],
        "answer": "Heading 9305. Pistol parts are 9305.10 — frames, receivers and other parts of 9302 pistols 4.2%. Shotgun and rifle parts are 9305.20 — rifle stocks 3.5%, shotgun barrels and other parts Free. Parts of military weapons (9305.91) are Free; parts of air guns 3.9% and other parts 2.9% (9305.99). Screws, springs and other parts of general use are classified by their material (chapter note 1(b)).",
        "link": "",
    },
    {
        "id": "rifle-scope",
        "question": "What is the HS code for a rifle scope, and how is a rifle with a scope taxed?",
        "searchedAs": ["hs code for rifle scope", "telescopic sight import duty"],
        "answer": "A scope imported on its own is 9013.10.10 (14.9%; NY N360004). A scope mounted on the rifle or entered with it stays with the rifle: the rifle line charges, for example, 3.1% on the rifle's value + 13% on the sight's value (9303.30.80). The importer reports the two values under separate statistical suffixes, and they must add up to the article's value (statistical note 1).",
        "link": "tariff-engineering",
    },
    {
        "id": "air-guns",
        "question": "What is the HS code for air guns, airsoft guns and paintball markers?",
        "searchedAs": ["hs code for air gun", "hs code for air rifle", "hs code for pellet gun", "hs code for airsoft guns", "hs code for airsoft parts", "hs code for paintball gun", "hs code for paintball marker", "hs code 9304"],
        "answer": "Spring, air and gas guns are 9304.00: rifles 9304.00.20 (3.9%; an airsoft rifle, NY N149835), other air guns 9304.00.40 (Free; airsoft pistols and shotguns, NY N140515; paintball markers, NY N095195). Their parts are 9305.99.50 (3.9%), pellets 9306.29 and plastic BBs and paintballs 9306.90.",
        "link": "",
    },
    {
        "id": "sword",
        "question": "What is the HS code for a sword?",
        "searchedAs": ["hs code for sword", "hs code decorative sword", "hs code 9307"],
        "answer": "Swords, cutlasses, bayonets, lances, their parts, scabbards and sheaths are 9307.00.00 at 2.7% (karate sai, NY N304308). Toy swords are chapter 95 goods, and a wooden martial arts training sword was classified in 9506.99.60 (NY N326170). From China a sword pays 22.7% in total.",
        "link": "",
    },
    {
        "id": "tariffs",
        "question": "Are there tariffs on guns and ammunition in 2026?",
        "searchedAs": ["tariffs on guns and ammo", "are there tariffs on ammunition", "tariffs on firearms", "us tariffs on firearms", "are there tariffs on firearms", "tariff on guns", "ammunition import duty 2026"],
        "answer": "Yes. Since July 24, 2026 the Section 301 tariff on 60 economies reaches every Chapter 93 line, with no exemption list: 10% in total for EU and Taiwanese goods, 12.5% in total for Japan and South Korea, the base rate plus 12.5% for Türkiye and Israel, plus 10% for the UK, plus 37.5% for Brazil and plus 20% for China. USMCA-qualifying goods from Canada and Mexico are exempt. The IEEPA tariffs ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "by-country",
        "question": "What do firearms and ammunition from Türkiye, Italy, Austria, Brazil and Canada pay?",
        "searchedAs": ["turkey arms import duty rates", "italian firearms import duty rates", "italy civilian shotguns import duty", "turkish shotgun customs duty", "turkey 9mm ammunition tariff", "brazil ammunition tariffs", "tariffs on firearms canada"],
        "answer": "Turkish shotguns 15.1%, pistols 14¢ each + 15.5%, 9mm ammunition 12.5%. Italian shotguns and Austrian pistols 10% in total. Brazilian pistols 14¢ each + 40.5%, ammunition 37.5%. Canadian goods: free with a USMCA claim, otherwise the base rate plus 10%.",
        "link": "industry-areas",
    },
    {
        "id": "atf-form-6",
        "question": "Do I need an ATF Form 6 to import firearms or ammunition?",
        "searchedAs": ["atf form 6", "atf form 6a", "atf form 6 part 1", "atf form 6 instructions", "importing firearms into the us", "can you import firearms into the us", "importing a gun into the us"],
        "answer": "Yes, for firearms, firearm barrels, ammunition and most parts on the U.S. Munitions Import List: ATF must approve a Form 6 (Part I) application, and the approved form is the permit. At release from CBP the permit holder files Form 6A. Only a licensed importer may import firearms or ammunition as a business, and ATF can approve only what 18 U.S.C. 925(d) allows, such as firearms particularly suitable for sporting purposes.",
        "link": "tariff-engineering",
    },
    {
        "id": "bring-back",
        "question": "Can I bring my own firearm back into the U.S. after a trip abroad?",
        "searchedAs": ["bringing firearms into the us", "bringing firearms into the us from canada", "atf form 6 temporary importation of firearms"],
        "answer": "Yes, if you can show CBP that you took it out of the United States: register it on CBP Form 4457 before departure, or keep a bill of sale or other document showing you acquired it in the U.S. (27 CFR 478.115(a)). No import permit is needed for that firearm.",
        "link": "tariff-engineering",
    },
    {
        "id": "excise",
        "question": "What is the federal excise tax on firearms and ammunition?",
        "searchedAs": ["federal excise tax on firearms and ammunition", "firearms excise tax", "federal firearms excise tax", "federal excise tax on ammunition", "firearms ammunition excise tax"],
        "answer": "10% of the sale price for pistols and revolvers and 11% for other firearms and for shells and cartridges (26 U.S.C. 4181), owed by the manufacturer, producer or importer on its sale. Makers and importers of fewer than 50 firearms a year in all are exempt for firearms, and sales to the military are exempt. It is a tax, not a customs duty.",
        "link": "tariff-engineering",
    },
    {
        "id": "russia",
        "question": "Is Russian ammunition banned from import?",
        "searchedAs": ["russian ammo import ban", "russian firearm import ban", "is russian ammo still being imported"],
        "answer": "Yes. Since September 7, 2021 ATF must deny permits to permanently import firearms and ammunition manufactured or located in Russia, under a State Department sanction, and ATF's regulation already barred most Russian firearms (27 CFR 447.52). U.S. imports from Russia fell from $183M in 2021 to under $0.3M a year since 2023. ATF proposed in May 2026 to keep Russia on its list while dropping other former Soviet states.",
        "link": "tariff-updates",
    },
    {
        "id": "itar",
        "question": "Does ITAR apply to imports of firearms?",
        "searchedAs": ["itar import", "itar import requirements", "itar import license", "itar temporary import", "itar permanent import"],
        "answer": "Permanent imports of firearms and ammunition are controlled by ATF under the Arms Export Control Act (27 CFR part 447, the U.S. Munitions Import List). Temporary imports — for repair, exhibition or return — fall under the State Department's ITAR, including its exemptions in 22 CFR 123.4 and the country policy of 22 CFR 126.1.",
        "link": "tariff-engineering",
    },
    {
        "id": "imports",
        "question": "How much arms and ammunition does the U.S. import, and from where?",
        "searchedAs": ["us firearms imports by country", "ammunition imports by country"],
        "answer": "$3.86B of Chapter 93 goods in 2025, down 13.3% from $4.45B in 2024. Ammunition was $1.34B, pistols $660M, shotguns $347M, rifles $254M and gun parts $1.02B. Türkiye ($419M), the UK ($389M), Italy ($366M), Germany ($318M) and Austria ($249M) were the largest suppliers.",
        "link": "understand-industry",
    },
]
