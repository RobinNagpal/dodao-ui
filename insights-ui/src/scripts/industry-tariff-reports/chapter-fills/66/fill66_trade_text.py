# Narrative that depends on the 2025 trade data (exec'd by fill66_trade.py). Figures checked against
# src/tariff-data/trade/chapter-66.json (UN Comtrade, retrieved 2026-10-13); the asserts stop a re-run on changed data.
assert ly == 2025 and round(total / 1e6, 1) == 552.0, total
assert round(BYC["China"]["importsUsd"] / 1e6, 1) == 489.5

ui["why"] = (
    "U.S. imports of Chapter 66 goods fell from **$689M in 2024 to $552M in 2025** (−19.9%), the lowest since 2020 and well "
    "below the 2022 peak of $888M. **Umbrellas are 78% of the chapter** ($430M): garden, patio and beach umbrellas (6601.10, "
    "$270M, −17%), telescopic folding umbrellas (6601.91, $118M, −31%) and other umbrellas such as stick and golf umbrellas "
    "(6601.99, $42M). Umbrella parts were $76M — mostly handles, bases and other parts (6603.90, $62M) plus frames ($14M) — "
    "and walking sticks, canes, whips and riding crops $46M, the only group that grew (+2%).\n\n"
    "**China supplies 89%** — $490M, down 23% from $639M — and $398M of it is umbrellas. The rest is small: Vietnam $15.6M "
    "(+53%, mostly umbrella parts), Taiwan $9.6M (mostly walking sticks and canes), Cambodia $9.0M (+90%, umbrellas), then "
    "Italy, Mexico and Canada at $3M–$4M each and Indonesia, Belgium and Germany at about $2M.\n\n"
    "Through 2025 Chinese umbrellas, which are on no Section 301 list, paid the IEEPA duties — 20%–30% extra for most of the year "
    "and 145% from April 10 to May 13 — while Vietnam and Cambodia paid 19%–20% from August 7 and USMCA-qualifying goods "
    "from Mexico and Canada paid nothing extra. Those duties ended on February 24, 2026; since July 24, 2026 a Section 301 "
    "tariff of 10% or 12.5% applies instead. 2025 is the latest full year of U.S. trade data."
)

ts = ov["tradeSnapshot"]
ts["biggestLines"] = [
    {"hts": "6601.10", "label": "Garden, patio and beach umbrellas"},
    {"hts": "6601.91", "label": "Telescopic-shaft (folding) umbrellas"},
    {"hts": "6603.90", "label": "Umbrella handles, tips, bases and other parts"},
    {"hts": "6602.00", "label": "Walking sticks, canes, whips and riding crops"},
]

ov["intro"] = (
    "Chapter 66 covers **umbrellas and sun umbrellas** — rain, golf, folding and stick umbrellas, parasols and patio, beach and "
    "garden umbrellas — **walking sticks, canes, seat sticks, whips and riding crops**, and **umbrella frames, handles and "
    "other parts**. Its **8 tariff lines** run from Free (telescopic umbrellas, rain-umbrella frames, handles and tips) to 12% "
    "(other umbrella frames); patio umbrellas pay 6.5%, stick and golf umbrellas 8.2%, walking sticks 4%.\n\n"
    "The extra duty by country decides the cost. Since **July 24, 2026** goods from 60 economies pay a **Section 301 tariff of "
    "10% or 12.5%** on every line — **12.5% from China and Vietnam**, 10% from Cambodia, India and Indonesia — and the only "
    "exemption is for CAFTA-DR umbrellas claimed duty-free under that agreement. China also pays **7.5% (List 4A)** on walking sticks and umbrella handles; its "
    "umbrellas are on no older China list. USMCA-qualifying goods from Mexico and Canada enter free, and EU and Taiwanese goods "
    "pay 10% in total. U.S. imports were **$552M in 2025**, and **China supplied 89%**."
)

