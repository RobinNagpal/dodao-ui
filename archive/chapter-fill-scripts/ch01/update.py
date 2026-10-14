import json, copy, re
P='/Users/robin/projects/worktrees/tariff-ch1-ch30-refresh/insights-ui/src/tariff-data/chapters/01-live-animals.json'
d=json.load(open(P))
TODAY='2026-10-09'
REV21_URL='https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
d['asOf']=TODAY

# ---------------- sources ----------------
S={}
def src(id,publisher,citation,document,title,signed,published,url):
    S[id]=dict(id=id,publisher=publisher,citation=citation,document=document,title=title,signed=signed,published=published,url=url)
src('hts-now','USITC','HTSUS 2026 Revision 21','Harmonized Tariff Schedule','Harmonized Tariff Schedule of the United States, 2026 Revision 21',None,'2026-10-07',REV21_URL)
src('hts-rev21-cr','USITC','HTSUS 2026 Revision 21 Change Record','Change Record','Harmonized Tariff Schedule of the United States (2026 Revision 21), Change Record',None,'2026-10-09','https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Change%20Record')
src('hts-before','USITC','HTSUS 2025 Basic Edition','Harmonized Tariff Schedule','Harmonized Tariff Schedule of the United States, 2025 Basic Edition',None,'2024-12-10','https://www.usitc.gov/sites/default/files/tata/hts/hts_2025_basic_edition_json.json')
src('ustr-301-fl','Federal Register','91 FR 47318','Notice (USTR)','Notice of Actions in Section 301 Investigations of Acts, Policies, and Practices of Various Economies Related to the Failure of Each Economy To Impose and Effectively Enforce a Prohibition on the Importation of Goods Produced With Forced Labor',None,'2026-07-28','https://www.federalregister.gov/documents/2026/07/28/2026-15181/notice-of-actions-in-section-301-investigations-of-acts-policies-and-practices-of-various-economies')
src('pm-301-fl','Federal Register','91 FR 47717','Presidential Memorandum','Actions by the United States in the Investigations Under Section 301 of the Trade Act of 1974 of the Acts, Policies, and Practices of 60 Economies Related to the Failure of Each Economy To Impose and Effectively Enforce a Prohibition on the Importation of Goods Produced With Forced Labor','2026-07-23','2026-07-28','https://www.federalregister.gov/documents/2026/07/28/2026-15274/actions-by-the-united-states-in-the-investigations-under-section-301-of-the-trade-act-of-1974-of-the')
src('ustr-301-br','Federal Register','91 FR 45516','Notice (USTR)',"Notice of Action: Brazil's Acts, Policies, and Practices Related to Digital Trade and Electronic Payment Services; Unfair, Preferential Tariffs; Anti-Corruption Enforcement; Intellectual Property Protection; Ethanol Market Access; and Illegal Deforestation",None,'2026-07-20','https://www.federalregister.gov/documents/2026/07/20/2026-14542/notice-of-action-brazils-acts-policies-and-practices-related-to-digital-trade-and-electronic-payment')
src('ustr-301-cn-4a','Federal Register','84 FR 43304','Notice (USTR)',"Notice of Modification of Section 301 Action: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",None,'2019-08-20','https://www.federalregister.gov/documents/2019/08/20/2019-17865/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to')
src('ustr-301-cn-4a-cut','Federal Register','85 FR 3741','Notice (USTR)',"Notice of Modification of Section 301 Action: China's Acts, Policies, and Practices Related to Technology Transfer, Intellectual Property, and Innovation",None,'2020-01-22','https://www.federalregister.gov/documents/2020/01/22/2020-00904/notice-of-modification-of-section-301-action-chinas-acts-policies-and-practices-related-to')
src('procl-11012','Federal Register','91 FR 9339','Proclamation 11012','Imposing a Temporary Import Surcharge To Address Fundamental International Payments Problems','2026-02-20','2026-02-25','https://www.federalregister.gov/documents/2026/02/25/2026-03824/imposing-a-temporary-import-surcharge-to-address-fundamental-international-payments-problems')
src('eo-14389','Federal Register','91 FR 9437','Executive Order 14389','Ending Certain Tariff Actions','2026-02-20','2026-02-25','https://www.federalregister.gov/documents/2026/02/25/2026-03832/ending-certain-tariff-actions')
src('csms-67834313','CBP','CSMS # 67834313','CBP CSMS message','Ending Collection of International Emergency Economic Powers Act Duties',None,'2026-02-22','https://content.govdelivery.com/bulletins/gd/USDHSCBP-40b11c9')
src('scotus-24-1287','Supreme Court of the United States','607 U.S. 229','Opinion, No. 24-1287','Learning Resources, Inc. v. Trump',None,'2026-02-20','https://www.supremecourt.gov/opinions/25pdf/607us2r12_8nj9.pdf')
src('procl-11046','Federal Register','91 FR 46639','Proclamation 11046','Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Alcoholic Beverages','2026-07-20','2026-07-23','https://www.federalregister.gov/documents/2026/07/23/2026-14991/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states')
src('procl-11047','Federal Register','91 FR 46653','Proclamation 11047','Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Dairy','2026-07-20','2026-07-23','https://www.federalregister.gov/documents/2026/07/23/2026-14992/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states')
src('procl-11048','Federal Register','91 FR 46663','Proclamation 11048','Imposing Additional Duties To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles','2026-07-20','2026-07-23','https://www.federalregister.gov/documents/2026/07/23/2026-14997/imposing-additional-duties-to-offset-canadian-discrimination-against-the-commerce-of-the-united-states')
src('procl-11062','Federal Register','91 FR 58319','Proclamation 11062','Excluding Certain Canadian Products From Importation Into the United States in Response to Continued Discrimination Against the Commerce of the United States With Respect to Dairy','2026-09-08','2026-09-14','https://www.federalregister.gov/documents/2026/09/14/2026-18836/excluding-certain-canadian-products-from-importation-into-the-united-states-in-response-to-continued')
src('fr-2026-18838','Federal Register','91 FR 58331','Proclamation 11064','Modifying the Scope of Products of Canada Subject to the Additional Duties Imposed To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Alcoholic Beverages','2026-09-08','2026-09-14','https://www.federalregister.gov/documents/2026/09/14/2026-18838/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset')
src('fr-2026-18839','Federal Register','91 FR 58339','Proclamation 11065','Modifying the Scope of Products of Canada Subject to the Additional Duties Imposed To Offset Canadian Discrimination Against the Commerce of the United States With Respect to Motor Vehicles','2026-09-08','2026-09-14','https://www.federalregister.gov/documents/2026/09/14/2026-18839/modifying-the-scope-of-products-of-canada-subject-to-the-additional-duties-imposed-to-offset')
src('ustr-usmca-review','USTR','USTR press release','Statement','Ambassador Greer Issues Statement on the USMCA Joint Review',None,'2026-07-01','https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ambassador-greer-issues-statement-usmca-joint-review')
src('aphis-nws-2025-07','USDA APHIS','APHIS announcement','Announcement','Secretary Rollins Takes Decisive Action and Shuts Down U.S. Southern Border Ports to Livestock Trade Due to Further Northward Spread of New World Screwworm in Mexico',None,'2025-07-09','https://www.aphis.usda.gov/news/agency-announcements/secretary-rollins-takes-decisive-action-shuts-down-us-southern-border')
src('aphis-ports-2026-07','USDA APHIS','APHIS announcement','Announcement','USDA Announces Phased Reopening of Southern Ports for Livestock Trade',None,'2026-07-24','https://www.aphis.usda.gov/news/agency-announcements/usda-announces-phased-reopening-southern-ports-livestock-trade-0')
src('aphis-nws-status','USDA APHIS','APHIS web page (updated October 7, 2026)','Web page','Current Status of New World Screwworm',None,'2026-10-07','https://www.aphis.usda.gov/animals/animal-health/livestock-and-poultry-disease/stop-screwworm/current-status')

