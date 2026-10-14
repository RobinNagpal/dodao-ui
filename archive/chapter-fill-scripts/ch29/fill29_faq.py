"""finalConclusion (FAQ) for Chapter 29. Questions come from Google search suggestions collected on 2026-10-12 (sugg29.json)."""
import json
import os

from fill29_lib import usd, n

HERE = os.path.dirname(os.path.abspath(__file__))


def apply(d, L, cnt, F, as_of, yr, BYC, HC):
    sugg = json.load(open(os.path.join(HERE, "sugg29.json")))
    allsugg = {s for k, v in sugg.items() if k != "_collected" for s in v}

    fc = d["finalConclusion"]
    fc["h1"] = "HTS Chapter 29: Organic Chemicals — Tariff FAQ"
    fc["seo"] = {
        "title": "Chemical & API Tariffs FAQ: HS Code 29, China, India, Section 232 Pharma, Pharmaceutical Appendix (HTS Ch. 29) | KoalaGains",
        "shortDescription": (
            "Answers to what people search about tariffs on organic chemicals: what HTS Chapter 29 covers, tariffs on chemicals from China and India, the "
            "Section 232 pharmaceutical tariff on APIs, generic drug exemptions, the Pharmaceutical Appendix, antidumping duties, the Superfund tax and HS codes."
        ),
        "keywords": [
            "hts chapter 29",
            "hs code for organic chemicals",
            "tariffs on chemicals from china",
            "tariff on chemicals from india",
            "trump tariffs on chemicals",
            "section 232 pharmaceutical tariffs",
            "tariffs on active pharmaceutical ingredients",
            "generic drug tariffs",
            "pharmaceutical appendix to the harmonized tariff schedule",
            "superfund chemical tax",
            "hs code for vitamins",
            "hs code for citric acid",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most common questions about U.S. tariffs on organic chemicals and drug ingredients — by country, by product and by HS code. "
        "Each answer links to the page with the full detail."
    )
    fc["keyTakeaways"] = [
        f"Chapter 29 has {cnt['lines']} lines: {cnt['free']} Free, the rest mostly 3.7%–6.5%. {cnt['K']} dutiable lines are Free for drug ingredients listed in "
        "the Pharmaceutical Appendix (K).",
        f"The 2026 Section 301 tariffs (10% or 12.5% for 60 economies, including China, India, the EU, Switzerland and Singapore) reach {cnt['s301']} lines; "
        f"vitamins, hormones, antibiotics and most alkaloids are exempt, and {cnt['e52']} more lines are exempt when the chemical is for pharmaceutical use.",
        f"China also pays 25% (List 3) or 7.5% (List 4A) on {n(len(L.l3 | L.l3d | L.l4a))} lines; the IEEPA fentanyl duty ended on February 24, 2026.",
        f"Patented drug ingredients on {cnt['p40']} lines pay the Section 232 pharmaceutical duty (100%; 15% from the EU, Japan, South Korea and Switzerland; "
        "0% from the UK); generics pay nothing extra.",
        "More than 25 chemicals carry antidumping or countervailing duties, and imported benzene, toluene, xylene, olefins and many derivatives owe the "
        "Superfund excise tax — none of which is in the tariff rate.",
    ]
    fc["lastCheckedAt"] = as_of
    fc["questionSource"] = f"Google search suggestions, collected {sugg['_collected']}"

    ie = BYC["Ireland"]["importsUsd"]
    cn = BYC["China"]["importsUsd"]
    india = BYC["India"]["importsUsd"]
    faqs = [
        dict(id="what-is-ch29", question="What is HTS Chapter 29?",
             searchedAs=["hts chapter 29", "htsus chapter 29", "hts code chapter 29", "us hts chapter 29", "hs code 29", "hs code 29 organic chemicals"],
             answer=(f"Chapter 29 of the Harmonized Tariff Schedule covers organic chemicals: separately defined compounds from hydrocarbons, alcohols and acids to "
                     f"amines, heterocyclic drug ingredients, vitamins, hormones, alkaloids and antibiotics. It has 42 headings (2901–2942) and {cnt['lines']} "
                     f"ten-digit U.S. lines; {cnt['free']} are Free and the rest mostly pay 3.7%, 5.5% or 6.5%. Mixtures generally go to Chapter 38 and "
                     "medicines in doses or bulk preparations to Chapter 30."),
             link=""),
        dict(id="hs-organic", question="What is the HS code for organic chemicals?",
             searchedAs=["organic chemicals hs code", "hs code for organic chemicals", "organic chemicals hsn code", "hs code for organic compounds",
                         "organic and inorganic chemicals hs code", "other organic compounds hs code"],
             answer=("Chapter 29 for separately defined organic compounds (inorganic chemicals are Chapter 28). Each compound has its own heading by its "
                     "functional group — e.g. 2905 alcohols, 2915–2918 carboxylic acids, 2921 amines, 2933 nitrogen heterocyclics — and 2942 is the residual "
                     "\"other organic compounds\". When a compound fits two headings, Chapter 29 note 3 sends it to the one last in numerical order."),
             link=""),
        dict(id="china", question="Are there U.S. tariffs on chemicals from China?",
             searchedAs=["tariffs on chemicals from china", "us tariffs on china chemicals", "chemical imports from china", "organic chemical import from china"],
             answer=(f"Yes. Chinese organic chemicals pay the base rate plus 12.5% under the 2026 Section 301 action, plus 25% on {n(len(L.l3 | L.l3d))} lines "
                     f"(List 3) or 7.5% on {cnt['l4a']} (List 4A) — e.g. citric acid 6% + 12.5% + 25% = 43.5%. Vitamins, hormones and antibiotics are exempt "
                     "from the 12.5% and on no China list. Many products also carry antidumping or countervailing duties (citric acid, glycine, MSG, L-lysine, "
                     f"HFC refrigerants, MDI, vanillin, erythritol and others). The U.S. imported {usd(cn)} of Chapter 29 goods from China in {yr}."),
             link="industry-areas"),
        dict(id="india", question="What is the U.S. tariff on chemicals from India?",
             searchedAs=["tariff on chemicals from india", "us tariff on chemicals from india", "us tariffs india chemicals", "us tariff on india chemicals"],
             answer=("The base rate (Free to 6.5%) plus 10% under the 2026 Section 301 action (9903.05.44). Drug ingredients can pay much less: listed INNs "
                     f"enter Free under the Pharmaceutical Appendix, and {cnt['e52']} lines are exempt from the 10% when for pharmaceutical use — so a generic "
                     "API can pay nothing. A patented drug ingredient on the Section 232 list pays 100%. Glycine, 2,4-D, melamine and hexamine from India carry "
                     f"AD/CVD orders. India supplied {usd(india)} in {yr}."),
             link="industry-areas"),
        dict(id="trump-tariffs", question="What happened to the Trump tariffs on chemicals?",
             searchedAs=["trump tariffs on chemicals", "us tariffs on chemicals", "tariffs on chemicals", "trump tariffs chemical industry"],
             answer=("The 2025 IEEPA duties — the China fentanyl duty (10%, then 20%, then 10%), 25% (Canada later 35%) on non-USMCA Canadian and Mexican goods, and "
                     "the reciprocal tariff, which exempted about 508 Chapter 29 lines — ended on February 24, 2026 after the Supreme Court's ruling. A 10% "
                     "Section 122 surcharge ran until July 23, 2026. Since July 24, 2026 the 2026 Section 301 tariffs (10% or 12.5% for 60 economies) apply, and "
                     "since July 31 / September 29, 2026 the Section 232 duty on patented drug ingredients."),
             link="tariff-updates"),
        dict(id="api-232", question="Are active pharmaceutical ingredients (APIs) subject to the Section 232 pharmaceutical tariff?",
             searchedAs=["section 232 pharmaceuticals", "section 232 pharmaceutical tariffs", "section 232 pharma tariffs", "tariffs on active pharmaceutical ingredients",
                         "pharma api tariffs", "us tariff on api", "tariff on api"],
             answer=(f"Yes, if they are on the list: U.S. note 40(c) names {cnt['p40']} Chapter 29 lines (insulin, other polypeptide hormones, steroids, antibiotics and "
                     "many \"Drugs\" lines). An API or key starting material for a patented drug pays 100% in place of the base rate (9903.04.60), 15% from the EU, "
                     "Japan, South Korea, Switzerland or Liechtenstein, 0% from the UK — for all importers since September 29, 2026. Generic ingredients, "
                     "excipients and chemicals not used for drugs pay no Section 232 duty."),
             link="tariff-updates"),
        dict(id="generic", question="Are generic drugs and their ingredients exempt from the pharmaceutical tariffs?",
             searchedAs=["generic drug tariffs", "generic pharmaceutical tariffs", "pharmaceutical tariff exemption", "drug tariff exemptions", "india generic drugs tariffs"],
             answer=("From Section 232, yes: generic drugs, biosimilars and their ingredients enter under 9903.04.67 with no Section 232 duty. They are not "
                     "automatically exempt from the 2026 Section 301 duty, but most drug ingredients are — either because the line is on note 52(b) (vitamins, "
                     f"hormones, antibiotics, most alkaloids) or because it is on note 52(e) and the goods are for pharmaceutical use ({cnt['e52']} lines). "
                     "Proclamation 11020 exempts generics \"at this time\" and asks Commerce to report within a year whether to cover them."),
             link="tariff-engineering"),
        dict(id="pharma-appendix", question="What is the Pharmaceutical Appendix to the tariff schedule?",
             searchedAs=["pharmaceutical appendix", "pharmaceutical appendix to the harmonized tariff schedule", "hts pharmaceutical appendix",
                         "htsus pharmaceutical appendix", "cbp pharmaceutical appendix"],
             answer=(f"A list of drug substances by INN, with prefixes and suffixes for their salts and esters, behind the special program indicator K (Agreement on Trade in Pharmaceutical Products). Under General "
                     f"Note 13, a product listed there that is classified in a line showing \"Free (K)\" enters duty-free from any column-1 country — {cnt['K']} "
                     "Chapter 29 lines carry K. It removes only the base rate: the Section 301 and Section 232 duties still apply unless their own exemptions do."),
             link="tariff-engineering"),
        dict(id="adcvd", question="Which organic chemicals have antidumping or countervailing duties?",
             searchedAs=["citric acid antidumping", "glycine antidumping"],
             answer=("Orders in force cover citric acid and citrates (China AD/CVD; Belgium, Colombia, Thailand AD), glycine (China, India, Japan, Thailand), "
                     "L-lysine and MSG, sodium gluconate, 2,4-D, HFC refrigerants R-134a, R-125 and R-32, melamine, chlorinated isocyanurates, hexamine, "
                     "corrosion inhibitors, HEDP, furfuryl alcohols, vanillin, erythritol, MDI, acetone, DOTP, TCPP, methionine and acrylate monomers. Citric acid "
                     "from India and Canada, choline salts, THAM and CBS from China are under investigation. Rates are per exporter and not in the tariff calculator."),
             link="tariff-engineering"),
        dict(id="superfund", question="What is the Superfund chemical tax on imports?",
             searchedAs=["superfund chemical tax", "superfund chemical excise tax", "superfund taxable chemicals list", "superfund chemical excise tax rates", "superfund tax chemicals list"],
             answer=("An IRS excise tax reinstated on July 1, 2022 and paid by the importer on Form 720 / Form 6627, not to CBP. Taxable chemicals such as benzene, "
                     "toluene, xylene, ethylene, propylene, butylene, butadiene and acetylene pay $9.74 a ton; listed imported substances made from them pay their "
                     "own per-ton rates — e.g. acetone $20.06, phenol $12.47, styrene $9.93. Ozone-depleting chemicals pay a separate tax (CFC-11 $19.30 a pound in 2026)."),
             link="tariff-engineering"),
        dict(id="where-from", question="Where does the U.S. import organic chemicals from?",
             searchedAs=["us chemical imports"],
             answer=(f"Mostly Ireland: {usd(ie)} of the {F['T']} imported in {yr} ({F['ie_share']}), {F['ie_2937']} of it hormones (2937). China ({F['cn']}), India "
                     f"({F['india']}), Singapore ({F['sg']}), Germany, Canada and Switzerland follow. Without Ireland, imports were {F['ex_ie']}, down from {F['ex_ie_p']} "
                     "in 2024."),
             link="understand-industry"),
        dict(id="hs-vitamins", question="What is the HS code for vitamins?",
             searchedAs=["hs code for vitamins", "hs code for vitamin c", "hs code for vitamin d3", "hs code for vitamin e", "hs code for vitamin b12",
                         "tariff code for vitamins", "vitamin c tariff code", "tariff on vitamins"],
             answer=("Bulk vitamins and provitamins are heading 2936: vitamin A 2936.21, B1 2936.22, B2 2936.23, B5 2936.24, B6 2936.25, B12 2936.26, C 2936.27, "
                     "E 2936.28, other vitamins including D3 2936.29, mixtures 2936.90. All are Free, exempt from the 2026 Section 301 duties and on no China list. "
                     "Vitamin tablets or capsules are not here: supplements are usually 2106.90 and vitamin medicines 3004.50."),
             link=""),
        dict(id="hs-citric", question="What is the HS code for citric acid?",
             searchedAs=["hs code for citric acid", "hs code for citric acid monohydrate", "hs code for citric acid anhydrous"],
             answer=(f"2918.14 (citric acid, anhydrous or monohydrate), base rate {L.rate('2918.14.00.00')}; its salts and esters are 2918.15 — sodium citrate "
                     f"{L.rate('2918.15.10.00')}, others {L.rate('2918.15.50.00')}. All are on China List 3, and citric acid and citrates are under AD/CVD orders "
                     "on China and AD orders on Belgium, Colombia and Thailand, with India and Canada under investigation."),
             link=""),
        dict(id="hs-2933", question="What do HS codes 2933, 2934 and 2922 cover?",
             searchedAs=["hs code 2933", "hs code 2933.99", "hs code 2933.39", "hs code 2934", "hs code 2934.99", "hs code 2922", "hs code 2922.49"],
             answer=(f"2933 is heterocyclic compounds with nitrogen hetero-atoms only (pyridines, pyrimidines, piperazines, melamine, benzodiazepines — {len(L.heading('2933'))} "
                     f"U.S. lines, most at 6.5% or Free (K)); 2934 is nucleic acids and other heterocyclic compounds ({len(L.heading('2934'))} lines); 2922 is "
                     f"oxygen-function amino compounds, including amino acids such as glycine and lysine ({len(L.heading('2922'))} lines). Together they hold most "
                     "drug APIs; 2933.99 and 2934.99 are the \"other\" baskets."),
             link=""),
        dict(id="hs-methanol-menthol", question="What are the HS codes for methanol and menthol?",
             searchedAs=["hs code for methanol", "hs code for menthol", "hs code for menthol crystal", "hs code l menthol"],
             answer=(f"Methanol is 2905.11: {L.rate('2905.11.20.10')} general, Free when imported only for producing synthetic natural gas (2905.11.10). Menthol "
                     f"is 2906.11, {L.rate('2906.11.00.00')}, Free (K) for products listed in the Pharmaceutical Appendix. Methanol is also a taxable substance for the "
                     "Superfund excise tax, and both are on China List 3."),
             link=""),
    ]
    for f in faqs:
        for s in f["searchedAs"]:
            assert s in allsugg, f"not a collected suggestion: {s}"
    fc["faqs"] = faqs
