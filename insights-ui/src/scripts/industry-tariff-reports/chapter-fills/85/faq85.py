"""FAQ (finalConclusion) for Chapter 85, from Google search suggestions collected on 2026-10-13."""


def fill_faq(d, S, N, ASOF):
    fc = d["finalConclusion"]
    fc["h1"] = "HTS Chapter 85: Electrical Machinery & Electronics — Tariff FAQ"
    fc["seo"] = {
        "title": "Electronics Tariffs FAQ: Are Electronics Exempt? Semiconductors, Smartphones, Batteries, Solar Panels (HTS Ch. 85) | KoalaGains",
        "shortDescription": "Answers to what people search about U.S. tariffs on HTS Chapter 85 goods: whether electronics are exempt, the tariff on semiconductors, "
        "smartphones and iPhones, lithium-ion batteries, solar panels, copper wire, transformers and motors, by country, with HS codes.",
        "keywords": [
            "are electronics exempt from tariffs",
            "tariff on semiconductors",
            "tariff on semiconductors from china",
            "section 232 semiconductors",
            "tariff on smartphones",
            "tariff on lithium ion batteries",
            "tariff on solar panels",
            "tariff on electronics from china",
            "tariff on copper wire",
            "hts chapter 85",
        ],
    }
    fc["intro"] = (
        "Straight answers to the most-searched questions about U.S. tariffs on electrical machinery and electronics (HTS Chapter 85), by product, by country and "
        "by HS code. Each answer links to the page with the detail and the official sources."
    )
    fc["keyTakeaways"] = [
        f"Base rates are low ({sum(1 for r in d['overview']['rateTable']['rows'] if r['htsCode10'] and (r['effectiveGeneral'] or 'Free') == 'Free')} of 982 lines Free); "
        "the extra duties decide the cost. Smartphones, chips, semiconductors, SSDs, display modules and monitors are Free from every country except China (50% on "
        "chips and semiconductors) and Canada (50% on phones and monitors).",
        "China pays Section 301 on almost every line: 25% or 7.5% under the 2018–2019 lists, 50% on chips, semiconductors and solar cells, 25% on lithium-ion "
        "batteries and permanent magnets, plus 12.5% on most lines since July 24, 2026.",
        "Other countries pay the 2026 Section 301 duty (10% or 12.5%; a 10%–15% floor for the EU, Japan, Korea and Taiwan) on most goods; USMCA goods of Mexico "
        "and Canada are exempt. Section 232 adds 25% on auto parts (when they are car parts), truck parts and metal-heavy goods such as insulated cable and transformers.",
        "The IEEPA tariffs ended February 24, 2026, the Section 122 surcharge July 23, 2026 and the solar safeguard February 6, 2026. A Section 232 duty on solar "
        "cells and modules starts December 4, 2026. AD/CVD on solar, aluminum cable, transformers and graphite electrodes comes on top.",
    ]
    fc["questionSource"] = (
        "Google search suggestions (autocomplete, United States, English) for chapter 85, electronics, semiconductor, smartphone, battery, solar, copper wire, "
        "transformer, motor and HS-code queries, collected on 2026-10-13."
    )
    fc["faqs"] = [
        {
            "id": "what-is-ch85",
            "question": "What is HTS Chapter 85?",
            "searchedAs": ["hts chapter 85", "htsus chapter 85", "us hts chapter 85", "hts code chapter 85", "chapter 85 us tariff", "hts chapter 85 2026"],
            "answer": "Chapter 85 of the Harmonized Tariff Schedule covers electrical machinery and equipment and their parts: motors, generators and transformers, "
            "batteries, household appliances, smartphones and network equipment, audio and video apparatus, cameras, TVs and monitors, switches and connectors, "
            "lamps and LEDs, semiconductors, solar cells, integrated circuits, insulated wire and cable, and e-waste. The current edition (2026 Revision 21) has "
            "982 ten-digit lines in 48 headings (8501–8549).",
            "link": "",
        },
        {
            "id": "electronics-exempt",
            "question": "Are electronics exempt from tariffs?",
            "searchedAs": ["are electronics exempt from tariffs", "are electronics still exempt from tariffs", "electronics exempt from tariffs list",
                           "are electronic components exempt from tariffs", "are electronics excluded from tariffs", "are electronics exempt from us tariffs"],
            "answer": "Partly. Smartphones (8517.13), switching and routing apparatus (8517.62), SSDs (8523.51), flat panel display modules (8524), computer monitors "
            "(8528.52), semiconductor devices other than solar cells (8541), chips (8542) and NdFeB magnets are exempt from the 2026 Section 301 duties (note 52(b)); "
            "most of them were also exempt from the 2025 reciprocal tariff. They are not exempt from China's Section 301 duties (50% on chips and semiconductors) or Canada's 50% "
            "Section 338 duty on phones and monitors. Other electronics, such as TVs, audio equipment, cameras, batteries and components, pay the 2026 duty "
            "(10%–12.5%) and, from China, Section 301.",
            "link": "tariff-updates",
        },
        {
            "id": "semis-china",
            "question": "What is the U.S. tariff on semiconductors from China?",
            "searchedAs": ["tariff on semiconductors", "tariff on semiconductors from china", "us tariff on semiconductors", "section 301 tariffs semiconductors",
                           "new tariff on semiconductors"],
            "answer": "50% on top of the base rate (Free) for Chinese semiconductors and chips of 8541 and 8542 (other than solar cells), under Section 301 heading "
            "9903.91.05 since January 1, 2025. The 12.5% 2026 Section 301 duty does not apply to them. A separate Section 301 action on Chinese semiconductors is at "
            "0% until June 23, 2027, when it rises to a rate USTR will announce. Chips from Taiwan, Korea, Malaysia, Vietnam and other countries pay no duty.",
            "link": "tariff-updates",
        },
        {
            "id": "s232-semis",
            "question": "Is there a Section 232 or 100% tariff on semiconductors?",
            "searchedAs": ["section 232 semiconductors", "section 232 semiconductors tariffs", "section 232 semiconductor proclamation", "100 tariff on semiconductors",
                           "tariff on semiconductors from taiwan", "tariff on semiconductors trump"],
            "answer": "No 100% tariff is in force. Proclamation 11002 imposed a 25% Section 232 duty (9903.79.01) from January 15, 2026, but U.S. note 39 limits it to "
            "goods of 8471.50, 8471.80 and 8473.30 (computers and computer parts) that are or contain logic chips within narrow performance bands, with exemptions "
            "for U.S. data centers, repairs, R&D, startups, consumer, industrial and public-sector uses. Chips and semiconductors imported on their own "
            "(8541, 8542) are not covered, so Taiwanese chips enter free.",
            "link": "tariff-updates",
        },
        {
            "id": "smartphones",
            "question": "Is there a tariff on smartphones and iPhones?",
            "searchedAs": ["tariff on smartphones", "tariffs on smartphones from china", "us tariff on smartphones", "tariff on iphones", "is there a tariff on iphones",
                           "us tariff on iphones", "100 tariff on iphones"],
            "answer": "Smartphones (8517.13.00.00) enter free from China, India, Vietnam and almost every other country: the base rate is Free, smartphones are on no "
            "China Section 301 list, and they are exempt from the 2026 Section 301 duties (note 52(b)). The IEEPA duties that applied to Chinese phones in 2025 "
            "ended on February 24, 2026. The exception is Canada: Canadian smartphones pay 50% under Section 338 since August 22, 2026.",
            "link": "",
        },
        {
            "id": "batteries-china",
            "question": "What is the tariff on lithium-ion batteries from China?",
            "searchedAs": ["tariff on lithium ion batteries", "tariffs on lithium ion batteries from china", "tariff on batteries from china",
                           "tariff on lithium batteries from china", "what is the current tariff on batteries from china", "us tariffs on batteries from china"],
            "answer": "40.9% for lithium-ion batteries of 8507.60 that are not car parts: 3.4% base, 25% Section 301 (9903.91.06, since January 1, 2026) and 12.5% "
            "(2026 Section 301). Batteries that are parts of passenger cars or light trucks, such as EV battery packs, pay 53.4%: 3.4% + 25% Section 301 + 25% "
            "Section 232 auto parts (the 12.5% does not apply). CBP has not published how it treats batteries whose use in vehicles is mixed or unknown. Lead-acid batteries from China pay about 41%. From Mexico or Canada, USMCA batteries enter free.",
            "link": "industry-areas",
        },
        {
            "id": "solar",
            "question": "What are the U.S. tariffs on solar panels in 2026?",
            "searchedAs": ["tariff on solar panels", "tariff on solar panels from china", "us tariff on solar panels from india", "solar panel tariffs 2026",
                           "trump tariff on solar panels", "tariffs on solar panels from india", "us tariff on solar panels"],
            "answer": "Solar cells and modules (8541.42, 8541.43) are Free at base. Chinese ones pay 62.5% (50% + 12.5% Section 301) plus AD/CVD; Vietnamese, Thai, "
            "Malaysian and Cambodian ones pay 10%–12.5% plus the 2025 AD/CVD orders; Indian ones 10%, with AD/CVD orders to follow if the ITC finds injury. "
            "The Section 201 safeguard ended February 6, 2026. From December 4, 2026, Section 232 adds 15% (15% in total for the EU, Japan, Korea and Taiwan) and "
            "minimum import prices of $0.22 per watt for cells and $0.38 for modules.",
            "link": "tariff-updates",
        },
        {
            "id": "electronics-china",
            "question": "What is the tariff on electronics from China?",
            "searchedAs": ["tariff on electronics from china", "tariff on electronics from china to usa", "tariff rates for china"],
            "answer": "It depends on the product: smartphones Free; chips and semiconductors 50%; solar cells 62.5%; lithium-ion batteries 40.9% (53.4% as car parts); "
            "TVs about 24% (base + 7.5% List 4A + 12.5%); modems, switches and routers 25% (8517.62.00.10/.20, List 3); and most components, motors and transformers "
            "37.5% plus the base rate (25% List 1–3 + 12.5%). Section 232 duties stack on top for auto parts and metal-heavy goods.",
            "link": "industry-areas",
        },
        {
            "id": "electronics-other",
            "question": "What is the tariff on electronics from Canada, Japan, India, Germany or Taiwan?",
            "searchedAs": ["tariff on electronics from canada", "tariff on electronics from japan", "tariff on electronics from india", "tariff on electronics from germany",
                           "taiwan electronics tariff", "tariff on electronics from uk"],
            "answer": "Phones, chips, SSDs, display modules and monitors are Free from all of them except Canada (50% on phones, network gear, TVs and monitors under "
            "Section 338). Other goods pay the 2026 Section 301 duty: India and the UK +10%; Japan, Korea and Taiwan 12.5%, 12.5% and 10% in place of a lower base "
            "rate; Germany and the EU 10% in place of a lower base rate; USMCA goods of Canada are exempt. Auto parts pay 15% in total from Japan, the EU, Korea and "
            "Taiwan, 25% from India.",
            "link": "industry-areas",
        },
        {
            "id": "copper-wire",
            "question": "Is there a tariff on copper wire and cable?",
            "searchedAs": ["tariff on copper wire", "is there a tariff on copper wire"],
            "answer": "Yes. Insulated copper wire and cable of 8544.42 and 8544.49.10, and insulated cable of 8544.19, 8544.49.20/.90 and 8544.60, pay a 25% Section 232 "
            "duty on the full value (9903.82.09) from every country since April 6, 2026, on top of the base rate and even with a USMCA claim. Cable whose metal is "
            "under 15% of its weight is exempt. Bare copper wire of Chapter 74 pays 50%. Chinese aluminum wire and cable also carries AD/CVD.",
            "link": "tariff-updates",
        },
        {
            "id": "transformers",
            "question": "What is the U.S. tariff on transformers?",
            "searchedAs": ["transformers tariff", "us tariff on transformers"],
            "answer": "Liquid-dielectric and other transformers up to 10,000 kVA pay their base rate (Free to 6.6%) plus 25% Section 232 on the full value; transformers "
            "over 10,000 kVA and other transformers over 500 kVA pay 15% in total through 2027, then the base rate plus 25%. Chinese transformers also pay 25% "
            "Section 301. Large power transformers from Korea carry an antidumping order.",
            "link": "industry-areas",
        },
        {
            "id": "motors",
            "question": "What is the tariff on electric motors?",
            "searchedAs": ["tariffs on electric motors", "motor tariff rate"],
            "answer": "Motors of 8501 have base rates of Free to 6.7%. Motors of 8501.32–8501.52 pay 25% Section 232 when they are parts of cars or light trucks (15% in "
            "total from the EU, Japan, Korea and Taiwan) and 25% when they are truck parts; some multi-phase AC motors over 75 kW (8501.53.60, 8501.53.80) pay 25% under the metals program. "
            "Otherwise the 2026 Section 301 duty applies (10%–12.5%). Chinese motors pay 25% Section 301 plus 12.5% or the Section 232 duty.",
            "link": "industry-areas",
        },
        {
            "id": "tvs",
            "question": "What is the tariff on TVs?",
            "searchedAs": ["tariff on tvs", "tariff impact on tvs"],
            "answer": "LCD and OLED TVs of 8528.72 have base rates of Free to 5%. A 65-inch TV (8528.72.64.60, 3.9%) pays 23.9% from China, 16.4% from Vietnam or "
            "Thailand, 13.9% from a non-USMCA Mexican factory and nothing from a USMCA-qualifying one; Canadian TVs pay 50% more under Section 338.",
            "link": "industry-areas",
        },
        {
            "id": "hs-codes",
            "question": "What are the HS codes for smartphones, chips, batteries, solar panels and cable?",
            "searchedAs": ["hs code 8517.13", "hs code 8517.62", "hs code 8542.31", "hs code 8507.60", "hs code 8541.43", "hs code 8544.42", "hs code 8544.49"],
            "answer": "Smartphones 8517.13; routers, switches and modems 8517.62; processors and controllers 8542.31, memories 8542.32; lithium-ion batteries "
            "8507.60 (8507.60.00.10 for EV batteries); solar cells 8541.42 and modules 8541.43; insulated cable fitted with connectors 8544.42 and other cable up to "
            "1,000 V 8544.49. Use the searchable rate table on the overview to find the 10-digit line and its rates.",
            "link": "",
        },
    ]
