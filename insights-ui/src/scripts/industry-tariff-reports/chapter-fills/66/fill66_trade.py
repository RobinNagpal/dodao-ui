# Trade-dependent text for Chapter 66 (exec'd by fill66.py with d, ov, ui, ia, LABELS, money in scope).
SHORT = {"China, Hong Kong SAR": "Hong Kong", "Other Asia, nes": "Taiwan"}


def nm(c):
    return SHORT.get(c, c)


def pct(v):
    return f"{v:+.1f}%".replace("+", "+").replace("-", "−")


HS6_LABEL = {
    "6601.10": "garden, patio and beach umbrellas",
    "6601.91": "telescopic-shaft (folding) umbrellas",
    "6601.99": "other umbrellas (stick, golf)",
    "6602.00": "walking sticks, canes, whips and riding crops",
    "6603.20": "umbrella frames",
    "6603.90": "umbrella handles, tips, bases and other parts",
}

ly = ui.get("latestYear")
py = ui.get("priorYear")
bc = ui["byCountry"]
total = ov["tradeSnapshot"]["totalImportsUsd"]
prior = sum((c.get("priorImportsUsd") or 0) for c in bc) + (ui.get("othersPriorImportsUsd") or 0)
chg = (total / prior - 1) * 100 if prior else 0
top = bc[:6]
lines = {x["hs6"]: x for x in ui["byLine"]}

ui["h1"] = "HTS Chapter 66: Umbrellas, Walking Sticks & Umbrella Parts — U.S. Import Statistics"
ui["seo"]["title"] = "HTS Chapter 66 Import Statistics: Umbrellas & Walking Sticks from China, Vietnam, Taiwan, Cambodia | KoalaGains"
ui["seo"]["shortDescription"] = (
    f"U.S. imports of umbrellas, walking sticks and umbrella parts 2020–{ly}, by country, product and year: {money(total)} in "
    f"{ly}, {'up' if chg >= 0 else 'down'} {abs(chg):.1f}%; {nm(top[0]['country'])} supplied {top[0]['sharePct']:.0f}%."
)
ui["seo"]["keywords"] = [
    "HTS Chapter 66 import statistics",
    "umbrella imports by country",
    "umbrella import from china",
    "us tariff on umbrellas",
    "hts 6601 umbrella import duty",
    "section 301 umbrella tariffs",
]
for c in bc:
    if c["country"] in ("Other Asia, nes", "China, Hong Kong SAR"):
        c["country"] = nm(c["country"])
    if c.get("mainHeading") in LABELS:
        c["mainHeadingLabel"] = LABELS[c["mainHeading"]][1]
ui["valueBasis"] = "CIF value (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ui["byYearCaption"] = (
    f"U.S. imports of Chapter 66 goods each year, split into the two largest {ly} suppliers ({ui['byYearPartners'][0]} and "
    f"{ui['byYearPartners'][1]}) and everyone else."
)
ui["effectiveDuty"]["dutyPaidUsd"] = None
ui["effectiveDuty"]["note"] = "Duty-collected figures aren't available from an official source yet."
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."

TRADE_WHY = None  # set in fill66_trade_text.py once the data has been read
exec(open(os.path.join(HERE, "fill66_trade_text.py")).read())

ts = ov["tradeSnapshot"]
ts["totalDutyCollectedUsd"] = None
ts["effectiveDutyRateNote"] = "Duty-collected figures aren't available from an official source yet."
ts["topCountries"] = [{"name": nm(c["country"]), "importsUsd": c["importsUsd"]} for c in bc[:5]]
ts["source"] = f"UN Comtrade, United States imports, HS chapter 66 ({ly})"
ts["coverageNote"] = (
    "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade at the 6-digit "
    "level; Comtrade does not split 6603.20 or 6603.90 into the 8-digit U.S. lines, so this page does not say which of them "
    "each country ships."
)

for c in ui["byHeadingCountry"]:
    if c["country"] in SHORT:
        c["country"] = SHORT[c["country"]]
for x in ui["byLine"]:
    if "searchText" in x:
        x["searchText"] = f"{x['hs6'].replace('.', '')} {x['hs6']} {x['description'].lower()} {LABELS[x['heading']][0].lower()}"
