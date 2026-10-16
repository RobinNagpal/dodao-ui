"""Antidumping / countervailing duty orders on HTS Chapter 28 chemicals (not modeled by the tariff calculator).

Every order below appears in one of Commerce's monthly "Opportunity To Request Administrative Review" notices of November 2025 – October 2026
(the latest: 91 FR 62695, October 2, 2026), so it is in force. Metadata from the Federal Register API (adcvd_docs.json).
"""
import json
import os

DOCS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "adcvd_docs.json")))


def fr(doc, document="Notice (Commerce)"):
    m = DOCS[doc]
    if m["agency"].startswith("International Trade"):
        document = "Notice (USITC)"
    return dict(id=f"fr-{doc}", publisher="Federal Register", citation=m["citation"], document=document, title=m["title"], signed=None,
                published=m["published"], url=m["url"])


AD_SOURCES = [fr(d) for d in [
    "2026-20269", "2026-17050", "2026-17049", "2026-07465", "2026-07466", "2026-06792", "2026-18790", "2026-00741", "2023-26237",
    "2023-07625", "2021-26658", "2025-02543", "2025-03291", "2023-03934", "2022-24021", "2022-18054", "2026-02951", "2025-02866",
    "2026-03878", "2024-23442", "2026-20378", "2026-20379", "2025-13552", "2025-18882", "2025-06447", "2024-25613", "2025-19409",
    "2026-20695", "2026-20696", "2026-20697", "2026-07875",
]]


def u(doc):
    return DOCS[doc]["url"]


def ch(id, type, date, label, title, detail, before, now, countries, ids):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)


AD_SUMMARY = (
    "Antidumping or countervailing duty orders cover **silicon metal** from China, Russia, Angola, Laos, Australia, Norway, Bosnia and Herzegovina, Iceland, "
    "Malaysia and Kazakhstan (new orders on four of them in 2026), **potassium permanganate**, **sodium nitrite**, calcium hypochlorite, persulfates, "
    "electrolytic manganese dioxide and several phosphates from China, and **uranium from Russia** is under a suspension agreement."
)

AD_CHANGES = [
    ch("ad-cro3", "pending", "2026-10-08", "Published", "Chromium trioxide from India and Türkiye: Commerce final determinations",
       "Commerce found dumping by Indian (14.44%) and Turkish (40.88%) exporters and subsidies in India (29.35%) on chromium trioxide (2819.10). The ITC's final injury vote is pending; there is no order yet.",
       None, "Pending ITC vote", "India, Türkiye", ["fr-2026-20695", "fr-2026-20696", "fr-2026-20697"]),
    ch("ad-kpo4-sunset", "reference", "2026-10-05", "Published", "Potassium phosphate salts from China: orders likely to continue",
       "In the third sunset review Commerce found that revoking the 2010 antidumping and countervailing duty orders on potassium phosphate salts from China (2835.24, 2835.39.10) would likely lead to dumping of up to 95.40% and a subsidy rate of 109.11%. The ITC's review is still open; the orders stay in force meanwhile.",
       None, None, "China", ["fr-2026-20378", "fr-2026-20379"]),
    ch("ad-si-continued", "reference", "2026-09-15", "Published", "Silicon metal orders on Bosnia, Iceland, Malaysia and Kazakhstan continued",
       "After the first five-year review, Commerce continued the 2021 antidumping orders on silicon metal from Bosnia and Herzegovina, Iceland and Malaysia and the countervailing duty order on Kazakhstan.",
       None, None, "Bosnia and Herzegovina, Iceland, Malaysia, Kazakhstan", ["fr-2026-18790"]),
    ch("ad-si-au-no", "extraDuty", "2026-08-21", "Published", "New antidumping and countervailing duties on silicon metal from Australia and Norway",
       "Commerce issued AD and CVD orders on silicon metal (2804.69.10, 2804.69.50) from Australia and Norway. Cash deposits for all other exporters: Australia 6.16% AD + 32.57% CVD; Norway 2.47% AD + 17.27% CVD. Polysilicon (2804.61) is outside the scope.",
       None, "AD + CVD cash deposits", "Australia, Norway", ["fr-2026-17050", "fr-2026-17049"]),
    ch("ad-lipf6", "reference", "2026-04-23", "Published", "No case on lithium hexafluorophosphate from China",
       "The antidumping and countervailing duty petitions on lithium hexafluorophosphate from China (2826.90.90) were withdrawn on April 14, 2026, before Commerce initiated, and the ITC discontinued its investigations.",
       None, None, "China", ["fr-2026-07875"]),
    ch("ad-si-ao-la", "extraDuty", "2026-04-16", "Published", "New antidumping and countervailing duties on silicon metal from Angola and Laos",
       "Commerce issued AD orders on silicon metal from Angola (68.45% for all other exporters) and Laos (94.44%) and a CVD order on Laos (69.10%). The ITC found imports from Thailand negligible, so there is no order on Thailand.",
       None, "AD + CVD cash deposits", "Angola, Laos", ["fr-2026-07465", "fr-2026-07466", "fr-2026-06792"]),
    ch("ad-si-ru", "reference", "2026-01-15", "Published", "Antidumping order on Russian silicon metal continued",
       "Commerce continued the 2003 antidumping order on silicon metal from Russia after the fourth five-year review. The order on silicon metal from China (1991) was continued in November 2023.",
       None, None, "Russia, China", ["fr-2026-00741", "fr-2023-26237"]),
    ch("ad-bac03-revoked", "reference", "2025-10-03", "Published", "Antidumping order on barium carbonate from China revoked",
       "Commerce revoked the 2003 antidumping order on barium carbonate from China (2836.60) at its sunset review, effective August 20, 2025, because no domestic party took part. A year earlier (November 5, 2024) the orders on barium chloride from China and India (2827.39.45) were revoked at the petitioner's request.",
       "Antidumping order", "None", "China, India", ["fr-2025-19409", "fr-2024-25613"]),
    ch("ad-solgel", "extraDuty", "2025-09-29", "Published", "Antidumping and countervailing duties on sol gel alumina abrasive grains from China",
       "Commerce issued AD (China-wide 88.32%) and CVD (165.05% for all others) orders on sol gel alumina-based ceramic abrasive grains from China, entered mainly under 2818.10.20 and also under 2818.20 and 2818.30.",
       None, "AD + CVD cash deposits", "China", ["fr-2025-18882"]),
]


