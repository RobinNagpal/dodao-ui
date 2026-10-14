# AD/CVD orders and investigations reaching Chapter 38 (Federal Register, verified 2026-10-12). Imported by fill38.py.
import os

HERE = os.path.dirname(__file__)
ITC_DOCS = {"2023-12222", "2026-06488", "2014-26472", "2026-06741", "2026-04783", "2026-18586", "2026-07220", "2026-12777", "2026-16469",
            "2026-10550", "2025-09232"}
META = {}
for line in open(os.path.join(HERE, "adcvd", "urls.txt")):
    p = [x.strip() for x in line.split(" | ")]
    if len(p) >= 5:
        META[p[0]] = dict(citation=p[1], published=p[2], url=p[3], title=p[4])

USED = ["2018-08775", "2017-28480", "2023-12827", "2023-12222", "2026-02998", "2026-02999", "2026-06488", "E7-8122", "2023-26296", "2026-07979",
        "2026-10940", "2016-19873", "2022-04122", "2026-15398", "2025-09452", "2025-09453", "2023-03652", "2025-21219", "2026-04767",
        "2026-04944", "2026-04945", "2026-06741", "2026-19378", "2026-19379", "2026-14871", "2026-14870", "2026-10677", "2026-17418",
        "2026-17417", "2026-12963", "2026-12962", "2015-01798", "2015-01795", "2026-02951", "2025-16949", "2026-20030", "2026-20031",
        "2026-15397", "2026-15396", "2026-20692", "2026-12771", "2026-10550"]


def fr_src(doc):
    m = META[doc]
    return dict(id="fr-" + doc, publisher="Federal Register", citation=m["citation"],
                document="Notice (USITC)" if doc in ITC_DOCS else "Notice (Commerce)", title=m["title"], signed=None,
                published=m["published"], url=m["url"])


ADCVD_SOURCES = [fr_src(d) for d in USED]


def ch(id, type, date, label, title, detail, before, now, countries, docs):
    return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries,
                sourceIds=["fr-" + d for d in docs])


