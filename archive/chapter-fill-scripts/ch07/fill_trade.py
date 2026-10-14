# Trade-dependent and country-specific texts for Chapter 07.
import re

TITLE = "Edible Vegetables and Certain Roots and Tubers"
EX = (
    "91 of the 422 lines are on the general exemption list (U.S. note 52(b), 9903.05.86) and pay no 2026 Section 301 duty from "
    "any country: all fresh tomatoes, seed potatoes, seeds for sowing, cassava, taro, yautia and a few others."
)
IEEPA_END = "The IEEPA duties ended February 24, 2026."


def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    return f"${v / 1e6:.0f}M"


def pct(a, b):
    return round(100 * a / b)


def strip_todo(label):
    return re.sub(r"\s*TODO:.*$", "", label).strip()


IN_EFFECT = {
    "Mexico": dict(
        exemption="USMCA-qualifying goods: no Section 301 duty (9903.05.94). " + EX + " The 2025 IEEPA duty on Mexico (+25%, "
        "9903.01.01) ended February 24, 2026. The antidumping duty on fresh tomatoes (17.09% for most exporters, since July 14, "
        "2025) is not a tariff-schedule duty and applies with or without a USMCA claim.",
        whatItMeans="USMCA-qualifying peppers, cucumbers, squash and asparagus from Mexico pay $0; produce that does not qualify "
        "pays the base rate plus 10% of value. A $24,000 load of Mexican tomatoes pays no tariff with USMCA, but a $4,101.60 "
        "antidumping deposit.",
        add=["fr-2025-13453", "eo-14194", "eo-14389"],
    ),
    "Canada": dict(
        exemption="USMCA-qualifying goods: no Section 301 duty (9903.05.93). " + EX + " The 2025 IEEPA duty on Canada (+35%, "
        "9903.01.10) ended February 24, 2026. The 2026 Section 338 duties on certain Canadian alcoholic beverages, dairy and "
        "motor vehicles (9903.03.12–9903.03.14) list no Chapter 07 line.",
        whatItMeans="USMCA-qualifying potatoes, greenhouse cucumbers and peppers from Canada pay $0; Canadian goods that do not "
        "qualify pay the base rate plus 10% of value.",
        add=["eo-14325", "eo-14389"],
    ),
    "Peru": dict(
        exemption=EX + " The Peru Trade Promotion Agreement (PE) makes the base rate Free on the dutiable lines but does not remove "
        "the Section 301 duty (U.S. note 52(a)). The IEEPA reciprocal duty on Peru ended February 24, 2026.",
        whatItMeans="Fresh asparagus from Peru claimed under PE pays 12.5% of value: $6,250 on a $50,000 shipment, in any season.",
        add=["eo-14389"],
    ),
    "China": dict(
        now="+37.5% or +20% (+25% or +7.5% on exempt-list lines)",
        exemption="Two Section 301 duties stack. The 2026 action adds 12.5% (9903.05.31, from July 24, 2026) on the 331 lines "
        "that are not on the exemption list (U.S. note 52(b)). The 2018–2019 actions add 25% (List 3, 9903.88.03, 281 lines) or "
        "7.5% (List 4A, 9903.88.15, 141 lines) on every Chapter 07 line, exemption list included. The IEEPA duties on China ended "
        "February 24, 2026. Fresh garlic also carries an antidumping deposit of $4.71/kg.",
        whatItMeans="Garlic powder from China (29.8% base) pays 67.3% of value; fresh garlic pays 0.43¢/kg + 37.5% plus the "
        "$4.71/kg antidumping deposit; tomatoes pay their base rate + 7.5%.",
        add=["fr-2023-11061", "fr-2024-12351", "eo-14389"],
    ),
    "Guatemala": dict(
        exemption=EX + " CAFTA-DR (P) makes the base rate Free but does not remove the 10% (U.S. note 52(a)); the CAFTA-DR relief "
        "in note 52(i) covers textiles and apparel only, and Guatemala's exception lists (9903.06.04–9903.06.06) have no Chapter 07 "
        "line. The IEEPA reciprocal duty ended February 24, 2026.",
        whatItMeans="Fresh snow peas or sugar snaps from Guatemala (0708.10) claimed under CAFTA-DR pay 10% of value.",
        add=["eo-14389"],
    ),
    "Costa Rica": dict(
        exemption=EX + " CAFTA-DR (P) makes the base rate Free but does not remove the 12.5% (U.S. note 52(a)); the CAFTA-DR relief "
        "in note 52(i) covers textiles and apparel only. The IEEPA reciprocal duty ended February 24, 2026.",
        whatItMeans="Fresh cassava from Costa Rica pays nothing: cassava is on the exemption list and CAFTA-DR makes the 11.3% base "
        "rate Free. Other Costa Rican vegetables pay 12.5% of value.",
        add=["eo-14389"],
    ),
    "European Union": dict(
        now="10% (in place of a lower base rate)",
        exemption="For EU goods whose base rate is under 10%, the total is 10% (9903.05.39); lines with a base rate of 10% or more "
        "(spinach and okra 20%, sweet corn 21.3%, frozen vegetables 11.3% to 14.9%, dried garlic 29.8%) pay the base rate only. "
        + EX + " The EU exception list (9903.05.97) has no Chapter 07 line. This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        whatItMeans="Frozen vegetables from Spain (11.3% to 14.9% base) pay just the base rate; Spanish garlic (0.43¢/kg) and Dutch "
        "peppers (4.7¢/kg) pay 10% of value.",
        add=["eo-14389"],
    ),
    "Ecuador": dict(
        exemption=EX + " The United States has no FTA with Ecuador and GSP has been expired since December 31, 2020, so the base "
        "rate always applies. The IEEPA reciprocal duty ended February 24, 2026.",
        whatItMeans="Frozen broccoli from Ecuador (14.9% base when cut) pays 24.9% of value; cassava and taro pay only their base rate.",
        add=["eo-14389", "cbp-gsp"],
    ),
    "India": dict(
        exemption=EX + " There is no FTA with India and GSP has been expired since December 31, 2020. The IEEPA duties ended "
        "February 24, 2026.",
        whatItMeans="Dried chickpeas (1.4¢/kg) or lentils (0.15¢/kg) from India pay their per-kilogram base rate plus 10% of value; "
        "guar seeds pay nothing.",
        add=["eo-14389", "cbp-gsp"],
    ),
    "Honduras": dict(
        exemption=EX + " CAFTA-DR (P) makes the base rate Free but does not remove the 10% (U.S. note 52(a)); the CAFTA-DR relief "
        "in note 52(i) covers textiles and apparel only. The IEEPA reciprocal duty ended February 24, 2026.",
        whatItMeans="Fresh vegetables from Honduras (heading 0709) claimed under CAFTA-DR pay 10% of value.",
        add=["eo-14389"],
    ),
    "Brazil": dict(
        exemption="+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July "
        "24, 2026 (9903.05.27). The Brazil exemption list (U.S. note 50(a)(ii)) has 26 Chapter 07 subheadings — tomatoes, cassava, "
        "taro, yautia and others — that pay neither duty; seed potatoes and sowing seeds are exempt only from the 12.5% and pay 25%.",
        whatItMeans="Most vegetables from Brazil pay the base rate plus 37.5% of value; Brazilian cassava pays only its base rate.",
        add=[],
    ),
}