AD_RULE_LIST = [
    ("ad-silicon", "Silicon metal (2804.69.10, 2804.69.50) from China, Russia, Angola, Laos, Australia, Norway, Bosnia and Herzegovina, Iceland, Malaysia (antidumping) and Kazakhstan, Laos, Australia, Norway (countervailing): cash deposit at entry; polysilicon (2804.61) is excluded",
     ["2026-17050", "2026-17049", "2026-07465", "2026-07466", "2026-18790", "2026-00741", "2023-26237"], ["2804.69"]),
    ("ad-uranium-ru", "Uranium from Russia (2844.10, 2844.20): Commerce suspension agreement on the antidumping investigation, continued in 2023 (export limits instead of a duty), on top of the statutory import ban",
     ["2023-07625", "2026-20269"], ["2844.10", "2844.20"]),
    ("ad-kmno4", "Potassium permanganate (2841.61) from China: antidumping order since 1984",
     ["2021-26658"], ["2841.61"]),
    ("ad-nano2", "Sodium nitrite (2834.10.10) from China (AD + CVD), Germany (AD), India (AD + CVD) and Russia (AD + CVD)",
     ["2025-02543", "2025-03291", "2023-03934", "2022-24021", "2022-18054"], ["2834.10.10"]),
    ("ad-china-chem", "Calcium hypochlorite (2828.10, AD + CVD), persulfates (2833.40), electrolytic manganese dioxide (2820.10), sodium hexametaphosphate (2835.39.50) and potassium phosphate salts (2835.24, 2835.39.10, AD + CVD) from China",
     ["2026-02951", "2025-02866", "2026-03878", "2024-23442", "2026-20378", "2026-20379"], ["2828.10", "2833.40", "2820.10", "2835.39.50", "2835.24", "2835.39.10"]),
    ("ad-alumina", "Refined brown aluminum oxide (2818.10.20) and sol gel alumina abrasive grains (2818.10.20, also 2818.20 and 2818.30) from China; strontium chromate (2841.50.91) from Austria and France",
     ["2025-13552", "2025-18882", "2025-06447"], ["2818.10.20", "2841.50.91"]),
]
AD_RULES = [
    {
        "id": rid,
        "agency": "Commerce (ITA) / CBP",
        "title": title + " (not in the tariff calculator)",
        "citations": [{"label": f"{DOCS[doc]['citation']} ({DOCS[doc]['published']})", "url": u(doc)} for doc in docs],
        "_hts": hts,
    }
    for rid, title, docs, hts in AD_RULE_LIST
]

# heading -> (sentence for blurbs / engineering notes, extra rule ids)
AD_GROUP_NOTES = {
    "2804": ("Silicon metal (2804.69) from ten countries is under antidumping or countervailing duty orders; polysilicon is not.", ["ad-silicon"]),
    "2818": ("Refined brown aluminum oxide and sol gel alumina abrasive grains from China are under antidumping orders.", ["ad-alumina"]),
    "2820": ("Electrolytic manganese dioxide from China is under an antidumping order.", ["ad-china-chem"]),
    "2828": ("Calcium hypochlorite from China is under antidumping and countervailing duty orders.", ["ad-china-chem"]),
    "2833": ("Persulfates from China are under an antidumping order.", ["ad-china-chem"]),
    "2834": ("Sodium nitrite from China, Germany, India and Russia is under antidumping (and, except Germany, countervailing) duty orders.", ["ad-nano2"]),
    "2835": ("Sodium hexametaphosphate and potassium phosphate salts from China are under antidumping (and countervailing) duty orders.", ["ad-china-chem"]),
    "2841": ("Potassium permanganate from China and strontium chromate from Austria and France are under antidumping orders.", ["ad-kmno4", "ad-alumina"]),
    "2844": ("Uranium from Russia is under a Commerce suspension agreement and a statutory import ban.", ["ad-uranium-ru"]),
}

AD_LEVER = {
    "id": "ad-scope",
    "title": "Check the scope of antidumping and countervailing duty orders",
    "saves": "The AD/CVD cash deposit — 2% to over 200% of value — when the product or its producer is outside the order or has its own lower rate",
    "appliesTo": "Silicon metal, potassium permanganate, sodium nitrite, calcium hypochlorite, persulfates, electrolytic manganese dioxide, certain phosphates and alumina abrasives from the countries named in each order",
    "document": "The order's written scope decides, not the HTS number: for example polysilicon of 99.99% silicon or more (2804.61) is excluded from every silicon metal order. Producers with their own reviewed rate pay that rate instead of the all-others rate. When unsure, request a scope ruling from Commerce.",
    "caveat": "Goods inside the scope pay the cash deposit even if entered under another HTS line, and the final duty can be set higher in an administrative review. AD/CVD duties are not refundable as drawback.",
    "citations": [
        {"label": "19 CFR 351.225 (scope rulings)", "url": "https://www.ecfr.gov/current/title-19/section-351.225"},
        {"label": f"{DOCS['2026-20269']['citation']} (orders in force, October 2026 list)", "url": u("2026-20269")},
    ],
}