ADCVD_CHANGES = [
    ch("adcvd-cbs-cvd", "pending", "2026-10-08", "Published", "CBS rubber accelerator from China: preliminary countervailing duty",
       "Commerce preliminarily found subsidies of 107.57% for the examined Chinese producers of N-cyclohexylbenzothiazole-2-sulfenamide (CBS), which "
       "can also enter under 3812.10.10 and 3812.10.50; cash deposits are required from publication. The antidumping preliminary determination is still to come.",
       None, "107.57% CVD deposit (preliminary)", "China", ["2026-20692"]),
    ch("adcvd-ldge-ad", "pending", "2026-09-30", "Published", "Large-diameter graphite electrodes from China and India: preliminary dumping margins",
       "Commerce preliminarily set antidumping cash deposits of 95.61% for China (China-wide) and 9.88% (Graphite India), 1.15% (HEG) and 3.53% (all others) "
       "for India, on top of the July 30, 2026 preliminary countervailing duties (China 103.49%, India 5.87% all others). The scope lists 3801.10.50.90 and "
       "3801.90.00.50 as well as the electrode lines of Chapter 85.",
       None, "AD + CVD deposits (preliminary)", "China, India", ["2026-20030", "2026-20031", "2026-15397", "2026-15396"]),
    ch("adcvd-fatty-ad", "pending", "2026-09-22", "Published", "Fatty acids from Indonesia and Malaysia: preliminary dumping margins",
       "Commerce preliminarily found dumping of certain fatty acids (stearic, oleic and other fatty acids of 3823.11, 3823.12, 3823.19.20 and 3823.19.40, "
       "which may also enter under 3824.99.41.90). Cash deposits: Indonesia 22.96% (Musim Mas), 12.31% (Wilmar Nabati), 19.49% (all others), with critical "
       "circumstances found for all others; Malaysia 4.46% (Evyap), 7.06% (Palm-Oleo), 5.22% (all others). They come on top of the July 23 preliminary "
       "countervailing duties. Final determinations are due in early 2027.",
       None, "AD + CVD deposits (preliminary)", "Indonesia, Malaysia", ["2026-19378", "2026-19379", "2026-04944", "2026-06741"]),
    ch("adcvd-citric-ad", "pending", "2026-08-26", "Published", "Citric acid from Canada and India: preliminary determinations",
       "Commerce preliminarily found dumping by Indian exporters (98.22% all others; Daffodil Pharmachem 149.74%) but none by Jungbunzlauer Canada (0.00%). "
       "Preliminary countervailing duties of 16.50% (Canada) and 63.88% (India) have applied since June 26, 2026. Citric acid itself is Chapter 29; the order "
       "scope also reaches blends classified in 3824.99.93.",
       None, "CVD deposits; AD deposit for India (preliminary)", "Canada, India", ["2026-17418", "2026-17417", "2026-12963", "2026-12962"]),
    ch("adcvd-hfc-ar", "reference", "2026-07-30", "Published", "HFC blends from China: antidumping rate for Sanmei set at 182.61%",
       "Final results of the 2023–2024 administrative review of the 2016 antidumping order on HFC refrigerant blends from China (R-404A, R-407A, R-407C, "
       "R-410A and R-507A): 182.61% for Zhejiang Sanmei and related companies. Other Chinese exporters pay the China-wide rate of 216.37%. The order, "
       "continued in 2022, still cites the pre-2022 numbers 3824.78.0020 and 3824.78.0050; these blends are now classified in heading 3827.",
       None, "182.61% (Sanmei); 216.37% China-wide", "China", ["2026-15398", "2016-19873", "2022-04122"]),
    ch("adcvd-fatty-cvd", "pending", "2026-07-23", "Published", "Fatty acids from Indonesia and Malaysia: preliminary countervailing duties",
       "Commerce preliminarily found countervailable subsidies of 16.48% (Indonesia, all others; Musim Mas 16.47%) and 4.32% (Malaysia, all others) on "
       "certain fatty acids, after the ITC found a reasonable indication of injury in April 2026. Cash deposits apply from publication.",
       None, "16.48% / 4.32% CVD deposit (preliminary)", "Indonesia, Malaysia", ["2026-14871", "2026-14870", "2026-04945", "2026-06741"]),
    ch("adcvd-mdi", "reference", "2026-06-25", "Published", "MDI from China: antidumping order",
       "Antidumping order on methylene diphenyl diisocyanate (MDI) from China, at 87.25% for the examined Wanhua and Covestro companies and 161.61% China-wide. "
       "MDI is classified mainly in Chapters 29 and 39, but the scope says it may also enter under 3824.99.26 and 3824.99.29.",
       None, "Order in force", "China", ["2026-12771", "2026-10550"]),
    ch("adcvd-ac-ar", "reference", "2026-06-02", "Published", "Activated carbon from China: amended review results",
       "Commerce amended the 2023–2024 review of the 2007 antidumping order on activated carbon from China (3802.10): $0.00/kg for Datong Juqiang, $0.04/kg for "
       "Ningxia Huahui and the non-examined separate-rate companies. Other Chinese exporters pay the China-wide rate of $2.42/kg. The order was continued in November 2023.",
       None, "$0.00–$0.04/kg; $2.42/kg China-wide", "China", ["2026-10940", "2026-07979", "2023-26296"]),
    ch("adcvd-citric-cn", "reference", "2026-05-29", "Published", "Citric acid from China: orders continued",
       "After the third sunset reviews, the 2009 antidumping and countervailing duty orders on citric acid and certain citrate salts from China were "
       "continued. The scope covers citric acid blends that enter under Chapter 38.",
       None, None, "China", ["2026-10677"]),
    ch("adcvd-aam", "reference", "2026-04-03", "Published", "No duties on active anode material (graphite) from China",
       "Commerce had found dumping (93.50% for the listed exporters, 102.72% China-wide) and subsidies (66.86% all others) on active anode material — the graphite "
       "of 3801.10.50 and 3801.90.00 used in lithium-ion battery anodes — but the ITC determined that U.S. industry was not materially retarded, so no "
       "antidumping or countervailing duty orders were issued. Chinese anode material still pays the Section 301 duties (base + 37.5%).",
       "AD/CVD investigation", "No order", "China", ["2026-06488", "2026-02998", "2026-02999"]),
    ch("adcvd-chloriso", "reference", "2026-03-11", "Published", "Chlorinated isocyanurates from China: review results",
       "Final results of the 2023–2024 review of the antidumping order on chlorinated isocyanurates (pool and spa sanitizers that can enter under 3808.94.50): "
       "39.87% (Heze Huayi), 30.24% (Juancheng Kangtai), 285.63% China-wide. The China and Spain antidumping orders were continued in 2023 and the China "
       "countervailing duty order in November 2025.",
       None, "Orders in force", "China, Spain", ["2026-04767", "2023-03652", "2025-21219"]),
    ch("adcvd-calhypo", "reference", "2026-02-13", "Published", "Calcium hypochlorite from China: orders continued",
       "Commerce and the ITC continued the 2015 antidumping and countervailing duty orders on calcium hypochlorite from China; tableted or blended product "
       "can enter under 3808.94.50 or 3808.99.95. The rates in the orders are 210.52% (antidumping, China-wide) and 65.85% (countervailing).",
       None, "Orders in force", "China", ["2026-02951", "2015-01798", "2015-01795"]),
    ch("adcvd-sdge", "reference", "2025-09-04", "Published", "Small-diameter graphite electrodes from China: order continued",
       "The 2009 antidumping order on small-diameter graphite electrodes from China was continued; its scope also covers graphite pin joining systems "
       "classified in 3801.10.",
       None, "Order in force", "China", ["2025-16949"]),
    ch("adcvd-24d", "reference", "2025-05-27", "Published", "2,4-D herbicide from China and India: antidumping and countervailing duty orders",
       "Orders on 2,4-dichlorophenoxyacetic acid, including formulations that enter under 3808.93.05 and 3808.93.15. Antidumping cash deposits: China-wide "
       "126.58%; India 20.62% (Atul), 3.18% (Meghmani), 11.90% (all others). Countervailing: China 26.50% (all others; Shandong Rainbow 169.63%), India "
       "5.88% (all others).",
       None, "Orders in force", "China, India", ["2025-09452", "2025-09453"]),
    ch("adcvd-biodiesel-cont", "reference", "2023-06-15", "Published", "Biodiesel from Argentina and Indonesia: orders continued",
       "After the first sunset reviews (ITC affirmative, June 8, 2023), Commerce continued the antidumping and countervailing duty orders on biodiesel "
       "from Argentina and Indonesia (3826.00.10 and 3826.00.30). CBP keeps collecting cash deposits at the rates in effect.",
       None, "Orders in force", "Argentina, Indonesia", ["2023-12827", "2023-12222"]),
    ch("adcvd-biodiesel", "reference", "2018-04-26", "Published", "Biodiesel from Argentina and Indonesia: antidumping and countervailing duty orders",
       "Antidumping order (April 26, 2018) and countervailing duty order (January 4, 2018). Rates set in the orders for all other exporters: Argentina 74.63% "
       "antidumping (after subsidy offset) plus 71.87% countervailing; Indonesia 92.52% antidumping plus 38.95% countervailing.",
       None, "AD + CVD orders", "Argentina, Indonesia", ["2018-08775", "2017-28480"]),
]


