"""Fill tariffEngineering for Chapter 23 (static research content)."""
import json, sys

HTS23 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2023"
HTS98 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098"
HTS99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"


def ecfr(t, s):
    return f"https://www.ecfr.gov/current/title-{t}/section-{s}"


def fill_te(d, title):
    te = d["tariffEngineering"]
    te["h1"] = f"HTS Chapter 23: {title} — Import Documents & Ways to Lower Duty"
    te["seo"] = {
        "title": "Importing Pet Food & Animal Feed into the U.S.: FDA & APHIS Rules, Permits & Legal Ways to Lower Duty (HTS Ch. 23) | KoalaGains",
        "shortDescription": "The documents and rules for each HTS Chapter 23 line — FDA food-facility registration, prior notice, FSVP and preventive controls for animal food, APHIS permits for meat and fish meal — and the legal ways to pay less: USMCA, FTA claims, the dairy-feed quota, rulings and drawback.",
        "keywords": [
            "importing pet food into the us",
            "pet food import requirements usa",
            "pet food import permit",
            "FDA animal food import requirements",
            "FSVP animal food",
            "APHIS fish meal import permit",
            "USMCA pet food",
            "animal feed import regulations",
        ],
    }
    te["intro"] = (
        "Most Chapter 23 goods are **food for animals**, so FDA treats them like food. The importer needs a "
        "**Foreign Supplier Verification Program**, every shipment needs **FDA prior notice**, and the foreign plant must be "
        "**registered with FDA** and follow its animal-food safety rules. Anything made from animals — meat and bone meal, "
        "fish meal, pet food with meat — also goes through **USDA APHIS**, which uses permits and BSE (mad cow disease) "
        "rules to decide whether it can enter at all.\n\n"
        "Most of the duty comes from the extra duty by country, not the base rate. The ways to pay less are a **USMCA** claim on "
        "goods from Canada or Mexico, an **FTA** claim on the lines that still carry a base rate, and the **in-quota lines** for "
        "milk-based feed. Each one depends on a document, listed below with its regulation."
    )
    te["regulationsAsOf"] = "2026-10-08"

    te["levers"] = [
        {
            "id": "usmca",
            "title": "Claim USMCA on feed and pet food from Canada or Mexico",
            "saves": "The 10% Section 301 duty on Canadian or Mexican goods, plus any base rate (up to 1.9%, or 7.5% on in-quota milk-based feed)",
            "appliesTo": "All 61 lines, for goods that qualify as originating under USMCA. Milk-based feed (2309.90.28, 2309.90.48) has its own USMCA rule: see the caveat.",
            "document": "A certification of origin from the importer, exporter or producer. It need not follow a prescribed format; it can be on the invoice or another document, and CBP can ask for it.",
            "caveat": (
                "For milk-based feed outside the quota (2309.90.28, 2309.90.48), the USMCA rate is set in Chapter 98. Mexican goods are Free "
                "(9823.05.01). Canadian goods are Free only within Canada's USMCA quota, which they share with whole milk powder (696.9 t in 2026; 9823.05.02, U.S. note 5(b)(1) to subchapter XXIII), and "
                "pay 80.4¢/kg + 6.4% above it (9823.05.05, 9823.05.06). A claim without a valid certification exposes the entry to the 10% "
                "Section 301 duty plus penalties. The USMCA was not renewed at the July 1, 2026 joint review but remains in force."
            ),
            "citations": [
                {"label": "19 CFR 182.12", "url": ecfr(19, "182.12")},
                {"label": "HTSUS 9903.05.93 / 9903.05.94", "url": HTS99},
                {"label": "HTSUS 9823.05.01–9823.05.06", "url": HTS98},
                {
                    "label": "USTR statement on the USMCA joint review (July 1, 2026)",
                    "url": "https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review",
                },
            ],
        },
        {
            "id": "fta",
            "title": "Claim a free trade agreement on the lines that carry a base rate",
            "saves": "The base rate: 1.4% or 1.9% of value, 0.12¢–0.56¢/kg on oilcake, or 7.5% on in-quota milk-based feed. The Section 301 duty for the country still applies.",
            "appliesTo": "Lines whose Special column lists the agreement (AU, BH, CL, CO, IL, JO, KR, MA, OM, P, PA, PE, SG); the 25 Free lines have nothing to save",
            "document": "A claim on the entry with the agreement's certification or origin information — for example Chile (19 CFR 10.410), CAFTA-DR (19 CFR 10.583) or Australia (19 CFR 10.703).",
            "caveat": (
                "An FTA claim does not remove the 2026 Section 301 duty (U.S. note 52(a) to Chapter 99 subchapter III). On over-quota "
                "milk-based feed, Australia's FTA rate is set in Chapter 98 (9822.04.20, within Australia's FTA quantity). GSP (A, A*, A+) "
                "has been expired since December 31, 2020."
            ),
            "citations": [
                {"label": "19 CFR 10.410", "url": ecfr(19, "10.410")},
                {"label": "19 CFR 10.583", "url": ecfr(19, "10.583")},
                {"label": "19 CFR 10.703", "url": ecfr(19, "10.703")},
                {"label": "HTSUS Ch. 99, subch. III, U.S. note 52(a)", "url": HTS99},
            ],
        },
        {
            "id": "dairy-quota",
            "title": "Enter milk-based feed under the in-quota lines",
            "saves": "80.4¢/kg + 6.4% drops to 7.5% of value (10% in total for EU goods, which pay the Section 301 top-up). On 20 t of milk replacer worth $60,000: $19,920 over quota against $4,500 in quota ($6,000 from the EU).",
            "appliesTo": "Animal feed containing milk or milk derivatives (2309.90.24 and 2309.90.44 in quota; 2309.90.28 and 2309.90.48 over quota)",
            "document": (
                "Entry under 2309.90.24 or 2309.90.44 while the quota is open. The quota is 7,399,700 kg a year in total, with at least "
                "5,470,323 kg for Ireland, 1,782,618 kg for New Zealand, 83,914 kg for the United Kingdom and 56,699 kg for Australia "
                "(Additional U.S. note 2 to Chapter 23). Goods of Mexico cannot be entered in this quota; they enter free under USMCA."
            ),
            "caveat": "Once the quota is filled, the same feed pays 80.4¢/kg + 6.4% (2309.90.28, 2309.90.48). Check CBP's quota status before shipping.",
            "citations": [
                {"label": "HTSUS Ch. 23, Additional U.S. note 2", "url": HTS23},
                {"label": "CBP: Quotas", "url": "https://www.cbp.gov/trade/quota"},
            ],
        },
        {
            "id": "ruling",
            "title": "Get a binding ruling before you import",
            "saves": "Certainty: a ruling fixes the line before the goods arrive — pet food vs. other feed, \"mixed feed\" (6% grain rule), milk content over or under 10%",
            "appliesTo": "Any line where the classification decides the rate — especially 2309.90 (Free mixed feeds vs. 1.4%–80.4¢/kg + 6.4% other preparations)",
            "document": "A ruling request to CBP describing the product, its ingredients by weight and how it is put up.",
            "caveat": "Rulings apply to the transaction described; a different formula may need its own.",
            "citations": [
                {"label": "19 CFR part 177", "url": "https://www.ecfr.gov/current/title-19/part-177"},
                {"label": "HTSUS Ch. 23, Additional U.S. note 1", "url": HTS23},
            ],
        },
        {
            "id": "drawback",
            "title": "Claim drawback when the goods (or what you make from them) are exported",
            "saves": "Up to 99% of the duties paid on the imported goods",
            "appliesTo": "Imported feed ingredients or pet food that are exported, destroyed, or used to make goods that are exported",
            "document": "A drawback claim filed with CBP, with records that link the import to the export or destruction.",
            "caveat": "Claims have deadlines and record-keeping rules. Antidumping and countervailing duties (such as those on Chinese lysine) are never refunded, and milk-based feed that paid the over-quota rate qualifies only for unused-merchandise drawback (19 CFR 191.3(b) and (c)).",
            "citations": [
                {"label": "19 CFR part 191", "url": "https://www.ecfr.gov/current/title-19/part-191"},
                {"label": "19 CFR 191.3", "url": ecfr(19, "191.3")},
            ],
        },
    ]

    te["rules"] = [
        {
            "id": "fda-registration",
            "agency": "FDA",
            "title": "Food facility registration: the foreign plant that makes, packs or holds animal food must be registered with FDA",
            "citations": [
                {"label": "21 CFR part 1, subpart H", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-H"},
            ],
        },
        {
            "id": "fda-prior-notice",
            "agency": "FDA",
            "title": "Prior notice: file it before every shipment of food for animals arrives (since October 1, 2026, mail shipments also need the mail tracking number)",
            "citations": [
                {"label": "21 CFR part 1, subpart I", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-I"},
                {
                    "label": "90 FR 46045: prior notice final rule (September 25, 2025)",
                    "url": "https://www.federalregister.gov/documents/2025/09/25/2025-18655/prior-notice-adding-requirement-to-submit-mail-tracking-number-for-articles-of-food-arriving-by",
                },
            ],
        },
        {
            "id": "fda-fsvp",
            "agency": "FDA",
            "title": "Foreign Supplier Verification Program: the U.S. importer must verify that each foreign supplier of animal food meets U.S. safety standards",
            "citations": [
                {"label": "21 CFR part 1, subpart L", "url": "https://www.ecfr.gov/current/title-21/part-1/subpart-L"},
                {
                    "label": "FDA: FSMA final rule on FSVP",
                    "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-foreign-supplier-verification-programs-fsvp-importers-food-humans-and-animals",
                },
            ],
        },
        {
            "id": "fda-pcaf",
            "agency": "FDA",
            "title": "Preventive controls for animal food: the maker follows FDA good manufacturing practice and a written food safety plan",
            "citations": [
                {"label": "21 CFR part 507", "url": "https://www.ecfr.gov/current/title-21/part-507"},
                {
                    "label": "FDA: FSMA final rule for preventive controls for animal food",
                    "url": "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-preventive-controls-animal-food",
                },
            ],
        },
        {
            "id": "fda-label",
            "agency": "FDA",
            "title": "Labels: product name, net quantity, manufacturer or distributor, and ingredients in order of weight; states also regulate pet food and feed labels",
            "citations": [
                {"label": "21 CFR part 501", "url": "https://www.ecfr.gov/current/title-21/part-501"},
                {"label": "FDA: Pet Food", "url": "https://www.fda.gov/animal-veterinary/animal-foods-feeds/pet-food"},
            ],
        },
        {
            "id": "fda-bse-feed",
            "agency": "FDA",
            "title": "BSE feed rules: most mammalian protein may not be fed to cattle and other ruminants, and high-risk cattle material may not be used in any animal food",
            "citations": [
                {"label": "21 CFR 589.2000", "url": ecfr(21, "589.2000")},
                {"label": "21 CFR 589.2001", "url": ecfr(21, "589.2001")},
            ],
        },
        {
            "id": "fda-ia-salmonella",
            "agency": "FDA",
            "title": "Import Alert 71-04: food for animals, including pet treats and chews, from listed firms is detained without examination for Salmonella (updated August 31, 2026)",
            "citations": [
                {"label": "FDA Import Alert 71-04", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_217.html"},
            ],
        },
        {
            "id": "fda-ia-melamine",
            "agency": "FDA",
            "title": "Import Alert 99-29: vegetable protein products from China (corn gluten meal, soy meal, rice and wheat gluten and others) are detained without examination for melamine unless the firm is on the green list",
            "citations": [
                {"label": "FDA Import Alert 99-29", "url": "https://www.accessdata.fda.gov/cms_ia/importalert_267.html"},
            ],
        },
        {
            "id": "aphis-pap",
            "agency": "USDA APHIS",
            "title": "Meat and bone meal, fish meal and other processed animal protein, and feed or pet food containing them: BSE restrictions, a foreign veterinary certificate and an APHIS import permit (VS Form 16-3)",
            "citations": [
                {"label": "9 CFR 95.4", "url": ecfr(9, "95.4")},
                {"label": "9 CFR 95.13", "url": ecfr(9, "95.13")},
                {"label": "9 CFR 95.14", "url": ecfr(9, "95.14")},
                {"label": "9 CFR 95.25", "url": ecfr(9, "95.25")},
                {"label": "APHIS: Animal Health Permits", "url": "https://www.aphis.usda.gov/animal-product-import/animal-health-permits"},
            ],
        },
        {
            "id": "aphis-no-permit",
            "agency": "USDA APHIS",
            "title": "No APHIS permit needed for some aquatic-animal material, plain rawhide chews and products whose only animal ingredient is lactose; fish meal and processed animal protein still need one (guidelines updated September 3, 2026)",
            "citations": [
                {
                    "label": "APHIS: Animal Products That Do Not Require an Import Permit",
                    "url": "https://www.aphis.usda.gov/animal-product-import/no-permit-required",
                },
            ],
        },
        {
            "id": "aphis-traveler",
            "agency": "USDA APHIS",
            "title": "Travelers from Canada: pet food, chews and treats in unopened retail packaging, up to 50 lb per vehicle by land or 20 lb per family by air; raw or dried items must be labeled a product of Canada or the U.S.",
            "citations": [
                {
                    "label": "APHIS: Traveling into the U.S. from Canada at land borders",
                    "url": "https://www.aphis.usda.gov/traveling-with-ag-products/traveling-united-states-canada-land-borders",
                },
            ],
        },
        {
            "id": "doc-lysine",
            "agency": "Commerce / CBP",
            "title": "Antidumping and countervailing duties on feed-grade L-lysine from China, including lysine in premixes, base mixes and concentrates (2309.90.70, 2309.90.95), since September 2026",
            "citations": [
                {
                    "label": "91 FR 58627: L-lysine from China, AD and CVD orders (September 16, 2026)",
                    "url": "https://www.federalregister.gov/documents/2026/09/16/2026-18924/l-lysine-from-the-peoples-republic-of-china-antidumping-duty-order-and-countervailing-duty-order",
                },
            ],
        },
        {
            "id": "dairy-trq",
            "agency": "CBP",
            "title": "Milk-based feed: in-quota lines (7.5%) only while the quota under Additional U.S. note 2 is open; otherwise 80.4¢/kg + 6.4%",
            "citations": [
                {"label": "HTSUS Ch. 23, Additional U.S. note 2", "url": HTS23},
                {"label": "CBP: Quotas", "url": "https://www.cbp.gov/trade/quota"},
            ],
        },
    ]

    fda_core = ["fda-registration", "fda-prior-notice", "fda-fsvp", "fda-pcaf", "fda-label"]
    group_rules = {
        "2301": fda_core + ["fda-bse-feed", "aphis-pap", "aphis-no-permit", "fda-ia-salmonella"],
        "2302": fda_core,
        "2303": fda_core + ["fda-ia-melamine"],
        "2304": fda_core + ["fda-ia-melamine"],
        "2305": fda_core,
        "2306": fda_core,
        "2307": fda_core,
        "2308": fda_core,
        "2309": fda_core + ["fda-bse-feed", "aphis-pap", "aphis-no-permit", "fda-ia-salmonella", "aphis-traveler"],
    }
    group_notes = {
        "2301": "Meat meal and greaves are processed animal protein: APHIS BSE rules decide which countries and plants qualify, and an APHIS permit is needed. Fish meal also needs a permit.",
        "2302": "Bran and milling residues are plant products with no APHIS animal-health permit; the FDA animal-food rules apply when they are sold as feed.",
        "2303": "Corn gluten feed and meal, beet pulp and distillers' grains are FDA-regulated feed ingredients. Corn gluten meal from China is on FDA Import Alert 99-29 (melamine).",
        "2304": "Soybean meal is an FDA-regulated feed ingredient. Soy meal from China is on FDA Import Alert 99-29 (melamine).",
        "2305": "Peanut meal is an FDA-regulated feed ingredient.",
        "2306": "Oilcakes and meals are FDA-regulated feed ingredients. Coconut or copra cake (2306.50) from Malaysia, Cambodia, El Salvador, Indonesia, Ecuador and Jordan is on those countries' Section 301 exception lists (U.S. note 52(j)).",
        "2307": "Wine lees are an FDA-regulated feed ingredient when sold for animal use.",
        "2308": "Acorns, screenings, marigold meal and citrus pulp pellets are FDA-regulated when sold as feed.",
        "2309": "Pet food and feed made with meat, poultry, fish or other animal ingredients need APHIS clearance on top of FDA rules; milk-based feed has a tariff-rate quota; lysine premixes from China owe antidumping and countervailing duties.",
    }
    for g in te["groups"]:
        g["ruleIds"] = group_rules[g["heading"]]
        g["note"] = group_notes[g["heading"]]

    for ln in te["lines"]:
        h = ln["hts"]
        rules = list(group_rules[ln["heading"]])
        if h.startswith("2309.90.2") or h.startswith("2309.90.4"):
            rules.append("dairy-trq")
        if h.startswith("2309.90.70") or h.startswith("2309.90.95"):
            rules.append("doc-lysine")
        if h.startswith("2309") and not h.startswith("2309.10") and not h.startswith("2309.90.10.15"):
            rules = [r for r in rules if r != "aphis-traveler"]
        ln["ruleIds"] = rules
        levers = ["usmca"]
        if ln["general"] not in ("Free", None):
            levers.append("fta")
        if h.startswith("2309.90.2") or h.startswith("2309.90.4"):
            levers.append("dairy-quota")
        if h.startswith("2309.90"):
            levers.append("ruling")
        levers.append("drawback")
        ln["leverIds"] = levers

    te["disclaimer"] = (
        "A checklist of where the rules are, with links to the regulations — not legal advice. Animal-health restrictions change "
        "with disease conditions in the country of origin; check APHIS and FDA before each shipment."
    )


if __name__ == "__main__":
    p = sys.argv[1]
    d = json.load(open(p))
    fill_te(d, d["chapter"]["title"])
    json.dump(d, open(p, "w"), ensure_ascii=False, indent=2)