tu=d['tariffUpdates']
old={s['id']:s for s in tu['sources']}
for k in ['eo-14194','eo-14193','eo-14325','eo-14257','eo-14360']:
    S[k]=old[k]
order=['hts-now','hts-rev21-cr','hts-before','ustr-301-fl','pm-301-fl','ustr-301-br','ustr-301-cn-4a','ustr-301-cn-4a-cut','procl-11012','eo-14389','csms-67834313','scotus-24-1287','procl-11046','procl-11047','procl-11048','procl-11062','fr-2026-18838','fr-2026-18839','ustr-usmca-review','aphis-nws-2025-07','aphis-ports-2026-07','aphis-nws-status','eo-14194','eo-14193','eo-14325','eo-14257','eo-14360']
assert set(order)==set(S)
tu['sources']=[S[k] for k in order]

# ---------------- tariffUpdates ----------------
tu['seo']['title']='HTS Chapter 01 Live Animals Tariff Updates — What Changed Since January 2025 | KoalaGains'
tu['seo']['shortDescription']='What changed for HTS Chapter 01 (live animals) since January 2025: base rates on all 78 lines, the end of the IEEPA duties on Canada, Mexico and other countries, and the 2026 Section 301 tariffs, with Federal Register citations.'
tu['seo']['keywords']=['HTS Chapter 01 tariff updates','live animal tariff changes','cattle tariff Canada','Mexico livestock tariff','Section 301 tariff live animals','USMCA live cattle duty']
tu['intro']=("This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** (in force October 9, 2026). On every one of the 78 Chapter 01 lines the base rates are the same in both.\n\n"
 "Everything that changed came on top of the base rate, as extra duties set by country. The 2025 IEEPA duties (Canada +35%, Mexico +25%, the reciprocal tariff on everyone else) **ended on February 24, 2026**, and the 10% Section 122 surcharge that replaced them expired on July 23, 2026. Since **July 24, 2026**, live animals from 60 economies pay a **Section 301 tariff of 10% or 12.5%**; no Chapter 01 line is on the general exemption list. **USMCA-qualifying animals from Canada and Mexico are still exempt.**")
