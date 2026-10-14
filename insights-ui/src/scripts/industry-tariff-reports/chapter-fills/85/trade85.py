"""Trade-dependent text for Chapter 85 (needs the generated understandIndustry data from UN Comtrade)."""

NAMES = {"Rep. of Korea": "South Korea", "Korea, Rep.": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan",
         "China, Hong Kong SAR": "Hong Kong", "United Kingdom": "the UK", "Netherlands": "the Netherlands", "Philippines": "the Philippines"}
DUTY_NOTE = "Duty-collected figures aren't available from an official source yet."
COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."


def b(usd):
    return f"${usd / 1e9:.1f}B" if usd >= 1e10 else (f"${usd / 1e9:.2f}B" if usd >= 1e9 else f"${usd / 1e6:.0f}M")


def nm(c):
    return NAMES.get(c, c)


def apply_trade(d, src, used):
    u = d["understandIndustry"]
    o = d["overview"]
    fc = d["finalConclusion"]
    d["sources"] = [
        {"label": "Harmonized Tariff Schedule of the United States", "url": "https://hts.usitc.gov/", "note": "rate table rows (2026 Revision 21)"},
        {"label": "HTSUS 2026 Revision 21, Chapter 99", "url": "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099", "note": "extra duties and exemption lists"},
        {"label": "Federal Register", "url": "https://www.federalregister.gov/", "note": "proclamations, executive orders, USTR and Commerce notices"},
        {"label": "UN Comtrade", "url": "https://comtradeplus.un.org/", "note": "U.S. import statistics"},
    ]
    if not u.get("latestYear"):
        import os
        if os.environ.get("SKIPTRADE"):
            return
        raise SystemExit("no trade data yet: run with --trade-file src/tariff-data/trade/chapter-85.json")
    yr, pyr = u["latestYear"], u["priorYear"]
    tot = {y["year"]: y["totalUsd"] for y in u["byYear"]}
    T, P = tot[yr], tot[pyr]
    top = u["byCountry"]
    head = {}
    for r in u["byHeadingCountry"]:
        head[r["heading"]] = head.get(r["heading"], 0) + r["importsUsd"]
    peak_year = max(tot, key=tot.get)
    labels = {g["heading"]: g["label"] for g in d["industryAreas"]["groups"]}
    heads_sorted = sorted(head.items(), key=lambda kv: kv[1], reverse=True)
    t5 = ", ".join(f"{nm(c['country'])} ({b(c['importsUsd'])})" for c in top[:5])
    h4 = ", ".join(f"{labels[h].lower()} ({h}, {b(v)})" for h, v in heads_sorted[:4])
    chg = (T - P) / P * 100
    by = {nm(c["country"]): c for c in top}
    cn = by.get("China")
    mx = by.get("Mexico")
    u["h1"] = "HTS Chapter 85: Electrical Machinery & Electronics — U.S. Import Statistics"
    u["seo"] = {
        "title": "U.S. Electronics Imports by Country & Product: Mexico, China, Vietnam, Taiwan (HTS Ch. 85) | KoalaGains",
        "shortDescription": f"Where U.S. imports of electrical machinery and electronics come from, {u['byYear'][0]['year']}–{yr}: {b(T)} in {yr} ({chg:+.1f}% on {pyr}), "
        f"led by {nm(top[0]['country'])}. By country, by product and over time, from UN Comtrade.",
        "keywords": [
            "us electronics imports by country",
            "electrical equipment imports",
            "us semiconductor imports by country",
            "smartphone imports by country",
            "lithium-ion battery imports",
            "HTS Chapter 85 import statistics",
        ],
    }
    lines = sorted(u["byLine"], key=lambda x: x["importsUsd"], reverse=True)
    l3 = ", ".join(f"{x['hs6']} ({b(x['importsUsd'])})" for x in lines[:3])
    u["why"] = (
        f"U.S. imports of Chapter 85 electrical machinery and electronics were **{b(T)} in {yr}**, {chg:+.1f}% from {b(P)} in {pyr}"
        + (f" (peak: {b(tot[peak_year])} in {peak_year})" if peak_year != yr else "")
        + f". The five largest suppliers were {t5}. By product group the largest were {h4}; the largest six-digit lines were {l3}.\n\n"
        "Most of these goods are exempt from the newest duties or pay little: smartphones, chips, semiconductors, SSDs, display modules and monitors are on the 2026 "
        "Section 301 exemption list, and USMCA goods from Mexico and Canada enter free of the 2026 duty. "
        + (f"China, whose goods pay Section 301 duties on almost every line, shipped {b(cn['importsUsd'])}" + (f" ({cn['changePct']:+.0f}% on {pyr})" if cn.get("changePct") is not None else "") + ". " if cn else "")
        + (f"Mexico, whose USMCA-qualifying goods are exempt from the 2026 duty, shipped {b(mx['importsUsd'])}. " if mx else "")
        + f"\n\n{yr} is the latest full year of U.S. trade data. {DUTY_NOTE}"
    )
    u["effectiveDuty"]["note"] = DUTY_NOTE
    u["coverageNote"] = COVERAGE
    u["sources"] = [{"label": f"UN Comtrade (public API), United States imports, HS chapter 85 (retrieved {d['asOf']})", "url": "https://comtradeplus.un.org/"}]

    ts = o["tradeSnapshot"]
    ts["effectiveDutyRateNote"] = DUTY_NOTE
    ts["source"] = f"UN Comtrade, United States imports, HS chapter 85 ({yr})"
    ts["coverageNote"] = COVERAGE
    fc["keyTakeaways"].append(
        f"In {yr} the U.S. imported {b(T)} of Chapter 85 goods, {nm(top[0]['country'])} ({b(top[0]['importsUsd'])}) and {nm(top[1]['country'])} ({b(top[1]['importsUsd'])}) first."
    )
    ch = sorted((r for r in u["byHeadingCountry"] if r["heading"] == "8542"), key=lambda r: r["importsUsd"], reverse=True)[:4]
    chips = ", ".join(f"{nm(r['country'])} ({b(r['importsUsd'])})" for r in ch)
    fc["faqs"].append(
        {
            "id": "imports",
            "question": "Where does the U.S. import electronics and electrical equipment from?",
            "searchedAs": ["us electronics imports by country", "where does the us import electronics from", "where does the us get semiconductors", "does the us get semiconductors from taiwan"],
            "answer": f"In {yr} U.S. imports of Chapter 85 goods were {b(T)} ({chg:+.1f}% on {pyr}). The largest suppliers were {t5}. The largest product groups were {h4}. "
            f"Integrated circuits (8542, {b(head.get('8542', 0))}) came mostly from {chips}.",
            "link": "understand-industry",
        }
    )
