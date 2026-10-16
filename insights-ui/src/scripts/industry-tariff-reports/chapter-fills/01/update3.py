import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json
P=IU + '/src/tariff-data/chapters/01-live-animals.json'
d=json.load(open(P))
def S(id,publisher,citation,document,title,signed,published,url): return dict(id=id,publisher=publisher,citation=citation,document=document,title=title,signed=signed,published=published,url=url)
new=[
 S('fr-hpai-28day','Federal Register','91 FR 60521','Proposed rule (USDA APHIS)','Amendments To Import Requirements for Highly Pathogenic Avian Influenza',None,'2026-09-24','https://www.federalregister.gov/documents/2026/09/24/2026-19532/amendments-to-import-requirements-for-highly-pathogenic-avian-influenza'),
 S('aphis-hpai-canada','USDA APHIS','APHIS import alert','Import alert','Import Restrictions on Canada due to Highly Pathogenic Avian Influenza',None,'2026-09-15','https://www.aphis.usda.gov/sites/default/files/import-alert-avian-canada.pdf'),
 S('aphis-hpai-eu-2025','USDA APHIS','APHIS announcement','Announcement','USDA Reduces HPAI Restrictions on Poultry from France and the European Union',None,'2025-01-16','https://www.aphis.usda.gov/news/agency-announcements/usda-reduces-hpai-restrictions-poultry-france-european-union'),
 S('aphis-live-poultry','USDA APHIS','APHIS web page (modified June 15, 2026)','Web page','Importing Live Poultry into the United States',None,'2026-06-15','https://www.aphis.usda.gov/live-animal-import/live-poultry'),
 S('ecfr-93-101','eCFR','9 CFR 93.101(c), 93.201(c)','Regulation','Birds and poultry: general prohibitions (HPAI- and Newcastle-affected regions, H5/H7-vaccinated birds)',None,'2026-10-07','https://www.ecfr.gov/current/title-9/section-93.101'),
 S('ustr-agoa-2026','USTR','USTR press release','Statement','Statement from Ambassador Jamieson Greer on the Reauthorization of the African Growth and Opportunity Act',None,'2026-02-03','https://ustr.gov/about/policy-offices/press-office/press-releases/2026/february/statement-ambassador-jamieson-greer-reauthorization-african-growth-and-opportunity-act'),
 S('crs-agoa','Congressional Research Service','CRS IF10149 (P.L. 119-75, Div. I, sec. 5019)','CRS In Focus','African Growth and Opportunity Act (AGOA)',None,'2026-02-17','https://www.congress.gov/crs_external_products/IF/PDF/IF10149/IF10149.26.pdf'),
 S('procl-11030','Federal Register','91 FR 30469','Proclamation 11030','To Implement Certain Provisions in the Consolidated Appropriations Act, 2026, and for Other Purposes','2026-05-19','2026-05-22','https://www.federalregister.gov/documents/2026/05/22/2026-10398/to-implement-certain-provisions-in-the-consolidated-appropriations-act-2026-and-for-other-purposes'),
 S('cbp-gsp','CBP','CBP web page (modified August 6, 2026)','Web page','Generalized System of Preferences (GSP)',None,'2026-08-06','https://www.cbp.gov/trade/priority-issues/trade-agreements/special-trade-legislation/generalized-system-preferences'),
]
NEW={s['id']:s for s in new}
tu=d['tariffUpdates']
ids={s['id'] for s in tu['sources']}
tu['sources']+= [s for s in new if s['id'] not in ids]

def C(id,type,date,dateLabel,title,detail,before,now,countries,sourceIds): return dict(id=id,type=type,date=date,dateLabel=dateLabel,title=title,detail=detail,before=before,now=now,countries=countries,sourceIds=sourceIds)
adds=[
 C('hpai-28day','pending','2026-09-24','Published','Proposed: shorter HPAI waiting period for live birds and hatching eggs','APHIS proposed cutting the period in which live birds and other avian commodities may not have been exposed to HPAI, or sourced from HPAI-quarantined premises, before export to the United States from 90 days to 28 days. Comments are due November 23, 2026; the 90-day rule still applies.','90 days','28 days (proposed)','All',['fr-hpai-28day']),
 C('hpai-canada','reference','2026-09-15','Published','APHIS HPAI restrictions on Canadian poultry zones','Poultry, commercial birds, ratites and hatching eggs from or through a Canadian zone listed as Active or To be determined on the CFIA avian influenza list may not be imported. Pet and zoo birds from such zones must fly to JFK or Miami for a 30-day federal quarantine with testing; they may not enter by land.',None,None,'Canada',['aphis-hpai-canada']),
 C('agoa-renewed','reference','2026-02-03','Signed','AGOA reauthorized through December 31, 2026','The Consolidated Appropriations Act, 2026 (P.L. 119-75) renewed AGOA retroactively from September 30, 2025, when it had lapsed. AGOA (SPI D) makes every dutiable Chapter 01 line Free for listed sub-Saharan countries such as Mauritius, which is on the General Note 16 list in Revision 21. GSP (SPI A, A+) remains expired since December 31, 2020.','Lapsed (from September 30, 2025)','In force to December 31, 2026','AGOA beneficiary countries',['ustr-agoa-2026','crs-agoa','procl-11030','cbp-gsp','hts-now']),
 C('hpai-eu-2025','reference','2025-01-16','Announced','APHIS eases HPAI restrictions on poultry from France and the EU','Unvaccinated live poultry and hatching eggs from France, and live ducks and hatching eggs from other countries of the European Poultry Trade Region and EFTA, may be imported again. Vaccinated poultry and hatching eggs or ducklings from vaccinated flocks stay ineligible.',None,None,'EU, EFTA',['aphis-hpai-eu-2025']),
]
ch=[c for c in tu['changes'] if c['id'] not in {a['id'] for a in adds}]+adds
ch.sort(key=lambda c:c['date'],reverse=True)
tu['changes']=ch

