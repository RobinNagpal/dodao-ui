"""Fill the writer parts of the generated Chapter 93 content file (arms and ammunition).

Re-run after `pnpm tariff:generate-chapter --chapter 93 ...` (see run.sh in this folder):
    python3 fill93.py
"""
import json
import os

WT = "/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui"
PATH = f"{WT}/src/tariff-data/chapters/93-arms-and-ammunition.json"
HERE = os.path.dirname(os.path.abspath(__file__))
POOL = os.path.join(HERE, "pool.json")
CHECKED = "2026-10-13"
ECFR_DATE = "2026-10-08"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
CH93 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2093"
CH90 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2090"
GN = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes"
USC_4181 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleD-chap32-subchapD-partIII-sec4181.htm"
USC_4182 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleD-chap32-subchapD-partIII-sec4182.htm"
USC_925 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title18/html/USCODE-2024-title18-partI-chap44-sec925.htm"
USC_2778 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title22/html/USCODE-2024-title22-chap39-subchapIII-sec2778.htm"
USC_5844 = "https://www.govinfo.gov/content/pkg/USCODE-2024-title26/html/USCODE-2024-title26-subtitleE-chap53-subchapB-partI-sec5844.htm"
FR_CBW = "https://www.federalregister.gov/documents/2021/09/07/2021-19117/imposition-of-additional-sanctions-on-russia-under-the-chemical-and-biological-weapons-control-and"
FR_CBW_CORR = "https://www.federalregister.gov/documents/2021/09/24/2021-20645/imposition-of-additional-sanctions-on-russia-under-the-chemical-and-biological-weapons-control-and"
FR_ATF_PROSCRIBED = "https://www.federalregister.gov/documents/2026/05/06/2026-08911/update-to-proscribed-countries-for-import-restrictions"
FR_ATF_FTZ = "https://www.federalregister.gov/documents/2026/05/08/2026-09162/firearm-activities-in-foreign-trade-zones-customs-bonded-warehouses"
FR_ITAR_2026 = "https://www.federalregister.gov/documents/2026/09/18/2026-19161/international-traffic-in-arms-regulations-clarifying-policies-of-denial-updating-the-major-non-nato"


def ecfr(title, section):
    return f"https://www.ecfr.gov/current/title-{title}/section-{section}"


def ecfr_part(title, part):
    return f"https://www.ecfr.gov/current/title-{title}/part-{part}"


def ruling(n):
    return f"https://rulings.cbp.gov/ruling/{n}"


d = json.load(open(PATH))
pool = json.load(open(POOL))

NEW_SOURCES = {
    "hts-ch93": {
        "id": "hts-ch93",
        "publisher": "USITC",
        "citation": "HTSUS 2026 Revision 21, Chapter 93",
        "document": "Harmonized Tariff Schedule",
        "title": "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 93: Arms and Ammunition; Parts and "
        "Accessories Thereof (chapter notes and statistical note 1)",
        "signed": None,
        "published": "2026-10-07",
        "url": CH93,
    },
    "state-cbw-2021": {
        "id": "state-cbw-2021",
        "publisher": "Federal Register",
        "citation": "86 FR 50203",
        "document": "Public Notice 11522 (Department of State)",
        "title": "Imposition of Additional Sanctions on Russia Under the Chemical and Biological Weapons Control and Warfare "
        "Elimination Act of 1991 (import restrictions on Russian firearms and ammunition, effective September 7, 2021)",
        "signed": "2021-08-20",
        "published": "2021-09-07",
        "url": FR_CBW,
    },
    "state-cbw-2021-corr": {
        "id": "state-cbw-2021-corr",
        "publisher": "Federal Register",
        "citation": "86 FR 53137",
        "document": "Public Notice 11540 (Department of State)",
        "title": "Imposition of Additional Sanctions on Russia Under the Chemical and Biological Weapons Control and Warfare "
        "Elimination Act of 1991; Correction (U.S. Munitions Import List citation: 27 CFR 447.21, Categories I and III)",
        "signed": None,
        "published": "2021-09-24",
        "url": FR_CBW_CORR,
    },
    "ecfr-447-52": {
        "id": "ecfr-447-52",
        "publisher": "eCFR",
        "citation": "27 CFR 447.52",
        "document": "Code of Federal Regulations (up to date as of October 8, 2026)",
        "title": "Import restrictions applicable to certain countries (ATF must deny permits for firearms and certain ammunition "
        "located or manufactured in the Russian Federation and other listed former Soviet states)",
        "signed": None,
        "published": ECFR_DATE,
        "url": ecfr("27", "447.52"),
    },
    "atf-nprm-proscribed": {
        "id": "atf-nprm-proscribed",
        "publisher": "Federal Register",
        "citation": "91 FR 24387",
        "document": "Proposed rule (ATF)",
        "title": "Update to Proscribed Countries for Import Restrictions",
        "signed": None,
        "published": "2026-05-06",
        "url": FR_ATF_PROSCRIBED,
    },
    "atf-nprm-ftz": {
        "id": "atf-nprm-ftz",
        "publisher": "Federal Register",
        "citation": "91 FR 25237",
        "document": "Proposed rule (ATF)",
        "title": "Firearm Activities in Foreign Trade Zones, Customs-Bonded Warehouses",
        "signed": None,
        "published": "2026-05-08",
        "url": FR_ATF_FTZ,
    },
    "itar-2026-19161": {
        "id": "itar-2026-19161",
        "publisher": "Federal Register",
        "citation": "91 FR 59059",
        "document": "Final rule (Department of State)",
        "title": "International Traffic in Arms Regulations: Clarifying Policies of Denial, Updating the Major Non-NATO Ally List, "
        "and Minor Corrections",
        "signed": None,
        "published": "2026-09-18",
        "url": FR_ITAR_2026,
    },
    "usc-4181": {
        "id": "usc-4181",
        "publisher": "U.S. Code (GovInfo)",
        "citation": "26 U.S.C. 4181",
        "document": "United States Code, 2024 edition",
        "title": "Firearms excise tax: 10% of the sale price of pistols and revolvers, 11% of firearms (other than pistols and "
        "revolvers) and of shells and cartridges, imposed on the sale by the manufacturer, producer or importer",
        "signed": None,
        "published": "2024-12-31",
        "url": USC_4181,
    },
}


def src(sid):
    return NEW_SOURCES.get(sid) or pool[sid]


def add_sources(page, ids):
    have = {s["id"] for s in page["sources"]}
    for sid in ids:
        if sid not in have:
            page["sources"].append(json.loads(json.dumps(src(sid))))
            have.add(sid)


def money(v):
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.0f}M" if v >= 1e8 else f"${v / 1e6:.1f}M"
    return f"${v / 1e3:.0f}K"


LABELS = {
    "9301": ("Military weapons: artillery, rocket and grenade launchers, military rifles and shotguns, machine guns", "Military weapons"),
    "9302": ("Revolvers and pistols", "Pistols & revolvers"),
    "9303": (
        "Sporting and hunting shotguns and rifles, muzzle-loaders, blank-firing pistols, flare guns, captive-bolt and "
        "line-throwing guns",
        "Shotguns & rifles",
    ),
    "9304": ("Air guns, airsoft guns, paintball markers, spring guns, truncheons and other arms", "Air guns & other arms"),
    "9305": ("Gun parts and accessories: frames, receivers, barrels, stocks and other parts of firearms and air guns", "Gun parts"),
    "9306": (
        "Ammunition: cartridges, shotgun shells, air gun pellets and BBs, paintballs, bombs, grenades, missiles and their parts",
        "Ammunition",
    ),
    "9307": ("Swords, cutlasses, bayonets, lances and similar arms, scabbards and sheaths", "Swords & bayonets"),
}
ENDED = "The IEEPA duties ended February 24, 2026, and the 10% Section 122 surcharge expired July 23, 2026."
NO_LIST = "No Chapter 93 line is on the general exemption list (U.S. note 52(b)) or on any note 52(j) country exception list. "
SCOPE_NOTE = (
    "Rifles entered with a telescopic sight (9301.90.30, 9303.30.40, 9303.30.80) pay the base rate on two declared values, the "
    "rifle's and the sight's; the extra duty is charged on the full customs value."
)

# ---------------------------------------------------------------- overview (seo)
ov = d["overview"]
ov["h1"] = "HTS Chapter 93: Arms & Ammunition — 2026 Tariff Rates for Firearms, Gun Parts and Ammunition"
ov["seo"]["title"] = "HTS Chapter 93 Tariff Rates 2026: Firearms, Pistols, Shotguns, Gun Parts & Ammunition Import Duty | KoalaGains"
ov["seo"]["shortDescription"] = (
    "Searchable duty table for all 67 HTS Chapter 93 lines: pistols and revolvers, shotguns and rifles (with the rifle-plus-"
    "scope rates), air guns, gun parts, ammunition and swords. General, FTA and Column 2 rates plus the 2026 extra duty by "
    "country."
)
ov["seo"]["keywords"] = [
    "HTS Chapter 93",
    "hts chapter 93 import duty rates",
    "arms and ammunition tariff",
    "hs code 9306",
    "hs code for firearms",
    "hs code for ammunition",
    "hs code for gun parts",
    "hs code for rifle scope",
    "italy civilian shotguns import duty",
    "turkey 9mm ammunition tariff",
    "brazil section 301 firearms tariffs",
    "ammunition import duty 2026",
]

