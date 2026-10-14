# understandIndustry for Chapter 60. Executed from fill_text.py.

ui["h1"] = "HTS Chapter 60: Knitted or Crocheted Fabrics — U.S. Import Statistics by Country and Product"
ui["seo"]["title"] = (
    f"Knitted Fabric Imports to the U.S. by Country: {', '.join(TOP[:4])} — HTS Chapter 60 Statistics | KoalaGains"
)
top_ln = sorted(ui["byLine"], key=lambda x: -x["importsUsd"])
ui["seo"]["shortDescription"] = (
    f"U.S. imports of knitted and crocheted fabric {ui['byYear'][0]['year']}–{YEAR} by country, product and year: {usd(TOTAL)} in "
    f"{YEAR}. {TOP[0]} supplied {pct(share(TOP[0]))} and {TOP[1]} {pct(share(TOP[1]))}; "
    f"{BIG_LABEL.get(top_ln[0]['hs6'], top_ln[0]['hs6']).lower()} ({top_ln[0]['hs6']}) was {pct(lshare(top_ln[0]['hs6']))}."
)
ui["seo"]["keywords"] = [
    "knitted fabric imports by country",
    "knitted fabric importers",
    "united states tariff on knitted or crocheted fabrics",
    "knitted fabric import duty",
    "hts 6006 imports",
    "china knitted fabric exports to us",
    "hs code 6006.32",
]
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearCaption"] = (
    f"U.S. imports of Chapter 60 fabric each year, split into the two largest {YEAR} suppliers ({ui['byYearPartners'][0]} and "
    f"{ui['byYearPartners'][1]}) and everyone else."
)
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
first = ui["byYear"][0]
peak = max(ui["byYear"], key=lambda y: y["totalUsd"])
chg_txt = f"{CHG:+.1f}%" if CHG is not None else "n/a"
lines_txt = ", ".join(
    f"**{ln['hs6']}** ({BIG_LABEL.get(ln['hs6'], ln['description'][:50]).lower()}, {usd(ln['importsUsd'])})" for ln in top_ln[:3]
)
cn_hs = sorted([x for x in ui["byHeadingCountry"] if x["country"] == "China"], key=lambda x: -x["importsUsd"])
ui["why"] = (
    f"U.S. imports of Chapter 60 fabric were **{usd(TOTAL)} in {YEAR}**, {chg_txt} against {usd(PRIOR)} in {YEAR - 1}"
    + (f" and below the {peak['year']} peak of {usd(peak['totalUsd'])}" if peak["year"] != YEAR else "")
    + f". The top suppliers were "
    + ", ".join(f"**{c['country']} {usd(c['importsUsd'])}**" for c in ui["byCountry"][:5])
    + f"; together they shipped {pct(sum(share(c['country']) for c in ui['byCountry'][:5]))}.\n\n"
    + "By product, warp knits lead: "
    + ", ".join(f"{h} {pct(hshare(h))}" for h in sorted(HEAD_IMP, key=lambda h: -HEAD_IMP[h]))
    + f" of the total (6005 warp knits, 6006 circular knits, 6004 stretch fabric, 6001 pile). The largest six-digit lines were {lines_txt}.\n\n"
    + "Through 2025 most suppliers paid the IEEPA tariffs on top of the base rate, and China its 25% List 3 duty as well. The "
    + "IEEPA duties ended on February 24, 2026; since July 24, 2026 a Section 301 tariff of 10% or 12.5% applies instead. "
    + f"{YEAR} is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": f"UN Comtrade (public API), United States imports, HS chapter 60 (retrieved {CHECKED})", "url": "https://comtradeplus.un.org/"}
]
ui["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level. \"Other Asia, nes\" in Comtrade is shown as Taiwan; \"Rep. of Korea\" as South Korea."
)
