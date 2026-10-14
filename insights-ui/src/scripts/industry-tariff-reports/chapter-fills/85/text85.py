"""Tariff updates, rates by country, import rules and FAQ text for Chapter 85 (called from fill85.py)."""
from sets85 import cov
from trade85 import apply_trade

ECFR_AS_OF = "2026-10-08"
E = "https://www.ecfr.gov/current"
HTS99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"


def fill_rest(d, S, N, EXTRA, CH99, cell_total, ASOF):
    tu = d["tariffUpdates"]
    src = {x["id"]: x for x in tu["sources"]}
    for x in EXTRA:
        src[x["id"]] = x
    src["hts-chapter-99"]["url"] = CH99

    def need(*ids):
        for i in ids:
            assert i in src, i

    # -------------------------------------------------------------- tariffUpdates
    tu["h1"] = "HTS Chapter 85: Electrical Machinery & Electronics — Tariff Updates"
    tu["seo"] = {
        "title": "Electronics & Semiconductor Tariff Updates 2025–2026: Section 301, Section 232, Solar, Batteries (HTS Ch. 85) | KoalaGains",
        "shortDescription": "Every U.S. tariff change on HTS Chapter 85 goods with official citations: China Section 301 at 50% on chips and solar cells, "
        "25% on lithium-ion batteries and magnets, the 2026 Section 301 actions, Section 232 auto parts and metals, Canada's Section 338 duty, "
        "the end of the IEEPA tariffs and the solar safeguard, and the solar AD/CVD orders.",
        "keywords": [
            "tariff updates",
            "electrical components tariffs",
            "semiconductor tariffs",
            "lithium-ion battery tariffs",
            "Section 301 tariffs",
            "solar panel tariffs 2026",
            "section 232 semiconductors",
            "tariffs on electronics 2026",
            "electronics tariff exemption",
            "USMCA tariffs",
        ],
    }
    tu["intro"] = (
        "This page compares two editions of the tariff schedule, the **2025 Basic Edition** (in force January 1, 2025) and the current **2026 Revision 21** "
        "(in force October 9, 2026), and lists every extra duty that reaches Chapter 85 today. Base rates did not move: the only changes are 21 new "
        "statistical lines (EV traction motors, power supplies, lithium-ion and lead-acid batteries, semiconductor devices, chips) at unchanged rates.\n\n"
        "The extra duties changed a lot. In 2025 the IEEPA duties hit Chapter 85 goods from Canada, Mexico and China, and the reciprocal tariff hit most "
        "other countries, but smartphones, computers and monitors, display modules, semiconductors and chips were exempted from the reciprocal tariff (memorandum of April 11, 2025, retroactive to April 5). "
        "The IEEPA duties ended on **February 24, 2026**, and the Section 122 surcharge that replaced them expired on **July 23, 2026**. What applies now: "
        "China's Section 301 duties (50% on chips and solar cells since 2024–2025, 25% on lithium-ion batteries and permanent magnets since January 1, 2026), "
        "the **2026 Section 301 actions** on 60 economies (from July 24, 2026; electronics exemptions in note 52(b)), the Brazil Section 301 duty, "
        "**Section 232** on auto parts (from May 3, 2025), truck and bus parts (November 1, 2025), metal-heavy goods on the full value (April 6, 2026) "
        "and drone docking stations (September 3, 2026), and Canada's **Section 338** duty (August 22, 2026). The Section 201 solar safeguard ended "
        "on February 6, 2026; a Section 232 duty on solar cells and modules begins December 4, 2026.\n\n"
        "Antidumping and countervailing duty orders cover solar cells and modules, aluminum wire and cable, large power transformers and small-diameter "
        "graphite electrodes. They are company-specific, listed below for reference, and **not included in the tariff calculator**."
    )
    tu["scope"] = (
        "Chapter 99 measures that reach Chapter 85 from any country: China Section 301 (notes 20 and 31), the 2026 Section 301 actions on 60 economies and Brazil "
        "(notes 50 and 52), Section 232 automobile parts (note 33), medium- and heavy-duty vehicle parts (note 38), metals (note 16), aluminum from Russia "
        "(note 19) and unmanned aircraft systems (note 43), Canada Section 338 (note 51), Russia's rates in lieu of column 2 (note 30), the scheduled "
        "Nicaragua Section 301 duty (note 29), and the ended IEEPA, Section 122 and Section 201 (solar, note 18) duties. The Section 232 semiconductor duty "
        "(note 39) is covered because people ask about it, though no Chapter 85 line is in it. AD/CVD orders are listed for reference. For the rate each "
        "supplier pays, see Rates by country."
    )
    tu["stats"] = [
        {"label": "Base rates unchanged", "value": "961 of 982 lines", "note": "21 new statistical lines, same rates"},
        {"label": "China: chips and solar cells", "value": "50%", "note": "Section 301, note 31; solar cells also +12.5%"},
        {"label": "2026 Section 301", "value": f"{N['s301_26']} lines", "note": f"{N['ex52b']} electronics lines exempt (note 52(b))"},
        {"label": "Section 232 auto parts", "value": f"{N['auto']} lines", "note": "25%; 15% total for EU, Japan, Korea, Taiwan"},
    ]

    S301_SRC = ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99", "hts-now"]
    CN_SRC = ["fr-2018-13248", "fr-2018-17709", "fr-2018-20610", "fr-2019-09681", "fr-2019-17865", "fr-2020-00904", "fr-2024-21217", "fr-2024-29462",
              "fr-2025-23912", "fr-2025-21671", "fr-2026-20510", "fr-2026-15181", "hts-chapter-99", "hts-now"]
    AUTO_SRC = ["procl-10908", "procl-10925", "csms-64916652", "cbp-section-232-additional-faqs-autos", "fr-2025-12060", "fr-2025-17908", "fr-2025-18660",
                "fr-2025-21940", "fr-2026-10571", "hts-chapter-99", "hts-now"]
    MET_SRC = ["procl-11021", "procl-11032", "fr-2026-08297", "csms-68253075", "procl-10962", "hts-chapter-99", "hts-now"]
    need(*S301_SRC, *CN_SRC, *AUTO_SRC, *MET_SRC)
    tu["inEffect"] = [
        {
            "id": "cn-section-301",
            "country": "China",
            "measure": "Section 301: Lists 1–4A (note 20), the 2024 review increases (note 31) and the 2026 action",
            "ch99Code": "9903.88.01–9903.88.15 / 9903.91.01–9903.91.06 / 9903.05.31",
            "before": "+25% (Lists 1–3) or +7.5% (List 4A); +50% on solar cells; 25% on chips (List 1)",
            "now": "+25% or +7.5% (lists); +50% chips, semiconductors and solar cells; +25% lithium-ion batteries and permanent magnets; plus +12.5% on most lines",
            "exemption": f"Lists 1–3 (25%) and 4A (7.5%) together cover {N['china_any'] - N['n31f'] - N['n31c'] - N['n31g'] - N['n31b']} lines; note 31 moved semiconductors and chips "
            f"(8541 except solar, 8542: {N['n31f']} lines) to 50% (9903.91.05) on January 1, 2025, solar cells and modules (8541.42/.43) to 50% (9903.91.02) on "
            "September 27, 2024, lead-acid battery parts (8507.90.40) to 25% (9903.91.01), and lithium-ion batteries (8507.60) and permanent magnets "
            "(8505.11) to 25% (9903.91.06) on January 1, 2026. "
            f"{len(S['all']) - N['china_any']} lines are on no China list, including smartphones (8517.13), many appliances and audio players. The 12.5% 2026 duty "
            f"(9903.05.31) applies on top except to the {N['ex52b']} note 52(b) lines (chips, semiconductors other than solar cells, smartphones, SSDs, display modules, "
            "monitors, NdFeB magnets) and to Section 232 goods (note 52(f)). USTR extended 178 exclusions (9903.88.69) through November 9, 2026; "
            f"{N['excl']} Chapter 85 lines have one, for the products described. USTR confirmed on October 7, 2026 that the 2018 actions continue.",
            "whatItMeans": "Chinese chips and solar cells pay 50% or 62.5%; Chinese lithium-ion batteries 40.9% (53.4% as EV parts); most other Chinese electrical "
            "goods 20% to 41%; Chinese smartphones nothing.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": CN_SRC,
        },
        {
            "id": "s301-2026",
            "country": "60 Section 301 economies (Mexico, Canada, Vietnam, Taiwan, Korea, Japan, Malaysia, Thailand, EU, India, UK and others)",
            "measure": "Section 301 (2026 actions on 60 economies)",
            "ch99Code": "9903.05.20–9903.05.84",
            "before": "None",
            "now": "+10% or +12.5%; the EU, Japan, Korea and Taiwan pay 10% to 15% in place of the base rate when the base rate is lower",
            "exemption": f"Reaches {N['s301_26']} of 982 lines. Exempt (note 52(b), 9903.05.86): smartphones (8517.13), switching and routing apparatus (8517.62), SSDs (8523.51), "
            "display modules (8524), computer monitors (8528.52), diodes, transistors, LEDs and other semiconductor devices (8541 except solar cells 8541.42/.43 "
            f"and crystals 8541.60), chips (8542), sintered NdFeB magnets (8505.11.00.70) and one e-waste line: {N['ex52b']} lines. Also exempt: recorded "
            f"informational materials ({N['info']} media lines, 9903.05.92), civil aircraft articles (note 52(d)), Section 232 metals, auto and truck parts "
            "(note 52(f)), and USMCA-qualifying goods of Canada (9903.05.93) and Mexico (9903.05.94). No Chapter 85 line is on the country exception lists "
            "of note 52(j) or the pharmaceutical list of note 52(e).",
            "whatItMeans": "A Vietnamese TV pays 12.5% more, a Mexican non-USMCA power supply 10% more; Taiwanese and Malaysian chips and Indian smartphones pay nothing.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": S301_SRC,
        },
        {
            "id": "br-section-301",
            "country": "Brazil",
            "measure": "Section 301 (Brazil)",
            "ch99Code": "9903.05.01",
            "before": "None",
            "now": "+25% (plus 12.5% under 9903.05.27)",
            "exemption": "Same product exemptions as the 2026 duty: the note 50(a)(ii) list (9903.05.03) covers the same 73 electronics lines, and informational "
            "materials, civil aircraft and Section 232 goods are excluded (9903.05.09, 9903.05.05, 9903.05.07).",
            "whatItMeans": "Brazilian electrical goods outside the exemptions pay 37.5% on top of the base rate.",
            "effectiveFrom": "2026-07-22",
            "effectiveSourceId": "fr-2026-14542",
            "sourceIds": ["fr-2026-14542", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s232-auto-parts",
            "country": "All countries (Canada and Mexico: USMCA parts exempt)",
            "measure": "Section 232 automobile parts (note 33(g) list)",
            "ch99Code": "9903.94.05 (EU 9903.94.53, Japan .43, Korea .63, Taiwan .67, UK .32)",
            "before": "None",
            "now": "+25%; 15% in total for the EU, Japan, Korea and Taiwan; 10% in total for UK parts on the note 33(j) list",
            "exemption": f"Covers {N['auto']} lines: motors of 8501.32–8501.52, lead-acid (8507.10) and lithium-ion (8507.60) batteries and parts, ignition and starting "
            "equipment (8511), vehicle lighting and wipers (8512), car audio (8519.81.20, 8527.21, 8527.29), cameras of 8525.60.10.10, ignition wiring sets (8544.30), "
            "8536.41.00.05 relays, 8537.10/.20 boards and 8539.10 sealed-beam lamps. Charged only on parts of passenger vehicles and light trucks: listed goods "
            "that are not such parts enter under 9903.94.06 with no duty, as do USMCA-qualifying parts (note 33(h); CSMS # 64916652). It replaces the 2026 "
            "Section 301 and Brazil duties (note 52(f)(3)) but not China's Section 301 duties. No drawback.",
            "whatItMeans": "A Chinese EV battery pack pays 53.4%; a German starter motor for a car 15% in total; the same battery used in an energy-storage system "
            "is not an auto part.",
            "effectiveFrom": "2025-05-03",
            "effectiveSourceId": "procl-10908",
            "sourceIds": AUTO_SRC,
        },
        {
            "id": "s232-elections",
            "country": "All countries (importer election)",
            "measure": "Section 232 certified automobile and truck parts (notes 33(p), 33(r), 38(j))",
            "ch99Code": "9903.94.07 / 9903.94.33 / 9903.94.45 / .55 / .65 / .69 / 9903.74.09",
            "before": "None",
            "now": "+25% (15% total for the EU, Japan, Korea and Taiwan; 10% total for the UK) when the importer elects it",
            "exemption": "An importer of record may certify that parts not on the note 33(g) or 38(i) lists will be used for U.S. vehicle production or repair and "
            "enter them as Section 232 parts. That applies to almost every Chapter 85 line (897 for the automobile election). The elected duty replaces the "
            "Section 232 metals, 2026 Section 301 and Brazil duties; USMCA-qualifying parts pay nothing (9903.94.06, 9903.74.10). It is optional: without the "
            "certification the ordinary duties apply.",
            "whatItMeans": "Mainly useful where it lowers the total, for example an EU or Japanese part on the metals list used in U.S. car assembly: 15% in total "
            "instead of the base rate plus 25%.",
            "effectiveFrom": "2025-11-01",
            "effectiveSourceId": "procl-10984",
            "sourceIds": ["procl-10984", "csms-66665333", "cbp-section-232-additional-faqs-autos", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s232-mhdv-parts",
            "country": "All countries (USMCA parts exempt)",
            "measure": "Section 232 medium- and heavy-duty vehicle parts (note 38(i))",
            "ch99Code": "9903.74.08",
            "before": "None",
            "now": "+25%",
            "exemption": f"Covers {N['mhdv']} lines (traction motors, batteries, starters, alternators, lighting, radios, wiring sets) when they are parts of trucks, "
            "buses or tractors; other goods there enter under 9903.74.11, USMCA parts under 9903.74.10. A part that is also a car or light-truck part pays "
            "the automobile-part duty instead. Not subject to the metals or 2026 Section 301 duties.",
            "whatItMeans": "A Mexican non-USMCA truck alternator pays its base rate plus 25%; a USMCA one pays nothing.",
            "effectiveFrom": "2025-11-01",
            "effectiveSourceId": "procl-10984",
            "sourceIds": ["procl-10984", "csms-66665333", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s232-metals",
            "country": "All countries (UK, U.S.-melted metal and Russia at other rates)",
            "measure": "Section 232 aluminum, steel and copper derivatives, on the full customs value",
            "ch99Code": "9903.82.09 / 9903.82.10",
            "before": "+25%, then +50% from June 4, 2025, on the aluminum or steel content of listed derivatives",
            "now": f"+25% on {N['m25']} lines; a 15% floor on {N['m15']} lines (25% from January 1, 2028)",
            "exemption": "25% (9903.82.09) covers large motors (8501.53), wind-turbine generators (8501.64.01.10), spark-ignition and wind generating sets (8502.20, "
            "8502.31), stators, rotors and generator parts (8503), transformers up to 10,000 kVA and transformer cores (8504.21, .22, .31–.33, 8504.90.96.34–.42), "
            "vacuum-cleaner parts, garbage disposals, industrial microwave ovens, cooking ranges and ovens (8516.60), antennas (8517.71), switchboard bases (8538.10), "
            "insulated wire and cable (8544.19, 8544.42, 8544.49, 8544.60) and conduit (8547.90). The 15% floor (9903.82.10) covers transformers over 10,000 kVA "
            "(8504.23) and other transformers over 500 kVA (8504.34), power-supply circuit assemblies, ferrites and transformer and converter parts, and space "
            "heaters (8516.29). No duty when the article has no aluminum, steel or copper (9903.82.01) or, outside Chapters 72–76, when they are under "
            "15% of its weight (9903.82.03). UK goods with 95% UK metal: 15% (9903.82.05); 85% U.S.-melted metal: 10% (9903.82.06); parts for agricultural or "
            "industrial equipment: 15% in total (9903.82.25); motorcycle parts for U.S. manufacturing: none (9903.82.13). FTA and USMCA claims do not reduce it.",
            "whatItMeans": "Insulated copper cable from any country pays 25% of its value on top of the base rate; a large Korean transformer 15% in total.",
            "effectiveFrom": "2026-04-06",
            "effectiveSourceId": "procl-11021",
            "sourceIds": MET_SRC,
        },
        {
            "id": "ca-section-338",
            "country": "Canada",
            "measure": "Section 338 (Canada), motor-vehicle list (note 51(b)(3))",
            "ch99Code": "9903.03.14",
            "before": "None",
            "now": "+50%, also on USMCA goods and, since September 15, 2026, on top of Section 232",
            "exemption": f"Covers {N['ca338']} lines: vacuum cleaners (8508.19), smartphones, phones and network gear (8517.13, .61, .62, .79), video players, storage media "
            "and SSDs (8523.49, .51, .52), cameras and transmitters (8525), radar and GPS (8526), monitors and TVs (8528.52, .59, .62, .69), their parts (8529), "
            "printed circuits (8534), numerical controls, panel boards and programmable controllers (8537.10.91.30–.70), 8543.70.98 and some cable (8544.49.30, 8544.70). Civil aircraft articles are relieved "
            "(9903.03.16).",
            "whatItMeans": "A Canadian-made smartphone or router pays 50% even with a USMCA certification.",
            "effectiveFrom": "2026-08-22",
            "effectiveSourceId": "procl-11048",
            "sourceIds": ["procl-11048", "procl-11056", "procl-11065", "csms-69606660", "csms-69851916", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "s232-uas",
            "country": "All countries",
            "measure": "Section 232 unmanned aircraft systems (note 43)",
            "ch99Code": "9903.08.21 / 9903.08.23 / 9903.08.24",
            "before": "None",
            "now": "+100%; UK +10%; 15% in total for Japan, Korea, Taiwan, Switzerland, Liechtenstein and the EU with certified partner components",
            "exemption": "Reaches two Chapter 85 lines, 8504.40.95.80 and 8537.10.91.70, only for docking stations for drones and their parts; other goods there "
            "enter under 9903.08.20. Goods on the Blue UAS lists start paying on February 9, 2027; approved onshoring plans are exempt (9903.08.25).",
            "whatItMeans": "Drone docking stations pay double their value; other power supplies and controllers on those lines are unaffected.",
            "effectiveFrom": "2026-09-03",
            "effectiveSourceId": "procl-11055",
            "sourceIds": ["procl-11055", "hts-chapter-99", "hts-now"],
        },
        {
            "id": "ru-col2",
            "country": "Russia (and Belarus, Cuba, North Korea for metals)",
            "measure": "Column 2 rates, 35% in lieu of column 2 (note 30), 200% on aluminum derivatives (note 19), metals and the 2026 Section 301 duty",
            "ch99Code": "9903.90.08 / 9903.85.68 / 9903.82.12–9903.82.17 / 9903.05.66",
            "before": "Column 2 rates and 35% in lieu of column 2 on note 30 lines",
            "now": "Column 2 rate (or 35%) + 12.5% (2026 Section 301) + 200% on aluminum derivatives or 25% on steel and copper derivatives",
            "exemption": f"Russian goods pay the column 2 rates (since April 9, 2022) and 35% in their place on {N['ru35']} note 30 lines (lamps, wiring sets, LEDs, some "
            f"insulators). {N['ru200']} lines that were aluminum derivatives pay 200% when Russian (9903.85.68). Belarus, Cuba and North Korea pay 25% on the metals "
            "lines (9903.82.12) on top of column 2.",
            "whatItMeans": "Russian electrical goods are close to prohibited: column 2 rates of 25% to 35% plus 12.5%, and 200% on aluminum-heavy goods.",
            "effectiveFrom": "2026-07-24",
            "effectiveSourceId": "fr-2026-15181",
            "sourceIds": ["procl-10420", "procl-10522", "procl-10895", "fr-2025-15819", "procl-11021", "fr-2026-15181", "hts-chapter-99", "hts-now"],
        },
    ]

    need("fr-2025-22690", "fr-2025-23892", "hts-now-cr", "hts-before", "procl-11065", "csms-69851916", "procl-11056", "csms-69606660", "procl-11048",
         "fr-2026-14542", "fr-2026-15274", "procl-10984", "csms-66665333", "fr-2026-10571")

    def ch(id, type, date, label, title, detail, before, now, countries, ids):
        need(*ids)
        return dict(id=id, type=type, date=date, dateLabel=label, title=title, detail=detail, before=before, now=now, countries=countries, sourceIds=ids)

    base = next(c for c in tu["changes"] if c["id"] == "base-rates")
    base["title"] = "No Chapter 85 base-rate changes"
    base["detail"] = (
        "961 of 982 Chapter 85 lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. The other 21 are new "
        "statistical lines at unchanged rates: 8501.64.01.10/.35/.55 (AC generators), 8504.40.95.71–.79 (static converters), 8507.20.80.92 (lead-acid batteries), "
        "8507.60.00.30/.90 (lithium-ion batteries other than for EVs), 8541.29.00.55/.65/.85 and 8541.90.00.10/.80 (transistors and parts), 8542.39.00.70/.90 (ICs) "
        "and 8543.30.90.10/.90."
    )
    nic = next(c for c in tu["changes"] if c["id"].startswith("section-301-nicaragua"))
    nic["title"] = "Section 301 tariff on Nicaragua phases in from 2027"
    nic["detail"] = (
        "Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29). "
        "The rate is 0% in 2026."
    )
    nic["date"] = src["fr-2025-23892"]["published"]
    nic["dateLabel"] = "Published"

    changes = [
        base,
        ch("fcc-component", "reference", "2026-10-13", "Effective", "FCC closes the Covered List component loophole",
           "FCC rules effective October 13, 2026 bar equipment authorization for devices containing logic-bearing hardware components made by Covered List entities "
           "(where the whole device would be barred), require full certification for modifications by those entities, and require online marketplaces to show "
           "the FCC ID. Radio-frequency devices without a valid authorization cannot be imported for sale (47 CFR 2.1204).",
           None, None, "All", ["fr-2026-18535"]),
        ch("cn-301-continued", "reference", "2026-10-07", "Published", "China Section 301 actions continue during the second four-year review",
           "USTR received requests to continue the 2018 actions, so they did not terminate on July 6 and August 23, 2026 and stay in effect, subject to changes from the review.",
           None, "No change", "China", ["fr-2026-20510"]),
        ch("ldge-prelim", "pending", "2026-09-30", "Published", "Preliminary dumping findings on large graphite electrodes from China and India",
           "Commerce preliminarily found dumping of large-diameter graphite electrodes (over 425 mm, 8545.11.00.20) from China and India, in "
           "investigations begun in March 2026 together with subsidy investigations. Final determinations and the ITC's injury vote are still to come.",
           None, "AD/CVD cash deposits (preliminary)", "China, India", ["fr-2026-20030", "fr-2026-20031", "fr-2026-05495", "fr-2026-05496"]),
        ch("polysilicon-stockpiling", "pending", "2026-09-24", "Published", "Commerce limits stockpiling of solar cells and modules before December 4",
           "A temporary BIS rule (September 22 – December 3, 2026) lets Commerce bar importers whose imports of polysilicon products, including solar cells (8541.42) "
           "and modules (8541.43), run well above their historic averages, and caps weekly volumes for importers registered after August 6, 2026.",
           None, "Import limits", "All", ["fr-2026-19537", "procl-11052"]),
        ch("solar-iil-final", "pending", "2026-09-16", "Published", "Final AD/CVD determinations on solar cells from India, Indonesia and Laos",
           "Commerce made final affirmative dumping and subsidy determinations on crystalline silicon solar cells and modules from India, Indonesia and Laos "
           "(investigations begun August 2025). Orders will issue only if the ITC makes final affirmative injury determinations.",
           None, "AD/CVD orders if the ITC finds injury", "India, Indonesia, Laos",
           ["fr-2026-18945", "fr-2026-18947", "fr-2026-18939", "fr-2026-18940", "fr-2026-18941", "fr-2026-18942", "fr-2025-15250", "fr-2025-15251"]),
        ch("ca338-modified", "extraDuty", "2026-09-15", "Effective", "Canada Section 338 duty now stacks on Section 232",
           "Proclamation 11065 made the 50% duty on Canadian goods of the motor-vehicle list apply on top of Section 232 duties and changed the list: 8537.10.91 "
           "is now covered only for four statistical numbers (numerical controls, panel boards, programmable controllers and other boards). The other Chapter 85 lines stayed on the list.",
           "+50% (not on Section 232 goods)", "+50% (in addition to Section 232)", "Canada", ["procl-11065", "csms-69851916"]),
        ch("uas-232", "extraDuty", "2026-09-03", "Effective", "Section 232 duty on drones reaches drone docking stations",
           "Proclamation 11055 imposed 100% on unmanned aircraft systems and their parts, including docking stations classified in 8504.40.95.80 and 8537.10.91.70 "
           "(note 43). UK goods pay +10% and goods of Japan, Korea, Taiwan, Switzerland, Liechtenstein and the EU 15% in total when substantially all critical "
           "components come from partner countries. Products on the Blue UAS lists start paying on February 9, 2027.",
           None, "+100%", "All", ["procl-11055", "hts-chapter-99"]),
        ch("ca338", "extraDuty", "2026-08-22", "Effective", "50% Section 338 duty on Canadian electronics and other goods",
           f"Proclamation 11048 imposed 50% on products of Canada in the note 51(b)(3) list to offset Canada's surtax on U.S. motor vehicles; Proclamation 11056 "
           f"moved the start from August 19 to August 22, 2026. It covers {N['ca338']} Chapter 85 lines, including smartphones, network gear, TVs, cameras, "
           "storage media and printed circuits, and is charged even when USMCA is claimed.",
           None, "+50%", "Canada", ["procl-11048", "procl-11056", "csms-69606660"]),
        ch("polysilicon-232", "pending", "2026-08-11", "Published", "Section 232 duty on solar cells and modules from December 4, 2026",
           "Proclamation 11052 (signed August 6, 2026) sets, from December 4, 2026, a 15% Section 232 duty on polysilicon derivatives, including solar cells and "
           "modules, and minimum import prices: $0.22 per watt for cells and $0.38 per watt for modules. Entries without the importer's documentation pay the "
           "minimum price as a specific duty; others pay the shortfall below it. EU, Japanese, Korean, Taiwanese, Swiss and Liechtenstein products pay 15% "
           "in total, UK products 10%. It replaces the Section 201 safeguard that expired in February.",
           None, "+15% and minimum import prices (from December 4, 2026)", "All", ["procl-11052", "fr-2025-13345"]),
        ch("derivatives-proposal", "pending", "2026-08-06", "Published", "Commerce proposes more metals derivatives, including insulated cable",
           "Under the rolling inclusion authority of Proclamation 11021, Commerce asked for comments on adding derivative articles to the Section 232 metals duties, "
           "including insulated copper electric conductor cables of 8544.49 and 8544.60. Nothing has been added yet.",
           None, None, "All", ["fr-2026-15961"]),
        ch("uflpa-list", "reference", "2026-08-03", "Published", "UFLPA Entity List adds 43 entities",
           "DHS added 43 entities to the UFLPA Entity List. Goods made wholly or in part by listed entities, or in Xinjiang, are presumed made with forced labor and "
           "are denied entry unless CBP grants an exception. Listed entities include polysilicon and transformer producers in Xinjiang.",
           None, None, "China", ["fr-2026-15628"]),
        ch("s301-2026", "extraDuty", "2026-07-24", "Effective", "2026 Section 301 tariffs on 60 economies: chips, phones and displays exempt",
           f"The 10% or 12.5% duties on goods of 60 economies (9903.05.20–9903.05.84) took effect on {N['s301_26']} Chapter 85 lines. Smartphones, switching "
           "apparatus, SSDs, display modules, monitors, semiconductors other than solar cells, and chips are exempt (note 52(b)); Section 232 goods and USMCA "
           "goods are exempt too. The EU, Japan, Korea and Taiwan pay a floor (10%–15% in place of a lower base rate).",
           None, "+10% to +12.5%", "60 economies", ["fr-2026-15181", "fr-2026-15274", "hts-chapter-99"]),
        ch("s122-end", "reference", "2026-07-23", "Expired", "Section 122 surcharge expired",
           "The 10% surcharge on products of all countries (9903.03.01) expired at the close of July 23, 2026. It had exempted smartphones, network switching gear, "
           "SSDs, display modules, monitors, semiconductors other than solar cells, chips and NdFeB magnets (note 2(aa)(ii)), Section 232 goods and USMCA goods.",
           None, None, "All", ["procl-11012", "hts-chapter-99"]),
        ch("br-301", "extraDuty", "2026-07-22", "Effective", "Section 301 tariff on Brazil",
           "The 25% duty on goods of Brazil (9903.05.01) took effect, with the same electronics exemption list (note 50(a)(ii)) and Section 232 carve-out.",
           None, "+25%", "Brazil", ["fr-2026-14542", "hts-chapter-99"]),
        ch("solar-ethiopia", "pending", "2026-07-17", "Published", "Circumvention inquiry: solar cells finished in Ethiopia or Vietnam",
           "Commerce opened a country-wide inquiry into whether solar cells completed in Ethiopia from Chinese parts, or assembled into modules in Vietnam with "
           "further Chinese inputs, circumvent the 2012 China solar orders.",
           None, None, "Ethiopia, Vietnam", ["fr-2026-14416", "fr-2012-29668", "fr-2012-29669"]),
        ch("solar-cn-tw-continued", "reference", "2026-06-23", "Published", "2015 solar orders on China and Taiwan continued",
           "After second sunset reviews, the 2015 antidumping orders on solar products from China and Taiwan and the countervailing order on China were continued.",
           None, None, "China, Taiwan", ["fr-2026-12571", "fr-2015-03183", "fr-2015-03179"]),
        ch("procl-11032", "reference", "2026-06-08", "Effective", "Proclamation 11032 adjusts the metals program",
           "From June 8, 2026, metal content counts as U.S.-made when at least 85% was melted or smelted and cast in the United States (10%), parts used to make "
           "agricultural or industrial equipment pay 15% in total, and electric space heaters of 8516.29 moved to the 15% floor list.",
           None, None, "All", ["procl-11032"]),
        ch("tw-auto", "extraDuty", "2026-05-01", "Effective", "Taiwanese auto parts: 15% in total",
           "Under the U.S.–Taiwan agreement, Taiwanese auto parts pay 15% in total, including the base rate, instead of 25% on top (9903.94.67).",
           "+25%", "15% in total", "Taiwan", ["fr-2026-10571"]),
        ch("procl-11021", "extraDuty", "2026-04-06", "Effective", "Section 232 metals duty moves to the full value",
           "Proclamation 11021 rebuilt the aluminum, steel and copper program on the full customs value. Chapter 85 derivatives (motors, generating sets, "
           "transformers, appliance parts, insulated copper and aluminum cable) pay 25% (9903.82.09), and large transformers and some equipment parts a 15% floor "
           "through 2027 (9903.82.10). Before, listed derivatives paid 50% of their metal content. Manufacturing drawback is limited to trade-agreement partners.",
           "+50% on the metal content", "+25% on the full value (or a 15% floor)", "All", ["procl-11021", "csms-68253075", "fr-2026-08297"]),
        ch("ieepa-end", "extraDuty", "2026-02-24", "Effective", "All IEEPA tariffs end; Section 122 surcharge begins",
           "After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended "
           "the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them from February 24, 2026. A 10% Section 122 surcharge (Proclamation 11012) "
           "applied from the same day until July 23, 2026, with the electronics exemptions of note 2(aa)(ii).",
           "Varied by country", "None (IEEPA)", "All", ["scotus-24-1287", "eo-14389", "csms-67834313", "procl-11012"]),
        ch("solar-201-end", "extraDuty", "2026-02-06", "Expired", "Section 201 solar safeguard ends",
           "The safeguard on crystalline silicon solar cells (above an annual quota) and modules, in place since February 7, 2018 and extended in 2022, terminated "
           "on February 6, 2026 (9903.45.21–9903.45.29 expired). The ITC is evaluating its effectiveness.",
           "Safeguard duty on cells above quota and on modules", "None", "All", ["fr-2026-05170", "procl-10339"]),
        ch("semis-232", "reference", "2026-01-15", "Effective", "Section 232 semiconductor duty: computers only, not Chapter 85",
           "Proclamation 11002 imposed 25% (9903.79.01) on semiconductor articles, defined in U.S. note 39(b) as goods of 8471.50, 8471.80 and 8473.30 that are or contain "
           "logic chips within narrow performance bands, with end-use exemptions (9903.79.03–.09). Chips, semiconductors and other Chapter 85 goods are not covered.",
           None, "No change for Chapter 85", "All", ["procl-11002"]),
        ch("cn-31g", "extraDuty", "2026-01-01", "Effective", "China: lithium-ion batteries and permanent magnets to 25%",
           "The second step of the 2024 review: lithium-ion batteries other than for EVs (8507.60) and permanent magnets (8505.11) went to 25% (9903.91.06). "
           "EV batteries had been raised to 25% on September 27, 2024.",
           "+7.5% (List 4A) or none", "+25%", "China", ["fr-2024-21217"]),
        ch("semis-301-action", "pending", "2025-12-23", "Effective", "Section 301 action on Chinese semiconductors: 0% now, increase June 23, 2027",
           "USTR found China's targeting of the semiconductor industry actionable and imposed a tariff on Chinese semiconductors at 0%, rising on June 23, 2027 to "
           "a rate to be announced at least 30 days before. It adds to the 50% under note 31.",
           None, "0% until June 23, 2027", "China", ["fr-2025-23912"]),
        ch("cn-excl", "reference", "2025-12-01", "Published", "178 China Section 301 exclusions extended to November 9, 2026",
           f"USTR extended the 178 product exclusions (9903.88.69) through November 9, 2026. {N['excl']} Chapter 85 lines have an exclusion for specific described "
           "products (motors, power supplies, switches, relays, PCBs, cables).",
           None, "Excluded until November 9, 2026", "China", ["fr-2025-21671"]),
        nic,
        ch("ieepa-cn-10", "reference", "2025-11-10", "Effective", "China IEEPA (fentanyl) duty cut to 10%",
           "Executive Order 14357 cut the IEEPA duty on Chinese goods from 20% to 10%. Unlike the reciprocal tariff, it had no electronics exemption. Ended February 24, 2026.",
           "+20%", "+10% (ended)", "China", ["eo-14357"]),
        ch("mhdv", "extraDuty", "2025-11-01", "Effective", "Section 232 on truck and bus parts; certified-parts elections",
           f"Proclamation 10984 imposed 25% on parts of medium- and heavy-duty vehicles ({N['mhdv']} Chapter 85 lines, 9903.74.08) and let importers certify other "
           "parts for U.S. vehicle production or repair as Section 232 parts (9903.94.07, 9903.74.09 and partner headings). Korean auto parts moved to 15% in total "
           "on the same date (9903.94.63).",
           None, "+25%", "All", ["procl-10984", "csms-66665333", "fr-2025-21940"]),
        ch("jp-auto", "extraDuty", "2025-09-16", "Effective", "Japanese auto parts: 15% in total",
           "Japanese auto parts pay 15% in total, including the base rate (9903.94.43).", "+25%", "15% in total", "Japan", ["fr-2025-17908"]),
        ch("eu-auto", "extraDuty", "2025-08-01", "Effective", "EU auto parts: 15% in total",
           "EU auto parts pay 15% in total, including the base rate (9903.94.53), retroactive to August 1, 2025.", "+25%", "15% in total", "European Union", ["fr-2025-18660"]),
        ch("al-derivatives", "reference", "2025-08-18", "Effective", "More Chapter 85 goods become aluminum and steel derivatives",
           "Commerce added 407 product codes to the Section 232 steel and aluminum derivatives, including generating sets, transformers, motors and insulated "
           "cable of Chapter 85, at 50% of the metal content. Proclamation 11021 replaced this with the full-value rates from April 6, 2026.",
           None, "+50% on the metal content", "All", ["fr-2025-15819"]),
        ch("uk-auto", "extraDuty", "2025-06-30", "Effective", "UK auto parts: 10% in total",
           "UK auto parts on the note 33(j) list pay 10% in total (9903.94.32).", "+25%", "10% in total", "United Kingdom", ["fr-2025-12060"]),
        ch("solar-cmtv-orders", "reference", "2025-06-24", "Published", "AD/CVD orders on solar cells from Cambodia, Malaysia, Thailand and Vietnam",
           "Commerce issued antidumping and countervailing duty orders on crystalline silicon solar cells and modules from Cambodia, Malaysia, Thailand and Vietnam.",
           None, "AD/CVD cash deposits", "Cambodia, Malaysia, Thailand, Vietnam", ["fr-2025-11588", "fr-2025-11589"]),
        ch("awc-continued", "reference", "2025-06-18", "Published", "Aluminum wire and cable orders on China continued",
           "After five-year reviews, Commerce continued the 2019 AD and CVD orders on aluminum wire and cable from China (8544.49.90, 8544.42.90). In January 2025 "
           "it found that cable completed in Vietnam and Korea from Chinese aluminum circumvents them.",
           None, None, "China, Vietnam, Korea", ["fr-2025-11232", "fr-2019-27641", "fr-2025-01744", "fr-2025-01745"]),
        ch("auto-parts", "extraDuty", "2025-05-03", "Effective", "Section 232 duty on auto parts",
           f"Proclamation 10908 imposed 25% on parts of passenger vehicles and light trucks (9903.94.05), reaching {N['auto']} Chapter 85 lines, including batteries, "
           "motors, ignition and lighting equipment, car radios and wiring sets. USMCA parts and goods that are not such parts use 9903.94.06 (0%).",
           None, "+25%", "All", ["procl-10908", "procl-10925", "csms-64916652"]),
        ch("electronics-exempt", "reference", "2025-04-11", "Signed", "Smartphones, chips and displays exempted from the reciprocal tariff",
           "A presidential memorandum clarified that the 'semiconductors' exception of Executive Order 14257 covers 8471, 8473.30, 8486, smartphones (8517.13), 8517.62, "
           "SSDs (8523.51), display modules (8524), monitors (8528.52), most of 8541 and all of 8542, retroactive to April 5, 2025. The China and Canada/Mexico IEEPA "
           "duties still applied. All ended February 24, 2026.",
           None, "Reciprocal tariff not applied", "All", ["wh-2025-04-11", "eo-14257"]),
        ch("ieepa-cn", "reference", "2025-03-04", "Effective", "IEEPA duties on China, Canada and Mexico",
           "+20% on Chinese goods (10% from February 4, 2025, raised by Executive Order 14228) and +25% on goods of Canada and Mexico from March 4, 2025 "
           "(USMCA goods exempt from March 7, 2025). "
           "Ended February 24, 2026.",
           None, "+20% / +25% (ended)", "China, Canada, Mexico", ["eo-14195", "eo-14228", "eo-14193", "eo-14194"]),
        ch("cn-31f", "extraDuty", "2025-01-01", "Effective", "China: semiconductors and chips to 50%",
           "Semiconductors and chips of 8541 (other than solar cells) and 8542 moved from 25% (List 1) to 50% (9903.91.05).",
           "+25%", "+50%", "China", ["fr-2024-21217", "fr-2024-29462"]),
        ch("cn-31c", "extraDuty", "2024-09-27", "Effective", "China: solar cells to 50%, EV batteries and battery parts to 25%",
           "After the four-year review, Chinese solar cells and modules (8541.42/.43) went to 50% (9903.91.02), lithium-ion EV batteries (8507.60.00.10) and lead-acid "
           "battery parts (8507.90.40) to 25%.",
           "+25% / +7.5%", "+50% / +25%", "China", ["fr-2024-21217"]),
        ch("lpt-continued", "reference", "2024-09-05", "Published", "Large power transformer order on Korea continued",
           "Commerce continued the 2012 antidumping order on large power transformers from Korea (8504.23, parts 8504.90).",
           None, None, "South Korea", ["fr-2024-19899", "fr-2012-21613"]),
        ch("solar-circumvention", "reference", "2023-08-23", "Published", "China solar orders reach cells and modules finished in Southeast Asia",
           "Commerce found that solar cells and modules completed in Cambodia, Malaysia, Thailand and Vietnam from Chinese wafers or parts circumvent the 2012 China "
           "orders. Duties on such goods were waived until June 6, 2024 under a presidential emergency, if they were used in the United States.",
           None, "AD/CVD (China rates)", "Cambodia, Malaysia, Thailand, Vietnam", ["fr-2023-18161"]),
        ch("russia-35", "reference", "2022-07-27", "Effective", "Russia: 35% in lieu of column 2",
           f"Proclamation 10420 set 35% in place of the column 2 rate on Russian goods of the note 30 list ({N['ru35']} Chapter 85 lines).",
           None, "35% in lieu of column 2", "Russia", ["procl-10420"]),
        ch("solar-201-extend", "reference", "2022-02-09", "Published", "Solar safeguard extended four years",
           "Proclamation 10339 extended the Section 201 safeguard on solar cells and modules to February 6, 2026, with a larger tariff-rate quota for cells.",
           None, None, "All", ["procl-10339"]),
        ch("cn-4a", "extraDuty", "2020-02-14", "Effective", "China List 4A cut to 7.5%", "The List 4A duty (9903.88.15) fell from 15% to 7.5%.",
           "+15%", "+7.5%", "China", ["fr-2020-00904"]),
        ch("awc-orders", "reference", "2019-12-23", "Published", "AD/CVD orders on aluminum wire and cable from China",
           "Commerce issued antidumping and countervailing duty orders on aluminum wire and cable from China.", None, "AD/CVD cash deposits", "China", ["fr-2019-27641"]),
        ch("cn-4a-start", "extraDuty", "2019-09-01", "Effective", "China List 4A", "List 4A added 15% on more Chinese goods, including TVs, audio and many appliances.",
           None, "+15%", "China", ["fr-2019-17865"]),
        ch("cn-l3-25", "extraDuty", "2019-05-10", "Effective", "China List 3 raised to 25%", "The List 3 duty rose from 10% to 25%.", "+10%", "+25%", "China", ["fr-2019-09681"]),
        ch("cn-l3", "extraDuty", "2018-09-24", "Effective", "China List 3", "List 3 added 10% on a broad range of Chinese goods.", None, "+10%", "China", ["fr-2018-20610"]),
        ch("cn-l2", "extraDuty", "2018-08-23", "Effective", "China List 2", "List 2 added 25% on Chinese goods including some motors, batteries and semiconductors.", None, "+25%", "China", ["fr-2018-17709"]),
        ch("cn-l1", "extraDuty", "2018-07-06", "Effective", "China List 1", "List 1 added 25% on Chinese goods including motors, transformers, capacitors, switches and semiconductors.", None, "+25%", "China", ["fr-2018-13248"]),
        ch("solar-201-start", "reference", "2018-02-07", "Effective", "Section 201 solar safeguard begins",
           "Proclamation 9693 imposed a four-year safeguard on crystalline silicon solar cells above a quota and on modules.", None, "Safeguard duty", "All", ["procl-9693"]),
        ch("solar-2015", "reference", "2015-02-18", "Published", "AD/CVD orders on solar products from China and Taiwan",
           "Commerce issued antidumping orders on solar products from China and Taiwan and a countervailing order on China.", None, "AD/CVD cash deposits", "China, Taiwan",
           ["fr-2015-03183", "fr-2015-03179"]),
        ch("solar-2012", "reference", "2012-12-07", "Published", "AD/CVD orders on solar cells from China",
           "Commerce issued antidumping and countervailing duty orders on crystalline silicon solar cells and modules from China.", None, "AD/CVD cash deposits", "China",
           ["fr-2012-29668", "fr-2012-29669"]),
        ch("lpt-order", "reference", "2012-08-31", "Published", "Antidumping order on large power transformers from Korea",
           "Commerce issued an antidumping order on large power transformers from Korea.", None, "AD cash deposits", "South Korea", ["fr-2012-21613"]),
        ch("sdge", "reference", "2009-02-26", "Published", "Antidumping order on small-diameter graphite electrodes from China",
           "Commerce issued an antidumping order on small-diameter graphite electrodes from China (8545.11); it was continued again in September 2025.",
           None, "AD cash deposits", "China", ["fr-e9-4126", "fr-2025-16949"]),
    ]
    changes.sort(key=lambda c: c["date"], reverse=True)
    tu["changes"] = changes

    used = set()
    for e in tu["inEffect"]:
        used.update(e["sourceIds"])
    for c in tu["changes"]:
        used.update(c["sourceIds"])
    used.update(["hts-now", "hts-before", "hts-now-cr", "hts-chapter-99", "hts-ch85"])

    # -------------------------------------------------------------- industryAreas
    ia = d["industryAreas"]
    ia["h1"] = "HTS Chapter 85: Electrical Machinery & Electronics — Tariff Rates by Country"
    ia["seo"] = {
        "title": "Electronics Tariffs by Country: China, Mexico, Vietnam, Taiwan, Korea, Japan, Canada (HTS Ch. 85) | KoalaGains",
        "shortDescription": "The total U.S. tariff on Chapter 85 electrical goods by country and product: China 20%–62.5%, Vietnam and Thailand 12.5%, Malaysia "
        "and India 10%, Taiwan and Korea floors, Mexico and Canada Free with USMCA (Canada 50% on phones and TVs). Chips and smartphones explained.",
        "keywords": [
            "tariff on electronics from china",
            "tariff on electronics from canada",
            "tariff on electronics from japan",
            "tariff on electronics from india",
            "tariff on electronics from germany",
            "taiwan electronics tariff",
            "tariff on semiconductors from taiwan",
            "electrical components tariffs",
        ],
    }
    ia["intro"] = (
        "Each cell is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. "
        "Three patterns decide most cells. **Chips, semiconductors, smartphones, SSDs, display modules and monitors** are on the 2026 Section 301 exemption list, "
        "so they are Free from every country except China (50% on chips and semiconductors) and Canada (50% on phones and monitors). **Most other goods** pay "
        "their base rate plus the 2026 Section 301 duty: 10% (Mexico and Canada without USMCA, Malaysia, India, UK), 12.5% (Vietnam, Thailand), or a 10%–15% floor "
        "(EU, Japan, Korea, Taiwan); China adds 7.5% to 50% under its lists. **Section 232 goods** (auto parts, truck parts, metal-heavy transformers and cable) "
        "pay 25% (15% in total for the EU, Japan, Korea and Taiwan on auto parts) instead of the 2026 duty.\n\n"
        "Cells with two figures depend on the use: a battery, motor or wiring set listed in U.S. note 33(g) pays the auto-parts duty only when it is a part of a "
        "car or light truck. The table does **not** include antidumping or countervailing duties (solar cells from China, Taiwan and Southeast Asia, aluminum "
        "wire and cable from China, large power transformers from Korea, graphite electrodes from China)."
    )

    def r(*ids):
        need(*ids)
        return list(ids)

    COMMON = (
        f" Section 232: auto parts (note 33(g), {N['auto']} lines) 25% when car or light-truck parts; truck and bus parts ({N['mhdv']} lines) 25%; metals "
        f"25% on {N['m25']} lines and a 15% floor on {N['m15']}."
    )
    EU_LIKE = (
        " Auto parts pay 15% in total (including the base rate); truck parts 25% on top; metals 25% (15% floor on large transformers)."
    )
    R = {
        "China": (
            f"Section 301 on {N['china_any']} lines: 25% (Lists 1–3), 7.5% (List 4A), 50% on chips, semiconductors and solar cells (note 31), 25% on lithium-ion batteries and "
            "permanent magnets; plus 12.5% (9903.05.31) except on the note 52(b) electronics and Section 232 goods. Smartphones Free. Section 232 auto, truck and metals "
            "duties stack on the China lists. " f"{N['excl']} lines have exclusions (9903.88.69) until November 9, 2026, not applied in the cells. Solar cells, aluminum wire and "
            "cable and graphite electrodes also carry AD/CVD, not shown.",
            r("fr-2024-21217", "fr-2018-13248", "fr-2018-20610", "fr-2019-17865", "fr-2025-21671", "fr-2026-15181", "procl-10908", "procl-11021", "hts-now"),
        ),
        "Mexico": (
            "USMCA-qualifying goods: Free, except Section 232 metals (25% on the full value, e.g. insulated copper cable) which USMCA does not lift; USMCA auto and "
            "truck parts pay nothing (9903.94.06, 9903.74.10). Without a USMCA claim: base rate + 10% (9903.05.55), or 25% Section 232 on auto, truck and metals goods."
            + " Chips, smartphones and monitors are exempt from the 10%.",
            r("fr-2026-15181", "procl-10908", "procl-10984", "procl-11021", "hts-now"),
        ),
        "Canada": (
            "USMCA-qualifying goods: Free, except Section 232 metals (25%) and the 50% Section 338 duty (9903.03.14) on 62 lines (smartphones, network gear, TVs, "
            "monitors, cameras, storage media, PCBs, PLCs), which applies with or without USMCA and, since September 15, 2026, on top of Section 232. "
            "Without USMCA: base + 10% (9903.05.29) on other lines.",
            r("procl-11048", "procl-11056", "procl-11065", "fr-2026-15181", "procl-11021", "hts-now"),
        ),
        "Taiwan": (
            "2026 Section 301: 10% in place of the base rate when the base rate is lower (9903.05.76); chips, semiconductors, SSDs, display modules and monitors exempt (Free). "
            "Auto parts 15% in total since May 1, 2026 (9903.94.67); truck parts 25%; metals 25%. Taiwanese solar products are under a 2015 AD order, not shown.",
            r("fr-2026-15181", "fr-2026-10571", "procl-11021", "fr-2015-03179", "hts-now"),
        ),
        "Vietnam": (
            "2026 Section 301: +12.5% (9903.05.84); smartphones, chips and the other note 52(b) electronics exempt (Free)." + COMMON
            + " Vietnamese solar cells and modules carry the 2025 AD/CVD orders, and cable from Chinese aluminum the AD/CVD on China, not shown.",
            r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2025-11588", "fr-2025-11589", "fr-2025-01744", "hts-now"),
        ),
        "South Korea": (
            "2026 Section 301: 12.5% in place of the base rate when lower (9903.05.71); note 52(b) electronics Free. KORUS removes base rates but not the extra duties."
            + EU_LIKE + " Large power transformers from Korea carry an AD order, not shown.",
            r("fr-2026-15181", "fr-2025-21940", "procl-11021", "fr-2024-19899", "hts-now"),
        ),
        "Japan": (
            "2026 Section 301: 12.5% in place of the base rate when lower (9903.05.49); note 52(b) electronics Free." + EU_LIKE,
            r("fr-2026-15181", "fr-2025-17908", "procl-11021", "hts-now"),
        ),
        "Malaysia": (
            "2026 Section 301: +10% (9903.05.54); chips, semiconductors and the other note 52(b) electronics Free; solar cells and modules pay the 10%." + COMMON
            + " Malaysian solar cells carry the 2025 AD/CVD orders, not shown.",
            r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2025-11588", "fr-2025-11589", "hts-now"),
        ),
        "Thailand": (
            "2026 Section 301: +12.5% (9903.05.77); note 52(b) electronics Free." + COMMON + " Thai solar cells carry the 2025 AD/CVD orders, not shown.",
            r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2025-11588", "fr-2025-11589", "hts-now"),
        ),
        "India": (
            "2026 Section 301: +10% (9903.05.44); smartphones, chips and the other note 52(b) electronics Free." + COMMON
            + " Indian solar cells face AD/CVD orders if the ITC finds injury (Commerce's final determinations: September 16, 2026); large graphite electrodes are under investigation.",
            r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2026-18945", "fr-2026-18947", "fr-2026-20031", "hts-now"),
        ),
        "Philippines": (
            "2026 Section 301: +12.5% (9903.05.64); semiconductors, chips and the other note 52(b) electronics Free." + COMMON,
            r("fr-2026-15181", "procl-10908", "procl-11021", "hts-now"),
        ),
        "Indonesia": (
            "2026 Section 301: +10% (9903.05.45); note 52(b) electronics Free." + COMMON
            + " Indonesian solar cells face AD/CVD orders if the ITC finds injury (Commerce's final determinations: September 16, 2026).",
            r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2026-18939", "fr-2026-18940", "hts-now"),
        ),
        "Israel": (
            "The U.S.–Israel FTA (IL) removes base rates but not the extra duties. 2026 Section 301: +12.5% (9903.05.47); note 52(b) electronics Free." + COMMON,
            r("fr-2026-15181", "procl-10908", "procl-11021", "hts-now"),
        ),
        "United Kingdom": (
            "2026 Section 301: +10% (9903.05.81); note 52(b) electronics Free. Auto parts on the note 33(j) list pay 10% in total (9903.94.32), other listed auto "
            "parts 25%; metals 25%, or 15% with 95% UK metal (9903.82.05); drone docking stations +10% with partner components.",
            r("fr-2026-15181", "fr-2025-12060", "procl-11021", "procl-11055", "hts-now"),
        ),
        "Brazil": (
            "+25% Brazil Section 301 (9903.05.01) plus 12.5% (9903.05.27) on 909 lines; the same note 52(b) electronics and Section 232 goods are exempt from both."
            + COMMON,
            r("fr-2026-14542", "fr-2026-15181", "procl-10908", "procl-11021", "hts-now"),
        ),
    }
    EU = {"Germany", "Netherlands", "Ireland", "Italy", "France", "Austria", "Hungary", "Czechia", "Poland", "Spain", "Sweden", "Belgium", "Denmark", "Finland"}
    for c in ia["countries"]:
        rule = c["rule"]
        name = c["country"]
        if name in R:
            rule["label"], rule["sourceIds"] = R[name]
        elif name in EU:
            rule["label"] = (
                "EU: 2026 Section 301 at 10% in place of the base rate when lower (9903.05.39); note 52(b) electronics Free." + EU_LIKE
            )
            rule["sourceIds"] = r("fr-2026-15181", "fr-2025-18660", "procl-11021", "hts-now")
        elif name == "Any other country":
            rule["label"] = (
                "Base rate only for countries outside the 2026 Section 301 actions; up to 12.5% more for the other listed economies (9903.05.20–9903.05.83), "
                "on all but the note 52(b) electronics. Section 232 auto, truck and metals duties apply to every country. Column 2 countries (Belarus, Cuba, "
                "North Korea, Russia) pay more; Nicaragua's Section 301 duty starts January 1, 2027."
            )
            rule["sourceIds"] = r("fr-2026-15181", "procl-10908", "procl-11021", "fr-2025-23892", "hts-now")
        else:
            raise SystemExit(f"no rule label for {name}")
    ia["assumptions"] = [a for a in ia["assumptions"] if "TODO" not in a] + [
        "Cells with two or three figures depend on whether the goods are parts of cars or light trucks, or of trucks and buses (U.S. notes 33(g) and 38(i)); "
        "listed goods that are neither enter under 9903.94.06 or 9903.74.11 with no Section 232 duty. The certified-parts elections (9903.94.07, 9903.74.09) "
        "are optional and not applied.",
        "Section 232 metals are shown at the default rates (25%, or the 15% floor). Lower rates for UK metal (15%), U.S.-melted metal (10%), parts for agricultural or "
        "industrial equipment (15% in total), articles under 15% metal by weight or with no metal (none) are not shown.",
        "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026; the Section 122 surcharge (9903.03.01) expired "
        "July 23, 2026; and the Section 201 solar safeguard (9903.45.21–.29) ended February 6, 2026. None is applied. The Section 232 polysilicon duty on solar "
        "cells and modules (from December 4, 2026) is not yet in effect.",
        "Antidumping and countervailing duties are not included: solar cells and modules (China, Taiwan, Cambodia, Malaysia, Thailand, Vietnam), aluminum wire "
        "and cable (China), large power transformers (Korea) and small-diameter graphite electrodes (China).",
        "Entry rules: FCC equipment authorization for radio-frequency devices, DOE energy-conservation certification for regulated motors, transformers and "
        "appliances, FDA radiation-safety rules for microwave ovens and lasers, hazmat rules for lithium batteries, and UFLPA screening (see Import documents).",
    ]
    ia["exemptionCheck"] = (
        "Read U.S. notes 2(aa), 16, 18, 19, 20, 29, 30, 31, 33, 38, 39, 43, 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. Note 52(b) lists 31 "
        "Chapter 85 provisions (8505.11.00.70, 8517.13, 8517.62, 8523.51, 8524, 8528.52, 8541 except 8541.42, 8541.43 and 8541.60, 8542 and 8549.13), the same set as "
        "Brazil's note 50(a)(ii); no Chapter 85 line is on the note 52(e) pharmaceutical list or the note 52(j) country exception lists. Note 52(f) and 50(a)(vi) "
        "exclude Section 232 metals, auto and truck parts. Note 39(b) limits the semiconductor duty to 8471.50, 8471.80 and 8473.30. Note 33(g) lists the auto-part "
        "subheadings of 8501, 8507, 8511, 8512, 8519, 8525, 8527, 8536, 8537, 8539 and 8544.30; note 38(i) the truck-part lines; note 16(c)(vi)–(x) the metals lines; "
        "note 51(b)(3) the Canada lines; note 43(c) the drone docking stations; note 30 the Russia 35% lines; note 18 (solar safeguard) has expired. The China "
        "exclusions of note 20(vvv) (9903.88.69) are product-specific and not applied in the cells."
    )
    ia_ids = {"hts-now"}
    for c in ia["countries"]:
        ia_ids.update(c["rule"]["sourceIds"])
    ia["sources"] = sorted([src[i] for i in ia_ids], key=lambda s: s["published"], reverse=True)

    # -------------------------------------------------------------- tariffEngineering + FAQ + trade
    from engineering85 import fill_engineering
    from faq85 import fill_faq

    fill_engineering(d, S, N, ECFR_AS_OF)
    fill_faq(d, S, N, ASOF)
    apply_trade(d, src, used)

    tu["sources"] = sorted([src[i] for i in used], key=lambda s: s["published"], reverse=True)