# ---------------------------------------------------------------- tariff updates
tu = d["tariffUpdates"]
tu["h1"] = "HTS Chapter 93 Tariff Updates: Firearms, Gun Parts & Ammunition (2025–2026)"
tu["seo"]["title"] = "HTS Chapter 93 Tariff Updates 2026: Firearms & Ammunition — Section 301, Brazil, China, IEEPA End | KoalaGains"
tu["seo"]["shortDescription"] = (
    "What changed for HTS Chapter 93 firearms, gun parts and ammunition since January 2025: unchanged base rates, the IEEPA "
    "tariffs and their end, the Section 122 surcharge, the 2026 Section 301 tariffs on 60 economies, the Brazil action, China "
    "List 4A, and the Russian firearms and ammunition import restrictions."
)
tu["seo"]["keywords"] = [
    "HTS Chapter 93 tariff updates",
    "ammunition import duty 2026",
    "turkey arms import duty rates",
    "italy tariff on arms and ammunition",
    "brazil ammunition tariffs",
    "section 301 duties on arms",
    "section 122 tariff updates",
    "russian ammo import ban",
]
tu["intro"] = (
    "This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the "
    "current **2026 Revision 21** (in force October 9, 2026). All 67 Chapter 93 lines carry the same base rates in both.\n\n"
    "What changed came on top of the base rate. In 2025 the IEEPA tariffs added 10%–25% on most suppliers' firearms and "
    "ammunition — 15% in total for EU goods, 15% extra for Türkiye and Israel, 20% for Taiwan, and 40% more for Brazil from "
    "August 6, 2025 — while USMCA-qualifying goods from Canada and Mexico paid nothing extra. They **ended on February 24, 2026**, and the "
    "10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, goods from 60 economies pay "
    "a **Section 301 tariff of 10% or 12.5%** on every Chapter 93 line, with no exemption list for this chapter; **Brazil** pays "
    "25% more (from July 22, 2026), and **China** also keeps its **7.5% List 4A duty** on 66 of the 67 lines.\n\n"
    "Apart from duties, **firearms and ammunition made in or located in Russia cannot be permanently imported**: since September 7, 2021 ATF "
    "must deny import permits for them under a State Department sanction."
)
tu["scope"] = (
    "Measures that reach Chapter 93 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 "
    "tariff, China Section 301 List 4A, Russia's column 2 and 35% rates, the Nicaragua Section 301 phase-in, and the 2025–2026 "
    "IEEPA and Section 122 duties that have ended. No Section 232 product list names a Chapter 93 line, no Chapter 93 line is on the "
    "Canada Section 338 lists (U.S. note 51), and no antidumping or countervailing duty order covers a firearm, gun part or "
    "ammunition. Also listed: the import restrictions on Russian firearms and ammunition and the 2026 ATF and State Department "
    "rules on arms imports. For the rate each supplier pays, see Rates by country."
)
tu["stats"] = [
    {"label": "Base rates unchanged", "value": "67 of 67 lines"},
    {"label": "Extra duties in effect", "value": str(len(tu["inEffect"])), "note": "Section 301 (2026, Brazil, China List 4A) and Russia's column 2 rates"},
    {"label": "Compared", "value": "Jan 2025 → Rev 21"},
    {"label": "IEEPA duties", "value": "Ended", "note": "February 24, 2026"},
]

IE = {
    "tr": (
        NO_LIST + "Türkiye pays +12.5% (9903.05.79) on top of the base rate. The 15% IEEPA reciprocal duty ended February 24, "
        "2026; the Section 122 surcharge expired July 23, 2026.",
        "Turkish shotguns pay 2.6% + 12.5% = 15.1%, pistols 14¢ each + 15.5%, ammunition 12.5%. Rifles: the rifle and sight "
        "rates plus 12.5% of the full value.",
    ),
    "gb": (
        NO_LIST + "The UK pays +10% (9903.05.81) on top of the base rate. The 10% IEEPA reciprocal duty ended February 24, 2026.",
        "British ammunition pays 10%, gun parts 10%–14.2%, shotguns 12.6% and pistols 14¢ each + 13%.",
    ),
    "eu": (
        "For EU goods the 2026 action replaces the base rate with 10% in total when the base rate is lower (9903.05.39) — every "
        "Chapter 93 line in practice; at 10% or more nothing extra is due (9903.05.38). On rifles with a sight the duty is the "
        "higher of 10% of the value and the rifle-plus-sight base rate. The EU exception list (note 52(j)) names no Chapter 93 "
        "line. This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "Austrian, Czech, Croatian and German pistols, Italian and Spanish shotguns and EU ammunition pay 10% of value in place "
        "of the base rate.",
    ),
    "ca": (
        "USMCA-qualifying goods pay no Section 301 duty (9903.05.93) and no base rate. Under General Note 11, firearms of 9301–9304 "
        "qualify when made from materials of another chapter (or from parts of 9305 with 60% regional value content), parts of "
        "9305 from another heading, ammunition and swords from another chapter. No Chapter 93 line is on the Section 338 lists in "
        "U.S. note 51, so the 50% Canada duty does not reach this chapter. The 35% IEEPA duty on Canada ended February 24, 2026.",
        "Canadian ammunition, gun parts and firearms pay $0 with a USMCA claim; without one, the base rate plus 10%.",
    ),
    "br": (
        "+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the 2026 action from July 24, 2026 "
        "(9903.05.27). No Chapter 93 line is on the note 50(a)(ii) Brazil exemption list. The 40% IEEPA duty on Brazil (and the "
        "10% reciprocal duty) ended February 24, 2026.",
        "Brazilian pistols pay 14¢ each + 40.5%, ammunition 37.5%, shotguns 40.1%.",
    ),
    "tw": (
        "Taiwanese goods pay 10% in total (9903.05.76) when the base rate is lower — every Chapter 93 line in practice. Taiwan's "
        "exception list names no Chapter 93 line. The 20% IEEPA reciprocal duty ended February 24, 2026.",
        "Taiwanese air guns, gun parts and ammunition pay 10% of value in place of the base rate.",
    ),
    "jp": (
        "Japanese goods pay 12.5% in total (9903.05.49) when the base rate is lower — every Chapter 93 line in practice. Japan's "
        "exception list names no Chapter 93 line. This replaced the 15% IEEPA rate, which ended February 24, 2026.",
        "Japanese shotguns, rifles and ammunition pay 12.5% of value in place of the base rate (rifles with a sight: the higher of "
        "12.5% and the base rate).",
    ),
    "cn": (
        "Two Section 301 duties. The 2026 action adds +12.5% (9903.05.31) on all 67 lines. China List 4A (+7.5%, 9903.88.15; 15% "
        "from September 1, 2019, cut to 7.5% from February 14, 2020) covers every Chapter 93 subheading except 9305.99.40 (parts "
        "of flare guns, blank-firing and other 9303 arms), which was on List 4B — suspended before it took effect. The List 4A "
        "exclusion for pre-charged pneumatic air rifles (note 20(fff)) has expired, and no other China exclusion covers a Chapter "
        "93 product; USTR confirmed on October 7, 2026 that the 2018–2019 actions continue. The IEEPA duties on China ended "
        "February 24, 2026.",
        "Chinese ammunition and gun parts pay 20%, air rifles 23.9%, swords 22.7%; parts of 9305.99.40 pay 12.5%.",
    ),
    "il": (
        NO_LIST + "Israel pays +12.5% (9903.05.47); the U.S.–Israel FTA (SPI IL) removes the base rate but not this duty "
        "(note 52(a)). The 15% IEEPA reciprocal duty ended February 24, 2026.",
        "Israeli pistols, gun parts and ammunition entered under the FTA pay 12.5% in total.",
    ),
    "mx": (
        "USMCA-qualifying goods entered under USMCA pay no Section 301 duty (9903.05.94) and no base rate; the General Note 11 "
        "rules are the same as for Canada. The 25% IEEPA duty on Mexico ended February 24, 2026.",
        "Mexican air guns, parts and ammunition that qualify for USMCA pay $0; goods without a valid claim pay the base rate plus "
        "10%.",
    ),
    "kr": (
        "Korean goods pay 12.5% in total (9903.05.71) when the base rate is lower — every Chapter 93 line in practice. Korea's "
        "exception list names no Chapter 93 line. KORUS (SPI KR) removes the base rate but not this duty. The IEEPA duty on Korea "
        "ended February 24, 2026.",
        "Korean ammunition, parts and military weapons pay 12.5% of value.",
    ),
    "in": (
        NO_LIST + "GSP (SPI A, A+) has been expired since December 31, 2020. The 25% reciprocal duty and the extra 25% on Indian "
        "goods (ended February 7, 2026) are gone. " + ENDED,
        "Indian gun parts and ammunition pay the base rate plus 10%; swords 12.7%.",
    ),
    "ru": (
        "Russia has had column 2 rates since April 2022 (Free to 105% on Chapter 93 lines; 65% on shotguns and rifles, $3.50 each + "
        "55% on pistols); four subheadings — 9304.00.40, 9305.20.80, 9306.21.00 and 9306.30.41 — pay 35% in their place "
        "(9903.90.08, note 30). The 2026 Section 301 action adds +12.5% (9903.05.66). Separately, ATF must deny permits to "
        "import firearms and ammunition made in or located in Russia (State Department sanction effective September 7, 2021; 27 "
        "CFR 447.52(b)).",
        "The duty is shown for completeness: Russian firearms and ammunition cannot get an ATF import permit. The calculator prices "
        "the duty but does not model this import ban.",
    ),
    "other": (
        "No Chapter 93 line is on the general exemption list (note 52(b)) or on any country exception list in note 52(j). Japan, "
        "South Korea and Switzerland pay 12.5% in total and Taiwan and the EU 10% in total when the base rate is lower. " + ENDED,
        "Firearms and ammunition from the other Section 301 economies (the Philippines, Switzerland, Norway, Australia, Pakistan "
        "and others) pay the base rate plus 10% or 12.5%, or a 10%/12.5% total. Countries outside the 60 economies pay only the base "
        "rate.",
    ),
}
for e in tu["inEffect"]:
    key = e["id"].split("-")[0]
    e["exemption"], e["whatItMeans"] = IE[key]
    if key == "cn":
        e["before"] = "+7.5% on 66 of 67 lines (List 4A)"
        e["now"] = "+20% (66 lines) or +12.5% (9305.99.40)"
    if key == "ru":
        e["before"] = "Column 2 rates; 35% in their place on 4 subheadings"
        e["now"] = "Column 2 (or 35%) + 12.5%"
        for sid in ("pl-117-110", "state-cbw-2021", "ecfr-447-52"):
            if sid not in e["sourceIds"]:
                e["sourceIds"].insert(-1, sid)
    if key == "other":
        e["country"] = "Other Section 301 economies (the Philippines, Switzerland, Norway, Australia, Pakistan and others)"
        e["now"] = "+10% or +12.5% (10% or 12.5% in total for the EU, Japan, South Korea, Switzerland, Taiwan)"
    if key == "in" and "cbp-gsp" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "cbp-gsp")
    if key not in ("ru",) and "eo-14389" not in e["sourceIds"]:
        e["sourceIds"].insert(-1, "eo-14389")