def u(doc):
    return META[doc]["url"]


def c(label, doc):
    return {"label": label, "url": u(doc)}


ADCVD_RULES = [
    {"id": "adcvd-biodiesel", "agency": "Commerce (ITA) / CBP",
     "title": "Biodiesel from Argentina and Indonesia: antidumping and countervailing duty cash deposits (orders since 2018, continued 2023; not in the tariff calculator)",
     "citations": [c("83 FR 18278 (AD orders)", "2018-08775"), c("83 FR 522 (CVD orders)", "2017-28480"), c("88 FR 39223 (continued)", "2023-12827")]},
    {"id": "adcvd-activated-carbon", "agency": "Commerce (ITA) / CBP",
     "title": "Activated carbon from China: antidumping duty per kilogram ($2.42/kg China-wide; not in the tariff calculator)",
     "citations": [c("72 FR 20988 (order)", "E7-8122"), c("91 FR 32935 (current rates)", "2026-10940")]},
    {"id": "adcvd-hfc", "agency": "Commerce (ITA) / CBP",
     "title": "HFC blends R-404A, R-407A, R-407C, R-410A and R-507A from China: antidumping duty (216.37% China-wide; not in the tariff calculator)",
     "citations": [c("81 FR 55436 (order and scope)", "2016-19873"), c("91 FR 48079 (current rates)", "2026-15398")]},
    {"id": "adcvd-pesticides", "agency": "Commerce (ITA) / CBP",
     "title": "2,4-D formulations (China, India), chlorinated isocyanurates (China, Spain) and calcium hypochlorite (China): antidumping and countervailing duties (not in the tariff calculator)",
     "citations": [c("90 FR 22243 (2,4-D AD orders)", "2025-09452"), c("90 FR 22232 (2,4-D CVD orders)", "2025-09453"),
                   c("88 FR 10871 (chlorinated isocyanurates continued)", "2023-03652"), c("91 FR 6818 (calcium hypochlorite continued)", "2026-02951")]},
    {"id": "adcvd-fatty-acids", "agency": "Commerce (ITA) / CBP",
     "title": "Fatty acids from Indonesia and Malaysia: preliminary antidumping and countervailing duty cash deposits since July–September 2026 (not in the tariff calculator)",
     "citations": [c("91 FR 60096 (Indonesia AD prelim)", "2026-19378"), c("91 FR 60092 (Malaysia AD prelim)", "2026-19379"),
                   c("91 FR 46409 (Indonesia CVD prelim)", "2026-14871"), c("91 FR 46401 (Malaysia CVD prelim)", "2026-14870")]},
    {"id": "adcvd-graphite", "agency": "Commerce (ITA) / CBP",
     "title": "Graphite electrodes from China (order) and large-diameter electrodes from China and India (preliminary): AD/CVD can reach 3801 goods; no order on active anode material (not in the tariff calculator)",
     "citations": [c("90 FR 42738 (small-diameter electrodes continued)", "2025-16949"), c("91 FR 61828 (large-diameter, China AD prelim)", "2026-20030"),
                   c("91 FR 16968 (ITC: anode material negative)", "2026-06488")]},
    {"id": "adcvd-3824", "agency": "Commerce (ITA) / CBP",
     "title": "Orders whose scope reaches 3824.99 blends and preparations — citric acid (China; preliminary for Canada and India) and MDI (China), among others: check the scope (not in the tariff calculator)",
     "citations": [c("91 FR 32004 (citric acid, China, continued)", "2026-10677"), c("91 FR 38666 (citric acid, Canada CVD prelim)", "2026-12962"),
                   c("91 FR 38393 (MDI order)", "2026-12771")]},
    {"id": "adcvd-rubber-chem", "agency": "Commerce (ITA) / CBP",
     "title": "CBS rubber accelerator from China (preliminary CVD, 3812.10): cash deposits (not in the tariff calculator)",
     "citations": [c("91 FR 64337 (CBS CVD prelim)", "2026-20692")]},
]


