# Static (trade-independent) content for HTS Chapter 07. Imported by fill.py.

TITLE = "Edible Vegetables and Certain Roots and Tubers"

CHAPTER_NOTES = (
    "**Note 1.** This chapter does not cover forage products of heading 1214.\n\n"
    "**Note 2.** In headings 0709, 0710, 0711 and 0712 the word \"vegetables\" includes edible mushrooms, truffles, olives, capers, "
    "marrows, pumpkins, eggplants (aubergines), sweet corn (Zea mays var. saccharata), fruits of the genus Capsicum (peppers) or of "
    "the genus Pimenta (e.g., allspice), fennel, parsley, chervil, tarragon, cress and sweet marjoram (Marjorana hortensis or "
    "Origanum marjorana).\n\n"
    "**Note 3.** Heading 0712 covers all dried vegetables of the kinds falling in headings 0701 to 0711, other than: (a) dried "
    "leguminous vegetables, shelled (heading 0713); (b) sweet corn in the forms specified in headings 1102 to 1104; (c) flour, meal, "
    "powder, flakes, granules and pellets of potatoes (heading 1105); (d) flour, meal and powder of the dried leguminous vegetables "
    "of heading 0713 (heading 1106).\n\n"
    "**Note 4.** However, dried or crushed or ground fruits of the genus Capsicum (peppers) or of the genus Pimenta (e.g., allspice) "
    "are excluded from this chapter (heading 0904).\n\n"
    "**Note 5.** Heading 0711 applies to vegetables which have been treated solely to ensure their provisional preservation during "
    "transport or storage prior to use (for example, by sulfur dioxide gas, in brine, in sulfur water or in other preservative "
    "solutions), provided they remain unsuitable for immediate consumption in that state."
)

ADDITIONAL_US_NOTES = (
    "**1.** Unless the context requires otherwise, the provisions of this chapter cover the named products whether or not reduced in size.\n\n"
    "**2.** In the assessment of duty on any kind of vegetables, any foreign matter or impurities mixed therewith shall not be "
    "segregated nor shall any allowance therefor be made.\n\n"
    "**3.** Articles of a kind covered by this chapter that can be used either for food or for sowing or planting (e.g., onions, "
    "onion sets, shallots, garlic, potatoes, and potato eyes) remain classified in this chapter even if rendered inedible as the "
    "result of treatment with insecticides, fungicides or similar chemicals.\n\n"
    "**4.** In subheading 0701.10, the expression \"seed\" covers only seed potatoes which are certified by a responsible officer or "
    "agency of a foreign government in accordance with official rules and regulations to have been grown and approved especially "
    "for use as seed, in containers marked with the foreign government's official seed potato tags and imported for use as seed.\n\n"
    "**5.** The aggregate quantity of olives entered under subheadings 0711.20.18 and 2005.70.06 in any calendar year shall not "
    "exceed 4,400 metric tons."
)