add_sources(tu, [
    "eo-14389", "csms-67834313", "scotus-24-1287", "procl-11012", "ustr-usmca-review", "eo-14193", "eo-14194", "eo-14195",
    "eo-14228", "eo-14257", "eo-14266", "eo-14298", "eo-14357", "eo-14326", "eo-14329", "eo-14384", "eo-14325", "eo-14323",
    "cbp-gsp", "pl-117-110", "state-cbw-2021", "state-cbw-2021-corr", "ecfr-447-52", "atf-nprm-proscribed", "atf-nprm-ftz",
    "itar-2026-19161", "hts-ch93", "usc-4181", "csms-69606660",
])

S301 = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
tu["changes"] = [
    {
        "id": "base-rates", "type": "baseRate", "date": CHECKED, "dateLabel": "Checked",
        "title": "No Chapter 93 base-rate changes",
        "detail": "All 67 Chapter 93 lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 "
        "Basic Edition, including the rifle-plus-telescopic-sight rates of 9301.90.30, 9303.30.40 and 9303.30.80; no line was "
        "added, split or renumbered.",
        "before": None, "now": None, "countries": None, "sourceIds": ["hts-before", "hts-now", "hts-now-cr"],
    },
    {
        "id": "cn-301-continued", "type": "reference", "date": "2026-10-07", "dateLabel": "Published",
        "title": "China Section 301 List 4A continues",
        "detail": "USTR received requests to continue the 2018–2019 China Section 301 actions, so they stay in effect during the "
        "four-year review. For Chapter 93 this keeps +7.5% (9903.88.15) on every subheading except 9305.99.40, on top of the "
        "12.5% 2026 action.",
        "before": None, "now": None, "countries": "China", "sourceIds": ["fr-2026-20510", "hts-now"],
    },
    {
        "id": "itar-126-1", "type": "reference", "date": "2026-09-18", "dateLabel": "Effective",
        "title": "State Department restates its arms-embargo country policies (ITAR 126.1)",
        "detail": "The rule reorganizes 22 CFR 126.1 and says its policy of denial covers exports, reexports, retransfers and "
        "temporary imports of defense articles destined for or originating in the listed countries. Russia stays on the list "
        "(126.1(l)). Permanent imports of firearms and ammunition remain ATF's (27 CFR part 447).",
        "before": None, "now": None, "countries": "Russia and other 126.1 countries", "sourceIds": ["itar-2026-19161"],
    },
    {
        "id": "s301-fl", "type": "extraDuty", "date": "2026-07-24", "dateLabel": "Effective",
        "title": "Section 301 tariffs on 60 economies cover every Chapter 93 line",
        "detail": "10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84): 12.5% for Türkiye, China, Israel and "
        "Brazil, 10% for the UK, Canada, Mexico and India. No Chapter 93 line is on the general exemption list (U.S. note 52(b)) "
        "or on any country exception list in note 52(j). EU and Taiwanese goods pay 10% in total and Japanese and Korean goods "
        "12.5% in total; USMCA-qualifying goods are exempt (9903.05.93, 9903.05.94). FTA claims remove the base rate but not this "
        "duty; goods entered under Chapter 98, such as U.S. firearms returned (9801.00.10), do not pay it.",
        "before": "None", "now": "+10% / +12.5%", "countries": "60 economies", "sourceIds": S301,
    },
    {
        "id": "s122-end", "type": "extraDuty", "date": "2026-07-23", "dateLabel": "Expired",
        "title": "Section 122 import surcharge expired",
        "detail": "The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.",
        "before": "+10%", "now": "None", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "br-301", "type": "extraDuty", "date": "2026-07-22", "dateLabel": "Effective",
        "title": "Section 301 tariff on products of Brazil",
        "detail": "25% on goods of Brazil (9903.05.01) on all 67 Chapter 93 lines; none is on the note 50(a)(ii) exemption list. "
        "From July 24 the 12.5% 2026 action (9903.05.27) is added, for 37.5% on top of the base rate.",
        "before": "None", "now": "+25%", "countries": "Brazil", "sourceIds": ["fr-2026-14542", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "usmca-review", "type": "reference", "date": "2026-07-01", "dateLabel": "Announced",
        "title": "USMCA joint review: not renewed, still in force",
        "detail": "The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in "
        "force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.",
        "before": None, "now": None, "countries": "Canada, Mexico", "sourceIds": ["ustr-usmca-review"],
    },
    {
        "id": "atf-ftz-nprm", "type": "pending", "date": "2026-05-08", "dateLabel": "Proposed",
        "title": "ATF proposes to treat customs-bonded warehouses like foreign-trade zones",
        "detail": "ATF's import rules already exclude firearms brought into a foreign-trade zone from \"importation\". The proposed "
        "rule would add customs-bonded warehouses and drop the \"for storage\" condition; it would not change customs "
        "requirements. Comments closed August 6, 2026; no final rule has been published.",
        "before": None, "now": None, "countries": "All", "sourceIds": ["atf-nprm-ftz"],
    },
    {
        "id": "atf-proscribed-nprm", "type": "pending", "date": "2026-05-06", "dateLabel": "Proposed",
        "title": "ATF proposes to update its list of proscribed countries",
        "detail": "ATF proposed to replace the country list in 27 CFR 447.52(a) with a reference to the State Department's list (22 "
        "CFR 126.1) and to drop Georgia, Kazakhstan, Kyrgyzstan, Moldova, Turkmenistan, Ukraine and Uzbekistan from the firearms "
        "and ammunition denial list in 447.52(b), leaving only Russia. Comments closed July 6, 2026; no final rule has been "
        "published, so the current list still applies.",
        "before": None, "now": None, "countries": "Former Soviet states", "sourceIds": ["atf-nprm-proscribed", "ecfr-447-52"],
    },
    {
        "id": "s122-start", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "Section 122 surcharge replaces the IEEPA tariffs",
        "detail": "10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 93 line was on the product "
        "exemption list (9903.03.03), so every firearm, part and cartridge paid it. USMCA-qualifying goods from Canada and Mexico "
        "were exempt.",
        "before": "None", "now": "+10% (until July 23, 2026)", "countries": "All", "sourceIds": ["procl-11012", "hts-now"],
    },
    {
        "id": "ieepa-end", "type": "extraDuty", "date": "2026-02-24", "dateLabel": "Effective",
        "title": "All IEEPA tariffs end",
        "detail": "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not "
        "authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP "
        "stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings "
        "are still printed in Revision 21 but are no longer in effect.",
        "before": "Varied by country", "now": "None", "countries": "All", "sourceIds": ["scotus-24-1287", "eo-14389", "csms-67834313"],
    },
    {
        "id": "in-oil-end", "type": "extraDuty", "date": "2026-02-07", "dateLabel": "Effective",
        "title": "Extra 25% on products of India ended",
        "detail": "Executive Order 14384 ended the additional 25% duty on products of India (9903.01.84) that had applied since "
        "August 27, 2025. India's 25% reciprocal duty continued until February 24, 2026.",
        "before": "+25%", "now": "None", "countries": "India", "sourceIds": ["eo-14384", "eo-14329"],
    },
    {
        "id": "nicaragua-301", "type": "pending", "date": "2025-12-12", "dateLabel": "Published",
        "title": "Nicaragua Section 301 tariff phases in from 2027",
        "detail": "USTR's action on Nicaragua adds a duty on all Nicaraguan goods that do not originate under CAFTA-DR "
        "(9903.89.01): 0% in 2026, 10% from January 1, 2027 and 15% from January 1, 2028. It reaches every Chapter 93 line.",
        "before": "None", "now": "0% in 2026 → 10% (2027) → 15% (2028)", "countries": "Nicaragua",
        "sourceIds": ["fr-2025-22690", "fr-2025-23892", "hts-chapter-99", "hts-now"],
    },
    {
        "id": "cn-fentanyl-cut", "type": "extraDuty", "date": "2025-11-10", "dateLabel": "Effective",
        "title": "China fentanyl duty cut to 10%",
        "detail": "Executive Order 14357 lowered the IEEPA duty on products of China (9903.01.24) from 20% to 10%, so Chinese "
        "firearms, parts and ammunition paid 10% + 10% reciprocal + 7.5% List 4A on top of the base rate. Ended February 24, "
        "2026.",
        "before": "+20%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14357"],
    },
    {
        "id": "in-oil", "type": "extraDuty", "date": "2025-08-27", "dateLabel": "Effective",
        "title": "Extra 25% on products of India",
        "detail": "Executive Order 14329 added 25% on Indian goods (9903.01.84) on top of the 25% reciprocal rate, for 50% in all "
        "on Indian gun parts, ammunition and swords. Ended February 7, 2026.",
        "before": "+25%", "now": "+50% (ended)", "countries": "India", "sourceIds": ["eo-14329", "eo-14384"],
    },
    {
        "id": "reciprocal-country", "type": "extraDuty", "date": "2025-08-07", "dateLabel": "Effective",
        "title": "Country-specific reciprocal rates replace the 10% baseline",
        "detail": "Executive Order 14326 set each country's reciprocal rate: Türkiye, Israel, Japan and South Korea +15%; Taiwan "
        "+20%; India +25%; EU goods 15% in total; the UK and Brazil stayed at +10%. No Chapter 93 line was on the "
        "reciprocal-tariff exemption list. Ended February 24, 2026.",
        "before": "+10%", "now": "+10% to +25% (ended)", "countries": "Listed countries", "sourceIds": ["eo-14326", "hts-now"],
    },
    {
        "id": "br-ieepa", "type": "extraDuty", "date": "2025-08-06", "dateLabel": "Effective",
        "title": "Additional 40% on products of Brazil",
        "detail": "Executive Order 14323 added 40% on Brazilian goods (9903.01.77) on top of the 10% reciprocal duty, for 50% "
        "extra on Brazilian pistols, shotguns and ammunition. Ended February 24, 2026.",
        "before": "None", "now": "+40% (ended)", "countries": "Brazil", "sourceIds": ["eo-14323"],
    },
    {
        "id": "ca-amended", "type": "extraDuty", "date": "2025-07-31", "dateLabel": "Signed",
        "title": "Canada additional duty raised to 35%",
        "detail": "Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.",
        "before": "+25%", "now": "+35% (ended)", "countries": "Canada", "sourceIds": ["eo-14325"],
    },
    {
        "id": "cn-reciprocal-10", "type": "extraDuty", "date": "2025-05-14", "dateLabel": "Effective",
        "title": "China reciprocal duty cut from 125% to 10%",
        "detail": "Executive Order 14298 cut the reciprocal duty on Chinese goods to 10% for goods entered from May 14, 2025, so "
        "Chinese firearms, parts and ammunition paid 37.5% on top of the base rate (20% fentanyl + 10% + 7.5% List 4A). Ended "
        "February 24, 2026.",
        "before": "+125%", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14298"],
    },
    {
        "id": "cn-125", "type": "extraDuty", "date": "2025-04-10", "dateLabel": "Effective",
        "title": "China reciprocal duty raised to 125%; other country rates paused",
        "detail": "Executive Order 14266 raised the reciprocal duty on Chinese goods to 125% and paused the higher country rates "
        "for other countries, leaving the 10% baseline. With the 20% fentanyl duty and List 4A, Chinese air guns, gun parts and "
        "ammunition paid 152.5% on top of the base rate until May 13, 2025.",
        "before": "+34%", "now": "+125% (ended)", "countries": "China; all others", "sourceIds": ["eo-14266", "eo-14257"],
    },
    {
        "id": "reciprocal", "type": "extraDuty", "date": "2025-04-02", "dateLabel": "Signed",
        "title": "Reciprocal tariff on products of all countries",
        "detail": "10% baseline (9903.01.25) from April 5, 2025 and country rates (9903.02.xx); Canada and Mexico excluded. "
        "Ended February 24, 2026.",
        "before": "None", "now": "+10% or more (ended)", "countries": "All except Canada, Mexico", "sourceIds": ["eo-14257"],
    },
    {
        "id": "cn-fentanyl-20", "type": "extraDuty", "date": "2025-03-04", "dateLabel": "Effective",
        "title": "China fentanyl duty raised to 20%",
        "detail": "Executive Order 14228 raised the IEEPA duty on products of China from 10% to 20%. Ended February 24, 2026.",
        "before": "+10%", "now": "+20% (ended)", "countries": "China", "sourceIds": ["eo-14228"],
    },
    {
        "id": "mx-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Mexico",
        "detail": "+25% on non-USMCA goods (9903.01.01) from March 4, 2025; USMCA-qualifying goods exempt (9903.01.04). Ended "
        "February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Mexico", "sourceIds": ["eo-14194"],
    },
    {
        "id": "ca-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of Canada",
        "detail": "+25% on non-USMCA goods (9903.01.10) from March 4, 2025, later raised to +35%; USMCA-qualifying goods exempt "
        "(9903.01.14). Ended February 24, 2026.",
        "before": "None", "now": "+25% (ended)", "countries": "Canada", "sourceIds": ["eo-14193"],
    },
    {
        "id": "cn-imposed", "type": "extraDuty", "date": "2025-02-01", "dateLabel": "Signed",
        "title": "Additional duty on products of China",
        "detail": "+10% on all goods of China (9903.01.20) from February 4, 2025, on top of the 7.5% List 4A duty. Ended February "
        "24, 2026.",
        "before": "None", "now": "+10% (ended)", "countries": "China", "sourceIds": ["eo-14195"],
    },
    {
        "id": "ru-cbw-2021", "type": "reference", "date": "2021-09-07", "dateLabel": "Effective",
        "title": "Russian firearms and ammunition: ATF must deny import permits",
        "detail": "Under the second round of Chemical and Biological Weapons Act sanctions on Russia, new or pending ATF permit "
        "applications to permanently import firearms or ammunition (U.S. Munitions Import List Categories I and III) "
        "manufactured or located in Russia are denied. The State Department said the measures stay in place for at least one "
        "year and until further notice; ATF's regulation already barred most Russian firearms under a 1996 agreement (27 CFR "
        "447.52(b)).",
        "before": None, "now": None, "countries": "Russia", "sourceIds": ["state-cbw-2021", "state-cbw-2021-corr", "ecfr-447-52"],
    },
    {
        "id": "cn-list4a-cut", "type": "extraDuty", "date": "2020-02-14", "dateLabel": "Effective",
        "title": "China List 4A cut from 15% to 7.5%",
        "detail": "Under the U.S.-China Phase One agreement USTR halved the List 4A duty (9903.88.15) on Chinese firearms, gun "
        "parts, ammunition and swords.",
        "before": "+15%", "now": "+7.5%", "countries": "China", "sourceIds": ["fr-2020-00904", "hts-chapter-99"],
    },
    {
        "id": "cn-list4a", "type": "extraDuty", "date": "2019-09-01", "dateLabel": "Effective",
        "title": "China List 4A: 15% on Chinese arms and ammunition",
        "detail": "USTR's fourth China Section 301 list (9903.88.15) put 15% on every Chapter 93 subheading except 9305.99.40 from "
        "September 1, 2019. Cut to 7.5% from February 14, 2020.",
        "before": "None", "now": "+15%", "countries": "China", "sourceIds": ["fr-2019-17865", "hts-chapter-99"],
    },
]
tu["changes"].sort(key=lambda c: c["date"], reverse=True)

