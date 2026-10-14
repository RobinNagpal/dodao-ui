"""Official sources for the Chapter 72 content file (id -> TariffUpdateSource)."""

FR = "Federal Register"
CH99 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099"
CH72 = "https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2072"


def s(id, publisher, citation, document, title, signed, published, url):
    return dict(id=id, publisher=publisher, citation=citation, document=document, title=title, signed=signed, published=published, url=url)


def fr(id, citation, document, title, signed, published, docnum, slug):
    y, m, d = published.split("-")
    return s(id, FR, citation, document, title, signed, published, f"https://www.federalregister.gov/documents/{y}/{m}/{d}/{docnum}/{slug}")


EXTRA = [
    # ---- Section 232 steel history
    fr("procl-9705", "83 FR 11625", "Proclamation 9705", "Adjusting Imports of Steel Into the United States", "2018-03-08", "2018-03-15", "2018-05478", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-9759", "83 FR 25857", "Proclamation 9759", "Adjusting Imports of Steel Into the United States", "2018-05-31", "2018-06-05", "2018-12140", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-9894", "84 FR 23987", "Proclamation 9894", "Adjusting Imports of Steel Into the United States", "2019-05-19", "2019-05-23", "2019-11002", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-10328", "87 FR 11", "Proclamation 10328", "Adjusting Imports of Steel Into the United States", "2021-12-27", "2022-01-03", "2021-28516", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-10356", "87 FR 19351", "Proclamation 10356", "Adjusting Imports of Steel Into the United States", "2022-03-31", "2022-04-01", "2022-07136", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-10406", "87 FR 33591", "Proclamation 10406", "Adjusting Imports of Steel Into the United States", "2022-05-31", "2022-06-03", "2022-12108", "adjusting-imports-of-steel-into-the-united-states"),
    fr("procl-10783", "89 FR 57347", "Proclamation 10783", "Adjusting Imports of Steel Into the United States", "2024-07-10", "2024-07-15", "2024-15641", "adjusting-imports-of-steel-into-the-united-states"),
    s("csms-62582900", "U.S. Customs and Border Protection", "CSMS # 62582900", "CBP CSMS message", "GUIDANCE: Section 232 Melt and Pour Requirements", None, "2024-10-09", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3baf074"),
    s("csms-64366327", "U.S. Customs and Border Protection", "CSMS # 64366327", "CBP CSMS message", "ACE Entry Summary Create/Update CATAIR Updated with Aluminum Smelt and Cast and Steel Melt and Pour Changes", None, "2025-03-10", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3d626f7"),
    fr("procl-10896", "90 FR 9817", "Proclamation 10896", "Adjusting Imports of Steel Into the United States", "2025-02-10", "2025-02-18", "2025-02833", "adjusting-imports-of-steel-into-the-united-states"),
    fr("eo-14289", "90 FR 18907", "Executive Order 14289", "Addressing Certain Tariffs on Imported Articles", "2025-04-29", "2025-05-02", "2025-07835", "addressing-certain-tariffs-on-imported-articles"),
    fr("procl-10947", "90 FR 24199", "Proclamation 10947", "Adjusting Imports of Aluminum and Steel Into the United States", "2025-06-03", "2025-06-09", "2025-10524", "adjusting-imports-of-aluminum-and-steel-into-the-united-states"),
    fr("eo-14309", "90 FR 26419", "Executive Order 14309", "Implementing the General Terms of the United States of America-United Kingdom Economic Prosperity Deal", "2025-06-16", "2025-06-23", "2025-11473", "implementing-the-general-terms-of-the-united-states-of-america-united-kingdom-economic-prosperity"),
    fr("procl-10984", "90 FR 48451", "Proclamation 10984", "Adjusting Imports of Medium- and Heavy-Duty Vehicles, Medium- and Heavy-Duty Vehicle Parts, and Buses Into the United States", "2025-10-17", "2025-10-22", "2025-19639", "adjusting-imports-of-medium--and-heavy-duty-vehicles-medium--and-heavy-duty-vehicle-parts-and-buses"),
    s("csms-68253075", "U.S. Customs and Border Protection", "CSMS # 68253075", "CBP CSMS message", "GUIDANCE: Section 232 Duties on Imports of Aluminum, Steel, and Copper", None, "2026-04-03", "https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593"),
    fr("fr-2026-07987", "91 FR 21790", "Notice (Commerce / ITA)", "Procedures for Submissions by Certain Steel and Aluminum Producers Committing to New U.S. Steel or Aluminum Production To Obtain Tariff Adjustments Under Proclamation 10984", None, "2026-04-23", "2026-07987", "procedures-for-submissions-by-certain-steel-and-aluminum-producers-committing-to-new-us-steel-or"),
    # ---- IEEPA, Supreme Court, Section 122
    fr("eo-14193", "90 FR 9113", "Executive Order 14193", "Imposing Duties To Address the Flow of Illicit Drugs Across Our Northern Border", "2025-02-01", "2025-02-07", "2025-02406", "imposing-duties-to-address-the-flow-of-illicit-drugs-across-our-northern-border"),
    fr("eo-14194", "90 FR 9117", "Executive Order 14194", "Imposing Duties To Address the Situation at Our Southern Border", "2025-02-01", "2025-02-07", "2025-02407", "imposing-duties-to-address-the-situation-at-our-southern-border"),
    fr("eo-14257", "90 FR 15041", "Executive Order 14257", "Regulating Imports With a Reciprocal Tariff To Rectify Trade Practices That Contribute to Large and Persistent Annual United States Goods Trade Deficits", "2025-04-02", "2025-04-07", "2025-06063", "regulating-imports-with-a-reciprocal-tariff-to-rectify-trade-practices-that-contribute-to-large-and"),
    s("scotus-24-1287", "Supreme Court of the United States", "607 U.S. 229", "Opinion, No. 24-1287", "Learning Resources, Inc. v. Trump", None, "2026-02-20", "https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf"),
    fr("eo-14389", "91 FR 9437", "Executive Order 14389", "Ending Certain Tariff Actions", "2026-02-20", "2026-02-25", "2026-03832", "ending-certain-tariff-actions"),
    s("csms-67834313", "U.S. Customs and Border Protection", "CSMS # 67834313", "CBP CSMS message", "Ending Collection of International Emergency Economic Powers Act Duties", None, "2026-02-22", "https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9"),
    fr("procl-11012", "91 FR 9339", "Proclamation 11012", "Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems", "2026-02-20", "2026-02-25", "2026-03824", "imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems"),
    # ---- AD/CVD orders (Commerce / ITA)
    fr("fr-2016-23836", "81 FR 67962", "Notice (Commerce / ITA)", "Certain Hot-Rolled Steel Flat Products From Australia, Brazil, Japan, the Republic of Korea, the Netherlands, the Republic of Turkey, and the United Kingdom: Amended Final Affirmative Antidumping Determinations for Australia, the Republic of Korea, and the Republic of Turkey and Antidumping Duty Orders", None, "2016-10-03", "2016-23836", "certain-hot-rolled-steel-flat-products-from-australia-brazil-japan-the-republic-of-korea-the"),
    fr("fr-2026-09707", "91 FR 27268", "Notice (Commerce / ITA)", "Certain Hot-Rolled Steel Flat Products From the Republic of Korea: Final Results of Antidumping Duty Administrative Review; 2023-2024", None, "2026-05-14", "2026-09707", "certain-hot-rolled-steel-flat-products-from-the-republic-of-korea-final-results-of-antidumping-duty"),
    fr("fr-2026-03999", "91 FR 10079", "Notice (Commerce / ITA)", "Certain Hot-Rolled Steel Flat Products From the Netherlands: Final Results of Antidumping Duty Administrative Review; 2023-2024", None, "2026-03-02", "2026-03999", "certain-hot-rolled-steel-flat-products-from-the-netherlands-final-results-of-antidumping-duty"),
    fr("fr-2025-19411", "90 FR 48046", "Notice (Commerce / ITA)", "Certain Hot-Rolled Carbon Steel Flat Products From India, Indonesia, the People's Republic of China, Taiwan, Thailand, and Ukraine: Continuation of Antidumping Duty and Countervailing Duty Orders", None, "2025-10-03", "2025-19411", "certain-hot-rolled-carbon-steel-flat-products-from-india-indonesia-the-peoples-republic-of-china"),
    fr("fr-2022-18348", "87 FR 52360", "Notice (Commerce / ITA)", "Cold-Rolled Steel Flat Products From Brazil, China, India, Japan, the Republic of Korea, and the United Kingdom: Continuation of Antidumping Duty Orders (China, Japan, Korea, and UK), Continuation of Antidumping and Countervailing Duty Orders (India), and Revocation of Antidumping and Countervailing Duty Orders (Brazil)", None, "2022-08-25", "2022-18348", "cold-rolled-steel-flat-products-from-brazil-china-india-japan-the-republic-of-korea-and-the-united"),
    fr("fr-2022-17919", "87 FR 51056", "Notice (Commerce / ITA)", "Certain Cold-Rolled Steel Flat Products From the People's Republic of China and the Republic of Korea: Continuation of Countervailing Duty Orders", None, "2022-08-19", "2022-17919", "certain-cold-rolled-steel-flat-products-from-the-peoples-republic-of-china-and-the-republic-of-korea"),
    fr("fr-2022-17711", "87 FR 50601", "Notice (Commerce / ITA)", "Corrosion-Resistant Steel Products From India, Italy, the People's Republic of China, the Republic of Korea, and Taiwan: Continuation of the Antidumping and Countervailing Duty Orders", None, "2022-08-17", "2022-17711", "corrosion-resistant-steel-products-from-india-italy-the-peoples-republic-of-china-the-republic-of"),
    fr("fr-2025-23431", "90 FR 59494", "Notice (Commerce / ITA)", "Corrosion-Resistant Steel Products From Brazil and Mexico: Amended Final Antidumping Duty Determination; Corrosion-Resistant Steel Products From Australia, Brazil, Canada, Mexico, the Netherlands, South Africa, Taiwan, the Republic of Türkiye, the United Arab Emirates, and the Socialist Republic of Vietnam: Antidumping Duty Orders", None, "2025-12-19", "2025-23431", "corrosion-resistant-steel-products-from-brazil-and-mexico-amended-final-antidumping-duty"),
    fr("fr-2025-23430", "90 FR 59488", "Notice (Commerce / ITA)", "Certain Corrosion-Resistant Steel Products From Brazil, Canada, Mexico, and the Socialist Republic of Vietnam: Countervailing Duty Orders", None, "2025-12-19", "2025-23430", "certain-corrosion-resistant-steel-products-from-brazil-canada-mexico-and-the-socialist-republic-of"),
    fr("fr-2017-10757", "82 FR 24096", "Notice (Commerce / ITA)", "Certain Carbon and Alloy Steel Cut-To-Length Plate From Austria, Belgium, France, the Federal Republic of Germany, Italy, Japan, the Republic of Korea, and Taiwan: Amended Final Affirmative Antidumping Determinations for France, the Federal Republic of Germany, the Republic of Korea and Taiwan, and Antidumping Duty Orders", None, "2017-05-25", "2017-10757", "certain-carbon-and-alloy-steel-cut-to-length-plate-from-austria-belgium-france-the-federal-republic"),
    fr("fr-2017-05440", "82 FR 14349", "Notice (Commerce / ITA)", "Certain Carbon and Alloy Steel Cut-to-Length Plate From the People's Republic of China: Antidumping Duty Order", None, "2017-03-20", "2017-05440", "certain-carbon-and-alloy-steel-cut-to-length-plate-from-the-peoples-republic-of-china-antidumping"),
    fr("fr-2026-09826", "91 FR 28573", "Notice (Commerce / ITA)", "Non-Oriented Electrical Steel From Sweden, Germany, the People's Republic of China, the Republic of Korea, Taiwan and Japan: Continuation of Antidumping Duty Orders and Countervailing Duty Orders", None, "2026-05-18", "2026-09826", "non-oriented-electrical-steel-from-sweden-germany-the-peoples-republic-of-china-the-republic-of"),
    fr("fr-2026-08745", "91 FR 24157", "Notice (Commerce / ITA)", "Tin Mill Products From the People's Republic of China, Taiwan, and the Republic of Türkiye: Initiation of Less-Than-Fair-Value Investigations", None, "2026-05-05", "2026-08745", "tin-mill-products-from-the-peoples-republic-of-china-taiwan-and-the-republic-of-trkiye-initiation-of"),
    fr("fr-2026-08744", "91 FR 24170", "Notice (Commerce / ITA)", "Tin Mill Products From the People's Republic of China: Initiation of Countervailing Duty Investigation", None, "2026-05-05", "2026-08744", "tin-mill-products-from-the-peoples-republic-of-china-initiation-of-countervailing-duty-investigation"),
    fr("fr-2026-18792", "91 FR 58418", "Notice (Commerce / ITA)", "Tin Mill Products From the People's Republic of China: Preliminary Affirmative Countervailing Duty Determination, Preliminary Affirmative Critical Circumstances Determination, and Alignment of Final Determination With Final Antidumping Duty Determination", None, "2026-09-15", "2026-18792", "tin-mill-products-from-the-peoples-republic-of-china-preliminary-affirmative-countervailing-duty"),
    fr("fr-2026-19274", "91 FR 59760", "Notice (Commerce / ITA)", "Tin Mill Products From the People's Republic of China: Preliminary Affirmative Determination of Sales at Less Than Fair Value, Preliminary Affirmative Determination of Critical Circumstances and Extension of Provisional Measures", None, "2026-09-21", "2026-19274", "tin-mill-products-from-the-peoples-republic-of-china-preliminary-affirmative-determination-of-sales"),
    fr("fr-2026-07109", "91 FR 18817", "Notice (Commerce / ITA)", "Steel Concrete Reinforcing Bar From Mexico and the Republic of Türkiye: Continuation of Antidumping Duty Order and Countervailing Duty Order", None, "2026-04-13", "2026-07109", "steel-concrete-reinforcing-bar-from-mexico-and-the-republic-of-trkiye-continuation-of-antidumping"),
    fr("fr-2026-08284", "91 FR 23062", "Notice (Commerce / ITA)", "Steel Concrete Reinforcing Bar From Algeria: Antidumping Duty Order", None, "2026-04-29", "2026-08284", "steel-concrete-reinforcing-bar-from-algeria-antidumping-duty-order"),
    fr("fr-2026-13488", "91 FR 40970", "Notice (Commerce / ITA)", "Steel Concrete Reinforcing Bar From Algeria: Countervailing Duty Order", None, "2026-07-06", "2026-13488", "steel-concrete-reinforcing-bar-from-algeria-countervailing-duty-order"),
    fr("fr-2026-19102", "91 FR 59104", "Notice (Commerce / ITA)", "Steel Concrete Reinforcing Bar From Bulgaria, Egypt, and the Socialist Republic of Vietnam: Antidumping Duty Orders", None, "2026-09-18", "2026-19102", "steel-concrete-reinforcing-bar-from-bulgaria-egypt-and-the-socialist-republic-of-vietnam-antidumping"),
    fr("fr-2026-19103", "91 FR 59102", "Notice (Commerce / ITA)", "Steel Concrete Reinforcing Bar From the Socialist Republic of Vietnam and Egypt: Countervailing Duty Orders", None, "2026-09-18", "2026-19103", "steel-concrete-reinforcing-bar-from-the-socialist-republic-of-vietnam-and-egypt-countervailing-duty"),
    fr("fr-2026-01600", "91 FR 3418", "Notice (Commerce / ITA)", "Carbon and Certain Alloy Steel Wire Rod From the People's Republic of China: Continuation of Antidumping Duty Order and Countervailing Duty Order", None, "2026-01-27", "2026-01600", "carbon-and-certain-alloy-steel-wire-rod-from-the-peoples-republic-of-china-continuation-of"),
    fr("fr-2026-04121", "91 FR 10071", "Notice (Commerce / ITA)", "Carbon and Certain Alloy Steel Wire Rod From Brazil, Indonesia, Mexico, Moldova, and Trinidad and Tobago: Continuation of Antidumping Duty Orders and Countervailing Duty Order", None, "2026-03-02", "2026-04121", "carbon-and-certain-alloy-steel-wire-rod-from-brazil-indonesia-mexico-moldova-and-trinidad-and-tobago"),
    fr("fr-2026-19107", "91 FR 59107", "Notice (Commerce / ITA)", "Carbon and Alloy Steel Wire Rod From Algeria: Final Affirmative Countervailing Duty Determination and Countervailing Duty Order", None, "2026-09-18", "2026-19107", "carbon-and-alloy-steel-wire-rod-from-algeria-final-affirmative-countervailing-duty-determination-and"),
    fr("fr-2022-24023", "87 FR 66651", "Notice (Commerce / ITA)", "Stainless Steel Sheet and Strip From the People's Republic of China: Continuation of Antidumping and Countervailing Duty Orders", None, "2022-11-04", "2022-24023", "stainless-steel-sheet-and-strip-from-the-peoples-republic-of-china-continuation-of-antidumping-and"),
    fr("fr-2025-08986", "90 FR 21456", "Notice (Commerce / ITA)", "Ferrosilicon From Malaysia: Amended Final Determination of Sales at Less Than Fair Value; Ferrosilicon From Brazil, Kazakhstan, and Malaysia: Antidumping Duty Orders", None, "2025-05-20", "2025-08986", "ferrosilicon-from-malaysia-amended-final-determination-of-sales-at-less-than-fair-value-ferrosilicon"),
    fr("fr-2025-08987", "90 FR 21446", "Notice (Commerce / ITA)", "Ferrosilicon From Kazakhstan: Amended Final Countervailing Duty Determination; Ferrosilicon From Brazil, Kazakhstan, and Malaysia: Countervailing Duty Orders", None, "2025-05-20", "2025-08987", "ferrosilicon-from-kazakhstan-amended-final-countervailing-duty-determination-ferrosilicon-from"),
    fr("fr-2026-04483", "91 FR 11037", "Notice (Commerce / ITA)", "Ferrovanadium From the People's Republic of China and the Republic of South Africa: Continuation of Antidumping Duty Orders", None, "2026-03-06", "2026-04483", "ferrovanadium-from-the-peoples-republic-of-china-and-the-republic-of-south-africa-continuation-of"),
    # ---- added after verification
    fr("fr-2025-15504", "90 FR 39372", "Notice (Commerce / ITA)", "x", None, "2025-08-15", "2025-15504", "x"),
    fr("fr-2026-05807", "91 FR 14533", "Notice (Commerce / ITA)", "x", None, "2026-03-25", "2026-05807", "x"),
    fr("fr-2026-06449", "91 FR 16641", "Notice (Commerce / ITA)", "x", None, "2026-04-02", "2026-06449", "x"),
    fr("fr-2026-05808", "91 FR 14530", "Notice (Commerce / ITA)", "x", None, "2026-03-25", "2026-05808", "x"),
    fr("fr-2022-16642", "87 FR 47706", "Notice (Commerce / ITA)", "x", None, "2022-08-04", "2022-16642", "x"),
    fr("fr-2023-26884", "88 FR 85232", "Notice (Commerce / ITA)", "x", None, "2023-12-07", "2023-26884", "x"),
    fr("fr-2024-05172", "89 FR 17819", "Notice (Commerce / ITA)", "x", None, "2024-03-12", "2024-05172", "x"),
    fr("eo-14231", "90 FR 11785", "Executive Order 14231", "x", "2025-03-06", "2025-03-11", "2025-03990", "x"),
    fr("eo-14232", "90 FR 11787", "Executive Order 14232", "x", "2025-03-06", "2025-03-11", "2025-03991", "x"),
    # ---- HTS chapter 72 text
    s("hts-ch72", "U.S. International Trade Commission", "HTSUS 2026 Revision 21, Chapter 72", "Harmonized Tariff Schedule", "Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 72: Iron and Steel", None, "2026-10-07", CH72),
]


# Normalize every Federal Register entry (title, citation, publication date, URL) from the API metadata
# fetched into fr_meta.json, so URLs and titles are exactly as published.
import json as _json  # noqa: E402
import os as _os  # noqa: E402
import re as _re  # noqa: E402

_META = _json.load(open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "fr_meta.json")))
for _s in EXTRA:
    _m = _re.search(r"/documents/\d{4}/\d\d/\d\d/([0-9]{4}-[0-9]+)/", _s["url"])
    if _m and _m.group(1) in _META:
        _r = _META[_m.group(1)]
        _s["url"], _s["citation"], _s["published"], _s["title"] = _r["html_url"], _r["citation"], _r["publication_date"], _r["title"]
        if _r.get("signing_date"):
            _s["signed"] = _r["signing_date"]
