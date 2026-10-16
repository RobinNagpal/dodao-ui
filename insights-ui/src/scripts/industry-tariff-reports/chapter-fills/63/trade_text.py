"""Trade-dependent numbers for the Chapter 63 fill, computed from the generated understandIndustry."""

NAMES = {"Viet Nam": "Vietnam", "Rep. of Korea": "South Korea", "Other Asia, nes": "Taiwan", "Türkiye": "Türkiye", "Dominican Rep.": "Dominican Republic"}


def m(v):
    return f"${v / 1e9:.2f}B" if v >= 1e9 else f"${v / 1e6:.0f}M" if v >= 1e7 else f"${v / 1e6:.1f}M"


def trade_facts(d):
    ui = d["understandIndustry"]
    year = ui["latestYear"]
    total = d["overview"]["tradeSnapshot"]["totalImportsUsd"]
    bc = {NAMES.get(c["country"], c["country"]): c for c in ui["byCountry"]}
    top = [NAMES.get(c["country"], c["country"]) for c in ui["byCountry"][:4]]
    assert top == ["China", "India", "Pakistan", "Mexico"], top
    sh = lambda n: round(bc[n]["sharePct"])  # noqa: E731
    T = {
        "year": year,
        "total": m(total),
        "source": f"UN Comtrade, United States imports, HS chapter 63 ({year})",
        "topCountries": [{"name": n, "importsUsd": bc[n]["importsUsd"]} for n in top[:5]],
        "biggestLines": [
            {"hts": "6307.90", "label": "Other made-up articles n.e.c. (incl. masks, flags, covers)"},
            {"hts": "6302.60", "label": "Cotton terry towels and kitchen linen"},
            {"hts": "6302.31", "label": "Cotton bed linen, not printed"},
        ],
    }
    T["ov_trade"] = (
        f"The U.S. imported **{m(total)}** of Chapter 63 goods in {year}: China {m(bc['China']['importsUsd'])} "
        f"({sh('China')}%), India {m(bc['India']['importsUsd'])} ({sh('India')}%), Pakistan "
        f"{m(bc['Pakistan']['importsUsd'])} ({sh('Pakistan')}%) and Mexico {m(bc['Mexico']['importsUsd'])}."
    )
    T["faq_countries"] = (
        f"In {year} the U.S. imported {m(total)} of Chapter 63 goods: China {m(bc['China']['importsUsd'])} "
        f"({sh('China')}%, down 25% on 2024), India {m(bc['India']['importsUsd'])} ({sh('India')}%), Pakistan "
        f"{m(bc['Pakistan']['importsUsd'])} ({sh('Pakistan')}%), Mexico {m(bc['Mexico']['importsUsd'])}, then Vietnam, "
        "Türkiye, Cambodia and Bangladesh. India and Pakistan ship mostly towels and bed linen; China's largest heading is "
        "6307, other made-up articles."
    )
    T["bc"] = bc
    T["m"] = m
    return T
