"""Fill the writer parts of the generated Chapter 41 content file.

usage: python3 fill41.py <generated.json> <out.json>

Re-runnable: regenerate with
  cd insights-ui && pnpm tariff:generate-chapter --chapter 41 --slug 41-raw-hides-and-leather \
    --title "Raw Hides and Skins (Other Than Furskins) and Leather" \
    --countries IT,BR,MX,DE,GB,AR,ZA,CA,SE,IN,JP,CN --force
  cp src/tariff-data/chapters/41-raw-hides-and-leather.json <scratch>/gen.json
then run this script on the copy, then
  pnpm tariff:compact-chapters <out> && npx prettier --write <out>
"""
import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import glob
import json
import re
import sys

src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
W = IU

# Source library: the tariffUpdates sources of the chapters already migrated (same documents, same ids).
LIB = {}
for f in sorted(glob.glob(f"{W}/src/tariff-data/chapters/*.json")):
    if "/41-" in f:
        continue
    try:
        doc = json.load(open(f))
    except Exception:
        continue
    for s in (doc.get("tariffUpdates") or {}).get("sources", []):
        LIB.setdefault(s["id"], s)

TODAY = d["asOf"]
QUESTIONS_DATE = "2026-10-12"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH41 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2041"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
FR = "https://www.federalregister.gov/documents/"


def ecfr(title, sec):
    return f"https://www.ecfr.gov/current/title-{title}/section-{sec}"


def ecfr_part(title, part):
    return f"https://www.ecfr.gov/current/title-{title}/part-{part}"


# ------------------------------------------------------------------ sanity checks on generated data
rows = d["overview"]["rateTable"]["rows"]
leaf = [r for r in rows if r["htsCode10"]]
assert len(leaf) == 176, len(leaf)
assert sum(1 for r in leaf if r["dutiable"]) == 132
assert all(l["status"] == "unchanged" for l in d["tariffUpdates"]["lines"])
ROW = {r["hts"]: r for r in leaf}

# ------------------------------------------------------------------ overview
ov = d["overview"]
ov["seo"] = {
    "title": "HTS Chapter 41 Import Duty & Tariffs 2026: Raw Hides, Wet Blue, Cow, Goat & Exotic Leather | KoalaGains",
    "shortDescription": "Searchable U.S. duty table for all 176 HTS Chapter 41 lines — raw cattle hides, wet-blue and crust leather, finished cowhide, goat, sheep, pig and reptile leather, chamois, patent and composition leather — with General, FTA and Column 2 rates, the 2026 Section 301 duties, Japan's 40% leather duty and Canada's 50% Section 338 duty.",
    "keywords": [
        "HTS Chapter 41",
        "hts chapter 41 import duty rates",
        "raw hides and skins (other than furskins) and leather tariff",
        "raw hides and skins import duty rates",
        "hs code for cow leather",
        "hs code for raw hides",
        "wet blue leather hs code",
        "hs code 4107",
        "japan leather tariff 9903.41.05",
        "usmca leather tariff exemption",
        "china tariff on leather",
        "composition leather hts 4115",
    ],
}
ov["intro"] = (
    "Chapter 41 covers raw hides and skins (other than furskins) and leather: raw cattle, horse, sheep, goat, pig and reptile skins (4101–4103), tanned "
    "and crust leather such as wet-blue (4104–4106), finished leather (4107, 4112, 4113), chamois, patent and metallized leather (4114) and composition "
    "leather and leather waste (4115). Its **176 tariff lines** carry low base rates: 44 are Free and the rest pay 1.6% to 5%.\n\n"
    "The extra duties by country matter more. Since **July 24, 2026** the Section 301 tariffs on 60 economies (10% or 12.5%, or a 10% floor for EU goods) "
    "reach **172 of the 176 lines**; only reptile leather (4113.30) and leather of other animals (4113.90) are on the U.S. note 52(b) exemption list. "
    "Brazil pays a separate 25% on top (37.5% on most lines). China pays 12.5% plus its 2018–2019 Section 301 duty of 25% (finished and tanned leather) "
    "or 7.5% (raw hides). **Japanese bovine and equine leather has paid 40% more since 1986** (9903.41.05), and goat and sheep leather too when dyed, "
    "colored, stamped or embossed. Since **August 22, 2026** goods of **Canada** pay a **50% Section 338 duty**, now on **14 lines** (mostly raw hides), even with a USMCA claim. The 2025 IEEPA tariffs ended on February 24, 2026. The U.S. imported **$450.5M** of Chapter 41 goods in 2025, 82% of it finished "
    "bovine leather (4107)."
)
ov["stats"] = [
    {"label": "Tariff lines", "value": "176"},
    {"label": "Lines with a base-rate duty", "value": "132 of 176"},
    {
        "label": "Lines with an extra duty for some origins",
        "value": "176 of 176",
        "note": "2026 Section 301: 172 (Brazil 176); China lists: 175; Japan 1986: 103, plus 11 if dyed or embossed; Canada Section 338: 14, USMCA or not",
    },
    {"label": "2025 imports", "value": "$450.5M"},
    {"label": "Italy + Brazil share", "value": "58%"},
]

