"""Trade-dependent and remaining text for Chapter 27 (needs the generated understandIndustry data)."""
import json
import os

TRADE = "/Users/robin/projects/worktrees/chapter-migration-1810-batch1/insights-ui/src/tariff-data/trade/chapter-27.json"
SF_NOTE = os.environ.get("SF_NOTE", "")


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.1f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


def apply_trade(d):
    from fill27_static import SF2026

    u = d["understandIndustry"]
    o = d["overview"]
    ia = d["industryAreas"]
    fc = d["finalConclusion"]
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    trade = json.load(open(TRADE))
    byc = {c["country"]: c for c in trade["byCountry"]}
    hc = {(r["country"], r["heading"]): r["importsUsd"] for r in trade["byHeadingCountry"]}
    head = {}
    for r in trade["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    hs6 = {h["hs6"]: h for h in trade["byHs6"]}

    def imp(n):
        return byc[n]["importsUsd"] if n in byc else 0

    def prior(n):
        return byc[n]["priorImportsUsd"] if n in byc else 0

    ca, mx = imp("Canada"), imp("Mexico")
    ru = byc.get("Russian Federation", {"byYear": {}})
    peak = max(tot.items(), key=lambda kv: kv[1])
    S = dict(
        T=b(T), P=b(P), chg=f"{(T - P) / P * 100:+.1f}%", peak_y=peak[0], peak=b(peak[1]),
        ca=b(ca), ca_share=f"{ca / T * 100:.0f}%", ca_crude=b(hc[("Canada", "2709")]), ca_gas=b(hc[("Canada", "2711")]),
        ca_ref=b(hc[("Canada", "2710")]), ca_el=b(hc[("Canada", "2716")]), mx=b(mx), mx_p=b(prior("Mexico")),
        usmca_share=f"{(ca + mx) / T * 100:.0f}%",
        crude=b(head["2709"]), crude_share=f"{head['2709'] / T * 100:.0f}%", ref=b(head["2710"]), gas=b(head["2711"]), el=b(head["2716"]),
        coal=b(head.get("2701", 0)), lng=b(hs6["271111"]["importsUsd"]), pipegas=b(hs6["271121"]["importsUsd"]),
        sa=b(imp("Saudi Arabia")), br=b(imp("Brazil")), iq=b(imp("Iraq")), co=b(imp("Colombia")), kr=b(imp("Rep. of Korea")), gy=b(imp("Guyana")),
        ng=b(imp("Nigeria")), nl=b(imp("Netherlands")), ve=b(imp("Venezuela")), ve_p=b(prior("Venezuela")), inn=b(imp("India")),
        cn=b(imp("China")), cn_p=b(prior("China")), ru21=b(ru["byYear"].get("2021", 0)), ru22=b(ru["byYear"].get("2022", 0)),
    )
    print(S)

    # ---------------- overview
    o["seo"] = {
        "title": "HTS Chapter 27 Oil & Gas Tariffs: Crude Oil, Gasoline, Diesel, Natural Gas & Coal Import Duty Rates | KoalaGains",
        "shortDescription": "Searchable U.S. duty table for all 141 HTS Chapter 27 lines — crude oil, gasoline, diesel, jet fuel, LNG, propane, coal, petroleum coke and electricity. Base rates from Free to 84¢ per barrel, Canadian oil Free under USMCA, energy exempt from the 2026 Section 301 tariffs, China 25%, and the Russian oil ban.",
        "keywords": [
            "HTS Chapter 27",
            "oil tariffs",
            "oil and gas tariffs",
            "tariff on canadian oil",
            "crude oil import tariff",
            "petroleum product tariffs",
            "tariff on natural gas",
            "hs code 2709",
            "hs code 2710",
            "U.S. energy tariffs 2026",
        ],
    }
    o["intro"] = (
        "Chapter 27 covers mineral fuels: coal, lignite and coke (2701–2704), coal-tar chemicals such as benzene and toluene (2707), **crude oil** (2709), "
        "**refined products** such as gasoline, diesel, jet fuel and lubricating oils (2710), **natural gas, LNG and propane** (2711), waxes, petroleum coke and "
        f"bitumen (2712–2715) and **electricity** (2716). It is the largest U.S. import chapter by value: **{S['T']}** in {yr}, {S['crude']} of it crude oil and "
        f"{S['ca_share']} from Canada.\n\n"
        "The base tariffs are small and specific: Free on coal, natural gas, LNG and electricity; **5.25¢ or 10.5¢ per barrel** on crude oil; **52.5¢ per barrel** "
        "on gasoline and jet fuel; 84¢ per barrel on lubricating oils. Canadian and Mexican oil is **Free under USMCA**. Energy was exempted from nearly every "
        "2025–2026 extra duty — the reciprocal tariff, the Section 122 surcharge and the **2026 Section 301 tariffs** (U.S. note 52(b)) — and the 2025 IEEPA "
        "duties, including **10% on non-USMCA Canadian energy**, ended on February 24, 2026. What still applies: **China's Section 301 duty** (25% on most lines), "
        "**Column 2 rates for Russia**, and sanctions that **ban Russian and Iranian oil**. Federal excise taxes on imported petroleum are owed on top and are not "
        "in the rate table."
    )
    for st in o["stats"]:
        if st["label"].startswith("Canada + Mexico"):
            st["label"] = "Canada + Mexico share"
            st["note"] = "USMCA partners"
    ts = o["tradeSnapshot"]
    ts["topCountries"] = [{"name": "Canada", "importsUsd": ca}, {"name": "Mexico", "importsUsd": mx}]
    ts["biggestLines"] = [{"hts": "2709.00", "label": "Crude oil"}, {"hts": "2710.19", "label": "Diesel, fuel oils, kerosene and lubricating oils"}]
    ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty-collected figures aren't available from an official source yet."

    # ---------------- understandIndustry
    u["h1"] = "HTS Chapter 27: Mineral Fuels & Oils — U.S. Oil, Gas & Coal Import Statistics"
    u["seo"] = {
        "title": f"U.S. Oil & Gas Imports by Country — Crude Oil, Fuels, Natural Gas (HTS Ch. 27, 2020–{yr}) | KoalaGains",
        "shortDescription": f"Where U.S. energy imports come from: {S['T']} in {yr}, {S['ca_share']} from Canada ({S['ca_crude']} of crude oil), then Mexico, Saudi Arabia, Brazil, Iraq, Colombia and Guyana. By country, by product and over time since 2020, from UN Comtrade.",
        "keywords": [
            "us oil imports by country",
            "how much oil do we import from canada",
            "where does the us import oil from",
            "us crude oil imports",
            "us natural gas imports canada",
            "how much oil does the us get from venezuela",
            "HTS Chapter 27 import statistics",
        ],
    }
    u["byYearCaption"] = "U.S. imports of Chapter 27 fuels each year, split into the two USMCA partners (Canada and Mexico) and everyone else."
    for st in u["stats"]:
        if st["label"] == "Largest product":
            st["note"] = "Crude oil (2709.00)"
    u["why"] = (
        f"U.S. imports of mineral fuels were **{S['T']} in {yr}**, {S['chg']} from {S['P']} in {pyr} and down from the {S['peak_y']} peak of {S['peak']}, when "
        f"energy prices spiked. Values move mostly with oil and gas prices, not tariffs. **Crude oil** is {S['crude_share']} of the total ({S['crude']}), refined "
        f"products {S['ref']}, natural gas and LPG {S['gas']} and electricity {S['el']}.\n\n"
        f"**Canada** dominates with {S['ca']} ({S['ca_share']}): {S['ca_crude']} of crude oil, {S['ca_gas']} of natural gas and LPG, {S['ca_ref']} of refined "
        f"products and {S['ca_el']} of electricity. **Mexico** follows with {S['mx']} (down from {S['mx_p']}), then crude suppliers Saudi Arabia ({S['sa']}), "
        f"Brazil ({S['br']}), Iraq ({S['iq']}), Colombia ({S['co']}), Guyana ({S['gy']}) and Nigeria ({S['ng']}). South Korea ({S['kr']}), the Netherlands "
        f"({S['nl']}) and India ({S['inn']}) ship mainly refined products.\n\n"
        f"Sanctions show clearly in the data: imports from **Russia** fell from {S['ru21']} in 2021 to {S['ru22']} in 2022 and to almost nothing after the March "
        f"2022 import ban, and Iran does not appear at all. **Venezuela**, whose oil sector is under U.S. sanctions, shipped {S['ve']} ({S['ve_p']} in {pyr}); since January 2026 U.S. companies can buy Venezuelan oil under OFAC General License 46. Chinese fuels, which pay "
        f"Section 301 duties, were only {S['cn']}.\n\n"
        f"{yr} is the latest full year of U.S. trade data. Duty-collected figures aren't available from an official source yet."
    )
    u["sources"] = u["sources"] + [
        {"label": "Executive Order 14066 (ban on Russian crude oil, petroleum products, LNG and coal, March 8, 2022)", "url": "https://www.federalregister.gov/documents/2022/03/10/2022-05232/prohibiting-certain-imports-and-new-investments-with-respect-to-continued-russian-federation-efforts"},
        {"label": "Federal Register 91 FR 24719 (OFAC Venezuela General Licenses 46–46B)", "url": "https://www.federalregister.gov/documents/2026/05/07/2026-09092/publication-of-venezuela-sanctions-regulations-web-general-licenses-46-46a-and-46b"},
    ]

    # ---------------- industryAreas
    ia["seo"] = {
        "title": "Oil & Gas Tariff Rates by Country — Canada, Mexico, Saudi Arabia, Venezuela, China, Russia (HTS Ch. 27) | KoalaGains",
        "shortDescription": "The total U.S. tariff on crude oil, refined products, natural gas, coal and electricity by country: Free or a few cents per barrel for Canada, Mexico, Saudi Arabia, Iraq, Brazil, Guyana and the other main suppliers, 25% extra for China, Column 2 for Russia — plus the oil import bans that are not in the grid.",
        "keywords": [
            "oil tariffs canada",
            "us tariff on canada oil",
            "tariffs on oil and gas canada",
            "oil tariffs china",
            "oil tariffs russia",
            "tariff on venezuelan oil",
            "oil tariff by country",
        ],
    }
    ia["intro"] = (
        "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
        "For energy the answer is short: **the base rate, or Free with an FTA claim, for every main supplier** — a few cents per barrel on crude oil, 52.5¢ per "
        "barrel on gasoline — and **25% extra for China**.\n\n"
        "That is because every Chapter 27 subheading is on the exemption list of the 2026 Section 301 tariffs on 60 economies (U.S. note 52(b)), so Canada, "
        "Mexico, Saudi Arabia, Iraq, Brazil, Guyana, the EU, India and the others pay nothing extra. The table does **not** show sanctions: Russian crude, fuels, "
        "LNG and coal and Iranian oil cannot be imported at all, and Venezuelan oil needs a Treasury license. Nor does it include the federal petroleum and fuel "
        "excise taxes."
    )
    EXEMPT = "All Chapter 27 subheadings are on the 2026 Section 301 exemption list (U.S. note 52(b), 9903.05.86)"
    END = "The 2025 IEEPA duties ended February 24, 2026."
    labels = {
        "Canada": (f"Free with a USMCA claim; otherwise the base rate (5.25–84¢ per barrel on crude and fuels). {EXEMPT}, so the 10% Section 301 duty on Canada (9903.05.29) does not apply. The 2025 IEEPA duty on non-USMCA Canadian energy (10%, 9903.01.13) ended February 24, 2026.", ["fr-2026-15181", "eo-14193", "eo-14389", "hts-now"]),
        "Mexico": (f"Free with a USMCA claim; otherwise the base rate. {EXEMPT}, so the 10% Section 301 duty on Mexico (9903.05.55) does not apply. The 2025 IEEPA duty on non-USMCA Mexican goods (25%) ended February 24, 2026.", ["fr-2026-15181", "eo-14194", "eo-14389", "hts-now"]),
        "Colombia": (f"Free under the U.S.–Colombia TPA (SPI CO); without a claim, the base rate. {EXEMPT}, so the 12.5% Section 301 duty on Colombia (9903.05.32) does not apply.", ["fr-2026-15181", "hts-now"]),
        "South Korea": (f"Free under KORUS (SPI KR); without a claim, the base rate. {EXEMPT}, so Korea's Section 301 duty (9903.05.71) does not apply. {END}", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "Guyana": (f"Free on crude oil and fuels under the Caribbean Basin Trade Partnership Act (SPI R, in force through September 30, 2030); without a claim, the base rate. {EXEMPT}, so the 12.5% Section 301 duty on Guyana (9903.05.41) does not apply.", ["fr-2026-15181", "hts-now"]),
        "Brazil": (f"Base rate (no FTA). {EXEMPT}, and all of them are also on the exemption list of Brazil's 25% Section 301 duty (U.S. note 50(a)(ii), 9903.05.03). The 2025 40% IEEPA duty on Brazil exempted energy and ended February 24, 2026.", ["fr-2026-15181", "fr-2026-14542", "eo-14323", "hts-now"]),
        "Netherlands": (f"EU: base rate (no FTA). {EXEMPT}, so the EU's 10% Section 301 rate (9903.05.39) does not apply. {END}", ["fr-2026-15181", "eo-14389", "hts-now"]),
        "India": (f"Base rate. {EXEMPT}, so India's 10% Section 301 duty (9903.05.44) does not apply. The 2025 25% tariff over Russian oil purchases exempted energy and was removed February 7, 2026.", ["fr-2026-15181", "eo-14384", "hts-now"]),
        "Nigeria": (f"Base rate; eligible goods can claim AGOA (SPI D, renewed through December 31, 2026) where the line offers it, which the grid does not apply. {EXEMPT}, so the 12.5% Section 301 duty on Nigeria (9903.05.59) does not apply.", ["fr-2026-15181", "hts-now"]),
        "Venezuela": (f"Base rate (5.25–10.5¢ per barrel on crude). {EXEMPT}, so the 12.5% Section 301 duty on Venezuela (9903.05.83) does not apply. Purchases from the Government of Venezuela or PdVSA need OFAC General License 46E (not shown in the grid).", ["fr-2026-15181", "ofac-gl46e", "hts-now"]),
        "China": ("Base rate + 25% Section 301 (List 3, 9903.88.03, and List 2, 9903.88.02, for lubricating oils and greases) on 124 of 141 lines; + 7.5% (List 4A, 9903.88.15) on phenol, waste oils and paraffin wax; nothing extra on coke and electricity. The 12.5% 2026 Section 301 duty (9903.05.31) does not apply under note 52(b); the IEEPA duties ended February 24, 2026.", ["fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2026-20510", "fr-2026-15181", "hts-now"]),
        "Russia": ("Column 2 rates (21¢ per barrel on crude oil, $1.05 on gasoline and jet fuel, 45% on calcined petroleum coke), 35% in place of Column 2 on peat (9903.90.08) and +200% on steam cylinder oils (9903.85.68). Not shown: Executive Order 14066 bans Russian crude oil, petroleum products, LNG and coal, so most of these lines cannot be imported from Russia at all.", ["pl-117-110", "procl-10420", "procl-10522", "eo-14066", "hts-now"]),
        "Any other country": ("Base rate for every other normal-trade-relations country: only China pays an extra tariff. The 60 Section 301 economies are exempt under note 52(b), Brazil's 25% duty under note 50(a)(ii), and Nicaragua's Section 301 duty is 0% until January 1, 2027. Iranian goods cannot be imported (31 CFR 560.201); Cuba, North Korea and Belarus pay Column 2 rates.", ["fr-2026-15181", "fr-2026-14542", "fr-2025-23892", "ecfr-560-201", "hts-now"]),
    }
    for c in ia["countries"]:
        if c["country"] in labels:
            c["rule"]["label"], c["rule"]["sourceIds"] = labels[c["country"]]
        else:
            c["rule"]["label"] = f"Base rate. {EXEMPT}, so no Section 301 duty applies. {END}"
            c["rule"]["sourceIds"] = ["fr-2026-15181", "eo-14389", "hts-now"]
    have = {s["id"] for s in ia["sources"]}
    tu_src = {s["id"]: s for s in d["tariffUpdates"]["sources"]}
    for c in ia["countries"]:
        for sid in c["rule"]["sourceIds"]:
            if sid not in have:
                ia["sources"].append(tu_src[sid])
                have.add(sid)
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01), which exempted energy, expired July 23, 2026; neither is applied.",
        "Sanctions are not priced: Russian-origin crude oil, petroleum products, LNG and coal (Executive Order 14066) and all Iranian-origin goods (31 CFR 560.201) cannot be imported; Venezuelan oil from the Government of Venezuela or PdVSA needs OFAC General License 46E.",
        f"Excise taxes are not included: the petroleum Superfund tax{SF2026} on imported crude and petroleum products, and 18.4¢ (gasoline) or 24.4¢ (diesel, kerosene) per gallon federal fuel tax.",
        "No antidumping or countervailing duty order covers a Chapter 27 product.",
    ]

    # ---------------- finalConclusion
    fc["h1"] = "HTS Chapter 27: Mineral Fuels & Oils — Oil & Gas Tariff FAQ"
    fc["seo"] = {
        "title": "Oil Tariffs FAQ: Canadian Oil, Natural Gas, Electricity, Russia, Venezuela, Iran & HS Codes (HTS Ch. 27) | KoalaGains",
        "shortDescription": "Answers to what people search about oil and gas tariffs: is there a tariff on oil from Canada, the 10% Canadian energy tariff, are oil and gas exempt, tariffs on natural gas, electricity, gasoline and diesel, Russian, Venezuelan and Iranian oil, and HS codes 2709, 2710 and 2711.",
        "keywords": [
            "is there a tariff on oil from canada",
            "tariff on canadian oil",
            "10 tariff on canadian energy",
            "is oil and gas exempt from tariffs",
            "tariff on natural gas",
            "tariff on electricity from canada",
            "russian oil ban",
            "tariff on venezuelan oil",
            "oil tariffs iran",
            "hs code 2710",
        ],
    }
    fc["intro"] = "Straight answers to the most common questions about U.S. tariffs on oil, gas, coal and electricity imports — by country, by product and by HS code. Each answer links to the page with the full detail."
    fc["keyTakeaways"] = [
        "Base tariffs on energy are small: Free on coal, natural gas, LNG and electricity, 5.25–10.5¢ per barrel on crude oil and 52.5¢ per barrel on gasoline and jet fuel — and Free for Canada and Mexico under USMCA.",
        "Energy is exempt from the 2026 Section 301 tariffs on 60 economies (U.S. note 52(b)); the 2025 IEEPA duties, including 10% on non-USMCA Canadian energy, ended February 24, 2026. Only China pays an extra tariff (25% on most lines).",
        "Sanctions matter more than tariffs: Russian crude, fuels, LNG and coal and Iranian oil are banned, and Venezuelan oil needs an OFAC license. Federal petroleum and fuel excise taxes are owed on top; the tariff calculator includes neither.",
    ]
    fc["questionSource"] = "Google search suggestions, collected October 12, 2026"
    fc["faqs"] = [
        dict(id="canada-oil", question="Is there a tariff on oil from Canada?",
             searchedAs=["is there a tariff on oil from canada", "tariff on canadian oil", "current tariff on canadian oil", "us tariff on canadian oil and gas", "is canadian oil tariff free", "tariff on alberta oil", "canadian oil tariffs"],
             answer=f"Only a few cents, or nothing. Canadian crude oil pays 5.25¢ per barrel (under 25° API) or 10.5¢ (25° API or more) and is Free when claimed under USMCA; refined products pay 10.5–84¢ per barrel without a claim. U.S. note 52(b) exempts all Chapter 27 goods from the 10% Section 301 duty on Canada. The 10% IEEPA duty on non-USMCA Canadian energy ended on February 24, 2026. Canada supplied {S['ca']} of U.S. fuel imports in {yr}, {S['ca_crude']} of it crude oil.",
             link="industry-areas"),
        dict(id="canada-energy-10", question="What was the 10% tariff on Canadian energy, and is it still in effect?",
             searchedAs=["10 tariff on canadian energy", "tariffs on canadian energy", "trump tariffs on canadian energy", "us tariffs on canadian energy imports", "does the us have tariffs on canadian energy"],
             answer="Executive Order 14193 put an IEEPA duty on Canadian goods from March 4, 2025, at 10% for energy and energy resources (crude oil, natural gas, natural gas liquids, refined petroleum products, coal and others, heading 9903.01.13) and 25% for other goods. From March 7, 2025, goods entered under USMCA were exempt. When the general rate rose to 35% on August 1, 2025, energy stayed at 10%. It is no longer in effect: after the Supreme Court ruled on February 20, 2026 that IEEPA does not authorize tariffs, all IEEPA duties ended on February 24, 2026.",
             link="tariff-updates"),
        dict(id="exempt", question="Are oil and gas exempt from tariffs?",
             searchedAs=["is oil and gas exempt from tariffs", "are there tariffs on oil", "do tariffs apply to oil", "are there tariffs on crude oil", "tariffs oil and gas"],
             answer="From the extra tariffs, mostly yes. Every Chapter 27 subheading was on the exemption lists of the April 2025 reciprocal tariff and the 2026 Section 122 surcharge, and is on the exemption list of the 2026 Section 301 tariffs on 60 economies (U.S. note 52(b)). Base rates still apply (Free to 84¢ per barrel, Free under USMCA and most FTAs), China-origin fuels pay 25% (Section 301), and Russian and Iranian oil is banned.",
             link="tariff-updates"),
        dict(id="crude-rate", question="What is the U.S. import tariff on crude oil?",
             searchedAs=["tariff on crude oil", "us tariff on crude oil", "crude oil import tariff", "us oil import tariff", "crude oil tariff code"],
             answer=f"Crude oil (HTS 2709.00) pays 5.25¢ per barrel if it tests under 25° API (2709.00.10) and 10.5¢ per barrel at 25° API or more, including condensate (2709.00.20). It is Free from Canada and Mexico under USMCA and from FTA partners such as Colombia, and from Guyana under the CBTPA. No extra tariff applies except 25% on Chinese crude. Importers also owe the petroleum Superfund excise tax{SF2026} to the IRS. The U.S. imported {S['crude']} of crude oil in {yr}.",
             link=""),
        dict(id="natural-gas", question="Is there a tariff on natural gas or LNG?",
             searchedAs=["tariff on natural gas", "tariff on natural gas from canada", "are there tariffs on natural gas", "us lng tariffs", "tariffs on canadian natural gas"],
             answer=f"No. Natural gas by pipeline (2711.21) and LNG (2711.11) are Free from every country except China (+25%, Section 301 List 3), and are exempt from the 2026 Section 301 tariffs. Russian-origin LNG is banned. Imports need authorization from the Department of Energy (10 CFR part 590). The U.S. imported {S['pipegas']} of pipeline gas and {S['lng']} of LNG in {yr}, almost all of the pipeline gas from Canada.",
             link="tariff-engineering"),
        dict(id="electricity", question="Is there a tariff on electricity from Canada?",
             searchedAs=["tariff on electricity from canada", "tariffs on electricity from canada to us", "are there tariffs on electricity from canada", "tariffs on canadian power", "25 tariff on electricity from canada"],
             answer=f"No. Electrical energy (2716.00) is Free from every country, including China, and is exempt from the 2026 Section 301 tariffs. The 2025 IEEPA duties on Canadian goods, which exempted goods entered under USMCA, ended on February 24, 2026. Electricity is entered on a periodic basis rather than shipment by shipment (Additional U.S. note 6 to Chapter 27). The U.S. imported {S['el']} of electricity in {yr}, essentially all from Canada.",
             link=""),
        dict(id="gasoline-diesel", question="Are there tariffs on imported gasoline and diesel?",
             searchedAs=["tariff on gasoline", "is there a tariff on gasoline", "tariffs on diesel", "taxes on diesel fuel"],
             answer="Small ones. Gasoline and jet fuel pay 52.5¢ per barrel (2710.12.15, 2710.19.16) and diesel 10.5¢ per barrel (2710.19.11), Free under USMCA and most FTAs; only Chinese fuel pays an extra 25%. The bigger costs are federal excise taxes — 18.4¢ per gallon on gasoline and 24.4¢ on diesel, due on entry or at the terminal rack — plus EPA fuel-quality and Renewable Fuel Standard obligations for importers.",
             link="tariff-engineering"),
        dict(id="russia", question="Can the U.S. import Russian oil? Has the ban been lifted?",
             searchedAs=["russian oil ban", "russian oil ban lifted", "oil tariffs russia", "tariff on oil from russia"],
             answer=f"No. Executive Order 14066 has banned imports of Russian-origin crude oil, petroleum fuels and products, LNG and coal since March 2022, and the President continued the underlying national emergency on March 24, 2026. On the tariff side Russia pays Column 2 rates (21¢ per barrel on crude) since April 2022. U.S. imports of Russian fuels fell from {S['ru21']} in 2021 to almost nothing.",
             link="tariff-updates"),
        dict(id="india", question="What are the oil tariffs on India?",
             searchedAs=["oil tariffs india", "tariff on india russian oil"],
             answer=f"Executive Order 14329 added 25% on Indian goods from August 27, 2025 because India bought Russian oil, but energy products were exempt. Executive Order 14384 removed that duty from February 7, 2026, after India committed to stop importing Russian oil. Today Indian fuels pay only the base rate: Chapter 27 is exempt from India's 10% Section 301 duty. India shipped {S['inn']} of fuels, mostly refined products, to the U.S. in {yr}.",
             link="tariff-updates"),
        dict(id="venezuela", question="Is there a tariff on Venezuelan oil?",
             searchedAs=["tariff on venezuelan oil", "u.s tariff on venezuelan oil", "tariffs on countries importing venezuelan oil", "trump tariffs on venezuelan oil", "venezuela oil deal"],
             answer=f"Venezuelan crude pays only the base rate (5.25–10.5¢ per barrel); it is exempt from Venezuela's 12.5% Section 301 duty. The 2025 order allowing a 25% tariff on countries that import Venezuelan oil (Executive Order 14245) ended on February 24, 2026. Buying from the Government of Venezuela or PdVSA requires OFAC authorization: since January 29, 2026, General License 46 (now 46E) lets established U.S. companies buy and import Venezuelan oil, with payments made into Treasury-held accounts. Imports were {S['ve']} in {yr}.",
             link="tariff-updates"),
        dict(id="iran-cuba", question="Are there oil tariffs on Iran or Cuba?",
             searchedAs=["oil tariffs iran", "tariffs oil cuba"],
             answer="Iranian oil cannot be imported at all: the Iran sanctions regulations ban imports of Iranian-origin goods (31 CFR 560.201). Two temporary 2026 licenses for Iranian oil (General License U, March 20 to April 19, and General License X, June 21 to July 7, wound down by July 17) have expired. Separately, 2026 executive orders allowed tariffs on countries that buy from Iran (EO 14382) or supply oil to Cuba (EO 14380); both were IEEPA tariffs and ended on February 24, 2026.",
             link="tariff-updates"),
        dict(id="china", question="What is the tariff on oil, coal and gas from China?",
             searchedAs=["oil tariff china", "tariff on coal"],
             answer=f"China-origin Chapter 27 goods pay the base rate plus 25% under Section 301 (List 3, or List 2 for lubricating oils and greases), or 7.5% for phenol, waste oils and paraffin wax (List 4A). Coke and electricity pay nothing extra. Coal from other countries is Free, and Russian coal is banned. U.S. imports from China were {S['cn']} in {yr} (down from {S['cn_p']}).",
             link="industry-areas"),
        dict(id="hs-2709-2710", question="What are HS codes 2709 and 2710?",
             searchedAs=["hs code 2709", "hs code 2710", "crude oil hs code", "hs code 2710.19", "hs code 2710.12", "tariff code for oil"],
             answer="2709 is crude petroleum oil (U.S. lines 2709.00.10 under 25° API and 2709.00.20 at 25° API or more, including condensate). 2710 is refined petroleum: 2710.12 light oils (gasoline 2710.12.15, naphtha), 2710.19 other oils (diesel and fuel oils 2710.19.06/.11, jet fuel 2710.19.16, kerosene, lubricating oils 2710.19.30, greases), 2710.20 blends containing biodiesel and 2710.91/.99 waste oils.",
             link=""),
        dict(id="hs-2711", question="What is HS code 2711?",
             searchedAs=["hs code 2711", "hs code 2711.21", "hs code 2711.11", "hs code 2711.12", "hs code 2711.19"],
             answer="Heading 2711 covers petroleum gases: liquefied natural gas (2711.11), propane (2711.12), butanes (2711.13), ethylene, propylene, butylene and butadiene (2711.14), other liquefied gases (2711.19), natural gas in gaseous state (2711.21) and other gaseous hydrocarbons (2711.29). All are Free except from China (+25%).",
             link=""),
        dict(id="excise", question="What taxes apply to imported oil besides tariffs?",
             searchedAs=["taxes on crude oil", "taxes on diesel fuel"],
             answer=f"Two federal excise taxes collected by the IRS, not by CBP: the petroleum Superfund tax (26 U.S.C. 4611) on crude oil and petroleum products entered for consumption, use or warehousing — 16.4¢ per barrel indexed for inflation{SF2026}; the 9¢ oil spill tax expired after 2025 — and fuel taxes of 18.4¢ per gallon on gasoline and 24.4¢ on diesel and kerosene. Neither is in the tariff calculator.",
             link="tariff-engineering"),
    ]