OTHER = dict(
    exemption="+10% or +12.5% depending on the country (for example Chile, Colombia, Thailand and Vietnam +12.5%; Argentina "
    "and Pakistan +10%); Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total where the base rate is lower. "
    + EX + " No country exception list in U.S. note 52(j) contains a Chapter 07 line. Countries outside the 60 economies pay no extra "
    "duty; Nicaragua (+12.5%) faces a further Section 301 duty on non-CAFTA-DR goods from January 1, 2027.",
    whatItMeans="FTA claims do not remove the duty: Chilean or Colombian vegetables claimed under their FTA still pay 12.5% of value.",
    add=["eo-14389"],
)

RULE_EXTRA = {
    "Mexico": " The 2025 IEEPA duty (+25%) ended February 24, 2026. Fresh tomatoes also carry an antidumping deposit (17.09% for most exporters) that is not in the cells.",
    "Canada": " The 2025 IEEPA duty (+35%) ended February 24, 2026; no Chapter 07 line is on the Section 338 lists.",
    "Peru": " PE removes the base rate but not the Section 301 duty (U.S. note 52(a)). 91 lines are on the exemption list (9903.05.86) and pay no extra duty.",
    "China": " The 2026 duty skips the 91 exempt lines; List 3 or 4A reaches all 422. Fresh garlic also carries an antidumping deposit of $4.71/kg that is not in the cells.",
    "Guatemala": " CAFTA-DR removes the base rate but not the Section 301 duty; Guatemala's exception lists (note 52(j)) have no Chapter 07 line.",
    "Costa Rica": " CAFTA-DR removes the base rate but not the Section 301 duty; note 52(i) covers textiles only.",
    "Honduras": " CAFTA-DR removes the base rate but not the Section 301 duty; note 52(i) covers textiles only.",
    "Spain": " Lines with a base rate of 10% or more pay the base rate only. The EU exception list (9903.05.97) has no Chapter 07 line.",
    "Ecuador": " No FTA; GSP has been expired since 2020.",
    "India": " No FTA; GSP has been expired since 2020.",
}