tu['scope']='Measures that reach Chapter 01 from any country: the 2026 Section 301 tariffs on 60 economies, the Brazil Section 301 tariff, the older China Section 301 List 4A, and the 2025–2026 IEEPA and Section 122 duties that have ended. For the rate each supplier pays, see Rates by country.'
tu['now']=dict(edition='2026 Revision 21',released='2026-10-07',inForceFrom='2026-10-09',url=REV21_URL)
tu['lastCheckedAt']=TODAY

tu['inEffect']=[
 dict(id='ca-301',country='Canada',measure='Section 301 tariff (forced-labor investigations)',ch99Code='9903.05.29',before='None',now='+10%',
  exemption='USMCA-qualifying goods entered free under USMCA: no Section 301 duty (9903.05.93), including lines whose general rate is already Free. The 2025 IEEPA duty on Canada (+35%, 9903.01.10) ended February 24, 2026. The 2026 Section 338 duties and import bans on Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) list no Chapter 01 line.',
  whatItMeans='A USMCA-qualifying feeder steer from Alberta still pays $0; a Canadian animal that does not qualify pays the base rate plus 10% of value.',
  sourceIds=['ustr-301-fl','hts-now']),
 dict(id='mx-301',country='Mexico',measure='Section 301 tariff (forced-labor investigations)',ch99Code='9903.05.55',before='None',now='+10%',
  exemption='USMCA-qualifying goods entered free under USMCA: no Section 301 duty (9903.05.94). The 2025 IEEPA duty on Mexico (+25%, 9903.01.01) ended February 24, 2026.',
  whatItMeans='USMCA-qualifying cattle from Mexico pay nothing extra; animals that do not qualify pay the base rate plus 10% of value. Whether Mexican cattle can enter at all is decided by USDA APHIS (only Douglas, AZ is open as of October 7, 2026).',
  sourceIds=['ustr-301-fl','hts-now','aphis-nws-status']),
 dict(id='eu-301',country='European Union',measure='Section 301 tariff (forced-labor investigations), EU rate',ch99Code='9903.05.39',before='None',now='10% (in place of base)',
  exemption='For EU goods whose base rate (or its ad valorem equivalent) is under 10%, the total is 10% (9903.05.39); every Chapter 01 base rate is under 10%. The EU exception list (9903.05.97) has no Chapter 01 line. This replaced the 15% IEEPA reciprocal rate (9903.02.20), which ended February 24, 2026.',
  whatItMeans='A $50,000 horse from Germany, Ireland or the Netherlands pays $5,000 (10%).',
  sourceIds=['ustr-301-fl','hts-now']),
 dict(id='uk-301',country='United Kingdom',measure='Section 301 tariff (forced-labor investigations)',ch99Code='9903.05.81',before='None',now='+10%',
  exemption='The UK exception list (9903.05.96) covers medical goods only, no Chapter 01 line.',
  whatItMeans='A horse from the UK (Free base rate) pays 10% of its value.',
  sourceIds=['ustr-301-fl','hts-now']),
 dict(id='cn-301',country='China',measure='Section 301 tariffs: 2026 action plus List 4A (2019)',ch99Code='9903.05.31 / 9903.88.15',before='+7.5%',now='+20%',
  exemption='Two Section 301 duties stack: +12.5% under the 2026 action (9903.05.31, from July 24, 2026) and +7.5% under List 4A (9903.88.15), which covers all 37 Chapter 01 subheadings and has been in force since 2019 (7.5% since February 14, 2020). The IEEPA duty on China ended February 24, 2026.',
  whatItMeans='Live animals from China pay the base rate plus 20% of value; a 1.8% bird line pays 21.8%.',
  sourceIds=['ustr-301-fl','ustr-301-cn-4a','ustr-301-cn-4a-cut','hts-now']),
 dict(id='br-301',country='Brazil',measure='Section 301 tariffs: Brazil action plus 2026 forced-labor action',ch99Code='9903.05.01 / 9903.05.27',before='None',now='+37.5%',
  exemption='+25% under the Brazil action from July 22, 2026 (9903.05.01) and +12.5% under the forced-labor action from July 24, 2026 (9903.05.27). Neither exemption list (U.S. note 50(a)(ii)–(v), U.S. note 52(b)–(e)) includes a Chapter 01 line.',
  whatItMeans='Live animals from Brazil pay the base rate plus 37.5% of value.',
  sourceIds=['ustr-301-br','ustr-301-fl','hts-now']),
 dict(id='other-301',country='Other Section 301 economies (incl. Japan, South Korea, Switzerland, Taiwan, Australia, New Zealand, India, Vietnam)',measure='Section 301 tariff (forced-labor investigations)',ch99Code='9903.05.20–9903.05.84',before='None',now='+10% or +12.5%',
  exemption='Japan, South Korea and Switzerland pay 12.5% in total and Taiwan 10% in total when the base rate is lower (9903.05.49, 9903.05.71, 9903.05.74, 9903.05.76); Australia, New Zealand and Vietnam +12.5%; India +10%. Country exception lists in U.S. note 52(j) exempt a few 0106 lines (for example 0106.19.91 and 0106.20) for Switzerland, Taiwan, Malaysia, Cambodia, Indonesia, Ecuador, Jordan, Argentina, Guatemala and El Salvador. Countries outside the 60 economies (for example Mauritius) pay no extra duty.',
  whatItMeans='500 goats from Australia: the 68¢/head base rate is Free under the Australia FTA, but the 12.5% Section 301 duty still applies to the shipment value.',
  sourceIds=['ustr-301-fl','pm-301-fl','hts-now']),
]