# ---------------------------------------------------------------- industry areas (static parts)
ia = d["industryAreas"]
ia["h1"] = "HTS Chapter 93 Tariff Rates by Country: Firearms, Gun Parts & Ammunition"
ia["seo"]["title"] = "HTS Chapter 93 Import Duty by Country: Türkiye, Italy, Austria, Germany, Brazil, Canada — Firearms | KoalaGains"
ia["seo"]["shortDescription"] = (
    "The total U.S. tariff on pistols, shotguns, rifles, gun parts and ammunition by country: base rate plus the 2026 Section "
    "301 duty, Brazil's 25% and China's List 4A duty, with USMCA and the EU, Japan, Korea and Taiwan caps applied."
)
ia["seo"]["keywords"] = [
    "united states tariff on arms and ammunition",
    "hts chapter 93 import duty by country",
    "sporting shotguns customs duty",
    "italian firearms import duty rates",
    "turkish shotgun customs duty",
    "austria pistol import duty",
    "brazil ammunition tariffs",
    "hts 9306 munitions import duty",
]
ia["intro"] = (
    "The total rate on Chapter 93 goods depends on **where they come from** as much as on what they are. Each cell below is the "
    "base rate for that product group plus the extra duty for that country, minus any preference — computed from the current "
    "tariff schedule with the same engine as the tariff calculator.\n\n"
    "Since the IEEPA duties ended on February 24, 2026, the extra duty is mainly the **Section 301 tariff on 60 economies** (from "
    "July 24, 2026), and no Chapter 93 line is on an exemption list. **EU goods** — Austrian, Czech, Croatian and German pistols, "
    "Italian and Spanish shotguns — pay **10% in total**; **Türkiye pays the base rate plus 12.5%**, the UK plus 10%, **Brazil "
    "plus 37.5%** and **China plus 20%**. **USMCA-qualifying goods from Canada and Mexico enter free.** Rifles entered with a "
    "telescopic sight are shown with their two-part base rate, as the schedule prints it."
)
for g in ia["groups"]:
    g["label"], g["shortLabel"] = LABELS[g["heading"]]