# industryAreas
ia=d['industryAreas']
ia['assumptions'][3]=("Preferences: USMCA is applied for Canada and Mexico, and AGOA (SPI D) for Mauritius. AGOA was reauthorized on February 3, 2026 through December 31, 2026, retroactive to September 30, 2025 (P.L. 119-75; USTR). "
 "GSP (SPI A, A+) has been expired since December 31, 2020 and Congress had not renewed it as of October 9, 2026 (CBP; HTS General Note 4 in Revision 21), so GSP claims pay the general rate. Other FTA preferences are not applied; they remove the base rate but not the Section 301 duty (U.S. note 52(a)).")
ids={s['id'] for s in ia['sources']}
ia['sources']+=[NEW[k] for k in ['ustr-agoa-2026','crs-agoa','cbp-gsp'] if k not in ids]
for c in ia['countries']:
    if c['country']=='Mauritius':
        c['rule']['label']='Base rate only, and the dutiable lines are Free with an AGOA claim (SPI D, in force through December 31, 2026). Mauritius is not one of the 60 economies in the 2026 Section 301 action, and the 15% reciprocal duty (9903.02.40) ended February 24, 2026.'
        c['rule']['sourceIds']=['ustr-301-fl','eo-14389','ustr-agoa-2026','hts-now']
        for cell in c['cells'].values():
            for m in ('withUsmca','withoutUsmca'):
                for r in cell[m]['breakdown']:
                    if r['base']!='Free':
                        r['preference']='Free under AGOA (D), through December 31, 2026'; r['total']='Free'
                cell[m]['totals']=['Free']
for l in ia['biggestLanes']:
    if l['country']=='Mauritius': l['totals']=['Free']
# eo-14389 must be in ia sources (check)
assert 'eo-14389' in {s['id'] for s in ia['sources']}

# tariffEngineering rule
te=d['tariffEngineering']
if not any(r['id']=='aphis-hpai' for r in te['rules']):
    te['rules'].append(dict(id='aphis-hpai',agency='USDA APHIS',title='Avian influenza: no live poultry, birds or hatching eggs from or through HPAI- or Newcastle-affected regions, or vaccinated for H5/H7; restricted Canadian zones per the APHIS import alert of September 15, 2026; 30-day quarantine for imported poultry',citations=[
        dict(label='9 CFR 93.101 (birds)',url='https://www.ecfr.gov/current/title-9/section-93.101'),
        dict(label='9 CFR 93.201 (poultry)',url='https://www.ecfr.gov/current/title-9/section-93.201'),
        dict(label='9 CFR 94.6 (HPAI and Newcastle regions)',url='https://www.ecfr.gov/current/title-9/section-94.6'),
        dict(label='APHIS: Importing Live Poultry (June 15, 2026)',url=NEW['aphis-live-poultry']['url']),
        dict(label='APHIS import alert: HPAI restrictions on Canada (September 15, 2026)',url=NEW['aphis-hpai-canada']['url']),
        dict(label='91 FR 60521: proposed 28-day HPAI period (September 24, 2026)',url=NEW['fr-hpai-28day']['url'])]))
for g in te['groups']:
    if g['heading'] in ('0105','0106') and 'aphis-hpai' not in g['ruleIds']: g['ruleIds'].append('aphis-hpai')
for l in te['lines']:
    if (l['heading']=='0105' or l['hts'].startswith('0106.3')) and 'aphis-hpai' not in l['ruleIds']: l['ruleIds'].append('aphis-hpai')

# overview chicks example
for w in d['overview']['workedExamples']:
    if w['line']=='0105.11.00':
        w['body']="Chicks not over 185 g are 0.9¢ each: 50,000 × $0.009 = **$450** base duty. An FTA or AGOA claim removes the base rate (GSP, also listed on the line, has been expired since December 31, 2020), but a Section 301 duty for the country still applies — except under USMCA, where both are zero. Chicks from an HPAI-affected region cannot be imported at all (9 CFR 93.201)."

# FAQs
for f in d['finalConclusion']['faqs']:
    if f['id']=='hs-chicken':
        f['answer']="0105.11 for chicks weighing not more than 185 g (0.9¢ each), and 0105.94 for larger chickens (2¢/kg). Live poultry and hatching eggs cannot come from or through a region with highly pathogenic avian influenza or Newcastle disease, or from H5/H7-vaccinated flocks (9 CFR 93.201), and need an APHIS permit and a 30-day quarantine unless they come from an unrestricted part of Canada."
    if f['id']=='parrot':
        f['answer']="Only within tight limits. Parrots are 0106.32 (1.8% base rate, plus any Section 301 duty for the country of origin), but the Wild Bird Conservation Act restricts imports of exotic birds (50 CFR part 15), most parrots need CITES permits (50 CFR part 23), and USDA requires an import permit, health certificate and quarantine (9 CFR 93.103, 93.104, 93.106), plus Fish & Wildlife Form 3-177. Birds from a region with highly pathogenic avian influenza face extra limits (9 CFR 93.101)."
json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
print('ok')
