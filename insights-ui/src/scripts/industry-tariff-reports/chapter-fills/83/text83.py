"""Writer text for Chapter 83. apply_text(ctx) fills every page of the generated file in place."""
import copy

# heading -> (label, short label, blurb, search examples). Official HTS wording; Section 232 lists from note 16(c)(vi)/(vii).
G = {
    "8301": (
        "Padlocks, locks & keys",
        "Locks & keys",
        "Padlocks, door locks and locksets, furniture, luggage and motor-vehicle locks, clasps with locks, lock parts and keys: 19 lines, 2.3% to 6.1%. "
        "None is on the Section 232 metals lists, so most countries pay the base rate plus the 2026 Section 301 duty (10% or 12.5%; USMCA goods exempt). "
        "Vehicle locks (8301.20) pay the auto-parts duty instead when they are car or truck parts. China: List 4A (7.5%) on most lines; Canadian lock parts pay +50% Section 338.",
        ["padlock", "door lock", "deadbolt", "lockset", "cam lock", "car door lock", "keys", "lock cylinder"],
    ),
    "8302": (
        "Hinges, castors & mountings and fittings",
        "Hinges & fittings",
        "Hinges, castors, door closers, door, window and curtain hardware, drawer slides and other furniture fittings, motor-vehicle fittings, saddlery hardware, brackets and hat racks: "
        "36 lines, Free to 7.5%. The 22 lines of iron, steel, aluminum or zinc (plus castors, brackets and door closers) are Section 232 aluminum or steel derivatives: +25% of the full value. "
        "Fittings of other base metal such as brass (8302.10.90, 8302.41.90, 8302.42.60, 8302.49.80) are outside Section 232. Chinese aluminum-extrusion fittings are under AD/CVD orders.",
        ["door hinges", "cabinet hinges", "drawer slides", "castor wheels", "door closer", "door handle", "furniture fittings", "shelf brackets", "gas spring"],
    ),
    "8303": (
        "Safes & strong-boxes",
        "Safes",
        "Armored or reinforced safes, gun safes, strong-boxes, strong-room doors and safe-deposit lockers, cash and deed boxes: 1 line, 3.8%. Not on the Section 232 lists: "
        "most countries pay the 2026 Section 301 duty, China 25% (List 3) + 12.5%, and Canadian safes +50% Section 338 even under USMCA.",
        ["gun safe", "fireproof safe", "safe deposit box", "cash box", "strong box", "vault door"],
    ),
    "8304": (
        "Desk-top filing cabinets & desk equipment",
        "Desk equipment",
        "Desk-top filing or card-index cabinets, paper trays, paper rests, pen trays, office-stamp stands and similar desk equipment of base metal (office furniture is 9403): "
        "1 line, 3.9%. Outside Section 232; Chinese goods are on the suspended List 4B, so they pay only the 12.5% 2026 Section 301 duty.",
        ["desk organizer", "paper tray", "letter tray", "pen holder", "desktop file holder", "card index cabinet"],
    ),
    "8305": (
        "Binder fittings, paper clips & staples",
        "Binder fittings & staples",
        "Ring-binder mechanisms and other looseleaf fittings, staples in strips (collated staples), paper clips, letter clips, indexing tags and similar office articles: 6 lines, Free to 5.7%. "
        "Staples in strips (8305.20) and other binder fittings (8305.10.00.50) are Section 232 derivatives (+25%). Chinese paper clips and collated staples are under antidumping orders (staples also countervailing).",
        ["ring binder mechanism", "staples", "collated staples", "paper clips", "binder clips", "letter clips"],
    ),
    "8306": (
        "Bells, ornaments, frames & mirrors",
        "Bells, ornaments & frames",
        "Non-electric bells, gongs and chimes, statuettes and other ornaments (plated with precious metal or not), and photograph or picture frames and mirrors of base metal: 4 lines, Free to 5.8%. "
        "Frames and mirrors (8306.30) are an aluminum derivative under Section 232 (+25%); other ornaments (8306.29) from Canada pay +50% Section 338.",
        ["metal picture frame", "photo frame", "metal statue", "metal ornament", "brass bell", "wind chimes", "decorative mirror"],
    ),
    "8307": (
        "Flexible metal tubing",
        "Flexible tubing",
        "Flexible tubing of iron or steel (including jacketed corrugated stainless gas tubing) or of other base metal, with or without fittings: 5 lines, all 3.8%. "
        "Tubing without fittings (8307.10.60, 8307.90.60) is a Section 232 derivative (+25%); tubing with fittings is not, but from Canada it pays +50% Section 338.",
        ["flexible metal hose", "CSST gas line", "corrugated stainless steel tubing", "flexible conduit", "stainless braided hose", "exhaust flex pipe"],
    ),
    "8308": (
        "Clasps, buckles, hooks, eyelets & rivets",
        "Clasps, buckles & rivets",
        "Hooks, eyes and eyelets, tubular and bifurcated rivets, buckles and buckle clasps, clasps and frames with clasps, beads and spangles of base metal (for clothing, footwear, bags and the like): "
        "6 lines, Free to 3.9% (hooks, eyes and eyelets 1.1¢/kg + 2.9%). Not on the Section 232 lists; all 6 lines pay Canada's 50% Section 338 duty and China's 25% List 3.",
        ["metal buckles", "eyelets", "grommets", "tubular rivets", "purse clasps", "hook and eye"],
    ),
    "8309": (
        "Stoppers, caps, lids & closures",
        "Caps & closures",
        "Crown corks, screw caps, beverage-can ends, pouring stoppers, bungs, capsules, seals and other packing accessories of base metal: 5 lines, Free or 2.6%. "
        "Aluminum can ends and other aluminum closures (8309.90.00.20, .25) and steel closures (.80) are Section 232 derivatives (+25%); crown corks are not, but from Canada they pay +50% Section 338.",
        ["crown cork", "bottle caps", "can ends", "can lids", "aluminum screw caps", "metal closures"],
    ),
    "8310": (
        "Sign plates, name plates & numbers",
        "Sign plates",
        "Sign plates, name plates, address plates and similar plates, numbers, letters and other symbols of base metal (illuminated signs are 9405): 1 line, Free. Not on Section 232. "
        "It is on CBP's informational-materials list, so the 2026 Section 301 and Brazil duties do not apply to plates that qualify; China's 25% List 3 and Canada's 50% Section 338 still do.",
        ["metal signs", "name plates", "address plaques", "house numbers", "metal letters", "door signs"],
    ),
    "8311": (
        "Welding electrodes, wire & solder",
        "Welding consumables",
        "Coated electrodes and cored wire for electric arc welding, lead-tin solders and other coated rods and cored wire for soldering, brazing or flame welding, and metal-spraying wire: 5 lines, all Free. "
        "Not on the Section 232 lists (solid welding wire is classified with its metal in Chapters 72–76). The 2026 Section 301 duty applies; Canada +50% Section 338 on four lines; China 25% List 3.",
        ["welding rod", "welding electrodes", "flux cored wire", "solder wire", "brazing rod", "stick electrodes"],
    ),
}


def b(usd):
    if usd >= 1e9:
        return f"${usd / 1e9:.2f}B"
    if usd >= 1e6:
        return f"${usd / 1e6:.0f}M"
    return f"${usd / 1e3:.0f}K"


NAMES = {"Rep. of Korea": "South Korea", "Russian Federation": "Russia", "Viet Nam": "Vietnam", "Other Asia, nes": "Taiwan", "China, Hong Kong SAR": "Hong Kong", "Türkiye": "Türkiye"}


def nm(x):
    return NAMES.get(x, x)


COVERAGE = "Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade."
NO_DUTY = "Duty-collected figures aren't available from an official source yet."