EU_RULE = (
    "EU: 10% in total in place of the base rate (9903.05.39) where the base rate is lower — every line in practice; rifles with "
    "a sight pay the higher of 10% and their rifle-plus-sight base rate. The 15% IEEPA rate ended February 24, 2026."
)
RULE_LABELS = {
    "Türkiye (Turkey)": "Base rate plus 12.5% Section 301 (9903.05.79) on all 67 lines; no exception list covers a Chapter 93 line. The 15% IEEPA reciprocal duty ended February 24, 2026.",
    "United Kingdom": "Base rate plus 10% Section 301 (9903.05.81) on all 67 lines; the UK exception list names no Chapter 93 line.",
    "Italy": EU_RULE,
    "Germany": EU_RULE,
    "Austria": EU_RULE,
    "Czechia": EU_RULE,
    "Spain": EU_RULE,
    "Croatia": EU_RULE,
    "Canada": "USMCA-qualifying: Free, no extra duty (9903.05.93); no Chapter 93 line is on the Section 338 lists. Otherwise the base rate plus 10% (9903.05.29). The 35% IEEPA duty ended February 24, 2026.",
    "Brazil": "Base rate plus 25% Brazil Section 301 (9903.05.01) and 12.5% (9903.05.27) on all 67 lines; none is on the note 50 exemption list. The 40% IEEPA duty ended February 24, 2026.",
    "Taiwan": "10% in total in place of the base rate (9903.05.76) — every line in practice. The 20% IEEPA reciprocal duty ended February 24, 2026.",
    "Japan": "12.5% in total in place of the base rate (9903.05.49) — every line in practice. The 15% IEEPA rate ended February 24, 2026.",
    "China": "Base rate plus 12.5% Section 301 (9903.05.31) on all 67 lines, plus 7.5% List 4A (9903.88.15) on every line except 9305.99.40 (List 4B, suspended).",
    "Israel": "U.S.–Israel FTA (IL) removes the base rate; the 12.5% Section 301 duty (9903.05.47) still applies, so 12.5% in total.",
    "Mexico": "USMCA-qualifying: Free, no extra duty (9903.05.94). Otherwise the base rate plus 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026.",
    "South Korea": "12.5% in total in place of the base rate (9903.05.71) — every line in practice; KORUS removes the base rate but not this duty.",
    "India": "Base rate plus 10% Section 301 (9903.05.44) on all 67 lines. GSP has expired; the IEEPA duties (25% + 25%) ended in February 2026.",
    "Any other country": "From the base rate alone (countries outside the 60 Section 301 economies) to base rate plus 12.5% (9903.05.20–9903.05.84). No country exception list names a Chapter 93 line. Russia is not included: its firearms and ammunition cannot get an import permit.",
}
for c in ia["countries"]:
    c["rule"]["label"] = RULE_LABELS[c["country"]]
    sids = c["rule"]["sourceIds"]
    if "eo-14389" not in sids:
        sids.insert(-1, "eo-14389")
    if c["country"] == "India" and "cbp-gsp" not in sids:
        sids.insert(-1, "cbp-gsp")
    if c["country"] == "Any other country":
        for sid in ("state-cbw-2021", "ecfr-447-52"):
            if sid not in sids:
                sids.insert(-1, sid)
ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
    "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section "
    "122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
    "Rifles with a telescopic sight (9301.90.30, 9303.30.40, 9303.30.80) are shown with the schedule's wording: the base rate is "
    "charged on the declared value of the rifle and of the sight (chapter 93 statistical note 1), so it can't be one number "
    "without those values. The extra duty is charged on the full customs value; the EU, Japan, Korea and Taiwan floors compare "
    "it with the two-part base rate.",
    "Pistols and revolvers (9302) carry 14¢ each + 3%: the grid shows the per-unit part as written. Under the EU, Japan, Korea "
    "and Taiwan rules the 10%/12.5% total is higher than the base rate for any pistol worth more than a few dollars.",
    "Russia is not in the grid: its goods take column 2 rates (35% on four subheadings) plus 12.5%, but ATF must deny permits "
    "to import firearms and ammunition made in or located in Russia.",
    "Not in the grid: ATF import permits (Form 6) and import criteria, the State Department's arms-embargo rules, and the federal "
    "excise tax on firearms and ammunition (10% or 11% of the importer's sale price, 26 U.S.C. 4181), which is not a customs "
    "duty. See Import documents.",
]
ia["exemptionCheck"] = (
    "Read U.S. notes 2, 16, 19, 20, 30, 31, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) "
    "(9903.05.86), the general exemption list, names no Chapter 93 code, and no note 52(j) country exception list names one; note "
    "52(i) (CAFTA-DR textiles) does not reach this chapter. Note 50(a)(ii) (Brazil) and note 51 (Canada Section 338) name none. "
    "In note 20, List 4A (20(s), 9903.88.15) names every Chapter 93 subheading except 9305.99.40, which is on List 4B (20(u), "
    "suspended); Lists 1–3 and the 2024 increases (note 31) name none, and the only Chapter 93 exclusion — pre-charged pneumatic "
    "air rifles of 9304.00.2000, note 20(fff) — has expired. Note 30(b) puts 9304.00.40, 9305.20.80, 9306.21.00 and 9306.30.41 "
    "at 35% for Russia. The Section 232 metals lists (notes 16 and 19) name no Chapter 93 line. No antidumping or countervailing "
    "duty order covers a Chapter 93 product."
)
add_sources(ia, ["eo-14389", "csms-67834313", "procl-11012", "cbp-gsp", "state-cbw-2021", "ecfr-447-52"])