fc = d["finalConclusion"]
fc["keyTakeaways"] = [
    "Chapter 66 base rates run from Free (telescopic umbrellas, rain-umbrella frames, handles and tips) to 12% (other umbrella frames); patio umbrellas pay 6.5%, stick and golf umbrellas 8.2%, walking sticks 4%. None changed since January 2025.",
    "Since July 24, 2026 every Chapter 66 line pays the Section 301 tariff on 60 economies — 12.5% from China and Vietnam, 10% from Cambodia, India and Indonesia — with no exemption or country exception list for this chapter except CAFTA-DR umbrellas claimed duty-free under the agreement (note 52(i)).",
    "China, 89% of the $552M of 2025 imports, also pays 7.5% (List 4A) on walking sticks and umbrella handles; Chinese umbrellas and frames are on no older China list because List 4B was suspended in 2019.",
    "USMCA-qualifying goods from Mexico and Canada enter free, EU and Taiwanese goods pay 10% in total and Japanese 12.5%. The IEEPA tariffs ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.",
    "Canes for people with chronic mobility impairments can enter Free under 9817.00.96, without the Section 301 duty; wooden or bamboo goods need a Lacey Act declaration, and medical canes are FDA Class I devices.",
]
fc["faqs"] = [
    {
        "id": "what-is-ch66",
        "question": "What does HTS Chapter 66 cover?",
        "searchedAs": ["hts chapter 66", "hs code 66", "umbrellas, sun umbrellas, walking sticks, seatsticks, whips, riding-crops and parts thereof tariff"],
        "answer": "Umbrellas and sun umbrellas (6601), walking sticks, seat sticks, whips and riding crops (6602), and umbrella frames, handles and other parts (6603) — 8 tariff lines in all. Measuring sticks (9017), sword-sticks (chapter 93), toy umbrellas (chapter 95) and textile umbrella covers and cases are classified elsewhere.",
        "link": "",
    },
    {
        "id": "hs-umbrella",
        "question": "What is the HS code for an umbrella?",
        "searchedAs": ["hs code for umbrella", "umbrella hs code", "umbrella tariff code", "harmonized tariff code for umbrella", "hts code for umbrella", "umbrella tariff number", "hs code 6601"],
        "answer": "Heading 6601. Garden, patio and beach umbrellas are 6601.10 (6.5%); other umbrellas with a telescopic shaft — most folding umbrellas — are 6601.91 (Free); other umbrellas, such as stick and golf umbrellas, are 6601.99 (8.2%). The country's extra duty comes on top: from China or Vietnam 12.5% more.",
        "link": "",
    },
    {
        "id": "hs-patio",
        "question": "What is the HS code for a patio, beach or sun umbrella?",
        "searchedAs": ["hs code for patio umbrella", "hs code for beach umbrella", "hs code for sun umbrella", "garden umbrella hs code", "outdoor umbrella hs code", "parasol hs code", "hs code 6601.10"],
        "answer": "Patio, market, beach and garden umbrellas are garden or similar umbrellas, 6601.10 at 6.5% whatever their pole — 6601.91 and 6601.99 cover only other umbrellas (HQ H248132; NY N334613). A hand-held parasol is an ordinary umbrella in 6601.99 (NY N028017). From China a patio umbrella pays 19% in total, from Cambodia 16.5%, from Italy 10%.",
        "link": "industry-areas",
    },
    {
        "id": "telescopic-golf",
        "question": "Telescopic, folding or golf umbrella: 6601.91 or 6601.99?",
        "searchedAs": ["hs code 6601.91", "hs code 6601.99", "hs code for golf umbrella", "folding umbrella hs code", "hts 6601.91 import duty rates"],
        "answer": "An umbrella whose shaft telescopes is 6601.91, Free at the base rate; one with a fixed shaft is 6601.99 at 8.2%. CBP put a fixed-shaft golf umbrella in 6601.99 although the importer claimed 6601.91 (NY N347448). From China the difference is 12.5% vs. 20.7% in total.",
        "link": "tariff-engineering",
    },
    {
        "id": "frames-parts",
        "question": "What is the HS code for umbrella frames, handles and parts?",
        "searchedAs": ["hs code for umbrella frame", "hs code for umbrella handle", "hs code 6603", "hs code 6603.90", "hts 6603.20.9000"],
        "answer": "Umbrella frames are 6603.20 — Free for hand-held rain umbrellas (6603.20.30), 12% for patio and other umbrellas (6603.20.90). Handles, knobs, tips and caps are 6603.90.41 (Free); other parts and accessories 6603.90.81 (5.2%). From China, handles also pay the 7.5% List 4A duty: 20% in total.",
        "link": "",
    },
    {
        "id": "base",
        "question": "What is the HS code for an umbrella base or stand?",
        "searchedAs": ["hs code for umbrella base", "hs code for umbrella stand", "umbrella base hs code"],
        "answer": "A base that holds a patio umbrella upright is an accessory of 6603.90.81, 5.2% — CBP ruled so for a fillable polyethylene base on wheels (NY N337801) and a beach-umbrella sand anchor (NY N281054). From China it pays 17.7% in total. It was on the Section 232 aluminum list from August 18, 2025 to April 6, 2026; now only Russian aluminum pays that duty.",
        "link": "tariff-updates",
    },
    {
        "id": "cover-fabric",
        "question": "How are umbrella covers, cases and canopy fabric classified?",
        "searchedAs": ["hs code for umbrella cover", "hs code for umbrella fabric", "protective cover for patio umbrella hs code"],
        "answer": "Not as umbrella parts: chapter note 2 keeps textile parts, covers, tassels, thongs and umbrella cases of any material out of heading 6603. Imported with but not fitted to an umbrella, they are classified on their own — by material, usually in the textile chapters.",
        "link": "",
    },
    {
        "id": "walking-stick",
        "question": "What is the HS code for walking sticks, canes and trekking poles?",
        "searchedAs": ["hs code for walking stick", "walking stick hs code", "hs code for walking cane", "hs code for hiking stick", "hs code for trekking poles", "wooden walking stick hs code", "hs code 6602"],
        "answer": "6602.00.00, 4%: walking sticks, canes, seat sticks and hiking, Nordic-walking and trekking poles (HQ H262581; NY N197699). From China it pays 24% in total (12.5% + 7.5% List 4A), from Vietnam 16.5%, from Taiwan 10%. Replacement cane tips are 6603.90.81 (NY N353993); crutches are 9021.",
        "link": "",
    },
    {
        "id": "medical-cane",
        "question": "Are medical walking canes duty-free?",
        "searchedAs": ["walking cane hs code", "quad cane import duty", "9817.00.96 cane"],
        "answer": "They can be. Canes specially designed for people with chronic mobility impairments — orthopedic, quad and mobility canes for the blind — qualify for 9817.00.96, Free (NY N356862, N352521), and Chapter 98 entries pay no Section 301 duty. Fashion canes and hiking poles do not qualify. Medical canes are also FDA Class I devices: the maker must register and list them.",
        "link": "tariff-engineering",
    },
    {
        "id": "whip-crop",
        "question": "What is the HS code for a riding crop or whip — and a selfie stick?",
        "searchedAs": ["hs code for riding crop", "hs code for whip", "hs code for selfie stick"],
        "answer": "Whips and riding crops share 6602.00.00 with walking sticks, 4% (NY R02119). A selfie stick is not a walking stick: CBP classified a monopod selfie stick in 9620.00.65 (NY N298912).",
        "link": "",
    },
    {
        "id": "china",
        "question": "What is the import duty on umbrellas from China?",
        "searchedAs": ["umbrella import duty from china", "umbrella import from china", "china tariff on umbrellas", "china section 301 umbrella duties"],
        "answer": "The base rate plus 12.5% (2026 Section 301, 9903.05.31): 19% on patio umbrellas, 12.5% on telescopic umbrellas, 20.7% on stick and golf umbrellas. Umbrellas and frames are on no 2018–2019 China list (List 4B was suspended); walking sticks and umbrella handles also pay 7.5% (List 4A). The IEEPA duties ended February 24, 2026.",
        "link": "tariff-updates",
    },
    {
        "id": "other-countries",
        "question": "What do umbrellas from Vietnam, Cambodia, Taiwan, Italy or Japan pay?",
        "searchedAs": ["cambodia umbrella import duty", "taiwan hts chapter 66 tariff", "italy umbrella import duty rates", "umbrellas made in italy", "umbrellas made in japan"],
        "answer": "Since July 24, 2026: Vietnam the base rate plus 12.5%, Cambodia and Indonesia plus 10%. Taiwan and EU countries such as Italy pay 10% in total and Japan 12.5% in total in place of the base rate (patio-umbrella frames at 12% pay only their base rate). Canada and Mexico pay nothing with a USMCA claim.",
        "link": "industry-areas",
    },
    {
        "id": "imports",
        "question": "How many umbrellas does the U.S. import, and from where?",
        "searchedAs": ["umbrella imports by country", "umbrella import"],
        "answer": "$552M of Chapter 66 goods in 2025, down 19.9% from $689M in 2024. China supplied 89% ($490M), then Vietnam ($15.6M), Taiwan ($9.6M) and Cambodia ($9.0M). Garden and patio umbrellas were $270M and telescopic umbrellas $118M.",
        "link": "understand-industry",
    },
    {
        "id": "rules",
        "question": "What else is needed to import umbrellas and walking sticks?",
        "searchedAs": ["umbrella manufacturing import regulations", "lacey act walking sticks compliance", "usda aphis lacey act walking sticks"],
        "answer": "Goods with wood, bamboo or other plant material need a Lacey Act declaration — walking sticks since 2010, umbrellas, frames and handles since December 1, 2024. Wooden or bamboo walking sticks from China must be treated and tagged. Umbrellas made for children need CPSC testing and an eFiled certificate, and every article needs an origin marking.",
        "link": "tariff-engineering",
    },
]
