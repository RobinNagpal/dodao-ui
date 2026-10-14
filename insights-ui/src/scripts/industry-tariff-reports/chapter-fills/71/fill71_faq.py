# Final conclusion / FAQ page (exec'd from fill71.py).
fc = d['finalConclusion']
fc['h1'] = f'HTS Chapter 71: {SHORT} — Tariff FAQ'
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (U.S. English), collected October 13, 2026'
fc['seo'] = {
    'title': 'Gold, Diamond & Jewelry Tariff FAQ: Is Gold Exempt? India, Israel, Swiss, China Rates & HS Codes (HTS Ch. 71) | KoalaGains',
    'shortDescription': 'Answers to what people search about U.S. tariffs on gold, silver, diamonds and jewelry: is gold exempt, Swiss gold '
    'bars, diamonds and gold jewelry from India, Israeli diamonds, jewelry from China, Canada and Italy, lab-grown diamonds, the Russian '
    'diamond ban, the Kimberley Process and the HS codes for jewelry, gold and diamonds.',
    'keywords': [
        'is gold exempt from tariffs',
        'tariff on gold jewelry from india to usa',
        'tariff on diamonds from india to usa',
        'swiss gold tariff',
        'tariff on silver',
        'tariffs on jewelry from china',
        'lab grown diamond tariff',
        'russian diamond ban',
        'kimberley process',
        'hs code for jewelry',
        'hs code for gold bar',
        'hts code for diamonds',
    ],
}
fc['intro'] = (
    'Straight answers to the most common questions about U.S. tariffs and import rules for gold, silver, platinum, diamonds, gemstones and '
    'jewelry. Each answer links to the page with the full detail.'
)
fc['keyTakeaways'] = [
    'Most Chapter 71 base rates are Free — bullion, bars, diamonds, gemstones, pearls and coin; fine jewelry pays 5%–13.5%, costume '
    'jewelry up to 11%.',
    'Gold, silver bullion, platinum-group metals, minted bars and legal-tender coin are exempt from the 2026 Section 301 duty from every '
    'country — and were exempt from the 2025 reciprocal tariff (gold bars from September 8, 2025). Only China adds 25% (List 3).',
    'Diamonds, gemstones and jewelry pay the Section 301 duty by country since July 24, 2026: India +10%; Israel, the UAE, South Africa, '
    'Thailand and Hong Kong +12.5%; EU 10% and Switzerland and Japan 12.5% in total — but EU and Swiss diamonds, gemstones and natural '
    'pearls are exempt.',
    'China pays +12.5% plus 7.5% (List 4A) on jewelry and stones or 25% (List 3) on metals: 25.5% on gold jewelry, 31% on costume jewelry.',
    'Canadian polished diamonds, cast silver bars, silver and gold jewelry, costume jewelry and non-legal-tender coin pay a 50% Section 338 '
    'duty since August 22, 2026, even under USMCA.',
    'The IEEPA duties (50% on Indian diamonds and jewelry, 39% on Swiss goods in 2025) ended February 24, 2026, and the 10% Section 122 '
    'surcharge ended July 23, 2026. Imports of Russian gold and diamonds stay banned, and rough diamonds need a Kimberley Process certificate.',
]