# ---------------------------------------------------------------- tariff engineering
te = d["tariffEngineering"]
te["h1"] = "Importing Firearms, Gun Parts & Ammunition (HTS Ch. 93): Permits, Rules & Ways to Lower Duty"
te["seo"]["title"] = "Importing Firearms & Ammunition: ATF Form 6, ITAR, Excise Tax & Ways to Lower Duty (HTS Ch. 93) | KoalaGains"
te["seo"]["shortDescription"] = (
    "The rules for each HTS Chapter 93 line — ATF import permits (Form 6, 27 CFR 447 and 478), the sporting-purposes test, NFA "
    "limits, the Russia restrictions, ITAR temporary imports, importer marking and the federal excise tax — and the legal ways "
    "to pay less: USMCA, FTAs, Chapter 98, foreign-trade zones, rulings and drawback."
)
te["seo"]["keywords"] = [
    "chapter 93 tariff engineering",
    "atf form 6",
    "atf form 6a",
    "importing firearms into the us",
    "itar import requirements",
    "federal excise tax on firearms and ammunition",
    "itar temporary import",
    "usmca firearms rules of origin",
]
te["intro"] = (
    "Firearms, their barrels and parts, and firearm ammunition need an **ATF import permit** before they can be imported: "
    "an approved **ATF Form 6** under the Arms Export Control Act and the Gun Control Act, presented to CBP at entry. ATF can "
    "approve only what the law allows — for example rifles and shotguns \"particularly suitable for sporting purposes\", not "
    "surplus military firearms — and machine guns and other National Firearms Act weapons only for government, research or "
    "dealer-sample use. **Firearms and ammunition made in or located in Russia are denied.** Importers must also mark each "
    "firearm and pay the **federal excise tax** when they sell it.\n\n"
    "The ways to pay less duty are few, because most Chapter 93 base rates are low and the cost is the extra duty: **claim "
    "USMCA** on Canadian and Mexican goods, use an **FTA** where the base rate is the cost, enter **U.S. goods returned** under "
    "Chapter 98 (no Section 301 duty), hold goods in a **foreign-trade zone**, get a **binding ruling** on air guns, parts and "
    "scopes, and claim **drawback** on re-exports. For rifles with a scope, **declare the rifle and sight values separately** — "
    "the schedule requires it."
)
te["regulationsAsOf"] = ECFR_DATE
te["lastCheckedAt"] = CHECKED
te["levers"] = [
    {
        "id": "rifle-scope",
        "title": "Rifles with a scope: declare the rifle and the sight separately",
        "saves": "Applies the sight rate only to the sight: 3.1% on the rifle + 13% on the sight (9303.30.80), 3.8% + 10% "
        "(9303.30.40) or 4.7% + 20% (9301.90.30), instead of a guess on the whole value",
        "appliesTo": "Rifles imported with a telescopic sight mounted on them or designed to be mounted on them (9301.90.30, "
        "9303.30.40, 9303.30.80); the sight is reported under its own statistical suffix (.10 or .05)",
        "document": "Invoice values for the rifle and the sight; the sum must equal the value of the article (chapter 93 "
        "statistical note 1). The tariff calculator asks for both values.",
        "caveat": "A sight imported without a rifle is not a Chapter 93 good (chapter note 1(d)): it is 9013.10.10 at 14.9% (NY "
        "N360004, N310885). The Section 301 duty is charged on the full value either way, and from the EU, Japan, Korea and "
        "Taiwan the 10%/12.5% total replaces the two-part rate when it is higher.",
        "citations": [
            {"label": "HTSUS Chapter 93, note 1(d) and statistical note 1", "url": CH93},
            {"label": "HTSUS 9013.10.10 (Chapter 90)", "url": CH90},
            {"label": "CBP ruling NY N360004 (telescopic scope)", "url": ruling("N360004")},
        ],
    },
    {
        "id": "usmca",
        "title": "Claim USMCA on goods made in Canada or Mexico",
        "saves": "The 10% Section 301 duty plus the base rate (up to 5.7%, or 14¢ each + 3% on pistols)",
        "appliesTo": "All 67 lines, for goods that qualify as originating under USMCA — in 2025 mostly Canadian ammunition and gun "
        "parts and Mexican air guns, parts and ammunition",
        "document": "A certification of origin from the importer, exporter or producer, in any format. Firearms of 9301–9304 "
        "qualify when made from materials of another chapter, or from parts of 9305 with at least 60% regional value content "
        "(transaction value) or 50% (net cost); parts of 9305 from any other heading; ammunition and swords (9306–9307) from any "
        "other chapter (General Note 11).",
        "caveat": "Assembling imported parts of 9305 into a firearm needs the regional value content. The USMCA was not renewed at "
        "the July 1, 2026 joint review but remains in force. The ATF permit is still required.",
        "citations": [
            {"label": "19 CFR 182.12", "url": ecfr("19", "182.12")},
            {"label": "HTSUS General Note 11 (Chapter 93 rules)", "url": GN},
            {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": CH99},
        ],
    },
    {
        "id": "fta",
        "title": "Claim an FTA rate where the base rate is the cost",
        "saves": "The base rate: 14¢ each + 3% on pistols, 2.6% on shotguns, 3.1%–4.7% on rifles plus 10%–20% on sights, 3.5%–5.7% "
        "on stocks, parts, air rifles and truncheons, 2.7% on swords",
        "appliesTo": "The 31 dutiable lines, for goods of Israel, Korea, Australia, Chile, Colombia, Peru, Panama, Jordan, Morocco, "
        "Bahrain, Oman, Singapore, CAFTA-DR, CBERA and AGOA countries",
        "document": "Proof of origin under the program and the SPI on the entry line (IL, KR, AU, CL, CO, PE, PA, JO, MA, BH, OM, "
        "SG, P, E or D).",
        "caveat": "FTA claims do not remove the 2026 Section 301 duty (U.S. note 52(a)): Israeli goods still pay 12.5%, and for "
        "Korea the 12.5% total already replaces the base rate. Ammunition (9306) is Free anyway. GSP (A, A+) has been expired "
        "since December 31, 2020.",
        "citations": [
            {"label": "HTSUS General Notes", "url": GN},
            {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": CH99},
        ],
    },
    {
        "id": "ch98",
        "title": "Enter U.S. firearms returned, and repairs abroad, under Chapter 98",
        "saves": "U.S. goods returned (9801.00.10) are Free and pay no Section 301 duty; repaired goods (9802.00.40/.50) pay duty "
        "only on the value of the repair",
        "appliesTo": "Firearms and parts made in the United States and returned without having been advanced in value abroad, and "
        "U.S.-exported firearms repaired or altered abroad",
        "document": "Proof of U.S. origin and export (19 CFR 10.1) or of the export for repair (19 CFR 10.8). ATF still requires a "
        "permit unless an exemption applies; a firearm the person took out of the United States may be brought back by that "
        "person (18 U.S.C. 925(d)(4)).",
        "caveat": "The 2026 Section 301 duty still applies to the value of repairs entered under 9802.00.40/.50 (U.S. note 52(a)). "
        "Chapter 98 relief needs CBP to agree the entry is proper.",
        "citations": [
            {"label": "HTSUS Chapter 98 (9801.00.10, 9802.00.40, 9802.00.50)", "url": CH98},
            {"label": "19 CFR 10.1", "url": ecfr("19", "10.1")},
            {"label": "19 CFR 10.8", "url": ecfr("19", "10.8")},
            {"label": "18 U.S.C. 925(d)", "url": USC_925},
        ],
    },
    {
        "id": "ftz",
        "title": "Hold stock in a foreign-trade zone",
        "saves": "Duty is paid only when goods leave the zone for U.S. consumption; goods re-exported from the zone pay none",
        "appliesTo": "Firearms, parts and ammunition stored for later entry or re-export",
        "document": "FTZ admission (CBP Form 214). ATF's rules do not treat bringing a firearm or ammunition into a foreign-trade "
        "zone for storage pending shipment abroad or later importation as \"importation\"; the ATF permit is needed when the "
        "goods are entered from the zone.",
        "caveat": "ATF's May 8, 2026 proposal to extend this to customs-bonded warehouses and drop the \"for storage\" condition is "
        "not final. Duties, including the Section 301 duty, are due when goods are entered for consumption from the zone.",
        "citations": [
            {"label": "27 CFR 478.11 (\"importation\")", "url": ecfr("27", "478.11")},
            {"label": "ATF proposed rule, 91 FR 25237 (May 8, 2026)", "url": FR_ATF_FTZ},
            {"label": "19 CFR part 146 (foreign trade zones)", "url": ecfr_part("19", "146")},
        ],
    },
    {
        "id": "ruling",
        "title": "Get a binding ruling before you import",
        "saves": "Certainty where the line decides the rate: air rifles (9304.00.20, 3.9%) vs. other air guns (9304.00.40, Free), "
        "parts of air guns (9305.99.50, 3.9%) vs. other parts, scopes (9013.10.10, 14.9%) vs. rifle-plus-sight entries",
        "appliesTo": "Airsoft and paintball guns, gun accessories (lights, lasers, mounts, holsters, cases), flash hiders, "
        "training swords and replicas",
        "document": "A ruling request to CBP describing the product, its materials and construction (19 CFR part 177). Published "
        "rulings show how CBP decides: N149835 (airsoft rifle, 9304.00.20), N140515 (airsoft pistol and shotgun, 9304.00.40), "
        "N095195 (paintball marker, 9304.00.40), N146796 (pellets 9306.29, plastic BBs 9306.90), N304308 (martial arts weapons, "
        "9307).",
        "caveat": "Rulings apply to the transaction described. Parts \"of general use\" of base metal or plastics (screws, springs) "
        "are not gun parts (chapter note 1(b)).",
        "citations": [
            {"label": "19 CFR part 177", "url": ecfr_part("19", "177")},
            {"label": "CBP ruling NY N149835 (airsoft rifle)", "url": ruling("N149835")},
            {"label": "CBP ruling NY N146796 (air gun ammunition)", "url": ruling("N146796")},
        ],
    },
    {
        "id": "drawback",
        "title": "Claim drawback when the goods are exported",
        "saves": "Up to 99% of the duties paid, including Section 301 duties, on imported goods re-exported or used in exported goods",
        "appliesTo": "All lines, when the imported goods or substitutes are exported or used in manufacturing exported goods "
        "(for example imported barrels and parts built into firearms for export)",
        "document": "A drawback claim filed in ACE within 5 years of import, with records linking the import to the export. CBP "
        "has applied unused-merchandise drawback to imported pistols (HQ 228267).",
        "caveat": "Only duties actually paid are refunded, not the excise tax; the export needs its own State Department or Commerce "
        "export authorization.",
        "citations": [
            {"label": "19 CFR part 190", "url": ecfr_part("19", "190")},
            {"label": "CBP ruling HQ 228267 (pistols, drawback)", "url": ruling("228267")},
        ],
    },
]
te["rules"] = [
    {
        "id": "atf-permit", "agency": "ATF",
        "title": "Import permit: an approved ATF Form 6 (Part I) is needed before firearms, firearm barrels, ammunition and other articles on the U.S. Munitions Import List are imported; it lists the foreign seller, the manufacturer, type, caliber, model, quantity and unit cost, and the approved form is the permit. At release the permit holder files Form 6A with CBP, and for Category I and III articles a registered importer also gives CBP a copy of the exporting country's export license (or a certification that none is needed). Minor parts (not barrels, cylinders, receivers or breech mechanisms) worth $100 or less per transaction need no permit",
        "citations": [
            {"label": "27 CFR 447.41 (permit requirement)", "url": ecfr("27", "447.41")},
            {"label": "27 CFR 447.42 (Form 6 application)", "url": ecfr("27", "447.42")},
            {"label": "27 CFR 447.45 (release, Form 6A)", "url": ecfr("27", "447.45")},
            {"label": "27 CFR 478.112 (licensed importers)", "url": ecfr("27", "478.112")},
            {"label": "22 U.S.C. 2778 (Arms Export Control Act)", "url": USC_2778},
        ],
    },
    {
        "id": "atf-usmil", "agency": "ATF",
        "title": "What needs a permit: the U.S. Munitions Import List — Category I firearms (pistols, revolvers, rifles, combat and short-barreled shotguns, automatic weapons, silencers) and their parts, Category II artillery, Category III ammunition and its components (cartridge cases, bullets, primers; not shotgun shells), Category IV rockets, bombs and mines",
        "citations": [
            {"label": "27 CFR 447.21 (U.S. Munitions Import List)", "url": ecfr("27", "447.21")},
            {"label": "27 CFR 447.11 (definitions)", "url": ecfr("27", "447.11")},
        ],
    },
    {
        "id": "atf-criteria", "agency": "ATF",
        "title": "What can be approved: firearms and ammunition for scientific or research use, unserviceable curios, firearms \"generally recognized as particularly suitable for or readily adaptable to sporting purposes\" (excluding surplus military firearms), and firearms the person took out of the U.S.; machine guns, short-barreled rifles and shotguns and other NFA weapons only for government use, research, or as samples",
        "citations": [
            {"label": "18 U.S.C. 925(d)", "url": USC_925},
            {"label": "26 U.S.C. 5844 (NFA importation)", "url": USC_5844},
            {"label": "27 CFR 479.111", "url": ecfr("27", "479.111")},
            {"label": "27 CFR 478.113 (nonlicensees)", "url": ecfr("27", "478.113")},
        ],
    },
    {
        "id": "gca-defs", "agency": "ATF",
        "title": "Gun Control Act definitions: a firearm expels a projectile by the action of an explosive (air, spring and gas guns are not firearms), antique firearms — made in or before 1898, and certain replicas — are excluded, and ammunition means cartridge cases, primers, bullets or propellent powder designed for use in a firearm",
        "citations": [
            {"label": "27 CFR 478.11 (definitions)", "url": ecfr("27", "478.11")},
        ],
    },
    {
        "id": "atf-russia", "agency": "ATF / State Department",
        "title": "Proscribed countries: ATF denies permits for defense articles from the countries in 27 CFR 447.52(a), and for firearms and 7.62×25mm ammunition located or manufactured in Russia and other listed former Soviet states (447.52(b)); since September 7, 2021 all permanent-import permits for Russian firearms and ammunition (USMIL Categories I and III) are denied. BIS's Russia and Belarus rules (15 CFR 746.8) are export license requirements and do not govern imports",
        "citations": [
            {"label": "27 CFR 447.52", "url": ecfr("27", "447.52")},
            {"label": "86 FR 50203 (State Department sanction, Sept. 7, 2021)", "url": FR_CBW},
            {"label": "91 FR 24387 (ATF proposed update, May 6, 2026)", "url": FR_ATF_PROSCRIBED},
            {"label": "15 CFR 746.8 (BIS, exports to Russia and Belarus)", "url": ecfr("15", "746.8")},
        ],
    },
    {
        "id": "itar", "agency": "State Department (DDTC)",
        "title": "Temporary imports of defense articles (for repair, exhibition or transit) are controlled by the State Department under the ITAR, not by an ATF permit; the policy of denial in 22 CFR 126.1 covers temporary imports originating in the listed countries, including Russia",
        "citations": [
            {"label": "22 CFR 123.4 (temporary import exemptions)", "url": ecfr("22", "123.4")},
            {"label": "22 CFR 126.1 (prohibited countries)", "url": ecfr("22", "126.1")},
            {"label": "91 FR 59059 (Sept. 18, 2026)", "url": FR_ITAR_2026},
        ],
    },
    {
        "id": "atf-marking", "agency": "ATF",
        "title": "Licensed importers must mark each imported firearm's frame or receiver with a serial number and their name and place of business (or a license-number prefix), and the firearm with its model, caliber or gauge, foreign manufacturer and country of manufacture; no one may assemble a semiautomatic rifle or shotgun that could not be imported from more than 10 of the listed imported parts",
        "citations": [
            {"label": "27 CFR 478.92", "url": ecfr("27", "478.92")},
            {"label": "27 CFR 478.39", "url": ecfr("27", "478.39")},
        ],
    },
    {
        "id": "fet", "agency": "TTB",
        "title": "Federal excise tax on the importer's (or manufacturer's) sale: 10% of the sale price for pistols and revolvers, 11% for other firearms and for shells and cartridges. Parts and accessories sold separately are not taxed; makers and importers of fewer than 50 pistols, revolvers and firearms a year in all are exempt for those. It is a tax, not a customs duty",
        "citations": [
            {"label": "26 U.S.C. 4181", "url": USC_4181},
            {"label": "26 U.S.C. 4182 (exemptions)", "url": USC_4182},
            {"label": "27 CFR 53.61", "url": ecfr("27", "53.61")},
        ],
    },
    {
        "id": "cbp-marking", "agency": "CBP",
        "title": "Country-of-origin marking on each article (or its container when the article cannot be marked), in English, legible and permanent enough to reach the ultimate purchaser",
        "citations": [
            {"label": "19 CFR 134.11", "url": ecfr("19", "134.11")},
        ],
    },
    {
        "id": "cbp-ch99", "agency": "CBP",
        "title": "Report the Chapter 99 headings with the line: the 2026 Section 301 heading for the country (or 9903.05.93/.94 for USMCA goods), Brazil (9903.05.01), China List 4A (9903.88.15) on every line except 9305.99.40, and for Russia 9903.90.08 on its four subheadings",
        "citations": [
            {"label": "HTSUS Ch. 99, subch. III, U.S. notes 20, 30, 50 and 52", "url": CH99},
        ],
    },
]
GROUP_NOTES = {
    "9301": "Military weapons need an ATF permit and are importable only within the 925(d) and NFA limits — machine guns only for government, research or dealer samples. Rifles with a scope (9301.90.30) pay 4.7% on the rifle + 20% on the sight.",
    "9302": "Pistols and revolvers need an ATF Form 6 permit and must meet the sporting-purposes criteria; importers mark each one. The federal excise tax is 10% of the importer's sale price.",
    "9303": "Sporting shotguns and rifles need an ATF permit; rifles entered with a scope are valued in two parts (statistical note 1). Excise tax 11%. Flare guns, blank-firing pistols and captive-bolt guns are also here.",
    "9304": "Air, spring and gas guns — airsoft guns and paintball markers too — do not fire by an explosive, so they are not firearms under the Gun Control Act. Classification between air rifles (3.9%) and other air guns (Free) decides the base rate; truncheons and other arms pay 5.7%.",
    "9305": "Frames, receivers, barrels and breech mechanisms need an ATF permit; other minor parts worth $100 or less per transaction do not. Parts of general use (screws, springs) are classified elsewhere.",
    "9306": "Cartridges, cases, primers and bullets for firearms need an ATF permit; air gun pellets, BBs and paintballs are not firearm ammunition. Russian ammunition is denied. Excise tax 11% on shells and cartridges. All lines are Free at the base rate.",
    "9307": "Swords, bayonets and similar arms are not firearms or ammunition; they pay 2.7% and must be marked with their country of origin.",
}
GROUP_RULES = {
    "9301": ["atf-permit", "atf-usmil", "atf-criteria", "atf-russia", "itar", "atf-marking", "fet", "cbp-ch99"],
    "9302": ["atf-permit", "atf-usmil", "atf-criteria", "atf-russia", "itar", "atf-marking", "fet", "cbp-marking", "cbp-ch99"],
    "9303": ["atf-permit", "atf-usmil", "atf-criteria", "gca-defs", "atf-russia", "itar", "atf-marking", "fet", "cbp-marking", "cbp-ch99"],
    "9304": ["gca-defs", "cbp-marking", "cbp-ch99"],
    "9305": ["atf-permit", "atf-usmil", "atf-russia", "itar", "atf-marking", "cbp-marking", "cbp-ch99"],
    "9306": ["atf-permit", "atf-usmil", "gca-defs", "atf-russia", "itar", "fet", "cbp-marking", "cbp-ch99"],
    "9307": ["cbp-marking", "cbp-ch99"],
}
GROUP_LEVERS = {
    "9301": ["rifle-scope", "usmca", "fta", "ch98", "ftz", "drawback"],
    "9302": ["usmca", "fta", "ch98", "ftz", "drawback"],
    "9303": ["rifle-scope", "usmca", "fta", "ch98", "ftz", "drawback"],
    "9304": ["usmca", "fta", "ruling", "drawback"],
    "9305": ["usmca", "fta", "ruling", "ftz", "drawback"],
    "9306": ["usmca", "ruling", "ftz", "drawback"],
    "9307": ["usmca", "fta", "ruling", "drawback"],
}
for g in te["groups"]:
    h = g["heading"]
    g["label"] = LABELS[h][0]
    g["note"] = GROUP_NOTES[h]
    g["ruleIds"] = GROUP_RULES[h]
rows = {r["hts"]: r for r in ov["rateTable"]["rows"]}
SCOPE_LINES = {"9301.90.30.10", "9301.90.30.20", "9303.30.40.10", "9303.30.40.20", "9303.30.40.30", "9303.30.80.05",
               "9303.30.80.10", "9303.30.80.12", "9303.30.80.17", "9303.30.80.25", "9303.30.80.30"}
for ln in te["lines"]:
    h = ln["hts"][:4]
    rules = list(GROUP_RULES[h])
    levers = list(GROUP_LEVERS[h])
    if ln["hts"] not in SCOPE_LINES and "rifle-scope" in levers:
        levers.remove("rifle-scope")
    gen = (rows.get(ln["hts"]) or {}).get("effectiveGeneral") or (rows.get(ln["hts"]) or {}).get("general")
    if gen == "Free" and "fta" in levers:
        levers.remove("fta")
    # The excise tax reaches firearms, shells and cartridges only, not pellets, BBs, paintballs or munitions of war.
    if ln["hts"].startswith(("9306.90", "9306.29", "9306.30.80")) and "fet" in rules:
        rules.remove("fet")
    ln["ruleIds"] = rules
    ln["leverIds"] = levers
te["disclaimer"] = (
    "A checklist of where the rules are, with links to the regulations — not legal advice. Import permits, the importability "
    "criteria, country restrictions and the excise tax are set by ATF, the State Department and the Treasury; check them with "
    "the agency before each shipment."
)

# ---------------------------------------------------------------- overview (static parts)
for g in ov["productGroups"]:
    g["label"] = LABELS[g["heading"]][0]
GROUP_BLURB = {
    "9301": (
        "Artillery, rocket and grenade launchers and military rifles, shotguns and machine guns. Most lines are Free; military "
        "rifles pay 4.7% on the rifle + 20% on any telescopic sight, military shotguns 2.6%.",
        ["artillery", "mortar", "grenade launcher", "machine gun", "military rifle", "rocket launcher"],
    ),
    "9302": (
        "Revolvers and pistols, including semiautomatic pistols: one line at 14¢ each + 3%. EU pistols pay 10% in total under the "
        "2026 rules.",
        ["pistol", "handgun", "revolver", "semiautomatic pistol", "9mm pistol"],
    ),
    "9303": (
        "Sporting, hunting and target shotguns (2.6%) and rifles (3.1% or 3.8% on the rifle + 10%–13% on any scope), muzzle-loaders "
        "(Free), blank-firing pistols (4.2%), flare guns and captive-bolt guns (Free).",
        ["shotgun", "hunting rifle", "over and under shotgun", "pump action shotgun", "rimfire rifle", "muzzleloader", "flare gun"],
    ),
    "9304": (
        "Air rifles (3.9%), air pistols, airsoft guns and paintball markers (Free), and truncheons and other arms (5.7%).",
        ["air rifle", "airsoft gun", "paintball marker", "bb gun", "pellet gun", "truncheon"],
    ),
    "9305": (
        "Parts and accessories of firearms and air guns: pistol frames and receivers and other pistol parts (4.2%), rifle stocks "
        "(3.5%), shotgun barrels and rifle parts (Free), parts of military weapons (Free), air gun parts (3.9%).",
        ["gun parts", "pistol frame", "receiver", "rifle stock", "shotgun barrel", "magazine", "slide"],
    ),
    "9306": (
        "Ammunition, all Free at the base rate: shotgun cartridges, rifle and pistol cartridges (.22 and other calibers), empty "
        "cases, air gun pellets and BBs, paintballs, bombs, grenades, guided missiles and their parts.",
        ["ammunition", "cartridges", "9mm ammunition", "shotgun shells", "bullets", "pellets", "paintballs"],
    ),
    "9307": (
        "Swords, cutlasses, bayonets, lances and similar arms, their parts, scabbards and sheaths: one line at 2.7%.",
        ["sword", "bayonet", "katana", "scabbard", "sheath"],
    ),
}
for g in ov["productGroups"]:
    g["blurb"], g["searchExamples"] = GROUP_BLURB[g["heading"]]

ov["workedExamples"] = [
    {
        "title": "Pistols: Austria vs. Türkiye vs. Brazil vs. Israel",
        "line": "9302.00.00.40",
        "body": "Twenty semiautomatic pistols worth $10,000. The base rate is 14¢ each + 3% = $302.80. From Austria (or Croatia, "
        "Czechia, Germany) the EU rule replaces it with 10% in total: **$1,000**. From Türkiye: $302.80 + 12.5% = **$1,552.80**. "
        "From Brazil: $302.80 + 37.5% = **$4,052.80**. From Israel under the FTA: 12.5% only, **$1,250**. The importer also owes "
        "the 10% excise tax when it sells them — a tax, not a customs duty.",
    },
    {
        "title": "A rifle with a telescopic sight",
        "line": "9303.30.80.17",
        "body": "A centerfire rifle entered with its scope, $1,000 in all: the rifle $800 and the sight $200, each reported under "
        "its own statistical suffix (statistical note 1). Base rate: 3.1% × $800 + 13% × $200 = **$50.80**. From Türkiye the "
        "12.5% Section 301 duty is on the full $1,000: **$175.80**. From Germany the EU rule takes the higher of $50.80 and 10% of "
        "$1,000: **$100**. The same rifle without a scope pays $24.80 at the base rate.",
    },
    {
        "title": "Shotguns: Italy vs. Türkiye vs. Japan",
        "line": "9303.20.00.40",
        "body": "Over-and-under shotguns worth $10,000 pay 2.6% at the base rate. From Italy the EU rule makes it 10% in total: "
        "**$1,000**. From Türkiye: 2.6% + 12.5% = **$1,510**. From Japan: 12.5% in total, **$1,250**. From Brazil: 2.6% + 37.5% "
        "= **$4,010**.",
    },
    {
        "title": "Rifle and pistol ammunition by country",
        "line": "9306.30.41.20",
        "body": "Cartridges are Free at the base rate, so the extra duty is the whole duty on $10,000: the UK **$1,000**, Germany "
        "or Czechia **$1,000** (10% in total), Türkiye **$1,250**, China **$2,000** (12.5% + 7.5% List 4A), Brazil **$3,750**, "
        "Canada **$0** with a USMCA claim. Russian ammunition cannot be imported. The 11% excise tax on shells and cartridges is "
        "due on the importer's sale.",
    },
]
ov["notes"]["chapterNotes"] = (
    "**Note 1.** This chapter does not cover: (a) goods of chapter 36 (for example, percussion caps, detonators, signaling "
    "flares); (b) parts of general use, as defined in note 2 to section XV, of base metal (section XV), or similar goods of "
    "plastics (chapter 39); (c) armored fighting vehicles (heading 8710); (d) telescopic sights or other optical devices suitable "
    "for use with arms, unless mounted on a firearm or entered with the firearm on which they are designed to be mounted (chapter "
    "90); (e) bows, arrows, fencing foils or toys (chapter 95); or (f) collectors' pieces or antiques (heading 9705 or 9706).\n\n"
    "**Note 2.** In heading 9306, the reference to \"parts thereof\" does not include radio or radar apparatus of heading 8526.\n\n"
    "**Statistical note 1.** The calculation of duties, under subheadings 9301.90.30, 9303.30.40 and 9303.30.80, for rifles "
    "imported either with telescopic sights mounted on them or with telescopic sights designed to be mounted on them, requires "
    "that these articles be constructively separated into their component parts and each component separately valued. The "
    "individual components shall be separately reported under the appropriate statistical suffixes. In each instance, the sum of "
    "the values of the individual components shall be equal to the total value of the article."
)
ov["notes"]["additionalUsNotes"] = None

# ---------------------------------------------------------------- trade-dependent text
exec(open(os.path.join(HERE, "fill93_trade.py")).read())

# ---------------------------------------------------------------- final conclusion
fc = d["finalConclusion"]
fc["h1"] = "HTS Chapter 93 FAQ: Firearm, Gun Part & Ammunition HS Codes, Tariffs and Import Rules"
fc["seo"]["title"] = "HTS Chapter 93 FAQ 2026: HS Codes for Guns, Ammunition, Gun Parts, Rifle Scopes & Airsoft | KoalaGains"
fc["seo"]["shortDescription"] = (
    "Answers to what people search about Chapter 93 imports: HS codes 9301–9307 for firearms, pistols, rifles, shotguns, gun "
    "parts, ammunition, rifle scopes, airsoft and paintball guns and swords; 2026 tariffs on guns and ammo; ATF Form 6; the "
    "excise tax; and the Russian ammunition ban."
)
fc["seo"]["keywords"] = [
    "hs code for firearms",
    "hs code for ammunition",
    "hs code for gun parts",
    "hs code for rifle scope",
    "hs code for airsoft guns",
    "hs code 9306",
    "tariffs on guns and ammo",
    "are there tariffs on ammunition",
    "atf form 6",
    "federal excise tax on firearms and ammunition",
    "russian ammo import ban",
    "section 301 firearms tariff",
]
fc["intro"] = (
    "Straight answers to the most common questions about importing firearms, gun parts, ammunition and other Chapter 93 goods "
    "into the U.S. — HS codes, tariffs by country, permits and taxes. Each answer links to the page with the full detail."
)
fc["lastCheckedAt"] = CHECKED
fc["questionSource"] = (
    "Google search suggestions, collected October 13, 2026, plus search terms the live chapter pages already rank for"
)

json.dump(d, open(PATH, "w"), ensure_ascii=False, indent=2)
print("filled")