def ADCVD_LINE_RULES(hts):
    r = []
    if hts.startswith("3826"):
        r.append("adcvd-biodiesel")
    if hts.startswith("3802.10"):
        r.append("adcvd-activated-carbon")
    if hts[:7] in {"3827.61", "3827.62", "3827.63", "3827.64", "3827.65", "3827.68", "3827.69"}:
        r.append("adcvd-hfc")
    if hts[:10] in {"3808.93.05", "3808.93.15", "3808.94.50", "3808.99.95"}:
        r.append("adcvd-pesticides")
    if hts[:10] in {"3823.11.00", "3823.12.00", "3823.19.20", "3823.19.40"} or hts.startswith("3824.99.41.90"):
        r.append("adcvd-fatty-acids")
    if hts.startswith("3801.10") or hts.startswith("3801.90"):
        r.append("adcvd-graphite")
    if hts[:10] in {"3824.99.26", "3824.99.29", "3824.99.93"}:
        r.append("adcvd-3824")
    if hts.startswith("3812.10"):
        r.append("adcvd-rubber-chem")
    return r


ADCVD_TEXT = {
    "leverAppliesTo": "Biodiesel (Argentina, Indonesia), activated carbon, HFC blends, 2,4-D, pool chlorine and graphite electrodes (China and others), fatty acids (Indonesia, Malaysia, preliminary) and the 3824.99 preparations named in the orders",
    "leverCitations": [c("83 FR 18278 (biodiesel AD orders)", "2018-08775"), c("81 FR 55436 (HFC blends order)", "2016-19873")],
    "groupNotes": {
        "3801": "Graphite electrode orders (small-diameter, China) and the 2026 large-diameter investigation (China, India) list 3801 numbers; the ITC rejected duties on Chinese active anode material in April 2026.",
        "3802": "Activated carbon from China is under an antidumping order since 2007 ($2.42/kg China-wide).",
        "3808": "2,4-D (China, India), chlorinated isocyanurates (China, Spain) and calcium hypochlorite (China) carry AD/CVD orders whose scopes reach 3808 formulations.",
        "3812": "CBS rubber accelerator from China is under a preliminary countervailing duty (October 2026).",
        "3823": "Fatty acids from Indonesia and Malaysia have paid preliminary AD/CVD cash deposits since July–September 2026.",
        "3824": "Several orders (citric acid, MDI and others) say the subject product may enter under 3824.99; the order's scope, not the HTS number, decides.",
        "3826": "Biodiesel from Argentina and Indonesia is under antidumping and countervailing duty orders (2018, continued 2023).",
        "3827": "HFC blends R-404A, R-407A, R-407C, R-410A and R-507A from China are under a 2016 antidumping order.",
    },
    "groupRules": {
        "3801": ["adcvd-graphite"], "3802": ["adcvd-activated-carbon"], "3808": ["adcvd-pesticides"], "3812": ["adcvd-rubber-chem"],
        "3823": ["adcvd-fatty-acids"], "3824": ["adcvd-3824", "adcvd-fatty-acids"], "3826": ["adcvd-biodiesel"], "3827": ["adcvd-hfc"],
    },
}