ch=[]
def C(id,type,date,dateLabel,title,detail,before,now,countries,sourceIds):
    ch.append(dict(id=id,type=type,date=date,dateLabel=dateLabel,title=title,detail=detail,before=before,now=now,countries=countries,sourceIds=sourceIds))
C('base-rates','baseRate','2026-10-09','Checked','No Chapter 01 base-rate changes','All 78 Chapter 01 tariff lines carry the same General, FTA and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition. Revision 21 changed only Chapter 38 and a China exclusion note in Chapter 99.',None,None,None,['hts-before','hts-now','hts-rev21-cr'])
C('ca-proclamation-2026','reference','2026-09-29','Effective','Canada Section 338 duties and import bans do not reach live animals','Proclamations of September 8, 2026 moved some Canadian alcoholic beverages, dairy products and motor vehicles from the 50% Section 338 duty to an import ban from September 29, 2026, and changed the duty lists. The dairy ban covers whey, molasses and non-alcoholic beer; no Chapter 01 line is on the ban lists we could read or on the duty lists (U.S. note 51, 9903.03.12–9903.03.14).',None,None,'Canada',['procl-11062','fr-2026-18838','fr-2026-18839','hts-now'])
C('mx-ports','reference','2026-08-24','Effective','Douglas, AZ reopens to cattle from Mexico','USDA reopened the Douglas, Arizona port to Mexican cattle under a joint U.S.–Mexico screwworm protocol, with full inspection of every animal. Santa Teresa and Columbus, NM stay closed pending Mexico\'s progress on the Joint Action Plan (APHIS status page, updated October 7, 2026).','Closed','Douglas, AZ open','Mexico',['aphis-ports-2026-07','aphis-nws-status'])
C('ca-338','reference','2026-08-22','Effective','Canada Section 338 duties take effect; live animals not covered','50% duties on certain Canadian alcoholic beverages, dairy and motor vehicles (9903.03.12–9903.03.14) took effect after a 3-day suspension lapsed. No Chapter 01 line is on the lists in U.S. note 51.',None,None,'Canada',['procl-11046','procl-11047','procl-11048','hts-now'])
C('s301-fl','extraDuty','2026-07-24','Effective','Section 301 tariffs on 60 economies cover live animals','10% or 12.5% on all products of 60 economies (9903.05.20–9903.05.84). No Chapter 01 line is on the general exemption lists in U.S. note 52(b)–(e). EU goods pay 10% in total; Japan, South Korea and Switzerland 12.5% in total. USMCA-qualifying goods from Canada and Mexico are exempt (9903.05.93, 9903.05.94).','None','+10% / +12.5%','60 economies',['ustr-301-fl','pm-301-fl','hts-now'])
C('s122-end','extraDuty','2026-07-23','Expired','Section 122 import surcharge expired','The 150-day surcharge (9903.03.01) expired at the close of July 23, 2026.','+10%','None','All',['procl-11012','hts-now'])
C('br-301','extraDuty','2026-07-22','Effective','Section 301 tariff on products of Brazil','25% on all goods of Brazil (9903.05.01), with exemptions that include no Chapter 01 line. From July 24 the 12.5% forced-labor tariff (9903.05.27) is added on top.','None','+25%','Brazil',['ustr-301-br','hts-now'])
C('usmca-review','reference','2026-07-01','Announced','USMCA joint review: not renewed, still in force','The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still apply.',None,None,'Canada, Mexico',['ustr-usmca-review'])
C('s122-start','extraDuty','2026-02-24','Effective','Section 122 surcharge replaces the IEEPA tariffs','10% on products of all countries (9903.03.01) until July 23, 2026. No Chapter 01 line was on the product exemption list (9903.03.03); USMCA-qualifying goods from Canada and Mexico were exempt (9903.03.07, 9903.03.08).','None','+10% (until July 23, 2026)','All',['procl-11012','hts-now'])
C('ieepa-end','extraDuty','2026-02-24','Effective','All IEEPA tariffs end','After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China and reciprocal duties, and CBP stopped collecting them for goods entered from 12:00 a.m. ET on February 24. The 9903.01.xx and 9903.02.xx headings are still printed in Revision 21 but are no longer in effect.','+10% to +35%','None','All',['scotus-24-1287','eo-14389','csms-67834313'])
C('ag-exemption','reference','2025-11-13','Effective','Agricultural exemption did not cover live animals','The exemption lists in U.S. note 2(v)(iii)(a) (1,090 subheadings) and (v)(iii)(b) (17 articles) of Chapter 99 contained no Chapter 01 line, so the reciprocal duties applied to live animals until they ended on February 24, 2026.',None,None,'All countries subject to the reciprocal tariff',['eo-14360','hts-now'])
C('ca-amended','extraDuty','2025-07-31','Signed','Canada additional duty raised to 35%','Raised the IEEPA duty on non-USMCA Canadian goods to +35% (9903.01.10). Ended February 24, 2026.','+25%','+35% (ended)','Canada',['eo-14325'])
C('mx-ports-2025','reference','2025-07-09','Effective','Southern border ports closed to Mexican cattle, bison and horses','USDA APHIS suspended imports of live cattle, bison and horses from Mexico through land-border ports after New World screwworm was detected further north in Veracruz. Horses may still enter by air under a screwworm protocol with quarantine.','Open','Closed','Mexico',['aphis-nws-2025-07'])
C('reciprocal','extraDuty','2025-04-02','Signed','Reciprocal tariff on products of all countries','10% baseline (9903.01.25) and country rates (9903.02.xx); Canada and Mexico excluded. Ended February 24, 2026.','None','+10% or more (ended)','All except Canada, Mexico',['eo-14257'])
C('mx-imposed','extraDuty','2025-02-01','Signed','Additional duty on products of Mexico','+25% on non-USMCA goods (9903.01.01); USMCA-qualifying goods exempt (9903.01.04). Ended February 24, 2026.','None','+25% (ended)','Mexico',['eo-14194'])
C('ca-imposed','extraDuty','2025-02-01','Signed','Additional duty on products of Canada','+25% on non-USMCA goods (9903.01.10), later raised to +35%; USMCA-qualifying goods exempt (9903.01.14). Ended February 24, 2026.','None','+25% (ended)','Canada',['eo-14193'])
tu['changes']=ch
tu['stats']=[
 dict(label='Base rates unchanged',value='78 of 78 lines'),
 dict(label='Extra duties in effect',value=str(len(tu['inEffect']))),
 dict(label='Compared',value='Jan 2025 → Rev 21'),
 dict(label='IEEPA duties',value='Ended',note='February 24, 2026'),
]

json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
print('ok tariffUpdates')