def apply_text(c):
    d, SRC = c["d"], c["SRC"]
    o, tu, ia = d["overview"], d["tariffUpdates"], d["industryAreas"]
    LINE, ROW = c["LINE"], c["ROW"]
    ASOF = c["ASOF"]
    n232, nnon, nauto = len(c["S232"]), len(c["NON232"]), len(c["AUTO"])
    nl3, nl4, nnone, nca, nru200 = len(c["CN_L3"]), len(c["CN_L4A"]), len(c["CN_NONE"]), len(c["CA338"]), len(c["RU200"])

    def cell_of(country, line, side="withoutUsmca"):
        for cell in ROW[country]["cells"].values():
            for bb in cell[side]["breakdown"]:
                if line in bb["lines"]:
                    return bb
        raise KeyError((country, line))

    # ------------------------------------------------------------ groups
    for pg in o["productGroups"]:
        label, short, blurb, ex = G[pg["heading"]]
        pg["label"], pg["blurb"], pg["searchExamples"] = label, blurb, ex
    for g in ia["groups"]:
        g["label"], g["shortLabel"] = G[g["heading"]][0], G[g["heading"]][1]

    # ------------------------------------------------------------ overview
    ndut = int(o["stats"][1]["value"].split(" of ")[0])
    o["h1"] = "HTS Chapter 83: Miscellaneous Articles of Base Metal — Tariff Rates"
    o["seo"] = {
        "title": "HTS Chapter 83 Tariffs: Locks, Hinges, Fittings, Safes & Section 232 Derivative Duties | KoalaGains",
        "shortDescription": f"Searchable U.S. duty table for all {len(LINE)} HTS Chapter 83 lines: padlocks and locks, hinges, castors, door and furniture fittings, drawer slides, safes, staples, "
        "frames, caps and closures, sign plates and welding electrodes. 31 lines pay 25% Section 232; the rest 10–12.5% Section 301; China, Canada and AD/CVD extra.",
        "keywords": [
            "hts chapter 83",
            "chapter 83 hts codes",
            "miscellaneous articles of base metal tariff",
            "miscellaneous articles of base metal import duty rates",
            "hs code 8302",
            "hs code 8301",
            "tariff code for hinges",
            "lock tariff code",
            "aluminum derivative tariff list",
            "steel derivative tariff list",
            "chapter 83 base metal locks duty",
        ],
    }
    o["stats"][2]["note"] = (
        f"Section 232 aluminum or steel derivatives at 25% (9903.82.09): {n232}; vehicle locks, hinges and fittings that can pay the auto-parts duty: {nauto}; "
        f"outside Section 232 (2026 Section 301 applies): {nnon}. China Section 301 List 3: {nl3}, List 4A: {nl4}; Canada Section 338: {nca}; Russia 200% aluminum: {nru200}"
    )
    o["intro"] = (
        "Chapter 83 covers miscellaneous articles of base metal: padlocks, locks and keys (8301), hinges, castors, door, window and furniture fittings, drawer slides and brackets (8302), "
        "safes (8303), desk equipment (8304), binder fittings, paper clips and staples (8305), bells, ornaments, picture frames and mirrors (8306), flexible tubing (8307), clasps, buckles, "
        f"eyelets and rivets (8308), caps, crown corks and can ends (8309), sign plates (8310) and welding electrodes and solder (8311). **{len(LINE) - ndut} of the {len(LINE)} lines are Free**; "
        "the rest pay from 2% to 7.5% (hooks and eyes 1.1¢/kg + 2.9%).\n\n"
        f"Two regimes split the chapter. **{n232} lines are Section 232 aluminum or steel derivatives** (U.S. note 16(c)(vi)–(vii)): hinges, castors, door closers and the door, furniture and vehicle fittings "
        "of iron, steel, aluminum or zinc, drawer slides, brackets, binder fittings, staples in strips, frames and mirrors, flexible tubing without fittings, and aluminum or steel caps and can ends. "
        "Since April 6, 2026 they pay **+25% of the full customs value** (9903.82.09) from every country, on top of any FTA or USMCA rate, and no 2026 Section 301 or Brazil duty. "
        "Lower rates: **10%** when at least 85% of the metal was melted or smelted in the United States, **15%** for UK goods with 95% UK metal, and **no Section 232 duty** when aluminum, steel and copper "
        "together are under 15% of the article's weight (9903.82.03).\n\n"
        f"The other **{nnon} lines** (locks and keys, brass hardware, safes, desk equipment, bells and ornaments, tubing with fittings, buckles and rivets, crown corks, sign plates, welding consumables) "
        "pay the base rate plus the **2026 Section 301** duty of 10% or 12.5% for 60 economies (EU, Japan, Korea and Taiwan: 10% or 12.5% in place of a lower base rate); USMCA goods of Canada and Mexico are exempt. "
        f"Vehicle locks, hinges and fittings (8301.20, 8302.10.30, 8302.30) pay the **auto-parts duty** instead when used in cars or trucks.\n\n"
        f"China pays **25% (List 3) or 7.5% (List 4A)** more on {nl3 + nl4} lines; Canada pays **+50% under Section 338** on {nca} lines even with a USMCA claim. "
        "Chinese aluminum-extrusion hardware, paper clips and collated staples also carry **antidumping and countervailing duties**, which are company-specific and not in this table (see Tariff updates)."
    )
    ex = [
        ("Vietnam", "8302.10.60.30", "28.5%"),
        ("China", "8302.42.30.15", "36.4%"),
        ("Mexico", "8301.40.60.30", "15.7%"),
        ("Canada", "8311.10.00.00", "60%"),
        ("Japan", "8301.20.00.60", "12.5% not a vehicle part / 15% car or light-truck part / 30.7% truck or bus part"),
        ("India", "8310.00.00.00", "Free informational materials / 10% not informational materials"),
    ]
    for country, line, total in ex:
        assert line in LINE, line
        assert cell_of(country, line)["total"] == total, (country, line, cell_of(country, line)["total"])
    assert cell_of("Mexico", "8301.40.60.30", "withUsmca")["total"] == "Free"
    assert cell_of("Canada", "8311.10.00.00", "withUsmca")["total"] == "50%"
    o["workedExamples"] = [
        {
            "title": "$50,000 of steel door hinges from Vietnam",
            "line": "8302.10.60.30",
            "body": "Door hinges of steel carry a **3.5%** base rate. They are on the Section 232 derivative lists (note 16(c)(vi) and (vii)), so they pay **+25% of their full value** (9903.82.09): "
            "**28.5%**, or $14,250. The 12.5% 2026 Section 301 duty on Vietnam does not apply to Section 232 goods (note 52(f)(1)). If at least 85% of the steel was melted and poured in the "
            "United States, the 232 part drops to **10%** (9903.82.06): 13.5%.",
        },
        {
            "title": "Steel drawer slides from China",
            "line": "8302.42.30.15",
            "body": "Base rate **3.9%**, plus **+7.5%** Section 301 (List 4A, 9903.88.15) and **+25%** Section 232 (9903.82.09): **36.4%**. China's 12.5% 2026 Section 301 duty is replaced by Section 232; "
            "the List 4A duty is not. Aluminum drawer slides from China can also fall under the aluminum extrusions AD/CVD orders: check the producer's rate.",
        },
        {
            "title": "Door locksets from Mexico, with and without USMCA",
            "line": "8301.40.60.30",
            "body": "Door locks are not on the Section 232 lists. Without a USMCA claim: **5.7%** base + **10%** Section 301 (9903.05.55) = **15.7%**. With a USMCA certification of origin the base "
            "rate is Free and the Section 301 duty does not apply (9903.05.94): **Free**.",
        },
        {
            "title": "Welding electrodes from Canada",
            "line": "8311.10.00.00",
            "body": "Free at base, but on the Section 338 list since September 15, 2026 (9903.03.14, U.S. note 51(b)(3)): **+50%** even under USMCA. Without a USMCA claim the 10% Section 301 duty "
            "(9903.05.29) is added too: **60%**; with USMCA, **50%**.",
        },
        {
            "title": "A car door lock from Japan",
            "line": "8301.20.00.60",
            "body": "Base rate 5.7%. Used as a part of a car or light truck, it pays Japan's auto-parts rate of **15% in place of the base rate** (9903.94.43) and no Section 301 duty. "
            "As a truck or bus part it pays 5.7% + 25% (9903.74.08) = **30.7%**. Otherwise, the Japan Section 301 rate of **12.5% in place of the base rate** (9903.05.49) applies.",
        },
        {
            "title": "Metal address plaques from India",
            "line": "8310.00.00.00",
            "body": "Sign plates are Free at base and not on the Section 232 lists. Heading 8310 is on CBP's informational-materials list: plates that qualify enter under **9903.05.92** with **no** Section 301 duty. "
            "Otherwise India's **10%** Section 301 duty (9903.05.44) applies.",
        },
    ]
    o["notes"] = {
        "chapterNotes": (
            "**Note 1.** For the purposes of this chapter, parts of base metal are to be classified with their parent articles. However, articles of iron or steel of heading 7312, 7315, 7317, 7318 or 7320, "
            "or similar articles of other base metal (chapters 74 to 76 and 78 to 81), are not to be taken as parts of articles of this chapter.\n\n"
            "**Note 2.** For the purposes of heading 8302, the word \"castors\" means those having a diameter (including, where appropriate, tires) not exceeding 75 mm, or those having a diameter "
            "(including, where appropriate, tires) exceeding 75 mm, provided that the width of the wheel or tire fitted thereto is less than 30 mm."
        ),
        "additionalUsNotes": (
            "**1.** The dutiable weight of hooks, eyes and eyelets in subheading 8308.10 includes the weight of cards, cartons and immediate wrappings and labels.\n\n"
            "**Statistical note 1.** For 8307.10.6010, jacketed corrugated stainless steel tubing refers to tubing marked with the words \"Fuel Gas\", and excludes tubing with permanently attached end fittings.\n\n"
            "**Statistical note 2.** For 8309.90.0020, cans of a kind used for the conveyance of beverages include those with \"stay on tab ends\" and \"ring pull tab ends.\""
        ),
    }

    # ------------------------------------------------------------ tariffUpdates
    S232 = ["procl-11021", "procl-11032", "fr-2026-08297", "csms-68253075", "procl-10895", "procl-10896", "procl-10947", "fr-2025-03596", "fr-2025-15819", "hts-chapter-99", "hts-now"]
    tu["seo"] = {
        "title": "Chapter 83 Tariff Updates 2025–2026: Section 232 on Hinges & Fittings, Section 301, Canada 338 (HTS Ch. 83) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 83 locks, hinges, fittings, safes, staples and closures since 2025, with Federal Register citations: Section 232 aluminum and steel derivatives "
        "(25% of full value since April 6, 2026), the 2026 Section 301 duties, Section 338 on Canada, China's lists, the end of IEEPA and AD/CVD orders.",
        "keywords": [
            "hts chapter 83",
            "chapter 83 hts 2026",
            "miscellaneous articles of base metal tariff",
            "section 232 base metal tariffs",
            "aluminum derivative tariff",
            "steel and aluminum tariffs derivative products",
            "section 301 tariffs 2026",
            "canada section 338 tariffs",
            "section 122 tariff expired",
            "ieepa tariffs ended",
        ],
    }
    tu["intro"] = (
        "This page compares the **2025 Basic Edition** (in force January 1, 2025) with the current **2026 Revision 21** (in force October 9, 2026) and lists every extra duty that reaches Chapter 83 today. "
        "No base rate changed; ten statistical lines are new splits of existing ones (copper lock parts and keys, corrugated stainless gas tubing, and aluminum, steel and other caps and can ends).\n\n"
        "The extra duties changed completely. In January 2025 Chapter 83 paid only its base rates, plus Section 301 on Chinese goods. On **March 12, 2025** 24 hardware lines "
        "(hinges, castors, fittings, brackets, door closers, binder fittings, frames) became Section 232 **aluminum derivatives**, charged on their aluminum content (25%, then 50% from June 4, 2025). "
        "On **August 18, 2025** Commerce's inclusions process added steel hinges, door and furniture fittings, staples in strips, flexible steel tubing and aluminum caps. "
        "Proclamation 11021 rebuilt the program on **April 6, 2026**: **25% of the full value** for all 31 Chapter 83 derivative lines, with a 15% metal-weight threshold and lower rates for U.S.-melted and UK metal.\n\n"
        "The IEEPA tariffs ended on **February 24, 2026** and the Section 122 surcharge on **July 23, 2026**. Since **July 24, 2026** the 2026 Section 301 duties (10% or 12.5%) apply to the 58 lines outside Section 232, "
        "Brazil has paid 25% more on them since July 22, and since **August 22 / September 15, 2026** 18 lines from Canada pay a 50% Section 338 duty. Antidumping and countervailing duty orders on Chinese aluminum extrusions, "
        "paper clips and collated staples reach parts of the chapter; they are company-specific and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 83 from any country: Section 232 aluminum and steel derivatives (notes 16 and 19), the Section 232 automobile and medium/heavy-duty vehicle parts duties "
        "on vehicle locks, hinges and fittings (notes 33 and 38), China Section 301 (note 20), the 2026 Section 301 actions on 60 economies and Brazil (notes 50, 52), Canada Section 338 (note 51), "
        "Russia's column 2 rates and 35% in lieu of column 2 (note 30), the scheduled Nicaragua Section 301 duty (note 29), and the ended IEEPA and Section 122 duties. The antidumping and countervailing duty "
        "orders on Chapter 83 products are summarized for reference; the calculator does not model them. For the rate each supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": f"{len(LINE) - 10} of {len(LINE)} lines"},
        {"label": "Section 232 derivatives (25%)", "value": f"{n232} of {len(LINE)} lines"},
        {"label": "Outside Section 232 (Section 301 applies)", "value": f"{nnon} lines"},
        {"label": "Compared", "value": "2025 Basic → Rev 21"},
    ]
    tu["inEffect"] = [
        {
            "id": "all-section-232",
            "country": "All countries (Canada, Mexico, EU, Japan, Korea and Brazil included)",
            "measure": "Section 232 derivative aluminum and steel articles, on the full customs value",
            "ch99Code": "9903.82.09",
            "before": "None in January 2025; from March 12, 2025 +25% (from June 4, 2025 +50%) on the aluminum or steel content of the listed lines",
            "now": "+25% of the full value",
            "exemption": f"Covers {n232} lines on U.S. note 16(c)(vi) (aluminum derivatives) and (vii) (steel derivatives): hinges of iron, steel, aluminum or zinc (8302.10.30, 8302.10.60), castors (8302.20), "
            "motor-vehicle fittings (8302.30.30), door closers and their parts (8302.41.30, 8302.60), building, furniture and other fittings of iron, steel, aluminum or zinc (8302.41.60, 8302.42.30 incl. drawer slides, 8302.49.60), "
            "brackets and hat racks (8302.50), binder fittings other than ring-binder mechanisms (8305.10.00.50), staples in strips (8305.20), frames and mirrors (8306.30), flexible tubing without fittings (8307.10.60, 8307.90.60) "
            "and aluminum or steel caps, lids and can ends (8309.90.00.20, .25, .80). No country exemptions; note 16(b) collects it on top of any FTA or USMCA rate. "
            "Lower rates: ≥85% of the metal melted/smelted in the United States 10% (9903.82.06); UK goods with ≥95% UK metal 15% (9903.82.05). No duty when aluminum, steel and copper together are under 15% of the "
            "article's weight (9903.82.03; Chapter 83 is outside Chapters 72–76) or when it contains none (9903.82.01). Civil aircraft articles of the EU, Japan, Korea and the UK on five of these subheadings (8302.10.60, 8302.20, 8302.42.30, 8302.49.60, 8302.60.30) are exempt "
            "(9903.02.76, 9903.96.02, 9903.02.81, 9903.96.01). Vehicle hinges and fittings (8302.10.30, 8302.30.30) pay the auto or truck parts duty instead when used as such. Goods under 9903.82.09 do not pay the 2026 "
            "Section 301 or Brazil duties (notes 52(f)(1), 50(a)(vi)(1)); China's Section 301 lists still apply.",
            "whatItMeans": "Hinges, castors, drawer slides, door closers, brackets, frames, collated staples and can ends pay a quarter of their value in duty from every country: $100,000 of hinges owes $25,000 plus the base rate.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": S232 + ["fr-2025-21940", "fr-2025-17908", "fr-2025-18660", "fr-2025-12060"],
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Mexico, Canada, EU, Japan, Korea, Taiwan, Vietnam, India, Thailand, UK, Russia and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None (the IEEPA reciprocal duties until February 24, 2026, then the Section 122 surcharge until July 23, 2026)",
            "now": f"+10% or +12.5% (EU, Japan, Korea, Taiwan: 10% or 12.5% in place of the base rate) on the {nnon} lines outside Section 232",
            "exemption": "Does not apply to Section 232 goods (note 52(f)(1), 9903.05.90) or to locks, hinges and fittings that pay the auto or truck parts duty (52(f)(3), (6)). USMCA-qualifying goods of Canada and Mexico "
            "are exempt (9903.05.93, 9903.05.94). Sign plates of 8310 that are informational materials are exempt (9903.05.92). Civil aircraft articles on note 52(d)'s list (9903.05.88) are exempt. "
            "No Chapter 83 line is on the note 52(b) general exemption list or on the note 52(j) country exception lists.",
            "whatItMeans": "$100,000 of padlocks, safes, buckles or welding rods from India pays $10,000 on top of the base rate; from Thailand or Vietnam $12,500; the same goods from Mexico with a USMCA certificate pay nothing extra.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "cbp-ieepa-faq", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: Lists 3 and 4A (2018–2019 actions) and the 2026 action",
            "ch99Code": "9903.88.03 / 9903.88.15 / 9903.05.31",
            "before": "+25% (List 3) or +7.5% (List 4A)",
            "now": "+25% or +7.5%, plus 12.5% on the lines outside Section 232 (25% Section 232 on the others)",
            "exemption": f"List 3 (9903.88.03, 25%) covers {nl3} lines: vehicle locks, most hinges, castors and fittings, safes, frames and mirrors, flexible tubing, buckles and rivets, caps, sign plates and welding consumables. "
            f"List 4A (9903.88.15, 7.5%) covers {nl4}: most padlocks and locks, lock parts and keys, vehicle hinges, furniture fittings including drawer slides, binder fittings, staples in strips, other office articles (8305.90.60) and plated ornaments. "
            f"{nnone} lines are on the suspended List 4B and pay no 2018–2019 duty: large padlocks (8301.10.50, 8301.10.90), luggage locks, desk equipment (8304), paper clips (8305.90.30), bells and other ornaments (8306.10, 8306.29). "
            "No product exclusion for Chapter 83 is in effect (notes 20(vvv)–(www)). The 12.5% 2026 duty (9903.05.31) stacks with the lists on the 58 lines outside Section 232. The IEEPA duties on China ended "
            "February 24, 2026; USTR confirmed on October 7, 2026 that the 2018–2019 actions continue.",
            "whatItMeans": "Chinese hinges and door fittings pay about 54% (25% + 25% + base); drawer slides 36.4%; most Chinese padlocks and locks 22–26%; safes 41.3%; welding electrodes 37.5%.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2026-20510", "procl-11021", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "br-section-301",
            "country": "Brazil",
            "measure": "Section 301 (Brazil) and the 2026 action",
            "ch99Code": "9903.05.01 / 9903.05.27",
            "before": "None",
            "now": f"+25% + 12.5% on the {nnon} lines outside Section 232; 25% Section 232 on the others",
            "exemption": "The Brazil duty does not apply to Section 232 goods (note 50(a)(vi)(1), 9903.05.07), informational materials (9903.05.09, which includes 8310 plates that qualify) or civil aircraft articles (9903.05.05).",
            "whatItMeans": "Brazilian locks, safes or welding electrodes pay the base rate plus 37.5%; Brazilian hinges and fittings pay 25% Section 232 only.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "fr-2026-14542", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ca-section-338",
            "country": "Canada",
            "measure": "Section 338 (Canada), list 51(b)(3)",
            "ch99Code": "9903.03.14",
            "before": "None",
            "now": f"+50% on {nca} lines, with or without a USMCA claim",
            "exemption": "Since August 22, 2026: lock parts (8301.60), safes (8303) and other base-metal ornaments (8306.29). Since September 15, 2026 (Proclamation 11065, Annex II): flexible tubing with fittings (8307.10.30, 8307.90.30), "
            "all of 8308 (hooks, eyelets, rivets, buckles, beads, clasps), crown corks (8309.10), sign plates (8310) and welding electrodes, cored wire and solders (8311.10, 8311.20, 8311.30). "
            "None of these is a Section 232 line. Charged even when USMCA is claimed (note 51(a)); without a USMCA claim the 10% Section 301 duty (9903.05.29) is added. Canadian civil aircraft articles are exempt (9903.03.16).",
            "whatItMeans": "Canadian safes, buckles, crown corks, sign plates and welding electrodes pay 50% of their value (60% plus base without a USMCA claim).",
            "effectiveFrom": "2026-09-15",
            "effectiveSourceId": "procl-11065",
            "sourceIds": ["procl-11065", "procl-11048", "procl-11056", "csms-69606660", "csms-69851916", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "vehicle-parts",
            "country": "All countries (EU, Japan, Korea, Taiwan and UK at deal rates)",
            "measure": "Section 232 automobile and medium/heavy-duty vehicle parts (locks, hinges, fittings)",
            "ch99Code": "9903.94.05 / 9903.74.08",
            "before": "None",
            "now": "+25% (EU, Japan, Korea, Taiwan: 15% in place of the base rate; UK 10%) when used as vehicle parts",
            "exemption": f"Reaches {nauto} lines of note 33(g): locks for motor vehicles (8301.20), hinges designed for motor vehicles (8302.10.30) and motor-vehicle mountings and fittings (8302.30), when they are parts of "
            "passenger vehicles or light trucks (note 33) or of medium and heavy-duty trucks and buses (note 38). Then the metals duty and the 2026 Section 301 duty do not apply. USMCA-qualifying parts of Canada and Mexico are "
            "exempt (9903.94.06, 9903.74.10). Not used as vehicle parts, the lines pay Section 232 metals (8302.10.30, 8302.30.30) or the 2026 Section 301 duty (8301.20, 8302.30.60).",
            "whatItMeans": "A German car lock pays 15% in total; the same lock for a heavy truck pays 5.7% + 25%; a Mexican USMCA-qualifying lock pays nothing.",
            "effectiveFrom": "2025-05-03",
            "effectiveSourceId": "procl-10908",
            "sourceIds": ["procl-10908", "procl-10925", "csms-64916652", "cbp-section-232-additional-faqs-autos", "procl-10984", "csms-66665333", "fr-2025-17908", "fr-2025-18660", "fr-2025-21940", "fr-2026-10571", "fr-2025-12060", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-duties",
            "country": "Russia",
            "measure": "Column 2 rates, 35% in lieu of column 2, Section 232 aluminum (200%) and the 2026 Section 301 duty",
            "ch99Code": "9903.85.68 / 9903.90.08 / 9903.82.16 / 9903.05.66",
            "before": "Column 2 rates; 35% in their place on 3 lines; 200% on 24 aluminum-derivative lines from March 12, 2025",
            "now": f"Column 2 rate + 12.5%; +200% on {nru200} aluminum-derivative lines (up to 257.5%); +25% on the steel-only derivatives",
            "exemption": f"Russia has paid column 2 rates since April 9, 2022. Note 30(b) puts 8302.30.30 and 8305.20 at 35% in place of column 2 (9903.90.08, since July 27, 2022). The {nru200} aluminum-derivative lines pay "
            "200% (9903.85.68, U.S. note 19(m)), which also applies to such articles from any country when the primary aluminum was smelted, or the article cast, in Russia. Steel derivatives pay 25% (9903.82.16). "
            "The 12.5% 2026 Section 301 duty (9903.05.66) is lifted only for the 9903.82 lines.",
            "whatItMeans": "Russian aluminum or zinc hinges and door fittings pay 45% (column 2) + 200% + 12.5% = 257.5% of their value.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["fr-2026-15181", "procl-10522", "procl-10895", "fr-2025-15819", "procl-11021", "procl-10420", "procl-10523", "hts-chapter-99", "hts-now"],
        },
    ]
    for e in tu["inEffect"]:
        for sid in e["sourceIds"]:
            assert sid in SRC, sid

    def ch(id, type, date, label, title, detail, before, now, countries, ids):
        for sid in ids:
            assert sid in SRC, sid
        return {"id": id, "type": type, "date": date, "dateLabel": label, "title": title, "detail": detail, "before": before, "now": now, "countries": countries, "sourceIds": ids}

    nic = next(x for x in tu["changes"] if x["id"].startswith("section-301-nicaragua"))
    changes = [
        ch("base-rates", "baseRate", ASOF, "Checked", "No Chapter 83 base-rate changes",
           f"{len(LINE) - 10} of {len(LINE)} Chapter 83 lines carry the same rates in 2026 Revision 21 as in the 2025 Basic Edition. Ten statistical lines are new splits at unchanged rates: "
           "lock parts and keys of copper or copper alloys (8301.60.00.10, 8301.70.00.10; rest .60), jacketed corrugated stainless steel \"Fuel Gas\" tubing (8307.10.60.10; rest .60), and caps and lids "
           "split into aluminum beverage-can ends (8309.90.00.20), other aluminum (.25), steel (.80) and other (.85).",
           None, None, None, ["hts-before", "hts-now", "hts-now-cr"]),
        ch("ca-338-sep", "extraDuty", "2026-09-15", "Effective", "Section 338 duty extended to 14 more Canadian Chapter 83 lines",
           "Proclamation 11065 added flexible tubing with fittings (8307.10.30, 8307.90.30), hooks, eyelets, rivets, buckles, beads and clasps (all of 8308), crown corks (8309.10), sign plates (8310) and "
           "welding electrodes, cored wire and solders (8311.10, 8311.20, 8311.30) to the 50% list (9903.03.14), and made the duty apply in addition to Section 232. Charged even when USMCA is claimed.",
           None, "+50%", "Canada", ["procl-11065", "csms-69851916", "hts-chapter-99"]),
        ch("ca-338-aug", "extraDuty", "2026-08-22", "Effective", "Section 338 duty on certain Canadian goods begins",
           "Proclamation 11048 imposed a 50% duty on the products of Canada in the note 51(b) lists from August 22, 2026 (after Proclamation 11056's three-day suspension). In Chapter 83 it reached lock parts (8301.60), "
           "safes (8303) and other base-metal ornaments (8306.29), with or without a USMCA claim.",
           None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660"]),
        ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: the non-232 lines pay",
           f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect. They do not apply to Section 232 goods (note 52(f)(1)) or vehicle parts under the auto duties, so in Chapter 83 they reach "
           f"the {nnon} lines outside Section 232: locks and keys, brass hardware, safes, desk equipment, ornaments and bells, tubing with fittings, buckles and rivets, crown corks, sign plates and welding consumables. "
           "USMCA goods are exempt; China's 12.5% stacks with its Lists 3 and 4A.",
           None, f"+10% to +12.5% ({nnon} lines)", "60 economies", ["fr-2026-15181", "fr-2026-15274", "csms-69326983", "hts-chapter-99"]),
        ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
           "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It never applied to Section 232 goods (Proclamation 11012), so in Chapter 83 it had charged only the lines outside Section 232; USMCA goods were exempt.",
           "+10% (non-232 lines)", None, "All", ["procl-11012", "hts-chapter-99"]),
        ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil: Section 232 lines exempt",
           f"The 25% duty on goods of Brazil (9903.05.01) took effect. Section 232 goods are excluded (note 50(a)(vi)(1)), so it reaches the {nnon} non-232 lines of Chapter 83; from July 24 the 12.5% 2026 action (9903.05.27) is added.",
           None, f"+25% ({nnon} lines)", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
        ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032: 85% U.S.-melted test",
           "From June 8, 2026, a derivative article qualifies for the 10% rate (9903.82.06) when at least 85% of its aluminum, steel or copper content by weight was melted, poured, smelted or cast in the United States "
           "(Proclamation 11021 had required all of it). Chapter 83 rates (25%) did not change.",
           None, None, "All", ["procl-11032"]),
        ch("tw-auto-parts", "reference", "2026-05-01", "Effective", "Taiwan auto-parts rate of 15% (vehicle locks, hinges and fittings)",
           "Under the U.S.-Taiwan agreement, Taiwanese auto parts pay 15% in place of the base rate (9903.94.67), which covers the vehicle locks, hinges and fittings of 8301.20, 8302.10.30 and 8302.30. "
           "Similar deal rates apply to the EU (August 1, 2025), Japan (September 16, 2025) and Korea (November 1, 2025); the UK rate is 10% (June 30, 2025).",
           None, "15% (in place of base)", "Taiwan", ["fr-2026-10571", "fr-2025-18660", "fr-2025-17908", "fr-2025-21940", "fr-2025-12060"]),
        ch("tech-corrections", "reference", "2026-04-29", "Published", "Commerce adds the no-metal heading 9903.82.01",
           "Commerce added heading 9903.82.01 from April 6, 2026: articles on the Section 232 lists that contain no aluminum, steel or copper pay no Section 232 duty. It matters for Chapter 83 fittings of other base metals.",
           None, None, "All", ["fr-2026-08297"]),
        ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 rebuilt on full value: Chapter 83 derivatives at 25% (Proclamation 11021)",
           f"Proclamation 11021 replaced the earlier headings with 9903.82.02–9903.82.26, charged on the full customs value. All {n232} Chapter 83 derivative lines moved to the 25% list (9903.82.09), from 50% of the "
           "metal content. Articles outside Chapters 72–76 whose listed metal is under 15% of their weight are exempt (9903.82.03); UK goods with 95% UK metal pay 15%, goods of U.S.-melted metal 10%. "
           "Manufacturing drawback is allowed for the 25% list from trade-agreement partners; goods admitted to a foreign-trade zone must take privileged foreign status.",
           "+50% (metal content)", "+25% (full value)", "All", ["procl-11021", "csms-68253075", "hts-chapter-99"]),
        ch("s122-start", "reference", "2026-02-24", "Effective", "Section 122 surcharge replaces the IEEPA tariffs; Section 232 goods outside it",
           "A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026. Proclamation 11012 says it does not apply in addition to Section 232 duties, so in Chapter 83 only the "
           "non-232 lines paid it; USMCA goods were exempt.",
           None, "+10% (non-232 goods)", "All", ["procl-11012", "hts-chapter-99"]),
        ch("ieepa-end", "extraDuty", "2026-02-24", "Ended", "All IEEPA tariffs end",
           "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, "
           "and CBP stopped collecting them from 12:00 a.m. ET on February 24, 2026. Section 232 duties are not IEEPA duties and continued. For Chapter 83 the IEEPA duties had applied to the non-232 lines and to the "
           "non-metal content of derivatives.",
           "Varied by country", None, "All", ["scotus-24-1287", "eo-14389", "csms-67834313"]),
        ch(nic["id"], "pending", "2025-12-29", "Published", "Section 301 tariff on Nicaragua phases in from 2027",
           "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 83 line. "
           "Note 29 has no Section 232 carve-out, so it will add to the 25% on Nicaraguan derivatives. The rate is 0% in 2026.",
           None, "+10% to +15%", "Nicaragua", nic["sourceIds"]),
        ch("mhdv-parts", "extraDuty", "2025-11-01", "Effective", "Section 232 on medium- and heavy-duty vehicle parts",
           "Proclamation 10984 imposed 25% on medium- and heavy-duty truck and bus parts (9903.74.08), which reaches the vehicle locks, hinges and fittings of 8301.20, 8302.10.30 and 8302.30 when used as truck parts. "
           "USMCA-qualifying parts are exempt (9903.74.10). Korea's 15% auto-parts deal rate took effect the same day.",
           None, "+25%", "All", ["procl-10984", "csms-66665333", "fr-2025-21940"]),
        ch("inclusions-2025-08", "extraDuty", "2025-08-18", "Effective", "Section 232 inclusions add steel hinges, fittings, staples and caps",
           "Commerce's first inclusions round added steel derivatives 8302.10.60 (hinges), 8302.41.30 (door closers), 8302.41.60, 8302.42.30 and 8302.49.60 (building, furniture and other fittings), 8305.20 (staples in strips) "
           "and 8307.10.60 (flexible steel tubing), and aluminum derivatives 8307.90.60.00 and 8309.90.00.20 / .25 (aluminum caps and can ends), at 50% of the metal content.",
           None, "+50% (metal content)", "All", ["fr-2025-15819"]),
        ch("eu-auto-parts", "reference", "2025-08-01", "Effective", "EU auto-parts rate of 15%",
           "EU auto parts, including the vehicle locks, hinges and fittings of 8301.20, 8302.10.30 and 8302.30, pay 15% in place of the base rate (9903.94.53) under the U.S.-EU framework, retroactive to August 1, 2025.",
           "+25%", "15% (in place of base)", "European Union", ["fr-2025-18660"]),
        ch("s232-50", "extraDuty", "2025-06-04", "Effective", "Section 232 doubled to 50% on the metal content",
           "Proclamation 10947 raised the aluminum and steel duties from 25% to 50% (UK stayed at 25%). For the Chapter 83 aluminum derivatives it applied to the value of the aluminum content; the non-metal content paid "
           "the reciprocal and other IEEPA duties. Ended April 5, 2026.",
           "+25%", "+50% (UK +25%)", "All except UK", ["procl-10947"]),
        ch("auto-parts", "extraDuty", "2025-05-03", "Effective", "Section 232 on automobile parts (vehicle locks, hinges, fittings)",
           "Proclamation 10908 imposed 25% on automobile parts (9903.94.05), including motor-vehicle locks (8301.20), hinges (8302.10.30) and mountings and fittings (8302.30) when they are passenger-vehicle or light-truck parts. "
           "USMCA-qualifying parts were exempt.",
           None, "+25%", "All", ["procl-10908", "procl-10925", "csms-64916652"]),
        ch("reciprocal", "reference", "2025-04-05", "Effective", "Reciprocal tariff on Chapter 83 goods",
           "Executive Order 14257 set the reciprocal tariffs from April 5, 2025 (10%, country rates from August 7, 2025). Section 232 goods were excluded (Annex II); for derivatives charged on their metal content, the non-metal content paid it. Ended February 24, 2026.",
           None, "10% or more (ended)", "All except Canada, Mexico", ["eo-14257"]),
        ch("s232-aluminum-derivatives", "extraDuty", "2025-03-12", "Effective", "24 Chapter 83 lines become Section 232 aluminum derivatives",
           "Proclamation 10895 extended the aluminum duty to the derivative articles listed by Commerce (90 FR 11251) and ended all country exemptions. In Chapter 83 that meant hinges, castors, vehicle, building and furniture fittings, "
           "brackets, door closers, binder fittings and frames (8302.10.30–8302.60.90, 8305.10.00.50, 8306.30): 25% on the aluminum content (9903.85.08), and 200% for Russian goods (9903.85.68).",
           None, "+25% (aluminum content)", "All", ["procl-10895", "fr-2025-03596"]),
        ch("ca-mx-ieepa", "reference", "2025-03-04", "Effective", "IEEPA duties on Canada and Mexico",
           "+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01) from March 4, 2025; USMCA goods exempt from March 7, 2025. Ended February 24, 2026.",
           None, "+25% (ended)", "Canada, Mexico", ["eo-14193", "eo-14194", "eo-14231", "eo-14232"]),
        ch("ru-35", "extraDuty", "2022-07-27", "Effective", "Russia: 35% in lieu of column 2 on vehicle fittings and staples",
           "Proclamation 10420 set 35% in place of the column 2 rate (9903.90.08, U.S. note 30(b)) on listed Russian goods, including 8302.30.30 (motor-vehicle fittings) and 8305.20 (staples in strips).",
           "Column 2 rate", "35% (in lieu of column 2)", "Russia", ["procl-10420"]),
        ch("cn-list4a", "extraDuty", "2020-02-14", "Effective", "China Section 301 List 4A cut to 7.5%",
           f"List 4A (9903.88.15), in force since September 1, 2019 at 15%, was cut to 7.5% from February 14, 2020. It covers {nl4} Chapter 83 lines: most padlocks and locks, lock parts and keys, vehicle hinges, "
           "furniture fittings and drawer slides, binder fittings, staples in strips, other office articles and plated ornaments.",
           "+15%", "+7.5%", "China", ["fr-2019-17865", "fr-2020-00904"]),
        ch("cn-list3", "extraDuty", "2019-05-10", "Effective", "China Section 301 List 3 raised to 25%",
           f"List 3 (9903.88.03) has covered {nl3} Chapter 83 lines since September 24, 2018 (10%), raised to 25% from May 10, 2019: vehicle locks, hinges, castors, fittings, safes, frames, tubing, buckles, caps, sign plates and welding consumables.",
           "+10%", "+25%", "China", ["fr-2018-20610", "fr-2019-09681"]),
    ]
    changes += [
        ch("adcvd-staples-2026", "reference", "2026-02-06", "Published", "Collated steel staples from China: AD/CVD orders continued",
           "After expedited sunset reviews (dumping margins likely up to 122.55%; subsidy rates up to 63.24%) and the ITC's vote, Commerce continued the antidumping and countervailing duty orders on certain collated steel "
           "staples from China (8305.20.0000). Cash deposits continue at the rates in effect at entry.",
           None, "Orders continue", "China", ["fr-2026-02382", "fr-2025-20161", "fr-2025-20159", "fr-2020-15622", "fr-2020-15623"]),
        ch("adcvd-carton-staples", "reference", "2023-05-08", "Revoked", "Carton-closing staples from China: antidumping order revoked",
           "Commerce revoked the 2018 antidumping order on carton-closing staples from China (8305.20) at its first sunset review because no domestic party took part, effective May 8, 2023.",
           "AD order", None, "China", ["fr-2023-13271"]),
        ch("adcvd-paper-clips", "reference", "2023-04-21", "Published", "Paper clips from China: antidumping order continued",
           "Commerce and the ITC continued the antidumping order on paper clips wholly of wire of base metal from China (8305.90.3010) after its fifth sunset review; margins likely to prevail up to 126.94%.",
           None, "Order continues", "China", ["fr-2023-08433", "fr-2022-28170"]),
        ch("adcvd-extrusions", "reference", "2022-11-02", "Published", "Aluminum extrusions from China: AD/CVD orders continued",
           "The 2011 antidumping and countervailing duty orders on aluminum extrusions from China were continued. Their HTS list names 23 Chapter 83 lines (aluminum hinges, castors, vehicle, building and furniture fittings, "
           "drawer slides, brackets, door-closer parts, binder fittings and frames); finished goods fully assembled at entry and finished goods kits are excluded.",
           None, "Orders continue", "China", ["fr-2022-23810", "fr-2011-13086", "fr-2011-13103"]),
    ]
    changes.sort(key=lambda x: x["date"], reverse=True)
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for x in tu["changes"]:
        used.update(x["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch83"])
    tu["sources"] = sorted([copy.deepcopy(SRC[i]) for i in used], key=lambda s: (s["published"], s["id"]), reverse=True)

    apply_industry_areas(c, cell_of)
    apply_engineering(c)
    from faq83 import apply_trade_and_faq

    apply_trade_and_faq(c)


