"""Fill the writer parts of the generated Chapter 09 content file.

usage: python3 build09.py <generated.json> <out.json>
"""
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
import te09  # noqa: E402

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
TITLE = "Coffee, tea, maté and spices"
TODAY = d["asOf"]

d["chapter"]["title"] = TITLE


def fix_h1(node):
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, str):
                node[k] = v.replace("TODO: chapter title", TITLE)
            else:
                fix_h1(v)
    elif isinstance(node, list):
        for v in node:
            fix_h1(v)


fix_h1(d)

CH99 = te09.CH99_URL
FR = "https://www.federalregister.gov/documents/"

# ---------------------------------------------------------------- sources (tariffUpdates)
EXTRA_SOURCES = [
    {"id": "hts-2025-rev16-cr", "publisher": "USITC", "citation": "HTSUS 2025 Revision 16 Change Record", "document": "Change Record",
     "title": "Harmonized Tariff Schedule of the United States (2025 Revision 16), Change Record", "signed": None, "published": "2025-06-20",
     "url": "https://hts.usitc.gov/reststop/file?release=2025HTSRev16&filename=Change%20Record"},
    {"id": "procl-11012", "publisher": "Federal Register", "citation": "91 FR 9339", "document": "Proclamation 11012",
     "title": "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "signed": "2026-02-20", "published": "2026-02-25",
     "url": FR + "2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"},
    {"id": "eo-14389", "publisher": "Federal Register", "citation": "91 FR 9437", "document": "Executive Order 14389", "title": "Ending Certain Tariff Actions",
     "signed": "2026-02-20", "published": "2026-02-25", "url": FR + "2026/02/25/2026-03832/ending-certain-tariff-actions"},
    {"id": "csms-67834313", "publisher": "CBP", "citation": "CSMS # 67834313", "document": "CBP CSMS message",
     "title": "Ending Collection of International Emergency Economic Powers Act Duties", "signed": None, "published": "2026-02-22",
     "url": "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"},
    {"id": "scotus-24-1287", "publisher": "Supreme Court of the United States", "citation": "607 U.S. 229", "document": "Opinion, No. 24-1287",
     "title": "Learning Resources, Inc. v. Trump", "signed": None, "published": "2026-02-20",
     "url": "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"},
    {"id": "eo-14384", "publisher": "Federal Register", "citation": "91 FR 6501", "document": "Executive Order 14384",
     "title": "Modifying Duties To Address Threats to the United States by the Government of the Russian Federation", "signed": "2026-02-06", "published": "2026-02-11",
     "url": FR + "2026/02/11/2026-02818/modifying-duties-to-address-threats-to-the-united-states-by-the-government-of-the-russian-federation"},
    {"id": "eo-14361", "publisher": "Federal Register", "citation": "90 FR 54467", "document": "Executive Order 14361",
     "title": "Modifying the Scope of Tariffs on the Government of Brazil", "signed": "2025-11-20", "published": "2025-11-26",
     "url": FR + "2025/11/26/2025-21417/modifying-the-scope-of-tariffs-on-the-government-of-brazil"},
    {"id": "eo-14360", "publisher": "Federal Register", "citation": "90 FR 54091", "document": "Executive Order 14360",
     "title": "Modifying the Scope of the Reciprocal Tariffs With Respect to Certain Agricultural Products", "signed": "2025-11-14", "published": "2025-11-25",
     "url": FR + "2025/11/25/2025-21203/modifying-the-scope-of-the-reciprocal-tariffs-with-respect-to-certain-agricultural-products"},
    {"id": "eo-14329", "publisher": "Federal Register", "citation": "90 FR 38701", "document": "Executive Order 14329",
     "title": "Addressing Threats to the United States by the Government of the Russian Federation", "signed": "2025-08-06", "published": "2025-08-11",
     "url": FR + "2025/08/11/2025-15267/addressing-threats-to-the-united-states-by-the-government-of-the-russian-federation"},
    {"id": "eo-14326", "publisher": "Federal Register", "citation": "90 FR 37963", "document": "Executive Order 14326", "title": "Further Modifying the Reciprocal Tariff Rates",
     "signed": "2025-07-31", "published": "2025-08-06", "url": FR + "2025/08/06/2025-15010/further-modifying-the-reciprocal-tariff-rates"},
    {"id": "eo-14323", "publisher": "Federal Register", "citation": "90 FR 37739", "document": "Executive Order 14323",
     "title": "Addressing Threats to the United States by the Government of Brazil", "signed": "2025-07-30", "published": "2025-08-05",
     "url": FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil"},
    {"id": "eo-14257", "publisher": "Federal Register", "citation": "90 FR 15041", "document": "Executive Order 14257",
     "title": "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits",
     "signed": "2025-04-02", "published": "2025-04-07",
     "url": FR + "2025/04/07/2025-06063/regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"},
    {"id": "eo-14325", "publisher": "Federal Register", "citation": "90 FR 37957", "document": "Executive Order 14325",
     "title": "Amendment to Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "signed": "2025-07-31", "published": "2025-08-06",
     "url": FR + "2025/08/06/2025-14999/amendment-to-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"},
    {"id": "eo-14194", "publisher": "Federal Register", "citation": "90 FR 9117", "document": "Executive Order 14194",
     "title": "Imposing Duties To Address the Situation at Our Southern Border", "signed": "2025-02-01", "published": "2025-02-07",
     "url": FR + "2025/02/07/2025-02407/imposing-duties-to-address-the-situation-at-our-southern-border"},
    {"id": "eo-14193", "publisher": "Federal Register", "citation": "90 FR 9113", "document": "Executive Order 14193",
     "title": "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "signed": "2025-02-01", "published": "2025-02-07",
     "url": FR + "2025/02/07/2025-02406/imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"},
    {"id": "eo-14195", "publisher": "Federal Register", "citation": "90 FR 9121", "document": "Executive Order 14195",
     "title": "Imposing Duties To Address the Synthetic Opioid Supply Chain in the People's Republic of China", "signed": "2025-02-01", "published": "2025-02-07",
     "url": FR + "2025/02/07/2025-02408/imposing-duties-to-address-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"},
    {"id": "eo-14228", "publisher": "Federal Register", "citation": "90 FR 11463", "document": "Executive Order 14228",
     "title": "Further Amendment to Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "signed": "2025-03-03", "published": "2025-03-07",
     "url": FR + "2025/03/07/2025-03775/further-amendment-to-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of"},
    {"id": "eo-14357", "publisher": "Federal Register", "citation": "90 FR 50725", "document": "Executive Order 14357",
     "title": "Modifying Duties Addressing the Synthetic Opioid Supply Chain in the People's Republic of China", "signed": "2025-11-04", "published": "2025-11-07",
     "url": FR + "2025/11/07/2025-19825/modifying-duties-addressing-the-synthetic-opioid-supply-chain-in-the-peoples-republic-of-china"},
    {"id": "ustr-usmca-review", "publisher": "USTR", "citation": "USTR press release", "document": "Statement",
     "title": "Ambassador Greer Issues Statement on the USMCA Joint Review", "signed": None, "published": "2026-07-01",
     "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review"},
    {"id": "ustr-agoa-2026", "publisher": "USTR", "citation": "USTR press release", "document": "Statement",
     "title": "Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act", "signed": None, "published": "2026-02-03",
     "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act"},
]

tu = d["tariffUpdates"]
have = {s["id"] for s in tu["sources"]}
tu["sources"] += [s for s in EXTRA_SOURCES if s["id"] not in have]

exec(open(__file__.rsplit("/", 1)[0] + "/content09.py").read())

# ---------------------------------------------------------------- tariffEngineering
te = d["tariffEngineering"]
rows_by_hts = {r["hts"]: r for r in d["overview"]["rateTable"]["rows"] if r["hts"]}


def rate_row(hts):
    r = rows_by_hts[hts]
    return r


te["levers"] = te09.LEVERS
te["rules"] = te09.RULES
for g in te["groups"]:
    rules, note = te09.GROUP_RULES[g["heading"]]
    g["ruleIds"] = list(rules)
    g["note"] = note
for line in te["lines"]:
    line["ruleIds"] = te09.line_rule_ids(line)
    line["leverIds"] = te09.line_lever_ids(line, rate_row(line["hts"]))

json.dump(d, open(out, "w"), ensure_ascii=False, indent=2)


def todos(n, p=""):
    if isinstance(n, dict):
        for k, v in n.items():
            yield from todos(v, p + "." + k)
    elif isinstance(n, list):
        for i, v in enumerate(n):
            yield from todos(v, f"{p}[{i}]")
    elif isinstance(n, str) and "TODO" in n:
        yield p


left = list(todos(d))
print("TODO left:", len(left))
for p in left[:40]:
    print("  ", p)