GROUP_TEXT = {
    "4101": (
        "Raw cattle, buffalo and horse hides. Hides that are not pretanned are Free; most pretanned hides pay 2.4% to 5%. Canadian hides that are not "
        "pretanned (4101.20.10, 4101.50.10, 4101.90.10) and some pretanned lines pay the 50% Section 338 duty even with a USMCA claim. Untanned hides must "
        "meet USDA APHIS entry rules (9 CFR 95.16).",
        ["raw cowhide", "salted cattle hides", "raw cattle hides", "horse hides", "buffalo hides", "raw bovine hides"],
    ),
    "4102": (
        "Raw sheep and lamb skins, with or without wool, are Free except pretanned skins in 4102.10.30 and 4102.29.30 (2%). Raw sheepskins with the wool on "
        "stay here (note 1(c)); Astrakhan, Caracul, Persian and similar lambskins go to Chapter 43 as furskins.",
        ["raw sheepskins", "pickled sheepskins", "lambskins", "hair sheep skins", "cabretta skins"],
    ),
    "4103": (
        "Other raw skins: reptiles (4103.20), swine (4103.30), goats and kids, deer and other animals (4103.90). Raw skins that are not pretanned are Free. "
        "Reptile and deer skins are wildlife: they need an FWS declaration and, for CITES species, CITES permits.",
        ["raw goat skins", "raw pig skins", "python skins", "crocodile skins", "deer skins", "raw reptile skins"],
    ),
    "4104": (
        "Tanned (wet-blue) and crust cattle, buffalo and horse hides, not further prepared: Free to 5%. Japanese goods of this heading pay 40% more "
        "(9903.41.05). Five 4104 lines (4104.11.20, 4104.41.50, 4104.49.10, 4104.49.50) are exempt from Brazil's 25% Section 301 duty.",
        ["wet blue leather", "wet blue hides", "crust leather", "chrome tanned hides", "buffalo crust leather", "wet blue splits"],
    ),
    "4105": (
        "Tanned and crust sheep and lamb skins pay 2%. Nigeria supplied most of the $1.9M imported in 2025. Japanese skins of this heading pay 40% more "
        "if dyed, colored, stamped or embossed.",
        ["sheep wet blue", "pickled sheep crust", "lamb crust leather"],
    ),
    "4106": (
        "Tanned and crust goat (2.4%), swine (4.2%), reptile (Free) and other skins (3.3%). Reptile skins need CITES and FWS clearance; crocodilian skins "
        "must carry CITES tags.",
        ["goat wet blue", "goat crust leather", "pig crust leather", "reptile crust leather"],
    ),
    "4107": (
        "Finished cattle, buffalo and horse leather: 82% of Chapter 41 imports in 2025. Rates run from Free (upper and lining leather of up to 28 sq ft) to 5%; "
        "upholstery leather is 2.8%. Italian leather pays a flat 10%, Brazilian 37.5% plus the base rate, and Mexican is Free with USMCA. Japanese finished "
        "bovine leather pays 52.5%.",
        ["cow leather", "cowhide leather", "finished leather", "upholstery leather", "full grain leather", "split leather", "buffalo leather", "nubuck"],
    ),
    "4112": (
        "Finished sheep and lamb leather pays 2% (fancy or not). Italy, Türkiye and France are the main suppliers. Japanese leather of this heading pays 40% "
        "more if dyed, colored, stamped or embossed.",
        ["sheep leather", "lambskin leather", "sheep nappa", "sheep suede"],
    ),
    "4113": (
        "Finished goat and kid leather (2.4% or 2.8%), pigskin (4.2%), reptile leather (Free) and leather of other animals (3.3% or 1.6%). Reptile and "
        "other-animal leather (4113.30, 4113.90) is exempt from the 2026 Section 301 duties of every country, but not from Brazil's 25% or China's 25%.",
        ["goat leather", "kid leather", "goat suede", "pigskin leather", "crocodile leather", "python leather", "ostrich leather", "exotic leather"],
    ),
    "4114": (
        "Chamois leather (3.2%), patent leather (2.3%) and patent laminated or metallized leather (3.6% for calf and kip, 1.6% other). Patent-look plastic "
        "or PU sheeting is not leather and is classified outside Chapter 41.",
        ["chamois leather", "patent leather", "metallic leather", "metallized leather", "patent laminated leather"],
    ),
    "4115": (
        "Composition (bonded) leather with a basis of leather or leather fiber, and leather parings, waste, dust and powder not suitable for making leather "
        "articles: both Free. Parings of raw hides are not here (heading 0511).",
        ["bonded leather", "reconstituted leather", "leather fiberboard", "leather scraps", "leather waste", "leather dust"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUP_TEXT[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Finished cowhide from Italy",
        "line": "4107.12.60.10",
        "body": "Grain-split upper leather has a 3.3% base rate. EU goods pay the higher of the base rate or 10% (9903.05.39), so a $100,000 shipment pays **$10,000**. Italy supplied $155M of the $371M of finished bovine leather (4107) the U.S. imported in 2025.",
    },
    {
        "title": "Finished leather from Brazil",
        "line": "4107.12.60.10",
        "body": "Brazilian goods pay the 3.3% base rate + 25% (9903.05.01) + 12.5% (9903.05.27) = 40.8%: **$40,800** on a $100,000 shipment. Whole-hide leather of up to 28 sq ft that is not fancy (4107.12.20.00, 2.4%) is on Brazil's exemption list (U.S. note 50(a)(ii)), so it pays 2.4% + 12.5% = 14.9%: **$14,900**.",
    },
    {
        "title": "Finished bovine leather from Japan",
        "line": "4107.11.60.10",
        "body": "Japanese goods pay 12.5% in place of the 3.3% base rate (9903.05.49) plus the 1986 Section 301 duty of 40% (9903.41.05), which U.S. note 3 makes cumulative: 52.5%, or **$52,500** on $100,000. Goat or sheep leather from Japan pays the 40% only when dyed, colored, stamped or embossed: 12.5% when not dyed, colored, stamped or embossed, 52.5% when it is.",
    },
    {
        "title": "Raw cattle hides from Canada",
        "line": "4101.50.10.10",
        "body": "Whole raw hides over 16 kg that are not pretanned are Free at the base rate. Since September 15, 2026 the line is on the Section 338 list in U.S. note 51(b)(1), and the 50% duty (9903.03.12) applies even with a USMCA claim: **$50,000** on $100,000, or $60,000 without the claim (50% + 10% Section 301). Pretanned 'other' hides such as 4101.50.30 are not on the list and are Free with USMCA.",
    },
    {
        "title": "Crocodile or python leather",
        "line": "4113.30.30.00",
        "body": "Reptile leather is Free and on the U.S. note 52(b) exemption list (9903.05.86), so from Italy, Singapore or Thailand it pays **$0** on a $100,000 shipment. From China it pays 25% (List 3, 9903.88.03) and from Brazil 25% (9903.05.01), because note 52(b) does not lift those. Each shipment needs CITES documents and an FWS declaration, and crocodilian skins must carry CITES tags (50 CFR 23.70).",
    },
]

ts = ov["tradeSnapshot"]
ts["effectiveDutyRateNote"] = (
    "Duty-collected figures aren't available from an official source yet. 44 of the 176 lines are Free and the others pay 1.6% to 5%, so most duty on "
    "Chapter 41 goods now comes from the 2026 Section 301 duties, Brazil's 25%, Japan's 40% and Canada's Section 338 duty."
)
ts["biggestLines"] = [
    {"hts": "4107.12", "label": "Finished bovine leather, whole hides, grain splits"},
    {"hts": "4107.11", "label": "Finished bovine leather, whole hides, full grain unsplit"},
]
ts["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
ov["notes"] = {
    "chapterNotes": (
        "**Note 1.** This chapter does not cover: (a) parings or similar waste of raw hides or skins (heading 0511); (b) birdskins or parts of birdskins, with "
        "their feathers or down, of heading 0505 or 6701; or (c) hides or skins with the hair or wool on, raw, tanned or dressed (Chapter 43). Raw hides and "
        "skins with the hair or wool on stay in Chapter 41 when they are of bovine animals (including buffalo), equine animals, sheep or lambs (except "
        "Astrakhan, Broadtail, Caracul, Persian or similar lambs, and Indian, Chinese, Mongolian or Tibetan lambs), goats or kids (except Yemen, Mongolian or "
        "Tibetan goats and kids), swine (including peccary), chamois, gazelle, camels (including dromedaries), reindeer, elk, deer, roebucks or dogs.\n\n"
        "**Note 2.** (a) Headings 4104 to 4106 do not cover hides and skins that have undergone a reversible tanning (including pre-tanning) process; they go "
        "in headings 4101 to 4103. (b) For headings 4104 to 4106, \"crust\" includes hides and skins that have been retanned, colored or fat-liquored "
        "(stuffed) before drying.\n\n"
        "**Note 3.** Throughout the tariff schedule, \"composition leather\" means only substances of the kind in heading 4115."
    ),
    "additionalUsNotes": (
        "**1.** \"Fancy\" leather means leather that has been embossed, printed or otherwise decorated in any manner or to any extent, including leather whose "
        "original grain has been accentuated by any process, but not leather of subheading 4114.20."
    ),
}

# ------------------------------------------------------------------ tariffUpdates
tu = d["tariffUpdates"]
tu["seo"] = {
    "title": "HTS Chapter 41 Tariff Updates 2026: Leather Section 301, Japan's 40% Duty, Canada Section 338 & the End of IEEPA | KoalaGains",
    "shortDescription": "What changed for U.S. tariffs on raw hides and leather (HTS Chapter 41) since January 2025: the IEEPA tariffs and their end, the Section 122 surcharge, the 2026 Section 301 duties on 60 economies and Brazil, Canada's 50% Section 338 duty on raw hides and the 1986 Japan leather duty that still applies, with Federal Register citations.",
    "keywords": [
        "hts chapter 41 2026 tariff updates",
        "hts chapter 41 import duty",
        "section 301 tariffs on leather imports",
        "japan leather tariff 9903.41.05",
        "section 338 canada hides",
        "brazil leather tariff",
        "2026 import duty on raw bovine hides",
        "china tariff on leather",
    ],
}
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** "
    "(in force October 9, 2026). **No Chapter 41 base rate or line changed** between them: all 176 lines carry the same rate.\n\n"
    "The changes were all extra duties by country. In 2025 Chapter 41 goods paid the IEEPA tariffs: the reciprocal tariff (10%, a country rate or a 15% floor "
    "for EU and Japanese goods), 40% more on Brazil, and 25%–35% on non-USMCA goods of Canada and Mexico. The IEEPA tariffs **ended on February 24, 2026** "
    "and a 10% Section 122 surcharge ran until July 23, 2026. Since **July 24, 2026** the Section 301 tariffs on 60 economies (10% or 12.5%) reach 172 of "
    "the 176 lines, and Brazil's own 25% applies from July 22. Since **August 22, 2026** Canada pays a **50% Section 338 duty**, now on 14 lines, USMCA or "
    "not. China's 2018–2019 Section 301 duties (25% or 7.5%) and **Japan's 1986 Section 301 duty of 40%** on its leather continue."
)
tu["scope"] = (
    "Measures that reach Chapter 41 from any country: the 2026 Section 301 tariffs on 60 economies and on Brazil, the China Section 301 Lists 3 and 4A, "
    "the 1986 Section 301 duty on leather from Japan (9903.41.05), Canada's Section 338 duty, the Nicaragua Section 301 duty scheduled for 2027, and the "
    "2025–2026 IEEPA and Section 122 duties that have ended. No antidumping or countervailing duty order covers a Chapter 41 product: the countervailing "
    "duty order on leather from Argentina (1990) was revoked in 1997. No Chapter 41 line is on the Section 232 auto-parts list (U.S. note 33(g)). For the "
    "rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "176 of 176 lines"},
    {"label": "Exempt from 2026 Section 301", "value": "4 of 176 lines", "note": "4113.30 reptile and 4113.90 other-animal leather"},
    {"label": "Japan 1986 duty (40%)", "value": "103 of 176 lines", "note": "Plus 11 goat and sheep lines if dyed, colored, stamped or embossed"},
    {"label": "Canada Section 338 (50%)", "value": "14 of 176 lines", "note": "Applies to USMCA goods too"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

# sources ---------------------------------------------------------------------------------------------
JP_FIX = {
    "govinfo-statute-100-pg4411": {
        "publisher": "U.S. Government Publishing Office",
        "citation": "100 Stat. 4411",
        "document": "Proclamation 5448",
        "title": "Increase in the Rates of Duty on Certain Articles From Japan (40% on leather and leather footwear, Section 301)",
        "signed": "1986-03-16",
        "published": "1986-03-16",
    },
    "govinfo-fr-1986-06-10": {
        "publisher": "Federal Register",
        "citation": "51 FR 21036",
        "document": "Notice (USTR)",
        "title": "Modification of Increased Duties on Certain Footwear (rewrites the footwear item, today 9903.41.10; the leather duty is unchanged)",
        "signed": None,
        "published": "1986-06-10",
    },
    "govinfo-statute-103-pg2613": {
        "publisher": "U.S. Government Publishing Office",
        "citation": "103 Stat. 2613",
        "document": "Proclamation 5911",
        "title": "Proclamation 5911, item 125: U.S. note 3 to Chapter 99 subchapter III makes 9903.41.05 and 9903.41.10 cumulative duties in the HTS",
        "signed": "1988-11-19",
        "published": "1988-11-19",
    },
}
for s in tu["sources"]:
    if s["id"] in JP_FIX:
        s.update(JP_FIX[s["id"]])

NEW_SOURCES = [
    {
        "id": "fr-1997-20379",
        "publisher": "Federal Register",
        "citation": "62 FR 41361",
        "document": "Notice (Commerce / ITA)",
        "title": "Leather From Argentina, Wool From Argentina, Oil Country Tubular Goods From Argentina, and Carbon Steel Cold-Rolled Flat Products From Argentina: Final Results of Changed Circumstances Countervailing Duty Reviews and Revocation of Countervailing Duty Orders",
        "signed": None,
        "published": "1997-08-01",
        "url": FR + "1997/08/01/97-20379/leather-from-argentina-wool-from-argentina-oil-country-tubular-goods-from-argentina-and-carbon-steel",
    },
]
REUSE = [
    "procl-11012",
    "eo-14389",
    "csms-67834313",
    "scotus-24-1287",
    "eo-14357",
    "eo-14345",
    "eo-14326",
    "eo-14329",
    "eo-14384",
    "eo-14323",
    "eo-14257",
    "eo-14325",
    "eo-14194",
    "eo-14193",
    "eo-14195",
    "eo-14228",
    "ustr-usmca-review",
    "ustr-agoa-2026",
]
have = {s["id"] for s in tu["sources"]}
for sid in REUSE:
    if sid not in have:
        tu["sources"].append(LIB[sid])
        have.add(sid)
for s in NEW_SOURCES:
    if s["id"] not in have:
        tu["sources"].append(s)
        have.add(s["id"])

ENDED_IEEPA = "eo-14389"
JP_SRC = ["govinfo-statute-100-pg4411", "govinfo-fr-1986-06-10", "govinfo-statute-103-pg2613"]

IN_EFFECT = {
    "eu-section-301": dict(
        now="10% in place of a lower base rate on 172 of 176 lines",
        exemption=(
            "EU goods pay the higher of the base rate or 10% (9903.05.39); at or above 10% nothing more is due (9903.05.38). Every Chapter 41 base rate is 5% "
            "or less, so the total is 10% on 172 lines. Reptile leather (4113.30) and leather of other animals (4113.90) are on the U.S. note 52(b) exemption "
            "list (9903.05.86) and pay only the base rate. The 15% IEEPA floor on EU goods (from August 7, 2025) ended February 24, 2026, and the 10% Section "
            "122 surcharge on top of the base rate expired July 23, 2026."
        ),
        whatItMeans="Italian, German, Swedish and Austrian leather pays a flat 10% whatever its base rate; EU reptile leather enters Free.",
        extra=[ENDED_IEEPA, "eo-14326", "procl-11012"],
    ),
    "br-section-301": dict(
        now="+37.5% on 165 lines; +12.5% on 7 lines; +25% on 4 lines",
        exemption=(
            "Brazil's 25% (9903.05.01) does not apply to 7 bovine leather lines on the U.S. note 50(a)(ii) list (9903.05.03): 4104.11.20, 4104.41.50, "
            "4104.49.10 (.20, .40), 4104.49.50, 4107.11.20 and 4107.12.20. The 12.5% forced-labor duty (9903.05.27) skips reptile and other-animal leather "
            "(4113.30, 4113.90) under note 52(b), so those pay 25%. The 2025 IEEPA duties (10% reciprocal plus 40% under 9903.01.77 from August 6, 2025) "
            "reached every Chapter 41 line and ended February 24, 2026."
        ),
        whatItMeans="Most Brazilian finished and crust leather pays 37.5% plus the base rate (up to 42.5%); the seven listed bovine lines pay 12.5% plus the base rate.",
        extra=[ENDED_IEEPA, "eo-14323"],
    ),
    "mx-section-301": dict(
        now="+10% on 172 of 176 lines; none with USMCA",
        exemption=(
            "Applies only to goods that do not qualify for USMCA (9903.05.94 exempts those) and not to reptile or other-animal leather (4113.30, 4113.90; "
            "9903.05.86). Mexico has no Section 338 duty. The 25% IEEPA duty on non-USMCA Mexican goods ended February 24, 2026."
        ),
        whatItMeans="Mexican finished leather, chamois and raw hides enter Free with a USMCA claim; without one they pay 10% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "gb-section-301": dict(
        now="+10% on 172 of 176 lines",
        exemption=(
            "Applies to every Chapter 41 line except reptile and other-animal leather (4113.30, 4113.90; 9903.05.86). The 10% IEEPA reciprocal duty on UK "
            "goods ended February 24, 2026."
        ),
        whatItMeans="British finished leather ($6.6M in 2025) and composition leather and leather waste ($6.5M) pay 10% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "ar-section-301": dict(
        now="+10% on 172 of 176 lines",
        exemption=(
            "Applies to every Chapter 41 line except reptile and other-animal leather (4113.30, 4113.90; 9903.05.86). The 10% IEEPA reciprocal duty ended "
            "February 24, 2026. There is no antidumping or countervailing duty: the 1990 countervailing duty order on leather from Argentina was revoked in 1997."
        ),
        whatItMeans="Argentine wet-blue and finished cattle leather pays 10% plus the base rate.",
        extra=[ENDED_IEEPA, "fr-1997-20379"],
    ),
    "za-section-301": dict(
        now="+12.5% on 172 of 176 lines",
        exemption=(
            "Applies to every Chapter 41 line except reptile and other-animal leather (4113.30, 4113.90; 9903.05.86). The 30% IEEPA reciprocal rate on South "
            "Africa ended February 24, 2026."
        ),
        whatItMeans="South African reptile and other-animal leather enters at the base rate; its goat and pigskin leather (4113.10, 4113.20) pays 12.5% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "ca-section-301": dict(
        now="+50% on 14 of 176 lines, USMCA or not; +10% more without USMCA",
        exemption=(
            "The 50% Section 338 duty applies to 14 lines: under 9903.03.12 (U.S. note 51(b)(1)) on bovine and equine hides that are not pretanned "
            "(4101.50.10, 4101.90.10) and full-grain upholstery leather (4107.11.50), added by Proclamation 11064 from September 15, 2026; and under "
            "9903.03.14 (note 51(b)(3)) on 4101.20.10, 4101.20.20, 4101.50.20, 4101.90.50 and pretanned reptile skins (4103.20.30) since August 22, 2026. "
            "Note 51(a) charges it even when USMCA is claimed. The 10% Section 301 duty (9903.05.29) reaches 172 lines but not USMCA-qualifying goods "
            "(9903.05.93) or reptile and other-animal leather (9903.05.86). The 35% IEEPA duty on non-USMCA Canadian goods ended February 24, 2026."
        ),
        whatItMeans="Canadian raw hides that are not pretanned pay 50% even with a USMCA claim; other Canadian hides and leather enter Free with USMCA.",
        effectiveFrom="2026-09-15",
        effectiveSourceId="procl-11064",
        extra=[ENDED_IEEPA],
    ),
    "in-section-301": dict(
        now="+10% on 172 of 176 lines",
        exemption=(
            "Applies to every Chapter 41 line except reptile and other-animal leather (4113.30, 4113.90; 9903.05.86). The extra 25% IEEPA duty on Indian goods "
            "ended February 7, 2026 and the 25% reciprocal rate on February 24, 2026."
        ),
        whatItMeans="Indian finished cattle and buffalo leather pays 10% plus the base rate: 12.4% to 15%.",
        extra=[ENDED_IEEPA, "eo-14384"],
    ),
    "jp-section-301": dict(
        now="+40% on 103 lines (114 if dyed or embossed), plus 12.5% in place of a lower base rate on 172 lines",
        exemption=(
            "The 1986 Section 301 duty (9903.41.05) adds 40% to bovine (including buffalo) and equine leather of headings 4104 and 4107, and to goat, kid, "
            "sheep and lamb leather of headings 4105, 4106 (4106.21, 4106.22), 4112 and 4113 (4113.10) only when dyed, colored, stamped or embossed. Raw "
            "hides (4101–4103), swine, reptile and other-animal leather, 4114 and 4115 are not covered. U.S. note 3 makes it cumulative with every other "
            "duty. Proclamation 5448 imposed it from March 31, 1986, after Japan kept quotas on U.S. leather and footwear; USTR may end it only by a Federal "
            "Register notice, and none has been published. The 2026 Section 301 duty sets a 12.5% floor (9903.05.49); reptile and other-animal leather is "
            "exempt (9903.05.86). The 15% IEEPA floor on Japanese goods ended February 24, 2026."
        ),
        whatItMeans="Japanese finished cattle leather pays 52.5%; undyed Japanese goat or sheep leather pays 12.5%, dyed or embossed 52.5%.",
        extra=JP_SRC + [ENDED_IEEPA, "eo-14345"],
    ),
    "cn-section-301": dict(
        now="+37.5% on 126 lines; +20% on 45 lines; +25% on reptile and other-animal leather",
        exemption=(
            "List 3 (+25%, 9903.88.03) covers 130 lines: all tanned, crust and finished leather (4104–4114) and leather waste (4115.10). List 4A (+7.5%, "
            "9903.88.15) covers 45 lines: raw hides and skins (4101–4103) and leather parings (4115.20). Pretanned sheepskins with the wool on (4102.10.30) "
            "are only on the suspended List 4B, so they pay 12.5%. The 12.5% forced-labor duty (9903.05.31) adds to both lists except on reptile and "
            "other-animal leather (4113.30, 4113.90; note 52(b)). The 2025 IEEPA duties on China ended February 24, 2026."
        ),
        whatItMeans="Chinese finished leather pays 37.5% plus the base rate (up to 42.5%); Chinese raw hides pay 20% plus the base rate.",
        extra=[ENDED_IEEPA],
    ),
    "other-section-301": dict(
        now="+10% or +12.5% (or a 10% or 12.5% floor) on 172 of 176 lines",
        exemption=(
            "Applies to every Chapter 41 line except reptile and other-animal leather (4113.30, 4113.90), which are on the U.S. note 52(b) exemption list "
            "(9903.05.86). The country lists in note 52(j) name no Chapter 41 line. Countries outside the 60 economies, such as Zimbabwe and Bolivia, pay "
            "only the base rate. From January 1, 2027 Nicaraguan goods not entered under CAFTA-DR also pay 10% under 9903.89.01."
        ),
        whatItMeans="Outside Canada, China, Brazil and Japan, the country's 2026 Section 301 rate is the whole extra duty: Colombia, Türkiye, Uruguay and Thailand 12.5%; Pakistan 10%.",
        extra=["fr-2025-22690", "fr-2025-23892"],
    ),
}
for e in tu["inEffect"]:
    spec = IN_EFFECT[e["id"]]
    e["now"] = spec["now"]
    e["exemption"] = spec["exemption"]
    e["whatItMeans"] = spec["whatItMeans"]
    if "effectiveFrom" in spec:
        e["effectiveFrom"] = spec["effectiveFrom"]
        e["effectiveSourceId"] = spec["effectiveSourceId"]
    ids = list(e["sourceIds"])
    for x in spec.get("extra", []):
        if x not in ids:
            ids.insert(len(ids) - 1, x)
    if e["effectiveSourceId"] not in ids:
        ids.insert(0, e["effectiveSourceId"])
    e["sourceIds"] = ids
    assert e["effectiveSourceId"] in e["sourceIds"]
# The Japan entry: the 1986 duty is the reason it is listed; show it first in the "before" column.
for e in tu["inEffect"]:
    if e["id"] == "jp-section-301":
        e["before"] = "+40% (1986 duty)"
    if e["id"] == "cn-section-301":
        e["before"] = "+25% or +7.5%"

CHANGES = [
    {
        "id": "base-rates",
        "type": "baseRate",
        "date": TODAY,
        "dateLabel": "Checked",
        "title": "No Chapter 41 base-rate changes",
        "detail": "All 176 Chapter 41 lines carry the same general rate and the same statistical suffix in the 2026 Revision 21 as in the 2025 Basic Edition. No line was added, removed or renumbered.",
        "before": None,
        "now": None,
        "countries": None,
        "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continue",
        "type": "reference",
        "date": "2026-10-07",
        "dateLabel": "Published",
        "title": "China Section 301 Lists 3 and 4A continue",
        "detail": "USTR announced that the China Section 301 actions continue during the four-year review. For Chapter 41 this keeps +25% (9903.88.03) on 130 lines of tanned and finished leather and +7.5% (9903.88.15) on 45 lines of raw hides and leather parings from China.",
        "before": "+25% / +7.5%",
        "now": "+25% / +7.5%",
        "countries": "China",
        "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "ca-338-scope",
        "type": "extraDuty",
        "date": "2026-09-15",
        "dateLabel": "Effective",
        "title": "Canada Section 338 list widened to 14 Chapter 41 lines",
        "detail": "Proclamation 11064 added bovine and equine hides that are not pretanned (4101.50.10, 4101.90.10) and full-grain upholstery leather (4107.11.50) to the 9903.03.12 list (U.S. note 51(b)(1)): 8 more lines at 50%, even with a USMCA claim. Proclamation 11065 changed the 9903.03.14 list but no Chapter 41 line.",
        "before": "+50% (6 of 176 lines)",
        "now": "+50% (14 of 176 lines)",
        "countries": "Canada",
        "sourceIds": ["procl-11064", "procl-11065", "csms-69851916", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "section-338-canada-2026-08-22",
        "type": "extraDuty",
        "date": "2026-08-22",
        "dateLabel": "Effective",
        "title": "50% Section 338 duty on 6 Chapter 41 lines from Canada",
        "detail": "Proclamations 11046 (9903.03.12), 11047 (9903.03.13) and 11048 (9903.03.14), signed July 20, 2026, added 50% on listed products of Canada; Proclamation 11056 moved the start to August 22. The 9903.03.14 list (U.S. note 51(b)(3)) names raw bovine and equine hides 4101.20.10, 4101.20.20, 4101.50.20 and 4101.90.50 and pretanned reptile skins 4103.20.30. The duty applies even to USMCA-qualifying goods.",
        "before": None,
        "now": "+50% (6 of 176 lines)",
        "countries": "Canada",
        "sourceIds": ["procl-11046", "procl-11048", "procl-11056", "csms-69606660", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "section-301-2026-60-economies-2026-07-24",
        "type": "extraDuty",
        "date": "2026-07-24",
        "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies; reptile and other-animal leather exempt",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84), including Canada, China, Brazil, Mexico, the UK, Argentina, South Africa and India; EU goods pay at least 10% and Japanese goods at least 12.5% in place of the base rate. U.S. note 52(b) (9903.05.86) exempts reptile leather (4113.30) and leather of other animals (4113.90); the note 52(j) country lists name no Chapter 41 line. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).",
        "before": None,
        "now": "+10% / +12.5% (172 of 176 lines)",
        "countries": "60 economies",
        "sourceIds": ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "s122-end",
        "type": "extraDuty",
        "date": "2026-07-23",
        "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10% (176 of 176 lines)",
        "now": "None",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "section-301-brazil-2026-07-22",
        "type": "extraDuty",
        "date": "2026-07-22",
        "dateLabel": "Effective",
        "title": "25% Section 301 tariff on products of Brazil",
        "detail": "USTR imposed 25% on all products of Brazil (9903.05.01). Its exemption list (U.S. note 50(a)(ii), 9903.05.03) names 7 bovine leather lines in Chapter 41: 4104.11.20, 4104.41.50, 4104.49.10, 4104.49.50, 4107.11.20 and 4107.12.20. From July 24 Brazil also pays the 12.5% forced-labor duty (9903.05.27) on 172 lines.",
        "before": None,
        "now": "+25% (169 of 176 lines)",
        "countries": "Brazil",
        "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review",
        "type": "reference",
        "date": "2026-07-01",
        "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None,
        "now": None,
        "countries": "Canada, Mexico",
        "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "s122-start",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026, on top of the base rate. No Chapter 41 line was on its exemption list (9903.03.03). USMCA-qualifying goods from Canada and Mexico were exempt. Japan's 1986 leather duty continued alongside it.",
        "before": "None",
        "now": "+10% on 176 of 176 lines (until July 23, 2026)",
        "countries": "All",
        "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end",
        "type": "extraDuty",
        "date": "2026-02-24",
        "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect. The 1986 Japan leather duty is a Section 301 duty, not an IEEPA duty, and was not affected.",
        "before": "Varied by country",
        "now": "None",
        "countries": "All",
        "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-25-end",
        "type": "extraDuty",
        "date": "2026-02-07",
        "dateLabel": "Effective",
        "title": "India's extra 25% IEEPA duty removed",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84). The 25% reciprocal rate on India ended with the other IEEPA duties on February 24.",
        "before": "+25%",
        "now": "None",
        "countries": "India",
        "sourceIds": ["eo-14384"],
    },
    {
        "id": "agoa-renewed",
        "type": "reference",
        "date": "2026-02-03",
        "dateLabel": "Signed",
        "title": "AGOA reauthorized through December 31, 2026",
        "detail": "AGOA was renewed retroactively from September 30, 2025, when it had lapsed. AGOA (SPI D) makes the 132 dutiable Chapter 41 lines Free at the base rate for eligible sub-Saharan countries. GSP (SPI A, A+, A*) remains expired since December 31, 2020.",
        "before": "Lapsed (from September 30, 2025)",
        "now": "In force to December 31, 2026",
        "countries": "AGOA beneficiary countries",
        "sourceIds": ["ustr-agoa-2026", "hts-now"],
    },
    {
        "id": "nicaragua-301",
        "type": "pending",
        "date": "2025-12-29",
        "dateLabel": "Published",
        "title": "Nicaragua Section 301 duty scheduled for 2027 and 2028",
        "detail": "USTR set a duty on products of Nicaragua under 9903.89.01: 0% in 2026, +10% from January 1, 2027 and +15% from January 1, 2028. It reaches every Chapter 41 line but applies only to goods not entered under CAFTA-DR (SPI P).",
        "before": None,
        "now": "+10% (2027), +15% (2028)",
        "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-ieepa-cut",
        "type": "extraDuty",
        "date": "2025-11-10",
        "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.24) fell from +20% to +10%. It applied to every Chapter 41 line on top of the Section 301 duties until it ended on February 24, 2026.",
        "before": "+20%",
        "now": "+10% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14357"],
    },
    {
        "id": "in-25",
        "type": "extraDuty",
        "date": "2025-08-27",
        "dateLabel": "Effective",
        "title": "Extra 25% on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84), on top of the 25% reciprocal rate in force since August 7, 2025: Indian finished leather at a 5% base rate paid 55%. Ended February 7, 2026.",
        "before": "+25%",
        "now": "+50% (ended)",
        "countries": "India",
        "sourceIds": ["eo-14329", "eo-14326"],
    },
    {
        "id": "reciprocal-rates",
        "type": "extraDuty",
        "date": "2025-08-07",
        "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates; 15% floor for EU and Japanese goods",
        "detail": "Executive Order 14326 replaced the 10% baseline with country rates for listed countries, for example South Africa +30% and India +25%. EU goods paid 15% in place of a lower base rate, so Italian leather paid 15%; Executive Order 14345 (signed September 4, 2025) gave Japanese goods the same 15% floor back to August 7, on top of which the 1986 40% duty still applied. Ended February 24, 2026.",
        "before": "+10%",
        "now": "+10% to +41%, or a 15% floor (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14326", "eo-14345", "hts-now"],
    },
    {
        "id": "br-40",
        "type": "extraDuty",
        "date": "2025-08-06",
        "dateLabel": "Effective",
        "title": "40% duty on products of Brazil",
        "detail": "Executive Order 14323 (signed July 30, 2025) added 40% on products of Brazil (9903.01.77) on top of the 10% reciprocal duty. No Chapter 41 line was on its exemption lists, so Brazilian hides and leather paid 50% plus the base rate until February 24, 2026.",
        "before": "+10%",
        "now": "+50% (ended)",
        "countries": "Brazil",
        "sourceIds": ["eo-14323", "eo-14389"],
    },
    {
        "id": "reciprocal",
        "type": "extraDuty",
        "date": "2025-04-05",
        "dateLabel": "Effective",
        "title": "Reciprocal tariff reaches Chapter 41",
        "detail": "10% baseline on products of all countries (9903.01.25); Canada and Mexico were excluded. No Chapter 41 line was on the reciprocal-tariff exemption list (U.S. note 2(v)(iii)). The tariff ended February 24, 2026.",
        "before": "None",
        "now": "+10% or more (ended)",
        "countries": "All except Canada, Mexico",
        "sourceIds": ["eo-14257", "hts-now"],
    },
    {
        "id": "cn-ieepa",
        "type": "extraDuty",
        "date": "2025-03-04",
        "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "The IEEPA duty on products of China and Hong Kong (9903.01.20, then 9903.01.24) went from +10% (from February 4, 2025) to +20%, on top of the 25% or 7.5% Section 301 duty.",
        "before": "+10%",
        "now": "+20% (ended)",
        "countries": "China",
        "sourceIds": ["eo-14195", "eo-14228"],
    },
    {
        "id": "ca-mx-imposed",
        "type": "extraDuty",
        "date": "2025-02-01",
        "dateLabel": "Signed",
        "title": "Additional duties on products of Canada and Mexico",
        "detail": "+25% on non-USMCA goods of Canada (9903.01.10, raised to +35% from August 1, 2025) and Mexico (9903.01.01); USMCA-qualifying goods exempt. Ended February 24, 2026.",
        "before": "None",
        "now": "+25% / +35% (ended)",
        "countries": "Canada, Mexico",
        "sourceIds": ["eo-14193", "eo-14194", "eo-14325"],
    },
    {
        "id": "ar-cvd-revoked",
        "type": "reference",
        "date": "1997-08-01",
        "dateLabel": "Published",
        "title": "Countervailing duty order on leather from Argentina revoked",
        "detail": "Commerce revoked the 1990 countervailing duty order on leather from Argentina (55 FR 40212) for all unliquidated entries made on or after September 20, 1991, after the Federal Circuit's Ceramica Regiomontana ruling. No antidumping or countervailing duty order has covered a Chapter 41 product since.",
        "before": "Countervailing duty order",
        "now": "Revoked",
        "countries": "Argentina",
        "sourceIds": ["fr-1997-20379"],
    },
    {
        "id": "jp-1988-hts",
        "type": "reference",
        "date": "1988-11-19",
        "dateLabel": "Signed",
        "title": "Japan leather duty carried into the HTS as 9903.41.05",
        "detail": "Proclamation 5911 moved the 1986 duty into the new Harmonized Tariff Schedule as heading 9903.41.05, with U.S. note 3 to Chapter 99 subchapter III making it cumulative with all other duties. Revision 21 still prints it, and U.S. note 5 does not list it among the suspended headings.",
        "before": None,
        "now": "+40% (9903.41.05)",
        "countries": "Japan",
        "sourceIds": ["govinfo-statute-103-pg2613", "hts-chapter-99"],
    },
    {
        "id": "jp-1986",
        "type": "extraDuty",
        "date": "1986-03-31",
        "dateLabel": "Effective",
        "title": "40% Section 301 duty on leather from Japan",
        "detail": "Proclamation 5448 (signed March 16, 1986) added 40% ad valorem to bovine (including buffalo) and equine leather, and to goat, kid, sheep and lamb leather that is dyed, colored, stamped or embossed, from Japan, in response to Japan's quotas on imports of U.S. leather and footwear. It lets USTR suspend or end the duty only by a notice in the Federal Register; the only later notice (June 1986) rewrote the footwear item, not the leather item.",
        "before": None,
        "now": "+40%",
        "countries": "Japan",
        "sourceIds": ["govinfo-statute-100-pg4411", "govinfo-fr-1986-06-10"],
    },
]
tu["changes"] = CHANGES
for c in CHANGES:
    for sid in c["sourceIds"]:
        assert sid in have, sid
for e in tu["inEffect"]:
    for sid in e["sourceIds"]:
        assert sid in have, (e["id"], sid)

# ------------------------------------------------------------------ understandIndustry
ui = d["understandIndustry"]
ui["h1"] = "HTS Chapter 41: Raw Hides and Skins (Other Than Furskins) and Leather — U.S. Import Statistics"
ui["seo"] = {
    "title": "HTS Chapter 41 Import Statistics: Hides & Leather Imports by Country & Product (2020–2025) | KoalaGains",
    "shortDescription": "U.S. imports of HTS Chapter 41 raw hides and leather 2020–2025 by country, product and year: $450.5M in 2025, led by Italy, Brazil and Mexico — finished cowhide, wet-blue and crust leather, exotic leather, composition leather and raw hides.",
    "keywords": [
        "HTS Chapter 41 import statistics",
        "US leather imports by country",
        "finished leather imports",
        "raw bovine and equine hides imports",
        "wet blue leather imports",
        "italian leather imports",
    ],
}
for st in ui["stats"]:
    if st["label"] == "Largest product":
        st["note"] = "Finished bovine leather, whole hides, grain splits (4107.12)"
ui["effectiveDuty"]["note"] = (
    "Duty-collected figures aren't available from an official source yet. Chapter 41 base rates are Free to 5%, so the base-rate duty is small; the 2026 "
    "Section 301, Brazil, Section 338 and Section 122 duties are not in these 2025 figures."
)
ui["why"] = (
    "U.S. imports of Chapter 41 goods were **$450.5M in 2025**, down 2.0% from $459.5M in 2024 and well below the 2021 peak of $599.9M. **Finished bovine "
    "leather (4107) is 82% of the chapter** ($370.6M): grain splits (4107.12, $145.6M), full-grain whole hides (4107.11, $78.4M) and other whole-hide "
    "leather (4107.19, $69.3M) lead. Raw hides and skins (4101–4103) were only $10.9M.\n\n"
    "**Italy** is the largest supplier at $166.2M (36.9%, -4.0%), almost all finished leather ($155.0M of 4107). **Brazil** rose 26.1% to $94.5M ($87.5M "
    "of finished leather and $5.3M of wet-blue and crust) even though it paid the 50% IEEPA rate from August 6. **Mexico** fell 8.0% to $62.6M, mostly "
    "finished leather ($53.3M). Germany ($21.6M), the UK ($14.6M), Argentina ($11.8M, +33.8%), South Africa ($8.6M, -39.1%) and Canada ($8.4M) follow. "
    "Imports from China fell from $10.9M in 2020 to $2.5M; Japan supplied $0.37M, nearly all finished bovine leather that pays the 1986 40% duty.\n\n"
    "Each product has its own leader. **Wet-blue and crust cattle leather** (4104, $18.7M) comes from Brazil ($5.3M), Argentina ($4.2M), Italy ($4.0M) and "
    "Sweden ($2.0M). **Goat, pig, reptile and other leather** (4113, $24.5M) comes from South Africa ($8.6M), Colombia ($3.6M) and Pakistan ($2.3M). "
    "**Raw cattle and horse hides** (4101, $10.3M) come from Canada ($6.4M) and Mexico ($2.7M). **Composition leather and leather waste** (4115, $10.5M) "
    "come mostly from the UK ($6.5M). 2025 is the latest full year of U.S. trade data."
)
ui["sources"] = [
    {"label": "UN Comtrade (public API), United States imports, HS chapter 41 by heading, HS 6-digit line and partner (retrieved 2026-10-12)", "url": "https://comtradeplus.un.org/"},
    {
        "label": "Federal Register 90 FR 37739 (Executive Order 14323, 40% duty on products of Brazil)",
        "url": FR + "2025/08/05/2025-14896/addressing-threats-to-the-united-states-by-the-government-of-brazil",
    },
]
ui["coverageNote"] = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade. Duty paid is not part of the Comtrade data."

# ------------------------------------------------------------------ industryAreas
ia = d["industryAreas"]
ia["seo"] = {
    "title": "HTS Chapter 41 Tariff Rates by Country: Italy, Brazil, Mexico, Japan, China, Canada | KoalaGains",
    "shortDescription": "The total U.S. tariff on Chapter 41 hides and leather by country and product group — base rate plus the 2026 Section 301 duties, Brazil's 25%, Japan's 40% leather duty, China's Section 301 lists and Canada's 50% Section 338 duty, with USMCA and FTA claims applied.",
    "keywords": [
        "italy tariff on raw hides and skins (other than furskins) and leather",
        "brazil raw hides import duty",
        "china tariff on raw hides and skins (other than furskins) and leather",
        "wet-blue leather import duty rates",
        "raw bovine hides customs duty",
        "usmca duty-free leather imports",
        "japan leather tariff",
        "canada section 338 hides",
    ],
}
ia["intro"] = (
    "Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference, from the current tariff schedule. "
    "Chapter 41 base rates are Free to 5%, so the country decides most of the total.\n\n"
    "The 2026 Section 301 tariffs add **10% or 12.5%** on 172 of 176 lines for most suppliers; reptile and other-animal leather (4113.30, 4113.90) is exempt. "
    "**Italy** and the rest of the EU pay a flat **10%** in place of the base rate. **Brazil** pays 37.5% plus the base rate on most lines, and **China** 37.5% "
    "(leather) or 20% (raw hides). **Japan** pays 12.5% plus the 1986 duty of **40%** on bovine leather. **Mexico** is Free with USMCA; **Canada** is too, "
    "except the 14 lines with the **50% Section 338 duty**, mostly raw hides."
)
SHORT = {
    "4101": "Raw cattle & horse hides",
    "4102": "Raw sheepskins",
    "4103": "Other raw skins",
    "4104": "Wet-blue & crust cattle",
    "4105": "Sheep crust",
    "4106": "Goat, pig, reptile crust",
    "4107": "Finished cattle leather",
    "4112": "Finished sheep leather",
    "4113": "Goat, pig, exotic leather",
    "4114": "Chamois & patent",
    "4115": "Composition leather",
}
for g in ia["groups"]:
    g["shortLabel"] = SHORT[g["heading"]]
LABELS = {
    "Italy": "EU rule: 10% in place of the base rate (9903.05.39) on 172 of 176 lines; reptile and other-animal leather (4113.30, 4113.90) pays only the base rate (9903.05.86).",
    "Brazil": "Base rate +25% Section 301 (Brazil, 9903.05.01) on 169 of 176 lines (7 bovine leather lines exempt, 9903.05.03) +12.5% Section 301 (9903.05.27) on 172 lines (reptile and other-animal leather exempt, 9903.05.86).",
    "Mexico": "USMCA-qualifying: no extra duty (9903.05.94). Otherwise base rate +10% Section 301 (9903.05.55) on 172 of 176 lines. No Section 338 duty on Mexico.",
    "Germany": "EU rule: 10% in place of the base rate (9903.05.39) on 172 of 176 lines; reptile and other-animal leather pays only the base rate (9903.05.86).",
    "United Kingdom": "Base rate +10% Section 301 (9903.05.81) on 172 of 176 lines; reptile and other-animal leather exempt (9903.05.86).",
    "Argentina": "Base rate +10% Section 301 (9903.05.22) on 172 of 176 lines; reptile and other-animal leather exempt (9903.05.86). No antidumping or countervailing duty.",
    "South Africa": "Base rate +12.5% Section 301 (9903.05.69) on 172 of 176 lines; reptile and other-animal leather exempt (9903.05.86).",
    "Canada": "Section 338: +50% on 14 of 176 lines (9903.03.12, 9903.03.14), even with a USMCA claim. Without USMCA also +10% Section 301 (9903.05.29) on 172 lines; USMCA-qualifying goods are exempt from that (9903.05.93).",
    "Sweden": "EU rule: 10% in place of the base rate (9903.05.39) on 172 of 176 lines; reptile and other-animal leather pays only the base rate (9903.05.86).",
    "India": "Base rate +10% Section 301 (9903.05.44) on 172 of 176 lines; reptile and other-animal leather exempt (9903.05.86).",
    "Japan": "12.5% in place of the base rate (9903.05.49) on 172 of 176 lines, plus +40% (9903.41.05, 1986) on bovine and equine leather (4104, 4107) and on goat and sheep leather if dyed, colored, stamped or embossed. Goat and sheep leather cells show two totals: 12.5% when not dyed, colored, stamped or embossed and 52.5% when it is.",
    "China": "Base rate +12.5% Section 301 (9903.05.31) on 172 of 176 lines, plus +25% List 3 (9903.88.03) on 130 lines of leather or +7.5% List 4A (9903.88.15) on 45 lines of raw hides and parings. Pretanned wool-on sheepskins (4102.10.30) are on no active list.",
    "Any other country": "Countries not listed pay the base rate plus their own 2026 Section 301 rate (10% or 12.5%, or a 10% or 12.5% floor) on 172 of 176 lines (9903.05.20–9903.05.84). Countries outside the 60 economies, such as Zimbabwe and Bolivia, pay only the base rate.",
}
RULE_EXTRA = {"Japan": JP_SRC, "Canada": ["csms-69851916"], "Argentina": ["fr-1997-20379"]}
for c in ia["countries"]:
    c["rule"]["label"] = LABELS[c["country"]]
    for sid in RULE_EXTRA.get(c["country"], []):
        if sid not in c["rule"]["sourceIds"]:
            c["rule"]["sourceIds"].insert(len(c["rule"]["sourceIds"]) - 1, sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "Canada's Section 338 duty (U.S. note 51) is applied on both sides of the Canada row: note 51(a) charges it even when USMCA or another special rate is claimed.",
    "U.S. note 52(b) (9903.05.86) is applied: reptile leather (4113.30) and leather of other animals (4113.90) pay no 2026 Section 301 duty from any country. It does not lift Brazil's 25% or China's 25% List 3 duty.",
    "Japan's 1986 duty (9903.41.05) is applied to all of headings 4104 and 4107. For goat, kid, sheep and lamb leather (4105, 4106.21–.22, 4112, 4113.10) it applies only when the leather is dyed, colored, stamped or embossed, so those cells show two totals: one for leather that is not dyed, colored, stamped or embossed and one for leather that is.",
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "The Nicaragua duty under 9903.89.01 starts January 1, 2027 and is not applied; it does not reach goods entered under CAFTA-DR.",
    "No antidumping or countervailing duty order covers a Chapter 41 product, and no Chapter 41 line is on the Section 232 auto-parts list (U.S. note 33(g)), so the grid has none.",
    "The rate is not the only gate: APHIS rules for untanned hides and skins and the CITES and FWS rules for reptile and other wildlife skins can stop a shipment whatever the tariff.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 3, 5, 20, 33, 50, 51 and 52 to Chapter 99 subchapter III and heading 9903.41.05 in the 2026 Revision 21. The Section 301 general "
    "exemption list (note 52(b), 9903.05.86) names 4113.30.30, 4113.30.60, 4113.90.30 and 4113.90.60; the country lists in note 52(j) name no Chapter 41 "
    "line. The Brazil list (note 50(a)(ii), 9903.05.03) names 4104.11.20, 4104.41.50, 4104.49.10, 4104.49.50, 4107.11.20 and 4107.12.20. China List 3 (note "
    "20(f)) covers 4104–4114 and 4115.10; List 4A (note 20(s)) covers 4101–4103 and 4115.20 except 4102.10.30, which is only on the suspended List 4B "
    "(note 20(u)). The Canada Section 338 lists name 4101.50.10, 4101.90.10 and 4107.11.50 (note 51(b)(1)) and 4101.20.10, 4101.20.20, 4101.50.20, "
    "4101.90.50 and 4103.20.30 (note 51(b)(3)). Heading 9903.41.05 covers headings 4104 and 4107, and 4105, 4106, 4112 and 4113 goat, kid, sheep and lamb "
    "leather if dyed, colored, stamped or embossed; note 5 does not suspend it. No Chapter 41 line is on the ended Section 122 (9903.03.03) or "
    "reciprocal-tariff (note 2(v)(iii)) exemption lists."
)
# industryAreas sources: every id a rule cites, resolved from the tariffUpdates source list.
TU_SRC = {s["id"]: s for s in tu["sources"]}
ia_ids = ["hts-now"]
for c in ia["countries"]:
    for sid in c["rule"]["sourceIds"]:
        if sid not in ia_ids:
            ia_ids.append(sid)
ia["sources"] = [TU_SRC[i] for i in ia_ids]

# ------------------------------------------------------------------ tariffEngineering
te = d["tariffEngineering"]
te["seo"] = {
    "title": "Importing Hides & Leather (HTS Ch. 41): APHIS, FWS & CITES Rules, Documents and Legal Ways to Lower Duty | KoalaGains",
    "shortDescription": "The APHIS, FWS and CBP rules for each HTS Chapter 41 line — untanned hide certificates, approved establishments, CITES permits and crocodilian tags for exotic skins — and the legal ways to pay less: USMCA, the Section 301 exemptions, FTA and AGOA claims, Japan's dyed-leather rule, drawback and rulings.",
    "keywords": [
        "importing hides into the us",
        "cites leather",
        "cites crocodile leather",
        "python leather cites",
        "usmca leather tariff exemption",
        "raw hides and skins (other than furskins) and leather import duty rates",
        "exotic leather import rules",
        "aphis untanned hides",
    ],
}
te["intro"] = (
    "For Chapter 41 the agency rules depend on how far the hide is processed and which animal it came from. **USDA APHIS** controls **untanned** hides and "
    "skins (4101–4103) to keep out foot-and-mouth disease, African swine fever and anthrax: they enter freely from disease-free regions or with a "
    "certificate or treatment (hard-dried, pickled, limed), and otherwise go to an approved establishment. Tanned, crust and finished leather of cattle, "
    "sheep, goats, pigs and horses has no APHIS or FWS gate. **FWS** rules apply to skins and leather of wild animals: reptiles, deer, ostrich and other "
    "non-domesticated species need an FWS declaration, a designated port and, for CITES species, CITES permits; crocodilian skins must carry CITES tags.\n\n"
    "To pay less: claim **USMCA** for Canadian and Mexican goods (it does not lift Canada's 50% Section 338 duty), report the **Section 301 exemption** "
    "heading for reptile and other-animal leather and for Brazil's listed bovine lines, claim an FTA or AGOA on the 132 dutiable lines, document whether "
    "Japanese goat or sheep leather is dyed or embossed, and claim drawback on re-exported leather."
)
te["regulationsAsOf"] = "2026-10-08"
te["levers"] = [
    {
        "id": "usmca",
        "title": "Claim USMCA on goods from Canada or Mexico",
        "saves": "The 10% Section 301 duty on 172 lines (9903.05.93 for Canada, 9903.05.94 for Mexico) and the base rate of up to 5% on the 132 dutiable lines",
        "appliesTo": "All 176 lines, for goods that qualify as originating under USMCA",
        "document": "A certification of origin from the importer, exporter or producer, in the importer's possession when the claim is made. It need not follow a set format.",
        "caveat": "It does not lift Canada's 50% Section 338 duty on the 14 listed lines (U.S. note 51(a)): Canadian hides of 4101.20.10, 4101.20.20, 4101.50.10, 4101.50.20, 4101.90.10 and 4101.90.50, reptile skins of 4103.20.30 and upholstery leather of 4107.11.50 pay 50% with or without the claim. USMCA was not renewed at the July 1, 2026 joint review but remains in force.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 51 and 52; 9903.05.93 / 9903.05.94", "url": CH99},
            {"label": "USTR statement on the USMCA joint review (July 1, 2026)", "url": LIB["ustr-usmca-review"]["url"]},
        ],
    },
    {
        "id": "s301-exempt",
        "title": "Report the Section 301 exemption heading where it applies",
        "saves": "The 2026 Section 301 duty of 10% or 12.5% of value on reptile and other-animal leather from every country, and Brazil's 25% on its 7 listed bovine leather lines",
        "appliesTo": "4113.30 and 4113.90 (note 52(b), 9903.05.86); from Brazil, 4104.11.20, 4104.41.50, 4104.49.10, 4104.49.50, 4107.11.20 and 4107.12.20 (note 50(a)(ii), 9903.05.03)",
        "document": "The entry lists the Chapter 99 exemption heading next to the Chapter 41 line.",
        "caveat": "Note 52(b) does not lift Brazil's 25% (9903.05.01), China's 25% List 3 duty (9903.88.03) or Canada's Section 338 duty. Leather of goats, swine and sheep is not exempt, and the leather must really be of reptiles or of animals not named elsewhere in heading 4113 to be classified there.",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(b)", "url": CH99},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 50(a)(ii) (9903.05.03)", "url": CH99},
            {"label": "91 FR 47318: USTR notice of Section 301 actions on 60 economies (July 28, 2026)", "url": TU_SRC["fr-2026-15181"]["url"]},
        ],
    },
    {
        "id": "fta",
        "title": "Claim a free trade agreement on the dutiable lines",
        "saves": "The base rate on the 132 dutiable lines: 1.6% to 5% of value",
        "appliesTo": "Goods that originate in a partner country listed in the line's Special column: Australia (AU), Bahrain (BH), Chile (CL), Colombia (CO), Israel (IL), Jordan (JO), Korea (KR), Morocco (MA), Oman (OM), CAFTA-DR countries (P), Panama (PA), Peru (PE) and Singapore (SG)",
        "document": "A certification of origin (or other information showing the goods originate) held by the importer when the claim is made, with the SPI code on the entry.",
        "caveat": "44 of the 176 lines are already Free. An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a)): Colombian and Korean leather still pays 12.5%. For Nicaragua it matters on every line from January 1, 2027: the 9903.89.01 duty applies only to goods not entered under CAFTA-DR.",
        "citations": [
            {"label": "19 CFR 10.3003 (Colombia TPA claim)", "url": ecfr(19, "10.3003")},
            {"label": "19 CFR 10.1003 (Korea FTA claim)", "url": ecfr(19, "10.1003")},
            {"label": "19 CFR 10.703 (Australia FTA claim)", "url": ecfr(19, "10.703")},
            {"label": "19 CFR 10.583 (CAFTA-DR claim)", "url": ecfr(19, "10.583")},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "agoa",
        "title": "Claim AGOA on dutiable goods from eligible African countries",
        "saves": "The base rate on the 132 dutiable lines, all of which list SPI D",
        "appliesTo": "Goods of AGOA beneficiary countries listed in HTSUS General Note 16",
        "document": "The AGOA claim (SPI D) on the entry; the goods must be the growth, product or manufacture of the beneficiary country.",
        "caveat": "AGOA was renewed only through December 31, 2026, and it does not lift the 2026 Section 301 duty of the country. GSP (SPI A, A+, A*) has been expired since December 31, 2020, so a GSP code in the Special column gives no benefit.",
        "citations": [
            {"label": "HTSUS General Note 16 (AGOA)", "url": GN},
            {"label": "USTR statement on AGOA reauthorization (February 2026)", "url": LIB["ustr-agoa-2026"]["url"]},
        ],
    },
    {
        "id": "jp-undyed",
        "title": "Document whether Japanese goat or sheep leather is dyed, colored, stamped or embossed",
        "saves": "The 40% 1986 duty (9903.41.05) on Japanese goat, kid, sheep and lamb leather that is not dyed, colored, stamped or embossed",
        "appliesTo": "Japanese leather of 4105, 4106.21, 4106.22, 4112 and 4113.10",
        "document": "Mill or supplier specifications showing the finish of the leather, kept with the entry.",
        "caveat": "Japanese bovine and equine leather of headings 4104 and 4107 pays the 40% whatever its finish. Swine, reptile and other-animal leather (4106.31–.92, 4113.20–.90) and raw hides are not covered at all.",
        "citations": [
            {"label": "HTSUS Ch. 99, heading 9903.41.05 and subch. III, U.S. note 3", "url": CH99},
            {"label": "100 Stat. 4411: Proclamation 5448 (1986)", "url": TU_SRC["govinfo-statute-100-pg4411"]["url"]},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback on re-exported leather",
        "saves": "Up to 99% of the duties paid, including the Section 301, Section 338 and 1986 Japan duties, when the leather (or products made from it) is exported",
        "appliesTo": "Any line that paid a duty, when the goods are exported or used to make exported goods",
        "document": "A drawback claim filed with CBP, with import and export records that tie the goods together.",
        "caveat": "Only worth it where a duty was actually paid; for Brazilian, Chinese and Japanese leather and Canadian Section 338 hides the refund can be large.",
        "citations": [{"label": "19 CFR part 191", "url": ecfr_part(19, 191)}],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the classification decides the rate: reptile or other-animal leather (4113.30, 4113.90, Section 301-exempt) versus goat or pig leather, pretanned versus not pretanned hides (Canada's Section 338 list), crust versus finished leather, and fancy versus not fancy",
        "appliesTo": "Any line where the classification decides the rate",
        "document": "A ruling request to CBP describing the product, the animal, the tanning stage, the finish and the size of the hides.",
        "caveat": "Rulings apply to the transaction described; a changed product or process may need its own ruling.",
        "citations": [{"label": "19 CFR part 177", "url": ecfr_part(19, 177)}],
    },
]
te["rules"] = [
    {
        "id": "aphis-hides",
        "agency": "USDA APHIS",
        "title": "Untanned hides and skins of ruminants and swine enter freely only from regions free of foot-and-mouth disease (and African swine fever for swine), or if hard-dried, pickled in acid (pH 5 or less), limed and dehaired, or from approved abattoirs with an official certificate",
        "citations": [
            {"label": "9 CFR 95.16", "url": ecfr(9, "95.16")},
            {"label": "9 CFR 95.2 (region of origin on the invoice)", "url": ecfr(9, "95.2")},
        ],
    },
    {
        "id": "aphis-restricted",
        "agency": "USDA APHIS",
        "title": "Untanned hides that do not meet those conditions must go under seal to an approved establishment and be handled or disinfected there; ruminant hides from Mexico must be tick-free and treated, frozen or certified",
        "citations": [
            {"label": "9 CFR 95.17", "url": ecfr(9, "95.17")},
            {"label": "9 CFR 95.16(b) (Mexico)", "url": ecfr(9, "95.16")},
            {"label": "9 CFR 95.35", "url": ecfr(9, "95.35")},
        ],
    },
    {
        "id": "aphis-diseased",
        "agency": "USDA APHIS",
        "title": "Hides and other byproducts of animals affected with anthrax or foot-and-mouth disease may not be imported",
        "citations": [{"label": "9 CFR 95.3", "url": ecfr(9, "95.3")}],
    },
    {
        "id": "fws-wildlife",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Skins and leather of wild animals (reptiles, deer, ostrich and other non-domesticated species) must be declared to FWS on Form 3-177 and enter through a designated port; commercial importers need an FWS license. Cattle, water buffalo, horses, sheep, goats and pigs are domesticated animals and exempt.",
        "citations": [
            {"label": "50 CFR 14.61", "url": ecfr(50, "14.61")},
            {"label": "50 CFR 14.12", "url": ecfr(50, "14.12")},
            {"label": "50 CFR 14.91", "url": ecfr(50, "14.91")},
            {"label": "50 CFR 14.4 (domesticated animals)", "url": ecfr(50, "14.4")},
        ],
    },
    {
        "id": "fws-cites",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Skins and leather of CITES-listed species (most crocodilians, pythons, monitor lizards and many other reptiles) need CITES export or re-export documents, and an import permit for Appendix I species",
        "citations": [
            {"label": "50 CFR 23.13", "url": ecfr(50, "23.13")},
            {"label": "50 CFR 23.20", "url": ecfr(50, "23.20")},
            {"label": "50 CFR 23.35", "url": ecfr(50, "23.35")},
        ],
    },
    {
        "id": "fws-crocodilian",
        "agency": "U.S. Fish and Wildlife Service",
        "title": "Crocodilian skins (alligator, caiman, crocodile, gavial), whether raw, crusted or tanned, may be imported only with a non-reusable CITES tag locked through each skin",
        "citations": [{"label": "50 CFR 23.70", "url": ecfr(50, "23.70")}],
    },
    {
        "id": "cbp-forced-labor",
        "agency": "CBP",
        "title": "Goods made wholly or in part with forced labor may be detained under a withhold release order or finding",
        "citations": [{"label": "19 CFR 12.42", "url": ecfr(19, "12.42")}],
    },
    {
        "id": "cbp-marking",
        "agency": "CBP",
        "title": "Country-of-origin marking on the goods or their container",
        "citations": [{"label": "19 CFR 134.11", "url": ecfr(19, "134.11")}],
    },
]
COMMON = ["cbp-marking", "cbp-forced-labor"]
APHIS = ["aphis-hides", "aphis-restricted", "aphis-diseased"]
WILD = ["fws-wildlife", "fws-cites"]
GROUP_RULES = {
    "4101": (APHIS, "Untanned cattle, buffalo and horse hides follow the APHIS rules; hard-dried, acid-pickled or limed and dehaired hides enter freely from any region."),
    "4102": (APHIS, "Raw sheepskins are ruminant skins: APHIS rules apply until they are tanned."),
    "4103": (APHIS + WILD + ["fws-crocodilian"], "Raw goat and pig skins follow APHIS; raw reptile and deer skins also need FWS clearance and, for CITES species, CITES permits."),
    "4104": ([], "Tanned (wet-blue) and crust cattle leather is no longer untanned: no APHIS or FWS gate."),
    "4105": ([], "Tanned sheepskins have no agency permit."),
    "4106": (WILD + ["fws-crocodilian"], "Goat and pig crust have no agency permit; reptile and other wild-animal crust needs FWS and CITES clearance."),
    "4107": ([], "Finished cattle, buffalo and horse leather has no agency permit."),
    "4112": ([], "Finished sheep leather has no agency permit."),
    "4113": (WILD + ["fws-crocodilian"], "Goat and pig leather have no agency permit; reptile leather and leather of ostrich, deer and other wild animals need FWS and CITES clearance."),
    "4114": ([], "Chamois, patent and metallized leather have no agency permit."),
    "4115": ([], "Composition leather and leather waste have no agency permit."),
}
for g in te["groups"]:
    rules, note = GROUP_RULES[g["heading"]]
    g["ruleIds"] = COMMON + rules
    g["note"] = note


def line_rules(hts):
    r = list(COMMON)
    if hts.startswith(("4101", "4102", "4103.30")):
        r += APHIS
    elif hts.startswith("4103.20"):
        r += WILD + ["fws-crocodilian"]
    elif hts.startswith("4103.90.11.30"):
        r += APHIS + WILD
    elif hts.startswith(("4103.90.11.40", "4103.90.12", "4103.90.13")):
        r += APHIS
    elif hts.startswith(("4103.90.11.90", "4103.90.20")):
        r += APHIS + WILD
    elif hts.startswith(("4106.40", "4113.30")):
        r += WILD + ["fws-crocodilian"]
    elif hts.startswith(("4106.91", "4106.92", "4113.90")):
        r += WILD
    return r


BR_EXEMPT = ("4104.11.20", "4104.41.50", "4104.49.10", "4104.49.50", "4107.11.20", "4107.12.20")
JP_COND = ("4105", "4106.21", "4106.22", "4112", "4113.10")


def line_levers(l):
    hts = l["hts"]
    lv = ["usmca"]
    if hts.startswith(("4113.30", "4113.90") + BR_EXEMPT):
        lv.append("s301-exempt")
    if ROW[hts]["dutiable"]:
        lv += ["fta", "agoa"]
    if hts.startswith(JP_COND):
        lv.append("jp-undyed")
    lv += ["drawback", "ruling"]
    return lv


for l in te["lines"]:
    l["ruleIds"] = line_rules(l["hts"])
    l["leverIds"] = line_levers(l)
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. APHIS disease-status lists change often; check the current APHIS "
    "requirements for untanned hides and, for reptile and other wildlife leather, the FWS and CITES status of the species before each shipment."
)

# ------------------------------------------------------------------ finalConclusion
fc = d["finalConclusion"]
fc["seo"] = {
    "title": "HTS Chapter 41 Tariff FAQ: HS Codes for Cow, Wet Blue, Goat & Exotic Leather, Raw Hides and Leather Tariffs by Country | KoalaGains",
    "shortDescription": "Answers to what people search about HTS Chapter 41: HS codes for cow leather, raw hides, wet blue, goat, sheep, buffalo, patent, chamois and bonded leather, where leather goods and faux leather go, the tariffs on leather from Italy, China and India, and CITES rules for exotic leather.",
    "keywords": [
        "hts chapter 41",
        "hs code for cow leather",
        "hs code for raw hides",
        "wet blue leather hs code",
        "hs code for goat leather",
        "hs code for buffalo leather",
        "bonded leather hs code",
        "leather scraps hs code",
        "tariff on leather from italy",
        "tariffs on leather goods from china",
        "leather tariffs us",
        "cites leather",
    ],
}
fc["intro"] = "Straight answers to the most common questions about HTS Chapter 41 — HS codes, tariffs by country and import rules for hides and leather. Each answer links to the page with the full detail."
fc["keyTakeaways"] = [
    "Chapter 41 base rates are Free to 5%; the duty comes mostly from extra duties by country.",
    "The 2026 Section 301 tariffs add 10% or 12.5% on 172 of 176 lines; only reptile and other-animal leather (4113.30, 4113.90) is exempt. Italian and other EU leather pays a flat 10%.",
    "Brazil pays 37.5% plus the base rate on most lines and China 37.5% (leather) or 20% (raw hides).",
    "Japanese bovine leather still pays the 1986 Section 301 duty of 40% on top: 52.5% in all.",
    "Canada pays a 50% Section 338 duty on 14 lines, mostly raw hides, even with a USMCA claim; Mexican leather is Free with USMCA.",
]
fc["questionSource"] = f"Google search suggestions, collected October 12, 2026"
fc["faqs"] = [
    {
        "id": "hts-chapter-41",
        "question": "What is HTS Chapter 41?",
        "searchedAs": ["hts chapter 41", "chapter 41 hts", "raw hides and skins"],
        "answer": "Chapter 41 of the Harmonized Tariff Schedule covers raw hides and skins (other than furskins) and leather: raw hides (4101–4103), tanned and crust leather (4104–4106), finished leather (4107, 4112, 4113), chamois, patent and metallized leather (4114) and composition leather and leather waste (4115). It has 176 tariff lines with base rates from Free to 5%. Furskins and hides with the hair on (except the kinds listed in note 1(c)) are in Chapter 43, and leather goods are in Chapter 42.",
        "link": "",
    },
    {
        "id": "hs-cow-leather",
        "question": "What is the HS code for cow leather?",
        "searchedAs": ["hs code for cow leather", "hs code for cowhide leather", "hs code for cow finished leather", "hs code for finished bovine leather", "hs code 4107", "hs code 4107.12"],
        "answer": "Finished cowhide is heading 4107: whole hides as full grain unsplit (4107.11), grain splits (4107.12) or other (4107.19), and sides and other pieces in 4107.91, 4107.92 and 4107.99. The rate depends on use and finish: upper and lining leather of up to 28 sq ft is Free, upholstery leather 2.8%, upper and sole leather 3.3% or 5%, other leather 2.4% to 5%. Tanned or crust cowhide not further prepared is 4104 and raw cowhide 4101.",
        "link": "",
    },
    {
        "id": "hs-raw-hides",
        "question": "What is the HS code for raw hides?",
        "searchedAs": ["hs code for raw hides", "hs code for cow hides", "hs code for raw leather", "raw hides hsn code", "hs code 4101", "hs code 4101.50"],
        "answer": "Raw (untanned) hides and skins are 4101 for cattle, buffalo and horses, 4102 for sheep and lambs and 4103 for other animals (reptiles 4103.20, swine 4103.30, goats, deer and others 4103.90). Whole cattle hides over 16 kg are 4101.50 and those of up to 8 kg simply dried, 10 kg dry-salted or 16 kg fresh or wet-salted are 4101.20. Hides that are not pretanned are Free; most pretanned ones pay 2.4% to 5%. Untanned hides must meet USDA APHIS rules (9 CFR 95.16).",
        "link": "",
    },
    {
        "id": "hs-wet-blue",
        "question": "What is the HS code for wet blue leather?",
        "searchedAs": ["wet blue leather hs code", "wet blue hides hs code", "wet blue bovine leather hs code", "hs code 4104", "hs code 4104.11"],
        "answer": "Wet-blue cattle and buffalo hides are heading 4104, in the wet state: full grains and grain splits 4104.11 and other (such as flesh splits) 4104.19. The 'wet blues' statistical lines are under 4104.11.50 and 4104.19.50 (3.3%); upper, lining, sole and buffalo leather in the wet state have their own lines (Free to 5%). Wet-blue sheepskins are 4105.10.10 (2%), goat 4106.21.10 (2.4%) and pig 4106.31.10 (4.2%). Dried crust leather is 4104.41 and 4104.49.",
        "link": "",
    },
    {
        "id": "hs-goat-sheep",
        "question": "What is the HS code for goat and sheep leather?",
        "searchedAs": ["hs code for goat leather", "hs code for goat finished leather", "hs code for goat suede finished leather", "hs code for sheep leather", "sheep finished leather h.s code", "hs code for goat skins"],
        "answer": "Finished goat and kid leather is 4113.10: 2.4% (not fancy) or 2.8% (fancy, meaning embossed, printed or decorated). Finished sheep and lamb leather is 4112.00 at 2%. Tanned or crust goat skins are 4106.21–.22 (2.4%) and sheep skins 4105 (2%); raw goat skins are 4103.90 and raw sheepskins 4102. Japanese goat and sheep leather pays 40% more if dyed, colored, stamped or embossed.",
        "link": "",
    },
    {
        "id": "hs-buffalo",
        "question": "What is the HS code for buffalo leather?",
        "searchedAs": ["hs code for buffalo finished leather", "hs code buffalo leather"],
        "answer": "Finished buffalo leather has its own lines in heading 4107 at 2.5%: 4107.11.40, 4107.12.40 and 4107.19.40 for whole hides and 4107.91.40, 4107.92.40 and 4107.99.40 for sides. Tanned or crust buffalo hides are 4104.11.30, 4104.19.30, 4104.41.30 and 4104.49.30 at 2.4%, and raw buffalo hides 4101.20.35, 4101.50.35 and 4101.90.35 (2.4%). Indian buffalo leather adds the 10% Section 301 duty.",
        "link": "",
    },
    {
        "id": "hs-patent-chamois",
        "question": "What is the HS code for patent and chamois leather?",
        "searchedAs": ["patent leather hs code", "chamois leather hs code", "pu patent leather hs code"],
        "answer": "Chamois leather, including combination chamois, is 4114.10 at 3.2%. Patent leather is 4114.20.30 at 2.3%, and patent laminated or metallized leather 4114.20.40 (calf and kip, 3.6%) or 4114.20.70 (1.6%). PU 'patent leather' made of plastic is not leather and is not in Chapter 41.",
        "link": "",
    },
    {
        "id": "hs-bonded-scraps",
        "question": "What is the HS code for bonded leather and leather scraps?",
        "searchedAs": ["bonded leather hs code", "leather scraps hs code", "leather pieces hs code", "hs code 4115", "hs code 4115.10"],
        "answer": "Composition (bonded) leather with a basis of leather or leather fiber, in slabs, sheets or strip, is 4115.10, Free. Parings and other waste of leather or composition leather not suitable for making leather articles, and leather dust, powder and flour, are 4115.20, Free. Parings of raw hides are heading 0511. From EU countries both pay 10%, from the UK 10%, and from China 37.5% (4115.10) or 20% (4115.20).",
        "link": "",
    },
    {
        "id": "leather-goods",
        "question": "What is the HS code for leather belts, wallets, bags or shoes?",
        "searchedAs": ["hs code for leather belt", "hs code for leather wallet", "hs code for leather bag", "hs code for leather jacket", "hs code for leather shoes", "hs code for leather gloves"],
        "answer": "Not Chapter 41: that chapter covers only hides and leather as a material. Handbags, wallets and cases are heading 4202, and leather apparel, gloves and belts heading 4203, both in Chapter 42. Footwear with leather uppers is in Chapter 64 (heading 6403). Each has its own rates and extra duties.",
        "link": "",
    },
    {
        "id": "faux-leather",
        "question": "Is faux or PU leather in Chapter 41?",
        "searchedAs": ["pu leather fabric hs code", "faux leather fabric hs code", "synthetic leather fabric hs code", "pvc leather fabric hs code"],
        "answer": "No. Chapter 41 covers only real leather, and \"composition leather\" (4115) must have a basis of leather or leather fiber (note 3). Faux, PU and PVC leather made of plastic or of fabric coated with plastic is classified outside Chapter 41, in the chapters for plastics or coated textile fabrics.",
        "link": "",
    },
    {
        "id": "leather-tariffs-us",
        "question": "What are the U.S. tariffs on leather in 2026?",
        "searchedAs": ["leather tariffs us", "leather tariffs", "leather tariff code", "is leather cheaper in italy"],
        "answer": "The base rate (Free to 5%) plus the 2026 Section 301 duty of the country: EU leather pays a flat 10%, the UK, India, Argentina and Mexico without USMCA 10%, South Africa 12.5%. Brazil pays 37.5% plus the base rate on most lines and China 37.5% or 20%. Japanese bovine leather pays 52.5% because of a 40% duty in force since 1986. Mexican and Canadian leather is Free with USMCA, except Canada's 14 Section 338 lines at 50%. Reptile and other-animal leather is exempt from the 2026 Section 301 duties.",
        "link": "industry-areas",
    },
    {
        "id": "italy",
        "question": "What is the tariff on leather from Italy?",
        "searchedAs": ["tariff on leather from italy", "tariff on italian leather", "tariff on italian leather goods"],
        "answer": "Italian hides and leather pay 10% in place of the base rate (9903.05.39, the EU rule of the 2026 Section 301 action), because every Chapter 41 base rate is below 10%. Italian reptile and other-animal leather (4113.30, 4113.90) pays only the base rate. Before July 24, 2026 Italian leather paid the base rate plus the 10% Section 122 surcharge, and from August 2025 to February 2026 a 15% IEEPA floor. Italian leather goods such as handbags are in Chapter 42.",
        "link": "industry-areas",
    },
    {
        "id": "china",
        "question": "What are the tariffs on leather from China?",
        "searchedAs": ["tariffs on leather goods from china", "leather from china tariff"],
        "answer": "Chinese finished, crust and tanned leather (4104–4114) pays the base rate plus 25% (List 3, 9903.88.03) plus 12.5% (9903.05.31): 37.5% to 42.5%. Raw hides and leather parings pay 7.5% (List 4A) plus 12.5%. Reptile and other-animal leather pays 25%, because note 52(b) lifts only the 12.5%. USTR said on October 7, 2026 that the China lists continue during the four-year review.",
        "link": "tariff-updates",
    },
    {
        "id": "india",
        "question": "What is the tariff on leather from India?",
        "searchedAs": ["tariff on leather goods from india to usa", "tariff on leather goods from india"],
        "answer": "Indian hides and leather pay the base rate plus the 10% Section 301 duty (9903.05.44): 12.4% to 15% on finished cattle and buffalo leather. Reptile and other-animal leather pays only the base rate. The 2025 IEEPA duties on India (25% reciprocal plus 25% from August 27, 2025) have ended. Leather goods such as bags and wallets are in Chapter 42.",
        "link": "industry-areas",
    },
    {
        "id": "cites",
        "question": "Do you need a CITES permit to import exotic leather?",
        "searchedAs": ["cites leather", "cites exotic leather", "cites crocodile leather", "alligator leather cites", "python leather cites", "ostrich leather cites", "cites certificate for leather"],
        "answer": "Yes for species listed under CITES, which include crocodilians, pythons and many other reptiles: the shipment needs CITES export or re-export documents (and an import permit for Appendix I species), an FWS declaration on Form 3-177 and entry through a designated port. Crocodilian skins and leather must carry a CITES tag locked through each skin (50 CFR 23.70). The tariff is low: reptile leather (4113.30) is Free and exempt from the 2026 Section 301 duties.",
        "link": "tariff-engineering",
    },
]
assert 11 <= len(fc["faqs"]) <= 15

# ------------------------------------------------------------------ final checks
out_s = json.dumps(d, ensure_ascii=False, indent=2)
assert "TODO" not in out_s, re.findall(r".{60}TODO.{60}", out_s)[:5]
open(out, "w").write(out_s + "\n")
print("ok", out)