def apply_industry_areas(c, cell_of):
    d, SRC = c["d"], c["SRC"]
    ia = d["industryAreas"]
    n232, nnon, nca = len(c["S232"]), len(c["NON232"]), len(c["CA338"])
    ia["h1"] = "HTS Chapter 83: Miscellaneous Articles of Base Metal — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Lock, Hinge & Hardware Tariffs by Country: China, Mexico, Canada, Taiwan, Vietnam, EU (HTS Ch. 83) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 83 locks, hinges, fittings, safes, staples, closures and welding consumables by country and product: 25% Section 232 on hinges and fittings from every country, "
        "10–12.5% Section 301 on the rest, China up to 55.7%, Canada +50% Section 338, USMCA relief for Mexico.",
        "keywords": [
            "miscellaneous articles of base metal tariff",
            "mexico tariff on miscellaneous articles of base metal",
            "china tariff on miscellaneous articles of base metal",
            "usmca base metal import duty",
            "section 301 tariffs mexico",
            "tariffs on china 2026",
            "canada section 338 tariffs",
            "germany base metal import duty",
            "cabinet hardware tariff",
            "taiwanese base metal import rates",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. Chapter 83 splits in two. "
        f"The **{n232} Section 232 derivative lines** (hinges, castors, door closers and fittings of iron, steel, aluminum or zinc, drawer slides, brackets, staples, frames, flexible tubing without fittings, caps and can ends) "
        "pay **25%** plus the base rate from every country, USMCA included, and no 2026 Section 301 duty. "
        f"The **{nnon} other lines** pay the base rate plus the **2026 Section 301** duty: 10% or 12.5% for most of the 60 economies, 10% or 12.5% *in place of* a lower base rate for the EU, Japan, Korea and Taiwan, "
        "and nothing extra for USMCA-qualifying goods of Canada and Mexico.\n\n"
        f"China pays **25% or 7.5% more** under its Section 301 lists, Canada **+50%** under Section 338 on {nca} lines (safes, buckles, crown corks, sign plates, welding consumables) even with USMCA, "
        "Brazil 25% + 12.5% on the non-232 lines, and Russia column 2 rates plus 200% on aluminum derivatives. Vehicle locks, hinges and fittings show both answers: the auto or truck parts duty when used as vehicle parts, "
        "the metals or Section 301 duty otherwise. The table does **not** include antidumping or countervailing duties (see Tariff updates)."
    )

    def r301(country):
        e = cell_of(country, "8304.00.00.00")["extra"]
        if "in place of base" in e:
            return f"{e.split('%')[0]}% in place of the base rate when that is lower"
        return e.lstrip("+")

    def std(country, code, deal=None):
        s = (
            f"25% Section 232 (9903.82.09) on the {n232} derivative lines (hinges, castors, door, furniture and vehicle fittings, drawer slides, brackets, staples, frames, tubing without fittings, caps). "
            f"Other {nnon} lines: Section 301 ({code}), {r301(country)}. "
        )
        if deal:
            s += f"Vehicle locks, hinges and fittings used as car parts pay the {deal} deal rate of 15% in place of the base rate."
        else:
            s += "Vehicle locks, hinges and fittings used as car or truck parts pay 25% (9903.94.05 / 9903.74.08)."
        return s

    R = {
        "China": ("Section 232 lines: 25% (9903.82.09) + 25% List 3 or 7.5% List 4A + base: 50%–55.7% on most hinges, castors, fittings and brackets, 34.5%–36.4% on vehicle hinges, drawer slides and staples. "
                  "Other lines: 12.5% (9903.05.31) + 25% List 3 or 7.5% List 4A + base: 22%–26% on most locks, 37.5%–45% on safes, buckles, caps, sign plates and welding consumables; 12.5% only on the 8 List 4B lines. "
                  "AD/CVD on aluminum-extrusion hardware, paper clips and collated staples.",
                  ["procl-11021", "fr-2018-20610", "fr-2019-17865", "fr-2026-15181", "fr-2026-20510", "fr-2022-23810", "fr-2023-08433", "fr-2026-02382", "hts-now"]),
        "Canada": (f"25% Section 232 on the {n232} derivative lines with or without a USMCA claim (note 16(b)). Other lines: Free with USMCA (9903.05.93 lifts the 10% Section 301 duty, 9903.05.29), "
                   f"except the {nca} Section 338 lines (9903.03.14), which pay +50% even under USMCA (60% plus base without it). Vehicle locks and fittings qualifying for USMCA: no auto-parts duty (9903.94.06).",
                   ["procl-11021", "procl-11065", "procl-11048", "fr-2026-15181", "procl-10908", "hts-now"]),
        "Mexico": (f"25% Section 232 on the {n232} derivative lines with or without a USMCA claim. Other lines: Free with USMCA (9903.05.94), otherwise base + 10% Section 301 (9903.05.55). "
                   "Vehicle locks and fittings qualifying for USMCA: no auto-parts duty (9903.94.06).",
                   ["procl-11021", "fr-2026-15181", "procl-10908", "hts-now"]),
        "United Kingdom": (f"25% Section 232 shown; UK goods with at least 95% UK-melted or UK-smelted metal pay 15% (9903.82.05, note 16(d)). Other lines: base + 10% Section 301 (9903.05.81). "
                           "Vehicle locks, hinges and fittings used as car parts: 10% (9903.94.32).",
                           ["procl-11021", "fr-2026-08297", "fr-2026-15181", "fr-2025-12060", "hts-now"]),
        "Brazil": (f"25% Section 232 on the {n232} derivative lines; the Brazil duty does not apply to them (note 50(a)(vi)(1)). Other lines: base + 25% (9903.05.01) + 12.5% (9903.05.27).",
                   ["procl-11021", "fr-2026-14542", "fr-2026-15181", "hts-now"]),
        "Russia": ("Column 2 rates (up to 65%) or 35% in their place on 3 lines (9903.90.08), plus 12.5% Section 301 (9903.05.66). Aluminum-derivative lines also pay 200% (9903.85.68): up to 257.5%. "
                   "Steel-only derivatives pay 25% (9903.82.16) instead of Section 301.",
                   ["procl-10522", "procl-10523", "procl-10420", "procl-11021", "fr-2026-15181", "hts-now"]),
    }
    DEAL = {"Germany": "EU", "Italy": "EU", "France": "EU", "Spain": "EU", "Netherlands": "EU", "Austria": "EU", "Japan": "Japan", "South Korea": "Korea", "Taiwan": "Taiwan"}
    DEAL_SRC = {"EU": "fr-2025-18660", "Japan": "fr-2025-17908", "Korea": "fr-2025-21940", "Taiwan": "fr-2026-10571"}
    for x in ia["countries"]:
        name = x["country"]
        if name == "Any other country":
            x["rule"]["label"] = (
                f"25% on the {n232} Section 232 derivative lines from every other country (no exemptions). Other lines: base rate only, or up to 12.5% more under the 2026 Section 301 actions "
                "for the 60 listed economies. Column 2 countries (Belarus, Cuba, North Korea) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
            )
            x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "fr-2025-23892", "hts-now"]
            continue
        if name in R:
            x["rule"]["label"], x["rule"]["sourceIds"] = R[name][0].strip(), R[name][1]
            continue
        code = x["rule"]["ch99Code"]
        deal = DEAL.get(name)
        x["rule"]["label"] = std(name, code, deal).strip()
        x["rule"]["sourceIds"] = ["procl-11021", "fr-2026-15181", "procl-10908", "hts-now"] + ([DEAL_SRC[deal]] if deal else [])
    for x in ia["countries"]:
        assert "TODO" not in x["rule"]["label"], x["country"]
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Section 232 is shown at its default rate of 25% (9903.82.09). Derivatives with at least 85% U.S.-melted or U.S.-smelted metal pay 10% (9903.82.06), UK goods with at least 95% UK metal 15% (9903.82.05), and "
        "articles whose aluminum, steel and copper are under 15% of their weight, or absent, pay no Section 232 duty (9903.82.03, 9903.82.01); the cells do not show these variants.",
        "Vehicle locks, hinges and fittings (8301.20, 8302.10.30, 8302.30) show both answers: the auto or truck parts duty when they are vehicle parts, the metals or Section 301 duty otherwise.",
        "Sign plates (8310) show both answers: no 2026 Section 301 or Brazil duty when they are informational materials (9903.05.92, 9903.05.09), the standard rate otherwise.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
        "Antidumping and countervailing duties are not included. They apply company by company to Chinese aluminum-extrusion hardware, paper clips and collated staples.",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 2, 16, 19, 20, 29, 30, 33, 35, 38, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 16(c)(vi) lists 27 Chapter 83 lines as aluminum derivatives and (vii) 19 as steel "
        f"derivatives ({n232} lines in all); the 15% metal-weight test of note 16(c) applies because Chapter 83 is outside Chapters 72–76. No country exemption exists, and note 16(b) collects the duty on top of FTA rates. "
        "Section 232 goods are excluded from the 2026 Section 301 duties (note 52(f)(1)), the Brazil duty (note 50(a)(vi)(1)) and the expired Section 122 surcharge, but not from China Section 301 (note 20) or the 2027 "
        "Nicaragua duty (note 29). No Chapter 83 line is on the note 52(b) general exemption list or the note 52(j) country exception lists, and no China product exclusion covers Chapter 83 (notes 20(vvv)–(www)). "
        "8310 is on CBP's informational-materials list (9903.05.92, 9903.05.09). Civil aircraft relief (notes 2(v), 35, 51(d), 52(d)) and the 9903.82.01 / 9903.82.03 headings need the importer's confirmation and are not applied."
    )
    ia_ids = {"hts-now"}
    for x in ia["countries"]:
        ia_ids.update(x["rule"]["sourceIds"])
    for sid in ia_ids:
        assert sid in SRC, sid
    ia["sources"] = sorted([copy.deepcopy(SRC[i]) for i in ia_ids], key=lambda s: (s["published"], s["id"]), reverse=True)