# heading -> (short label, blurb, search examples)
PRODUCT_GROUPS = {
    "0701": (
        "Potatoes",
        "Every potato line is 0.5¢/kg. Certified seed potatoes (0701.10) are on the 2026 Section 301 exemption list; table and "
        "processing potatoes are not.",
        ["potato", "seed potato", "russet", "red potato", "yellow potato"],
    ),
    "0702": (
        "Tomatoes",
        "3.9¢/kg from March 1 to July 14 and September 1 to November 14, 2.8¢/kg the rest of the year. No 2026 Section 301 "
        "duty applies to tomatoes, but fresh tomatoes from Mexico carry an antidumping duty (17.09% for most exporters).",
        ["tomato", "roma", "cherry tomato", "grape tomato", "greenhouse tomato"],
    ),
    "0703": (
        "Onions, garlic & leeks",
        "Onions 3.1¢/kg (onion sets 0.83¢/kg), garlic 0.43¢/kg, leeks 20%. Fresh garlic from China also carries an "
        "antidumping duty of $4.71/kg on top of its Section 301 duties.",
        ["onion", "garlic", "shallot", "leek", "onion sets"],
    ),
    "0704": (
        "Cabbage, broccoli & cauliflower",
        "Mostly ad valorem: broccoli and cauliflower 2.5% in summer (June 5 to October 15) and 10% otherwise (14% if cut), "
        "Brussels sprouts 12.5%, kale and other brassicas 20%, cabbage 0.54¢/kg.",
        ["broccoli", "cauliflower", "cabbage", "brussels sprouts", "kale"],
    ),
    "0705": (
        "Lettuce & chicory",
        "Lettuce is seasonal: 0.4¢/kg from June 1 to October 31, 3.7¢/kg the rest of the year. Witloof chicory and other "
        "chicory 0.15¢/kg.",
        ["lettuce", "iceberg", "romaine", "endive", "chicory"],
    ),
    "0706": (
        "Carrots, beets & other roots",
        "Whole carrots 0.7¢/kg (1.4¢/kg if under 10 cm), cut carrots 14.9%, turnips free, other salad roots such as radishes "
        "and beets 1.9% to 10%.",
        ["carrot", "baby carrot", "beet", "radish", "turnip"],
    ),
    "0707": (
        "Cucumbers",
        "The rate depends on the month: 4.2¢/kg December to February, 5.6¢/kg March to June and September to November, "
        "1.5¢/kg in July and August.",
        ["cucumber", "gherkin", "pickling cucumber", "english cucumber"],
    ),
    "0708": (
        "Fresh peas & beans",
        "Fresh peas 0.5¢/kg in July to September and 2.8¢/kg otherwise; fresh beans 4.9¢/kg; cowpeas (other than black-eye peas) free.",
        ["green beans", "snow peas", "peas", "fava beans"],
    ),
    "0709": (
        "Other fresh vegetables",
        "The chapter's biggest group: peppers 4.4¢ to 4.7¢/kg, squash 1.5¢/kg, asparagus 5% if air-freighted between "
        "September 15 and November 15 (otherwise 21.3%), fresh mushrooms 8.8¢/kg + 20%, sweet corn 21.3%, spinach and okra 20%. "
        "Jicama, breadfruit and chayote are on the Section 301 exemption list.",
        ["bell pepper", "chili pepper", "asparagus", "squash", "mushroom", "celery", "artichoke", "sweet corn"],
    ),
    "0710": (
        "Frozen vegetables",
        "Frozen potatoes, spinach and sweet corn 14%, frozen peas 1¢ to 2¢/kg, other frozen vegetables 11.3% whole or 14.9% "
        "cut, mixtures 14%. Frozen French fries are not here: they are prepared vegetables (Chapter 20).",
        ["frozen vegetables", "frozen peas", "frozen broccoli", "frozen corn", "frozen spinach"],
    ),
    "0711": (
        "Provisionally preserved vegetables",
        "Vegetables kept in brine or sulfur water for transport and not ready to eat: olives by drained weight (3.7¢ to 8.6¢/kg), "
        "cucumbers 7.7%, mushrooms 5.7¢/kg + 8%, capers 8%.",
        ["brined olives", "capers", "mushrooms in brine", "brined cucumbers"],
    ),
    "0712": (
        "Dried vegetables",
        "Some of the chapter's highest rates: onion powder and dried garlic 29.8%, other dried onion 21.3%, most other dried "
        "vegetables 8.3%. Dried shiitake and wood ear mushrooms are on the Section 301 exemption list.",
        ["dried garlic", "garlic powder", "onion powder", "dehydrated onion", "dried mushrooms"],
    ),
    "0713": (
        "Dried beans, peas & lentils",
        "Low per-kilogram rates: lentils 0.15¢/kg, chickpeas 1.4¢/kg, dry beans 0.8¢ to 1.5¢/kg, split peas and cowpeas free. "
        "Seeds for sowing, Bambara beans and guar seeds are on the Section 301 exemption list; ordinary dry beans and lentils are not.",
        ["lentils", "chickpeas", "black beans", "kidney beans", "dried peas", "mung beans"],
    ),
    "0714": (
        "Cassava, sweet potatoes & other roots",
        "Ad valorem rates from free to 20%: sweet potatoes 4.5% (6% frozen), cassava 7.9% to 11.3%, fresh taro 2.3%, fresh "
        "yautia 16%. Cassava, taro, yautia and frozen or dried roots are on the Section 301 exemption list; sweet potatoes and yams are not.",
        ["sweet potato", "cassava", "yuca", "taro", "yam", "water chestnut"],
    ),
}

WORKED_EXAMPLES = [
    {
        "title": "20 tonnes of Roma tomatoes from Sinaloa, entered in January",
        "line": "0702.00.60",
        "body": "From November 15 to the end of February the rate is 2.8¢/kg: 20,000 kg × $0.028 = **$560**, or **$0** with a "
        "USMCA claim. Tomatoes are on the Section 301 exemption list (9903.05.86), so no extra tariff applies. What does apply is "
        "the **antidumping duty on fresh tomatoes from Mexico**: a cash deposit of 17.09% of the entered value for most exporters "
        "(91 FR 33363). At $1.20/kg the load is worth $24,000, so the deposit is **$4,101.60** — far more than the tariff.",
    },
    {
        "title": "Air-freighted asparagus from Peru, entered in October",
        "line": "0709.20.10",
        "body": "Whole asparagus flown in between September 15 and November 15 pays 5% (21.3% at other times), and the Peru "
        "Trade Promotion Agreement (SPI **PE**) makes either rate Free. The 12.5% Section 301 duty on goods of Peru (9903.05.63) "
        "still applies with an FTA claim (U.S. note 52(a)): a $50,000 shipment pays **$6,250**. Without the PE claim it would pay "
        "another $2,500 (5%).",
    },
    {
        "title": "Garlic powder from China",
        "line": "0712.90.40",
        "body": "Dried garlic has a 29.8% base rate. Goods of China add 25% under Section 301 List 3 (9903.88.03) and 12.5% under "
        "the 2026 Section 301 action (9903.05.31): **67.3%** in total, or $6,730 on a $10,000 shipment. Fresh garlic (0703.20) is "
        "different: 0.43¢/kg + 37.5%, plus the antidumping deposit of $4.71/kg on garlic from China (89 FR 48373).",
    },
]