OTHER_RULE = (
    "Countries outside the 60 Section 301 economies pay only the base rate; the 60 pay +10% or +12.5% (EU, Japan, South Korea, "
    "Switzerland and Taiwan a 10% or 12.5% total), and Brazil +37.5% (9903.05.01, 9903.05.20–9903.05.84). FTA preferences are not "
    "applied in this row."
)


def apply(d):
    ui = d["understandIndustry"]
    ov = d["overview"]
    tu = d["tariffUpdates"]
    ia = d["industryAreas"]
    fc = d["finalConclusion"]
    by_country = {c["country"]: c for c in ui["byCountry"]}
    total = ui["byYear"][-1]["totalUsd"]
    prior = ui["byYear"][-2]["totalUsd"]
    mx, ca = by_country["Mexico"], by_country["Canada"]
    lines = {l["hs6"]: l for l in ui["byLine"]}
    tom = lines["0702.00"]
    usmca_share = pct(mx["importsUsd"] + ca["importsUsd"], total)
    T, P = money(total), money(prior)

    # ---------------- overview ----------------
    ov["seo"]["shortDescription"] = (
        "Searchable duty table for all 422 HTS Chapter 07 tariff lines — potatoes, tomatoes, onions and garlic, lettuce, peppers, "
        "asparagus, mushrooms, frozen and dried vegetables, beans and lentils, cassava. General, FTA and Column 2 rates, filterable by product name."
    )
    ov["seo"]["keywords"] = [
        "HTS Chapter 07",
        "hts chapter 07 import duty rates",
        "edible vegetables and certain roots and tubers tariff",
        "vegetable import duty",
        "tomato tariff code",
        "garlic tariff code",
        "dried garlic import duty rates",
        "seed potatoes import duty",
        "onion powder tariff",
    ]
    ov["intro"] = (
        "Chapter 07 covers vegetables — fresh, chilled, frozen, provisionally preserved and dried — plus dried beans, peas and "
        "lentils and starchy roots like cassava and sweet potatoes. Most of its **422 tariff lines** carry small per-kilogram "
        "rates, and many change with the season: tomatoes pay 3.9¢/kg in spring and fall and 2.8¢/kg the rest of the year, and "
        "asparagus flown in between September 15 and November 15 pays 5% instead of 21.3%. A few are high: 29.8% on dried garlic "
        "and onion powder, 8.8¢/kg + 20% on fresh mushrooms.\n\n"
        f"The U.S. imported {T} of these goods in 2025, {usmca_share}% of it from Mexico and Canada, and USMCA-qualifying produce "
        "from both enters free. Since **July 24, 2026** most other suppliers pay a **Section 301 tariff of 10% or 12.5%** on top "
        "(EU goods 10% in total, China +37.5% or +20%) — but **91 lines are exempt**, including all fresh tomatoes, seed potatoes, "
        "sowing seeds, cassava and taro. Two **antidumping duties** sit outside the schedule: 17.09% on most fresh tomatoes from "
        "Mexico and $4.71/kg on fresh garlic from China."
    )
    for s in ov["stats"]:
        if s["label"].startswith("Lines with an extra duty"):
            s["note"] = "Section 301: 331 lines for the 60 economies, all 422 for China; USMCA goods exempt"
    ov["stats"].insert(3, {"label": "Lines exempt from the 2026 Section 301", "value": "91 of 422", "note": "U.S. note 52(b): tomatoes, seed potatoes, sowing seeds, cassava, taro"})
    ts = ov["tradeSnapshot"]
    ts["totalDutyCollectedUsd"] = None
    ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
    ts["coverageNote"] = "Import values are CIF as reported by the United States to UN Comtrade; duty collected is not shown."
    ts["biggestLines"] = [{"hts": "0702.00", "label": "Tomatoes, fresh or chilled"}, {"hts": "0709.60", "label": "Peppers, fresh or chilled"}]

    # ---------------- tariff updates ----------------
    tu["seo"] = {
        "title": "HTS Chapter 07 Vegetable Tariff Updates 2026 — Mexico Tomatoes, China Garlic, Section 301 | KoalaGains",
        "shortDescription": "What changed for HTS Chapter 07 vegetables since January 2025: unchanged base rates, the end of the IEEPA and "
        "Section 122 duties, the 2026 Section 301 tariffs and their exemption list, and the 17.09% antidumping duty on Mexican "
        "tomatoes — with Federal Register citations.",
        "keywords": [
            "HTS Chapter 07 tariff updates",
            "mexico tomato tariff 2026",
            "tomato antidumping duty mexico",
            "tariffs on vegetables from mexico",
            "china garlic tariff",
            "section 301 tariff vegetables",
            "peru asparagus tariff",
            "usmca vegetables duty",
        ],
    }
    tu["intro"] = (
        "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
        "current **2026 Revision 21** (in force October 9, 2026). No Chapter 07 base rate changed: 412 of the 422 lines read the "
        "same, and the other 10 are new statistical lines for certified-organic produce at their old rate.\n\n"
        "Everything that changed came on top of the base rate. The 2025 IEEPA duties (Canada +35% and Mexico +25% on goods that did "
        "not qualify for USMCA, the reciprocal tariff on everyone else) **ended on February 24, 2026**, and the 10% Section 122 "
        "surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, vegetables from 60 economies pay a "
        "**Section 301 tariff of 10% or 12.5%**, except **91 lines on the exemption list** (all fresh tomatoes, seed potatoes, "
        "sowing seeds, cassava, taro and a few others). China pays more because its 2018–2019 Section 301 duties stack on top "
        "(**+37.5% or +20%**). **USMCA-qualifying produce from Canada and Mexico is still exempt.** Separately, fresh tomatoes "
        "from Mexico have carried an **antidumping duty of 17.09%** for most exporters since July 14, 2025."
    )
    tu["scope"] = (
        "Measures that reach Chapter 07 from any country: the 2026 Section 301 tariffs on 60 economies and their exemption list, the "
        "Brazil Section 301 tariff, the China Section 301 Lists 3 and 4A, the scheduled Nicaragua tariff, the 2025–2026 IEEPA and "
        "Section 122 duties that have ended, and the antidumping orders on fresh tomatoes from Mexico and fresh garlic from China. "
        "For the rate each supplier pays, see Rates by country."
    )
    tu["stats"].append({"label": "Lines exempt from 2026 Section 301", "value": "91 of 422"})
    tu["stats"].append({"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"})
    for e in tu["inEffect"]:
        spec = IN_EFFECT.get(e["country"], OTHER if e["id"].startswith("other") else None)
        assert spec, e["country"]
        e["exemption"] = spec["exemption"]
        e["whatItMeans"] = spec["whatItMeans"]
        if "now" in spec:
            e["now"] = spec["now"]
        for sid in spec["add"]:
            if sid not in e["sourceIds"]:
                e["sourceIds"].append(sid)
        if e["id"].startswith("other"):
            e["country"] = "Other Section 301 economies (incl. Chile, Colombia, Thailand, Vietnam, Japan, South Korea, Argentina, Nicaragua)"
    tu["changes"] = [c for c in tu["changes"] if not c["id"].startswith("section-301-nicaragua-2028")]
    for c in tu["changes"]:
        cid = c["id"]
        if cid.startswith("section-301-nicaragua-2027"):
            c["id"] = "section-301-nicaragua-scheduled"
            c["date"] = "2025-12-29"
            c["dateLabel"] = "Published"
            c["title"] = "Section 301 tariff on Nicaragua scheduled: 10% in 2027, 15% in 2028"
            c["detail"] = ("USTR's Section 301 action on Nicaragua phases in a tariff on goods of Nicaragua that do not originate "
                           "under CAFTA-DR (9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028, on every "
                           "Chapter 07 line, on top of the 12.5% 2026 Section 301 duty where that applies. Goods entered with a "
                           "CAFTA-DR claim are not covered.")
            c["now"] = "+10% (2027), +15% (2028)"
        elif cid.startswith("section-301-2026-60-economies"):
            c["title"] = "Section 301 tariffs on 60 economies cover most vegetables"
            c["detail"] = ("10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), except the 91 Chapter 07 lines on "
                           "the general exemption list (U.S. note 52(b), 9903.05.86): fresh tomatoes, seed potatoes, sowing seeds, "
                           "cassava, taro, yautia and others. EU goods pay 10% in total where the base rate is lower; Japan, South "
                           "Korea and Switzerland 12.5%. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, "
                           "9903.05.94); other FTA claims do not remove it.")
            c["countries"] = "60 economies"
            c["now"] = "+10% / +12.5%"
        elif cid.startswith("section-301-brazil"):
            c["title"] = "Section 301 tariff on products of Brazil"
            c["detail"] = ("25% on all goods of Brazil (9903.05.01). The Brazil exemption list (U.S. note 50(a)(ii)) includes 26 "
                           "Chapter 07 subheadings, among them tomatoes, cassava, taro and yautia. From July 24 the 12.5% "
                           "forced-labor tariff (9903.05.27) is added on top.")
        elif cid == "base-rates":
            c["title"] = "No Chapter 07 base-rate changes"
            c["detail"] = ("412 of the 422 lines carry the same General rate in 2026 Revision 21 as in the 2025 Basic Edition. The "
                           "other 10 are new statistical lines that split certified-organic Brussels sprouts, Agaricus mushrooms, "
                           "spinach and frozen vegetables out of existing lines, at the same rate as their 8-digit line. No General "
                           "rate changed.")

    # ---------------- understand industry ----------------
    mx_drop = mx["priorImportsUsd"] - mx["importsUsd"]
    ui["h1"] = f"HTS Chapter 07: {TITLE} — U.S. Import Statistics"
    ui["seo"] = {
        "title": "HTS Chapter 07 Vegetable Import Statistics by Country & Product | KoalaGains",
        "shortDescription": f"U.S. imports of vegetables, roots and tubers 2020–2025 by country, product and year: {T} in 2025, "
        f"down {abs(round(100 * (total - prior) / prior, 1))}% from {P}. Mexico supplied {round(mx['sharePct'])}% and Canada "
        f"{round(ca['sharePct'])}%; tomatoes, peppers and cucumbers lead.",
        "keywords": [
            "vegetable imports by country",
            "us vegetable imports mexico",
            "HTS Chapter 07 import statistics",
            "us tomato imports 2025",
            "us asparagus imports peru",
            "mexico vegetables market share",
        ],
    }
    ui["byYearCaption"] = "U.S. imports of Chapter 07 goods each year, split into the two USMCA partners (Mexico and Canada) and everyone else."
    ui["effectiveDuty"]["dutyPaidUsd"] = None
    ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
    ui["why"] = (
        f"U.S. imports of vegetables fell from **{P} in 2024 to {T} in 2025** ({round(100 * (total - prior) / prior, 1)}%), the first "
        f"annual drop in the 2020–2025 series. Most of it was **Mexico**: {money(mx['priorImportsUsd'])} to {money(mx['importsUsd'])}, "
        f"a fall of {money(mx_drop)} against a total fall of {money(prior - total)}. Fresh tomatoes, the largest product, fell from "
        f"{money(tom['priorImportsUsd'])} to {money(tom['importsUsd'])} ({tom['changePct']}%), and onions, lettuce, squash and "
        f"brassicas fell 19% to 29%. Canada was flat at {money(ca['importsUsd'])}.\n\n"
        "Base rates did not change, and USMCA-qualifying produce from Mexico paid no extra duty in 2025. Two measures did raise the "
        "cost of some Mexican shipments during the year: the 25% IEEPA duty on goods that did not qualify for USMCA (from March 4, "
        "2025; ended February 24, 2026) and, from July 14, 2025, the antidumping deposit of 17.09% on most fresh tomatoes. These are "
        "values, not volumes, so lower produce prices also show up as a drop.\n\n"
        "After the two USMCA partners come Peru (asparagus and onions), China (garlic and dried vegetables), Guatemala (fresh peas "
        "and beans), Costa Rica (cassava and other roots) and Spain (frozen vegetables and garlic). 2025 is the latest full year of "
        "U.S. trade data."
    )
    ui["sources"] += [
        {"label": "Federal Register 90 FR 33363 (antidumping order on fresh tomatoes from Mexico, July 17, 2025)",
         "url": "https://www.federalregister.gov/documents/2025/07/17/2025-13453/fresh-tomatoes-from-mexico-termination-of-suspension-agreement-rescission-of-administrative-reviews"},
        {"label": "Federal Register 90 FR 9117 (Executive Order 14194, Mexico IEEPA duty)",
         "url": "https://www.federalregister.gov/documents/2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"},
    ]
    ui["coverageNote"] = ui["coverageNote"] or "Values are CIF, as reported by the United States to UN Comtrade."

    # ---------------- industry areas ----------------
    ia["seo"] = {
        "title": "HTS Chapter 07 Vegetable Tariff Rates by Country — Mexico, Canada, Peru, China, Spain | KoalaGains",
        "shortDescription": "The total U.S. tariff on vegetables, roots and tubers by country and product group: base rate plus the 2026 "
        "Section 301 duty, with USMCA, the Peru TPA and CAFTA-DR applied. Mexico, Canada, Peru, China, Guatemala, Costa Rica, Spain, "
        "Ecuador, India, Honduras.",
        "keywords": [
            "tariff on vegetables from mexico",
            "tariffs on produce from canada",
            "peru asparagus tariff",
            "china garlic tariff",
            "vegetable tariff by country",
            "HTS Chapter 07 tariff rates by country",
        ],
    }
    ia["intro"] = (
        "The total rate on vegetables depends more on **where they come from** than on what they are. Each cell below is the base "
        "rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff "
        "schedule.\n\n"
        f"**USMCA-qualifying produce from Mexico and Canada — {usmca_share}% of 2025 imports — enters free.** Peru, Guatemala, Costa "
        "Rica and Honduras claim FTA rates that remove the base rate, but the **2026 Section 301 duty of 10% or 12.5%** still "
        "applies; Spain pays 10% or its base rate if higher; **China** pays the most, +37.5% or +20%. Fresh tomatoes, seed potatoes, "
        "cassava, taro and other exempt-list lines pay no Section 301 duty from any country except China's older lists. The "
        "antidumping duties on Mexican tomatoes and Chinese garlic are not in the cells."
    )
    for c in ia["countries"]:
        r = c["rule"]
        if c["country"] == "Any other country":
            r["label"] = OTHER_RULE
        else:
            r["label"] = strip_todo(r["label"]) + RULE_EXTRA.get(c["country"], "")
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 "
        "surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "Antidumping duties are not tariff-schedule duties and are not in the cells: fresh tomatoes from Mexico pay a cash deposit of "
        "17.09% of value for most exporters (since July 14, 2025, with or without USMCA), and fresh garlic from China $4.71/kg.",
        "The rate is not the only gate: APHIS must have authorized that vegetable from that country, and potatoes, onions and "
        "tomatoes must meet USDA Section 8e grade rules (see Tariff engineering).",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) (9903.05.86) lists 40 Chapter "
        "07 provisions — 91 of the 422 lines — exempt from the 2026 Section 301 duties for every country: tomatoes, seed potatoes, "
        "jicama, breadfruit, chayote, bamboo shoots and water chestnuts (0710.80.15), capers, dried wood ears and shiitake, sweet "
        "corn seed, legume seeds for sowing, Bambara beans, guar seeds, cassava, taro, yautia and most frozen or dried Chinese water "
        "chestnuts. Notes 52(c)–(e) name no Chapter 07 article, note 52(i) covers CAFTA-DR textiles only, and none of the country "
        "exception lists in note 52(j) contains a Chapter 07 line. The Brazil exemption list (note 50(a)(ii)) has 26 Chapter 07 "
        "subheadings; the Canada Section 338 lists (note 51) have none. China's List 3 (281 lines) and List 4A (141 lines) together "
        "cover all 422."
    )

    # ---------------- final conclusion ----------------
    fc["seo"] = {
        "title": "Vegetable Tariffs FAQ: Mexico Tomatoes, Canada Produce, China Garlic, HS Codes (HTS Ch. 07) | KoalaGains",
        "shortDescription": "Answers to what people search about vegetable tariffs: tariffs on tomatoes and produce from Mexico, "
        "Canadian vegetables and potatoes, garlic from China, asparagus from Peru, and the HS codes for garlic, onions, potatoes and tomatoes.",
        "keywords": [
            "tariff on tomatoes from mexico",
            "are there tariffs on vegetables from mexico",
            "tariffs on produce from canada",
            "garlic tariffs",
            "hs code for garlic powder",
            "hs code for onion",
            "hs code for potatoes",
            "hs code for fresh vegetables",
            "mushroom tariffs",
            "asparagus tariffs",
        ],
    }
    fc["intro"] = ("Straight answers to the most common questions about importing vegetables into the U.S. — tariffs by country, "
                   "HS codes and entry rules. Each answer links to the page with the full detail.")
    fc["keyTakeaways"] = [
        f"USMCA-qualifying vegetables from Mexico and Canada — {usmca_share}% of 2025 imports — enter free: no base rate, no extra duty.",
        "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff of 10% or "
        "12.5% (EU 10% in total, China +37.5% or +20%), and 91 lines — all fresh tomatoes, seed potatoes, sowing seeds, cassava, "
        "taro — are exempt.",
        "Antidumping duties matter more than tariffs for two products: 17.09% on most fresh tomatoes from Mexico, even with USMCA, "
        "and $4.71/kg on fresh garlic from China.",
        "Every fresh vegetable needs USDA APHIS authorization for its country of origin, and potatoes, onions and tomatoes must meet "
        "USDA grade rules before release.",
    ]
    fc["lastCheckedAt"] = d["asOf"]
    fc["questionSource"] = "Google search suggestions (U.S.), collected October 11, 2026"
    peru = by_country["Peru"]
    fc["faqs"] = [
        {
            "id": "mexico-tomatoes",
            "question": "Is there a tariff on tomatoes from Mexico?",
            "searchedAs": ["tariff on tomatoes from mexico", "are there tariffs on tomatoes from mexico", "tomato tariff mexico",
                           "tomato tariffs us mexico trade"],
            "answer": "No tariff with a USMCA claim, but there is an antidumping duty. The base rate (3.9¢/kg from March 1 to July "
            "14 and September 1 to November 14, 2.8¢/kg otherwise) is Free under USMCA, and tomatoes are on the Section 301 "
            "exemption list (9903.05.86). Since July 14, 2025, when the 2019 suspension agreement ended, fresh tomatoes from Mexico "
            "carry an antidumping cash deposit of 17.09% of value for most exporters, with or without USMCA. The USITC decided on "
            "July 20, 2026 not to revoke the order. Tomatoes imported for processing are excluded if entered with USDA Form SC-6 and "
            f"a processing certification. The U.S. imported {money(tom['importsUsd'])} of fresh tomatoes in 2025.",
            "link": "tariff-updates",
        },
        {
            "id": "mexico-produce",
            "question": "Are there tariffs on vegetables from Mexico?",
            "searchedAs": ["tariffs on vegetables from mexico", "are there tariffs on vegetables from mexico",
                           "tariff on produce from mexico", "tariff on mexican produce"],
            "answer": "Not on USMCA-qualifying produce: Mexican-grown vegetables qualify and enter free, with no Section 301 duty "
            "(9903.05.94). Vegetables that do not qualify pay the base rate plus 10% of value (9903.05.55), except the 91 exempt "
            "lines such as tomatoes and cassava. The 25% IEEPA duty of 2025 ended on February 24, 2026. The exception is fresh "
            f"tomatoes, which carry a 17.09% antidumping deposit for most exporters. Mexico supplied {money(mx['importsUsd'])} "
            f"({round(mx['sharePct'])}%) of U.S. vegetable imports in 2025.",
            "link": "industry-areas",
        },
        {
            "id": "canada-produce",
            "question": "Are there tariffs on vegetables and potatoes from Canada?",
            "searchedAs": ["canada vegetable tariff", "tariffs on produce from canada", "tariff on canadian produce",
                           "potato tariff canada", "canadian potato tariffs"],
            "answer": "Not on USMCA-qualifying goods. Canadian potatoes (0.5¢/kg base), greenhouse cucumbers, peppers and tomatoes "
            "enter free with a USMCA claim and pay no Section 301 duty (9903.05.93). Goods that do not qualify pay the base rate "
            "plus 10% of value (9903.05.29). The 35% IEEPA duty ended on February 24, 2026, and the 2026 Section 338 duties on "
            "Canadian dairy, alcohol and vehicles do not cover vegetables. Potatoes from Newfoundland and part of Central Saanich, "
            f"British Columbia cannot be imported (7 CFR 319.56-3). Canada supplied {money(ca['importsUsd'])} in 2025.",
            "link": "industry-areas",
        },
        {
            "id": "china-garlic",
            "question": "What is the tariff on garlic from China?",
            "searchedAs": ["garlic tariffs", "tariff on garlic from china", "chinese garlic tariff"],
            "answer": "Fresh garlic (0703.20) from China pays the 0.43¢/kg base rate plus 37.5% of value — 25% under Section 301 "
            "List 3 (9903.88.03) and 12.5% under the 2026 action (9903.05.31) — plus an antidumping cash deposit of $4.71 per "
            "kilogram (China-wide rate), in place since 1994 and continued in 2023. Garlic powder and other dried garlic "
            "(0712.90.40) is not among the subheadings the antidumping order lists, but pays 29.8% + 37.5% = 67.3%.",
            "link": "tariff-updates",
        },
        {
            "id": "hs-garlic",
            "question": "What is the HS code for garlic and garlic powder?",
            "searchedAs": ["hs code for garlic", "hs code for garlic powder", "garlic powder tariff code", "garlic tariff code",
                           "hs code for garlic flakes"],
            "answer": "Fresh or chilled garlic is 0703.20 (0.43¢/kg); dried garlic — powder, flakes, granules — is 0712.90.40 "
            "(29.8%). Frozen garlic falls under 0710.80, and garlic in brine for transport under 0711.90. Garlic paste and garlic "
            "salt are prepared foods outside Chapter 07.",
            "link": "",
        },
        {
            "id": "hs-onion",
            "question": "What is the HS code for onions and onion powder?",
            "searchedAs": ["hs code for onion", "hs code for onion powder", "hs code for dehydrated onion powder",
                           "hs code for fresh onions"],
            "answer": "Fresh onions and shallots are 0703.10: onion sets 0.83¢/kg, small pearl onions 0.96¢/kg, other onions "
            "3.1¢/kg. Dried onion is 0712.20: powder or flour 29.8%, flakes and other dried onion 21.3%. Imported onions must also "
            "meet USDA grade and size rules (7 CFR 980.117).",
            "link": "",
        },
        {
            "id": "hs-potato",
            "question": "What is the HS code for potatoes?",
            "searchedAs": ["hs code for potatoes", "potato tariff code", "sweet potato tariff code"],
            "answer": "Fresh potatoes are 0701 (0.5¢/kg): 0701.10 for certified seed potatoes, 0701.90 for table and processing "
            "potatoes. Frozen potatoes are 0710.10 (14%), dried potatoes 0712.90.30 (2.3¢/kg), and sweet potatoes 0714.20 (4.5% "
            "fresh, 6% frozen). Potato chips, flakes and frozen fries are outside Chapter 07.",
            "link": "",
        },
        {
            "id": "hs-tomato",
            "question": "What is the HS code for fresh tomatoes?",
            "searchedAs": ["hs code for tomatoes", "hs code for fresh tomatoes", "tomato tariff code", "hs code for tomato powder"],
            "answer": "0702.00, split by season: 0702.00.20 (March 1 to July 14 and September 1 to November 14, 3.9¢/kg), "
            "0702.00.40 (July 15 to August 31, 2.8¢/kg) and 0702.00.60 (November 15 to February, 2.8¢/kg), with 10-digit lines for "
            "greenhouse, cherry, grape, Roma and round tomatoes. Tomato powder is 0712.90.74 (8.7%); paste, sauce and ketchup are "
            "prepared foods outside Chapter 07.",
            "link": "",
        },
        {
            "id": "hs-vegetables",
            "question": "What is the HS code for fresh vegetables?",
            "searchedAs": ["hs code for fresh vegetables", "hs code for vegetables", "hs code for fresh produce",
                           "hs code for fruits and vegetables"],
            "answer": "Chapter 07. Fresh or chilled vegetables are headings 0701 to 0709 (potatoes, tomatoes, onions and garlic, "
            "cabbages, lettuce, carrots, cucumbers, peas and beans, and other vegetables such as peppers and asparagus); frozen "
            "vegetables are 0710, dried 0712, dried beans and lentils 0713, and cassava and sweet potatoes 0714. Fruit and nuts are "
            "Chapter 08.",
            "link": "",
        },
        {
            "id": "mushrooms",
            "question": "What is the tariff on mushrooms?",
            "searchedAs": ["mushroom tariffs", "us mushroom tariff", "mushroom tariff code", "dried mushroom tariff code",
                           "canadian mushroom tariffs"],
            "answer": "Fresh mushrooms (0709.51–0709.59) pay 8.8¢/kg + 20%, truffles are free. Dried mushrooms are 0712.31–0712.39 "
            "(1.3¢/kg + 1.8% air or sun dried, otherwise 1.9¢/kg + 2.6%; dried wood ears 8.3%). USMCA-qualifying Canadian "
            "mushrooms enter free. From the 60 Section 301 economies, add 10% or 12.5% — except dried shiitake and wood ears, which "
            "are on the exemption list.",
            "link": "",
        },
        {
            "id": "peru-asparagus",
            "question": "What is the tariff on asparagus from Peru?",
            "searchedAs": ["asparagus tariffs", "peru asparagus tariff"],
            "answer": "12.5% of value. Fresh asparagus has a base rate of 21.3% (5% if air-freighted between September 15 and "
            "November 15), which the Peru Trade Promotion Agreement makes Free, but the 12.5% Section 301 duty on goods of Peru "
            f"(9903.05.63) applies even with an FTA claim. Peru supplied {money(peru['importsUsd'])} of U.S. vegetable imports in "
            "2025, mostly fresh vegetables (heading 0709).",
            "link": "industry-areas",
        },
        {
            "id": "lentils",
            "question": "What is the tariff code and duty for lentils?",
            "searchedAs": ["lentils tariff code", "lentil tariff"],
            "answer": "Dried lentils are 0713.40: 0713.40.20 at 0.15¢/kg, or 0713.40.10 at 1.5¢/kg for lentils of a kind used for "
            "sowing (which are on the Section 301 exemption list). Fresh lentils are 0708.90.15 (0.1¢/kg). From the 60 Section 301 "
            "economies, non-seed lentils also pay 10% or 12.5% of value.",
            "link": "",
        },
        {
            "id": "us-imports",
            "question": "How much of its vegetables does the U.S. import, and from where?",
            "searchedAs": ["us vegetable imports", "us vegetable imports by country", "where does the us import vegetables from",
                           "how much produce does the us import from mexico"],
            "answer": f"{T} of Chapter 07 goods in 2025, down from {P} in 2024. Mexico supplied {round(mx['sharePct'])}% and "
            f"Canada {round(ca['sharePct'])}%; next were Peru, China, Guatemala, Costa Rica and Spain. Tomatoes "
            f"({money(tom['importsUsd'])}), peppers and cucumbers are the largest products.",
            "link": "understand-industry",
        },
    ]