FAQS = [
    {
        'id': 'gold-exempt',
        'question': 'Is gold exempt from U.S. tariffs?',
        'searchedAs': ['is gold exempt from tariffs', 'is gold exempt from us tariffs', 'are gold and silver exempt from tariffs', 'tariff on gold',
                       'tariff on gold bars', 'gold bar tariff', 'tariff on gold bullion'],
        'answer': 'Yes, almost everywhere. Every gold line of heading 7108 — bullion, doré, cast bars, powder, leaf — plus minted bars '
        '(7115.90.05) and legal-tender coin (7118.90) has a Free base rate and is on the general exemption list of the 2026 Section 301 '
        'tariffs (note 52(b), 9903.05.86). They were also exempt from the 10% Section 122 surcharge (February 24 – July 23, 2026) and from the '
        '2025 reciprocal tariff — unwrought bullion from April 5, 2025, cast bars only from September 8, 2025. The exception is China: Chinese '
        'gold still pays the 25% List 3 duty. Gold jewelry is not exempt (see below), and Russian gold cannot be imported.',
        'link': 'tariff-updates',
    },
    {
        'id': 'swiss-gold',
        'question': 'What is the tariff on Swiss gold bars?',
        'searchedAs': ['swiss gold tariff', 'swiss tariffs gold bars', 'switzerland tariff gold bar', 'swiss gold us tariffs',
                       'swiss gold bullion import tariffs'],
        'answer': 'Nothing today. Swiss 1-kilogram and 100-ounce cast bars are 7108.13.55 (Free) and exempt from the 12.5%-in-total Section 301 '
        'rate on Swiss goods. In 2025 they were not: CBP ruled on July 31, 2025 (NY N351466) that stamped cast bars are semi-manufactured gold, '
        'not exempt unwrought bullion, so they paid the 39% Swiss reciprocal rate from August 7 until Executive Order 14346 exempted all gold '
        'forms from September 8, 2025. Swiss gold jewelry pays 12.5% in total; Swiss diamonds and gemstones are exempt.',
        'link': 'tariff-updates',
    },
    {
        'id': 'gold-jewelry-india',
        'question': 'What is the tariff on gold jewelry from India to the USA?',
        'searchedAs': ['tariff on gold jewelry from india to usa', 'tariff on gold from india to usa', 'tariff on jewelry from india to usa',
                       'gold jewelry import duty usa', 'tariff on gold jewelry'],
        'answer': 'Indian gold jewelry (7113.19, mostly 5.5%) pays 15.5% — the base rate plus the 10% Section 301 duty on Indian goods '
        '(9903.05.44) in force since July 24, 2026. Silver jewelry pays 15%. GSP, which once made it duty-free, expired in 2020. In 2025 the '
        'same jewelry paid 30.5% from August 7 and 55.5% from August 27 under IEEPA; those duties ended in February 2026, and importers can '
        'claim refunds through CBP\'s CAPE process. Gold bars and bullion from India are exempt.',
        'link': 'industry-areas',
    },
    {
        'id': 'diamonds-india',
        'question': 'What is the U.S. tariff on diamonds from India?',
        'searchedAs': ['tariff on diamonds from india to usa', 'tariff on loose diamonds from india to usa', 'diamond tariff india',
                       'tariff on diamonds from india', '50 tariff on diamonds', 'trump tariff on diamonds', 'tariff on diamonds'],
        'answer': 'Cut and polished diamonds (7102.39) have a Free base rate. Since July 24, 2026 Indian diamonds pay the 10% Section 301 duty — '
        '$10,000 on a $100,000 parcel — because India has no exception list for stones. Lab-grown diamonds from India (7104.91.10) pay 10% too. '
        'The "50% tariff on diamonds" was the IEEPA rate on Indian goods from August 27, 2025; it fell to 25% on February 7, 2026 and ended on '
        'February 24, 2026.',
        'link': 'industry-areas',
    },
    {
        'id': 'diamonds-israel-belgium',
        'question': 'What is the tariff on diamonds from Israel and Belgium?',
        'searchedAs': ['tariff on diamonds from israel', 'us tariff on diamonds', 'tariff on diamonds in usa', 'import duty on diamonds in usa',
                       'new tariff on diamonds'],
        'answer': 'Israeli polished diamonds pay 12.5% (9903.05.47); the U.S.–Israel FTA does not remove the Section 301 duty. Diamonds from '
        'Belgium and every other EU country, and from Switzerland, enter Free: the EU and Swiss exception lists in note 52(j) cover unsorted, '
        'rough and polished non-industrial diamonds (7102.10, 7102.31, 7102.39). UAE and South African diamonds pay 12.5%, Canadian polished '
        'diamonds 50%.',
        'link': 'industry-areas',
    },
    {
        'id': 'silver',
        'question': 'Is there a tariff on silver and silver bullion?',
        'searchedAs': ['tariff on silver', 'tariffs on silver bullion', 'us tariff on silver', 'tariffs on silver from canada',
                       'tariff on silver and gold', 'silver bullion tariff'],
        'answer': 'Silver bullion and doré (7106.91.10) are Free and exempt from the Section 301 duty. Cast silver bars of 99.5% (7106.92.10) are '
        'Free but not exempt: they pay the country\'s Section 301 rate — 10% from the UK or Mexico (unless USMCA), 12.5% in total from '
        'Switzerland — and from Canada the 50% Section 338 duty, even under USMCA. Minted silver bars (7115.90.05) and legal-tender silver '
        'coins (7118.90) are exempt. Other semi-manufactured silver pays 3%.',
        'link': '',
    },
    {
        'id': 'jewelry-china',
        'question': 'What are the tariffs on jewelry from China?',
        'searchedAs': ['tariffs on jewelry from china', 'tariffs on jewelry from china to usa', 'us tariff on jewelry from china',
                       'are there tariffs on jewelry from china', 'tariff on jewelry from china to usa'],
        'answer': 'Chinese jewelry pays the base rate plus 12.5% (2026 Section 301, 9903.05.31) plus 7.5% (List 4A, 9903.88.15): gold jewelry '
        '25.5%, silver jewelry 25%, base-metal costume jewelry 31%. Toy jewelry and a few pearl and gemstone lines on the suspended List 4B pay '
        'only the 12.5%. Chinese gold and silver bullion pays 25% (List 3). USTR kept both lists after its 2026 review.',
        'link': 'industry-areas',
    },
    {
        'id': 'jewelry-canada-uk-italy',
        'question': 'What is the tariff on jewelry from Canada, the UK, Italy and Australia?',
        'searchedAs': ['tariff on jewelry from canada to usa', 'tariff on jewelry from uk to usa', 'tariff on jewelry from italy',
                       'tariff on jewelry from australia to usa', 'tariff on jewelry from canada'],
        'answer': 'Canada: silver and gold jewelry (7113.11.50, 7113.19.29, 7113.19.50) and base-metal costume jewelry (7117.19.90) pay 50% '
        'under Section 338 even when USMCA is claimed; other USMCA-qualifying jewelry pays nothing. UK: base rate + 10% — 15.5% on gold '
        'jewelry. Italy and the rest of the EU: 10% in total on gold and silver jewelry. Australia: the FTA removes the base rate, but the '
        '12.5% Section 301 duty applies.',
        'link': 'industry-areas',
    },
    {
        'id': 'lab-grown',
        'question': 'Is there a tariff on lab-grown diamonds?',
        'searchedAs': ['lab grown diamond tariff'],
        'answer': 'Lab-grown diamonds are synthetic stones of heading 7104. Cut but unset lab-grown diamonds for jewelry (7104.91.10) are Free; '
        'rough ones (7104.21) pay 3%, other worked ones 6.4%. Unlike natural diamonds they are on no Section 301 exception list, so they pay '
        'the country rate from everywhere on the list — 10% from India, 20% from China (12.5% + 7.5%), 10% in total from the EU. They must be '
        'described as laboratory-grown when sold (16 CFR 23.12).',
        'link': '',
    },
    {
        'id': 'russian-diamonds',
        'question': 'Why are Russian diamonds banned, and what does the ban cover?',
        'searchedAs': ['russian diamond ban', 'g7 russian diamond ban', 'why are russian diamonds banned'],
        'answer': 'Under Executive Order 14068 (March 2022), the sanctions over Russia\'s war against Ukraine, imports of non-industrial '
        'diamonds of Russian origin are prohibited. Since March 1, 2024 the ban also covers Russian diamond jewelry and unsorted diamonds, '
        'and Russian-mined diamonds of 1.0 carat or more even if cut in another country — 0.5 carat or more since September 1, 2024. OFAC '
        'General License 104B lets stones that were outside Russia before those dates in through September 1, 2027. Russian gold has been '
        'banned since June 28, 2022.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'kimberley',
        'question': 'What is the Kimberley Process, and how does it apply to U.S. imports?',
        'searchedAs': ['kimberley process', 'kimberley process diamonds', 'kimberley process certification scheme',
                       'kimberley process certification', 'kimberley process countries'],
        'answer': 'The Kimberley Process Certification Scheme tracks rough diamonds to keep conflict diamonds out of trade. Under the Clean '
        'Diamond Trade Act (19 U.S.C. 3903) and 31 CFR part 592, rough diamonds (7102.10, 7102.21, 7102.31) may be imported only from a '
        'participant listed by the State Department, sealed in a tamper-resistant container, with an original Kimberley Process certificate '
        'that the importer keeps five years. It does not apply to polished diamonds or jewelry and adds no duty.',
        'link': 'tariff-engineering',
    },
    {
        'id': 'hs-codes',
        'question': 'What are the HS codes for jewelry, gold and diamonds?',
        'searchedAs': ['hs code for jewelry', 'hs code for gold jewelry', 'hs code for gold bar', 'hts code for diamonds', 'hs code for loose diamonds',
                       'hs code for rough diamonds', 'hs code for jewelry sterling silver', 'hs code for gold plated jewelry', 'hs code for gold bullion'],
        'answer': 'Gold or platinum jewelry: 7113.19 (rings, earrings, bracelets mostly 7113.19.50, 5.5%); sterling silver jewelry: 7113.11 (5% '
        'for most); gold-plated or other costume jewelry: 7117 (up to 11%). Gold bullion and doré: 7108.12.10; cast gold bars: 7108.13.55; '
        'minted bars: 7115.90.05. Loose polished diamonds: 7102.39 (split at 0.5 carat); rough diamonds: 7102.10, 7102.21 or 7102.31; '
        'lab-grown diamonds: 7104.91 or 7104.21. The rate table on the overview page lists all 140 lines.',
        'link': '',
    },
    {
        'id': 'customs-jewelry',
        'question': 'Do you have to pay customs duty on jewelry you bring into the U.S.?',
        'searchedAs': ['do you have to pay customs on jewelry', 'do you have to pay duty on jewelry', 'can i bring gold jewelry to usa',
                       'what is the customs duty on jewelry', 'jewelry import duty usa'],
        'answer': 'A returning U.S. resident can bring up to $800 of goods bought abroad, jewelry included, duty-free in accompanied baggage '
        '(19 CFR 148.33); personal-use baggage is also outside the 2026 Section 301 duty. Above that, or for jewelry shipped or sold, the base '
        'rate (5%–13.5% for fine jewelry) plus the country\'s extra duty applies. Duty-free de minimis entry of parcels under $800 has been '
        'suspended since August 29, 2025.',
        'link': '',
    },
    {
        'id': 'gold-coins',
        'question': 'Are there tariffs on gold coins?',
        'searchedAs': ['tariffs on gold coins', 'duty on gold coins', 'tariff on gold coins', 'import duty on gold coins'],
        'answer': 'No for legal-tender bullion coins such as the Canadian Maple Leaf, Krugerrand or Britannia: they are 7118.90 (Free) and exempt '
        'from the Section 301 duty, so they pay nothing from any country — Chinese coin aside (7.5% List 4A). Coin that is not legal tender '
        '(7118.10, Free) is not exempt, and from Canada it pays 50% under Section 338. Transporting more than $10,000 in coin must be reported.',
        'link': '',
    },
    {
        'id': 'platinum',
        'question': 'Is there a tariff on platinum and palladium?',
        'searchedAs': ['tariff on platinum'],
        'answer': 'No. Platinum, palladium, rhodium, iridium, osmium and ruthenium (heading 7110) are Free and exempt from the 2026 Section 301 '
        'duty, so South African, Swiss or UK platinum pays nothing. Chinese platinum-group metals pay 25% (List 3); Russian ones pay column 2 '
        'or 35%. No Section 232 duty applies to them.',
        'link': 'industry-areas',
    },
]
fc['faqs'] = FAQS