def apply_engineering(c):
    d, SRC = c["d"], c["SRC"]
    te = d["tariffEngineering"]
    CH99 = c["CH99_PDF"]
    CH83 = c["CH83_PDF"]
    FR11021 = SRC["procl-11021"]["url"]

    def e(title, sec):
        return f"https://www.ecfr.gov/current/title-{title}/section-{sec}"

    def ep(title, part):
        return f"https://www.ecfr.gov/current/title-{title}/part-{part}"

    te["h1"] = "HTS Chapter 83: Miscellaneous Articles of Base Metal — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Locks, Hinges & Hardware: Section 232 Entry, Metal Content, USMCA & Ways to Lower Duty (HTS Ch. 83) | KoalaGains",
        "shortDescription": "The rules for each HTS Chapter 83 line: Section 232 headings and the 15% metal-weight test, melt-and-pour and smelt-and-cast reporting, origin marking, USMCA claims, food-contact rules for caps, "
        "AD/CVD scope, plus legal ways to pay less: U.S.-melted metal (10%), low metal content, USMCA, informational materials, drawback and correct classification.",
        "keywords": [
            "tariff engineering",
            "usmca chapter 83 origin thresholds",
            "section 232 derivative tariff calculation",
            "melt and pour steel",
            "aluminum smelt and cast",
            "hts 8301 padlocks import duty",
            "tariff code for welding wire",
            "drawer slides hs code",
        ],
    }
    te["intro"] = (
        "For Chapter 83 the paperwork decides which of two regimes applies. On the 31 Section 232 derivative lines the entry reports the Section 232 heading (9903.82.09, or a lower-rate or no-duty heading) next to the "
        "Chapter 83 line, the **country where the steel was melted and poured or the aluminum smelted and cast**, and the metal content; the duty is charged on the full value with no FTA reduction. On the other lines "
        "the **2026 Section 301** heading for the country of origin is reported, unless a USMCA or informational-materials exemption is claimed. Vehicle locks, hinges and fittings take the auto-parts headings when "
        "they are vehicle parts. Every article must be marked with its country of origin, and caps and closures that touch food must meet FDA food-contact rules.\n\n"
        "The legal ways to pay less: **metal content under 15% of the weight** (9903.82.03) or of **U.S.-melted metal** (10%), **UK metal** (15%), **USMCA** for Canadian and Mexican goods outside Section 232, "
        "**informational-materials** treatment for sign plates, **avoiding Chinese origin**, **drawback**, correct classification (castor size, parts with their parent article) and checking **AD/CVD scope** before buying. "
        "Each rule and lever links to its regulation or proclamation."
    )
    te["regulationsAsOf"] = c["ECFR_AS_OF"]
    te["levers"] = [
        {
            "id": "low-metal",
            "title": "Check the aluminum, steel and copper share of the article's weight",
            "saves": "The whole 25% Section 232 duty when the listed metals are under 15% of the weight (9903.82.03) or absent (9903.82.01)",
            "appliesTo": "The 31 Section 232 derivative lines of Chapter 83, e.g. fittings with plastic, glass or wood bodies, or of base metals other than aluminum, steel and copper",
            "document": "A bill of materials and weights showing the aggregate aluminum, steel and copper content below 15% of the article's weight (or none at all), kept for CBP; enter under 9903.82.03 or 9903.82.01.",
            "caveat": "The test is by weight of the listed metals combined. Classification still follows the article: a zinc-alloy hinge stays in 8302.10.60 and pays its base rate. China's Section 301 lists and the 2026 Section 301 "
            "duty then apply as for non-232 goods (9903.82.01/.03 are outside the note 52(f)(1) exemption).",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(c), headings 9903.82.01 and 9903.82.03", "url": CH99},
                {"label": "Proclamation 11021, clause 9 (91 FR 18201)", "url": FR11021},
                {"label": "Commerce technical corrections (91 FR 23056)", "url": SRC["fr-2026-08297"]["url"]},
            ],
        },
        {
            "id": "us-melted",
            "title": "Use U.S.-melted steel or U.S.-smelted aluminum",
            "saves": "15 points on the Section 232 duty (10% instead of 25%, 9903.82.06)",
            "appliesTo": "The 31 Section 232 derivative lines (hinges, castors, fittings, drawer slides, brackets, staples, frames, tubing, caps)",
            "document": "Mill and smelter certificates showing that at least 85% (by weight) of the metal content was melted and poured or smelted and cast in the United States; reported in ACE.",
            "caveat": "The 85% test applies from June 8, 2026 (before that, all of it). Origin of the article and the base rate do not change; China's Section 301 duty still applies to Chinese-made goods.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(e), heading 9903.82.06", "url": CH99},
                {"label": "Proclamation 11032 (91 FR 34085)", "url": SRC["procl-11032"]["url"]},
            ],
        },
        {
            "id": "uk-metal",
            "title": "Buy UK goods made of UK metal",
            "saves": "10 points on the Section 232 duty (15% instead of 25%, 9903.82.05)",
            "appliesTo": "The 31 Section 232 derivative lines, for products of the United Kingdom",
            "document": "Mill and smelter certificates showing that at least 95% of the steel was melted and poured, or the aluminum smelted and cast, in the UK.",
            "caveat": "Origin must be the UK and the 95% test must be met; otherwise 25%.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 16(d)", "url": CH99},
                {"label": "Proclamation 11021 (91 FR 18201)", "url": FR11021},
            ],
        },
        {
            "id": "usmca",
            "title": "Claim USMCA on Canadian and Mexican goods outside Section 232",
            "saves": "The 10% Section 301 duty and the base rate (up to 16.1%) on the 58 non-232 lines; the 25% auto-parts duty on qualifying vehicle locks and fittings",
            "appliesTo": "Locks, keys, brass hardware, safes, desk equipment, ornaments, tubing with fittings, buckles, caps, sign plates and welding consumables that originate in Canada or Mexico",
            "document": "A USMCA certification of origin from the importer, exporter or producer, available to CBP on request.",
            "caveat": "USMCA does not reduce Section 232 (note 16(b)) or the 50% Section 338 duty on 18 Canadian lines (note 51(a)).",
            "citations": [
                {"label": "19 CFR 182.12", "url": e(19, "182.12")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)", "url": CH99},
            ],
        },
        {
            "id": "informational",
            "title": "Enter qualifying sign plates as informational materials",
            "saves": "The 2026 Section 301 duty (10%–12.5%) and Brazil's 25%",
            "appliesTo": "Sign plates, name plates, numbers, letters and symbols of 8310 that are informational materials",
            "document": "Product description showing the plates carry information (signs, notices); enter under 9903.05.92 (and 9903.05.09 for Brazil).",
            "caveat": "Does not lift China's 25% List 3 duty or Canada's 50% Section 338 duty. Plain blanks or decorative plates are not informational materials.",
            "citations": [
                {"label": "HTSUS Ch. 99, headings 9903.05.92 and 9903.05.09", "url": CH99},
                {"label": "CBP IEEPA FAQ: informational materials", "url": SRC["cbp-ieepa-faq"]["url"]},
            ],
        },
        {
            "id": "origin",
            "title": "Avoid Chinese origin",
            "saves": "25% (or 7.5%) of the value: Chinese goods pay Section 301 Lists 3 or 4A on top of Section 232 or the 2026 duty",
            "appliesTo": "81 of the 89 Chapter 83 lines, for goods of China",
            "document": "Production records showing where the article was made; origin follows the last substantial transformation (for goods processed in Canada or Mexico, the tariff-shift rules of 19 CFR 102.20). Ask CBP for a binding ruling.",
            "caveat": "Section 232 applies to every country, and Chinese parts assembled elsewhere can still fall under AD/CVD orders or circumvention findings.",
            "citations": [
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 20", "url": CH99},
                {"label": "19 CFR 102.20", "url": e(19, "102.20")},
                {"label": "19 CFR part 177 (rulings)", "url": ep(19, 177)},
            ],
        },
        {
            "id": "classification",
            "title": "Classify by the chapter notes, not the catalog name",
            "saves": "The difference between lines: a castor over 75 mm with a wheel 30 mm or wider is not a Chapter 83 castor (8716.90), parts of base metal go with their parent article, brass fittings are outside Section 232",
            "appliesTo": "Castors (8302.20), parts of locks and fittings, hinges and fittings of different metals (8302.10, 8302.41, 8302.42, 8302.49), locks by use (8301.20, .30, .40)",
            "document": "Product specifications (wheel diameter and width, metal composition, intended use) and, when in doubt, a CBP binding ruling.",
            "caveat": "Screws, bolts, springs and chain of Chapter 73 (7312, 7315, 7317, 7318, 7320) are never parts of Chapter 83 articles (note 1).",
            "citations": [
                {"label": "HTSUS Chapter 83, notes 1 and 2", "url": CH83},
                {"label": "19 CFR part 177 (rulings)", "url": ep(19, 177)},
            ],
        },
        {
            "id": "drawback",
            "title": "Drawback on re-exported goods",
            "saves": "Up to 99% of the base rate and ordinary duties; Section 232 duty on the 25% list only for goods of trade-agreement partners",
            "appliesTo": "Chapter 83 goods used in manufacturing or re-exported; the Section 232 part only for UK, EU, Japan, Korea, Mexico or Canada goods whose metal was melted or smelted in one of them and that are not AD/CVD merchandise",
            "document": "A drawback claim to CBP with import and export records (19 CFR part 191).",
            "caveat": "AD/CVD are never refundable (19 CFR 191.3(b)(3)).",
            "citations": [
                {"label": "Proclamation 11021, clauses 13–14", "url": FR11021},
                {"label": "19 CFR part 191", "url": ep(19, 191)},
                {"label": "19 CFR 191.3", "url": e(19, "191.3")},
            ],
        },
        {
            "id": "civil-aircraft",
            "title": "Civil aircraft parts",
            "saves": "The base rate (Free (C)) and, for EU, Japan, Korea, UK and Canadian goods on the listed subheadings, the Section 232 or Section 338 duty; the 2026 Section 301 duty for all",
            "appliesTo": "Hinges, castors, fittings, door closers and flexible tubing (8302.10.60, 8302.10.90, 8302.20, 8302.42, 8302.49.40–.80, 8302.60.30, 8307.10.30, 8307.90.30) for civil aircraft",
            "document": "Certification that the article is for use in civil aircraft under general note 6 and 19 CFR 10.183.",
            "caveat": "Military and (except for the UK) unmanned aircraft are excluded.",
            "citations": [
                {"label": "19 CFR 10.183", "url": e(19, "10.183")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. notes 2(v), 35, 51(d), 52(d)", "url": CH99},
            ],
        },
        {
            "id": "adcvd-scope",
            "title": "Check AD/CVD scope before you buy",
            "saves": "The whole antidumping or countervailing duty, when the product or producer is outside the order",
            "appliesTo": "Chinese aluminum-extrusion hardware (8302, 8305.10.00.50, 8306.30), paper clips wholly of wire (8305.90.30.10) and collated steel staples (8305.20)",
            "document": "The order's written scope (it, not the HTS number, decides) and the producer's company-specific cash-deposit rate; when unsure, request a scope ruling from Commerce.",
            "caveat": "A product in scope pays the cash deposit even if entered under another HTS line. Finished goods fully assembled at entry (e.g. framed pictures with glass) and finished goods kits are outside the extrusions orders.",
            "citations": [
                {"label": "19 CFR 351.225 (scope rulings)", "url": e(19, "351.225")},
            ],
        },
    ]
    rules = [
        {"id": "melt-pour", "agency": "CBP", "title": "Section 232 derivatives: report the country where the steel was melted and poured or the primary aluminum smelted and cast, and the metal content, on every entry",
         "citations": [{"label": "CBP CSMS # 64366327", "url": SRC["csms-64366327"]["url"]}, {"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}]},
        {"id": "s232-entry", "agency": "CBP", "title": "Section 232: report 9903.82.09 (25%), or the U.S.-metal (.06), UK (.05), Russia (.16) or no-duty (.01, .03) heading, with the Chapter 83 line; duty on the full value, on top of any FTA rate",
         "citations": [{"label": "CBP CSMS # 68253075", "url": SRC["csms-68253075"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 16", "url": CH99}]},
        {"id": "ftz", "agency": "CBP", "title": "Section 232 goods admitted to a foreign-trade zone must take privileged foreign status (duty fixed at admission)",
         "citations": [{"label": "19 CFR 146.41", "url": e(19, "146.41")}, {"label": "Proclamation 11021, clause 12", "url": FR11021}]},
        {"id": "s301-entry", "agency": "CBP", "title": "2026 Section 301: report the country heading (9903.05.20–9903.05.84) or the exemption claimed (USMCA 9903.05.93 / .94, informational materials 9903.05.92, civil aircraft 9903.05.88)",
         "citations": [{"label": "CBP CSMS # 69326983", "url": SRC["csms-69326983"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 52", "url": CH99}]},
        {"id": "auto-parts", "agency": "CBP", "title": "Vehicle locks, hinges and fittings used as vehicle parts: report 9903.94.05 (or the EU, Japan, Korea, Taiwan, UK deal heading), 9903.74.08 for truck and bus parts, or 9903.94.06 / 9903.74.10 for USMCA-qualifying parts",
         "citations": [{"label": "CBP CSMS # 64916652", "url": SRC["csms-64916652"]["url"]}, {"label": "CBP CSMS # 66665333", "url": SRC["csms-66665333"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. notes 33 and 38", "url": CH99}]},
        {"id": "ca-338", "agency": "CBP", "title": "Canadian goods on the note 51(b)(3) list: report 9903.03.14 (+50%) even when USMCA is claimed",
         "citations": [{"label": "CBP CSMS # 69851916", "url": SRC["csms-69851916"]["url"]}, {"label": "HTSUS Ch. 99, subch. III, U.S. note 51", "url": CH99}]},
        {"id": "marking", "agency": "CBP", "title": "Country of origin marking on the article or its container (19 CFR part 134)",
         "citations": [{"label": "19 CFR 134.11", "url": e(19, "134.11")}, {"label": "19 CFR part 134", "url": ep(19, 134)}]},
        {"id": "food-contact", "agency": "FDA", "title": "Caps, lids, crown corks and can ends that touch food or beverages: gasket and coating materials must be permitted food-contact substances",
         "citations": [{"label": "21 CFR 177.1210 (closures with sealing gaskets)", "url": e(21, "177.1210")}, {"label": "21 CFR 175.300 (resinous and polymeric coatings)", "url": e(21, "175.300")}]},
        {"id": "russia", "agency": "CBP", "title": "Russian goods: column 2 rates, 35% in lieu of column 2 on note 30(b) subheadings, plus 200% on aluminum derivatives (9903.85.68)",
         "citations": [{"label": "HTSUS Ch. 99, subch. III, U.S. notes 19 and 30", "url": CH99}, {"label": "Proclamation 10522 (88 FR 13267)", "url": SRC["procl-10522"]["url"]}]},
        {"id": "adcvd-extrusions", "agency": "Commerce (ITA) / CBP", "title": "Aluminum extrusions from China (A-570-967, C-570-968): AD and CVD cash deposits on in-scope aluminum hardware, regardless of the HTS line",
         "citations": [{"label": "Continuation, 87 FR 66128", "url": SRC["fr-2022-23810"]["url"]}, {"label": "AD order, 76 FR 30650", "url": SRC["fr-2011-13086"]["url"]}, {"label": "CVD order, 76 FR 30653", "url": SRC["fr-2011-13103"]["url"]}]},
        {"id": "adcvd-paper-clips", "agency": "Commerce (ITA) / CBP", "title": "Paper clips wholly of wire of base metal from China (A-570-826): antidumping cash deposits",
         "citations": [{"label": "Continuation, 88 FR 24552", "url": SRC["fr-2023-08433"]["url"]}]},
        {"id": "adcvd-staples", "agency": "Commerce (ITA) / CBP", "title": "Certain collated steel staples from China: antidumping and countervailing cash deposits",
         "citations": [{"label": "Continuation, 91 FR 5431", "url": SRC["fr-2026-02382"]["url"]}, {"label": "AD order, 85 FR 43815", "url": SRC["fr-2020-15622"]["url"]}, {"label": "CVD order, 85 FR 43813", "url": SRC["fr-2020-15623"]["url"]}]},
    ]
    te["rules"] = rules
    rule_ids = {r["id"] for r in rules}
    S232, AUTO, CA338 = set(c["S232"]), set(c["AUTO"]), set(c["CA338"])
    EXTR = {"8302.10.30.00", "8302.10.60.30", "8302.10.60.60", "8302.10.60.90", "8302.20.00.00", "8302.30.30.10", "8302.30.30.60", "8302.41.30.00", "8302.41.60.15", "8302.41.60.45", "8302.41.60.50",
            "8302.41.60.80", "8302.42.30.10", "8302.42.30.15", "8302.42.30.65", "8302.49.60.35", "8302.49.60.45", "8302.49.60.55", "8302.49.60.85", "8302.50.00.00", "8302.60.90.00", "8305.10.00.50", "8306.30.00.00"}
    assert len(EXTR) == 23 and all(x in c["LINE"] for x in EXTR)
    CIVIL = ("8302.10.60", "8302.10.90", "8302.20.00", "8302.42.30", "8302.42.60", "8302.49.40", "8302.49.60", "8302.49.80", "8302.60.30", "8307.10.30", "8307.90.30")
    GROUP_NOTES = {
        "8301": "Outside Section 232: base rate + 2026 Section 301 (USMCA exempt). Vehicle locks (8301.20) take the auto or truck parts duty when used as such. Canadian lock parts pay +50% Section 338.",
        "8302": "22 of 36 lines are Section 232 derivatives at 25% (iron, steel, aluminum or zinc); brass and other base-metal fittings pay Section 301 instead. Chinese aluminum hardware may be under the extrusions AD/CVD orders.",
        "8303": "Outside Section 232: base rate + 2026 Section 301; Canada +50% Section 338.",
        "8304": "Outside Section 232: base rate + 2026 Section 301; China List 4B (suspended).",
        "8305": "Staples in strips and other binder fittings are 25% Section 232 derivatives; Chinese paper clips and collated staples carry AD/CVD.",
        "8306": "Frames and mirrors (8306.30) are 25% aluminum derivatives; framed pictures with glass are outside the extrusions orders. Canadian ornaments (8306.29) pay +50% Section 338.",
        "8307": "Tubing without fittings: 25% Section 232. Tubing with fittings: Section 301; Canada +50% Section 338.",
        "8308": "Outside Section 232: base rate + 2026 Section 301; all Canadian lines +50% Section 338; hooks and eyes pay 1.1¢/kg + 2.9% (weight includes cards and wrappings).",
        "8309": "Aluminum and steel caps and can ends: 25% Section 232. Crown corks: Section 301; Canada +50%. FDA food-contact rules for closures.",
        "8310": "Outside Section 232; informational-materials exemption from the 2026 Section 301 and Brazil duties; Canada +50% Section 338.",
        "8311": "Outside Section 232: base Free + 2026 Section 301; Canada +50% Section 338 on electrodes, cored wire and solders.",
    }
    for g in te["groups"]:
        h = g["heading"]
        g["label"] = G[h][0]
        lines = [ln for ln in c["LINE"] if ln[:4] == h]
        rr = ["marking"]
        if any(l in S232 for l in lines):
            rr = ["melt-pour", "s232-entry", "ftz"] + rr
        if any(l not in S232 for l in lines):
            rr.append("s301-entry")
        if any(l in AUTO for l in lines):
            rr.append("auto-parts")
        if any(l in CA338 for l in lines):
            rr.append("ca-338")
        if h == "8309":
            rr.append("food-contact")
        if any(l in EXTR for l in lines):
            rr.append("adcvd-extrusions")
        if h == "8305":
            rr += ["adcvd-paper-clips", "adcvd-staples"]
        rr.append("russia")
        g["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        g["note"] = GROUP_NOTES[h]
    for ln in te["lines"]:
        hts = ln["hts"]
        rr = ["marking"]
        if hts in S232:
            rr = ["melt-pour", "s232-entry", "ftz"] + rr
        else:
            rr.append("s301-entry")
        if hts in AUTO:
            rr.append("auto-parts")
        if hts in CA338:
            rr.append("ca-338")
        if hts.startswith("8309"):
            rr.append("food-contact")
        if hts in EXTR:
            rr.append("adcvd-extrusions")
        if hts == "8305.90.30.10":
            rr.append("adcvd-paper-clips")
        if hts == "8305.20.00.00":
            rr.append("adcvd-staples")
        ln["ruleIds"] = [r for r in dict.fromkeys(rr) if r in rule_ids]
        lv = []
        if hts in S232:
            lv += ["low-metal", "us-melted", "uk-metal"]
        else:
            lv += ["usmca"]
        if hts.startswith("8310"):
            lv.append("informational")
        if hts not in c["CN_NONE"]:
            lv.append("origin")
        if hts[:7] in ("8302.20", "8302.10", "8302.41", "8302.42", "8302.49", "8301.20", "8301.30", "8301.40", "8301.60"):
            lv.append("classification")
        if hts[:10] in CIVIL:
            lv.append("civil-aircraft")
        lv.append("drawback")
        if hts in EXTR or hts in ("8305.90.30.10", "8305.20.00.00"):
            lv.append("adcvd-scope")
        ln["leverIds"] = list(dict.fromkeys(lv))
    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations and proclamations, not legal advice. Section 232 headings and lists change often, and AD/CVD rates are company-specific and "
        "change with each administrative review; check the current Chapter 99 notes, CBP's CSMS messages and Commerce's latest notices before importing."
    )
