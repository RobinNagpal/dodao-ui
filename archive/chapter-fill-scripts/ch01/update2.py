import json, copy
P='/Users/robin/projects/worktrees/tariff-ch1-ch30-refresh/insights-ui/src/tariff-data/chapters/01-live-animals.json'
d=json.load(open(P))
TODAY='2026-10-09'
REV21_URL='https://www.usitc.gov/sites/default/files/tata/hts/hts_2026_revision_21_json.json'
tu=d['tariffUpdates']
for c in tu['changes']:
    if c['id']=='ieepa-end': c['before']='Varied by country'
    if c['id']=='ca-proclamation-2026':
        c['detail']='Proclamations of September 8, 2026 moved some Canadian alcoholic beverages, dairy products and motor vehicles from the 50% Section 338 duty to an import ban from September 29, 2026, and changed the duty lists. The dairy ban list covers whey, molasses and non-alcoholic beer; the other two cover alcoholic beverages and motor vehicles. No Chapter 01 line is on the remaining duty lists (U.S. note 51, 9903.03.12–9903.03.14).'
SRC={s['id']:s for s in tu['sources']}

# ---------------- overview ----------------
o=d['overview']
o['intro']=o['intro'].split('\n\n')[0]+"\n\n"+("The printed rate is rarely what decides the cost. Canada and Mexico supplied 79% of the $3.71B the U.S. imported in 2025, and USMCA-qualifying animals from both enter free. Animals from elsewhere pay the base rate **plus an extra duty by country**: since July 24, 2026 a Section 301 tariff on 60 economies — 10% in total for the EU, +10% or +12.5% for most others, +20% for China (see Rates by country). And for any shipment, disease status, quarantine and permits decide whether it lands at all.")
for w in o['workedExamples']:
    if w['line']=='0104.20.00.00':
        w['title']='500 goats from New Zealand'
        w['body']="Goats are a flat 68¢ per head: 500 × $0.68 = **$340** base duty. New Zealand is one of the 60 economies in the 2026 Section 301 action, so another 12.5% of the shipment's value is added (9903.05.57). At $200 a head that is **$12,500**, so the extra duty, not the base rate, is most of the bill."
    if w['line']=='0105.11.00':
        w['body']="Chicks not over 185 g are 0.9¢ each: 50,000 × $0.009 = **$450** base duty. A trade-agreement claim (one of the 17 programs on the line) removes the base rate, but a Section 301 duty for the country still applies — except under USMCA, where both are zero."

# ---------------- industryAreas ----------------
ia=d['industryAreas']
ia['seo']['shortDescription']='The total U.S. tariff on live animals by country and product group: base rate plus the 2026 Section 301 duty, with USMCA and EU rules applied. Canada, Mexico, Netherlands, Germany, Vietnam, UK, China and more.'
ia['seo']['keywords']=['tariff on live cattle from Canada','Mexico cattle tariff','live horse import tariff Germany','live animal tariff by country','HTS Chapter 01 tariff rates by country','EU 10% tariff live animals']
ia['intro']=("The total rate on live animals depends far more on **where they come from** than on what they are. Each cell below is the base rate for that product group plus the extra duty for that country, minus any preference — taken from the current tariff schedule.\n\n"
 "Since the IEEPA duties ended on February 24, 2026, the extra duty is the **Section 301 tariff on 60 economies** that started July 24, 2026. **USMCA-qualifying animals from Canada and Mexico enter free**, **EU animals pay 10%** in place of the base rate, the UK and Vietnam add 10% and 12.5%, and **China adds 20%**. Countries outside the 60, such as Mauritius, pay only the base rate.")
ia['scheduleEdition']='2026 Revision 21'
ia['lastCheckedAt']=TODAY

def pct(x):
    s=('%.2f'%x).rstrip('0').rstrip('.'); return s+'%'
def isp(b): return b.endswith('%')
def add(base,p):
    if p==0: return base
    if base=='Free': return pct(p)
    if isp(base): return pct(float(base[:-1])+p)
    return f'{base} + {pct(p)}'
def plus(p): return '+'+pct(p)

def rule_cells(country, mode):
    """mode: ('usmca',p,ch,ex) | ('inplace',p) | ('add',p) | ('range',)"""
    for h,cell in country['cells'].items():
        groups=cell['withUsmca']['breakdown']
        newU=[];newN=[]
        for g in groups:
            base=g['base']; lines=g['lines']; n=g['lineCount']
            def row(extra,pref,total): return dict(base=base,lines=lines,lineCount=n,extra=extra,preference=pref,total=total)
            k=mode[0]
            if k=='usmca':
                p=mode[1]
                newU.append(row('None (USMCA)',f'Free under USMCA (S); Section 301 does not apply ({mode[3]})','Free'))
                newN.append(row(plus(p),'None',add(base,p)))
            elif k=='inplace':
                r=row(f'{pct(mode[1])} in place of base','None',pct(mode[1])); newU.append(r); newN.append(copy.deepcopy(r))
            elif k=='add':
                p=mode[1]; r=row(plus(p) if p else 'None','None',add(base,p)); newU.append(r); newN.append(copy.deepcopy(r))
            elif k=='range':
                if base=='Free': tot='Free–37.5%'
                elif isp(base): tot=f'{base}–{add(base,37.5)}'
                else: tot=f'{base} + 0–37.5%'
                r=row('0% to +12.5% by country (9903.05.20–9903.05.84); China a further +7.5% (9903.88.15), Brazil a further +25% (9903.05.01)','None',tot); newU.append(r); newN.append(copy.deepcopy(r))
        def tots(rows):
            out=[]
            for r in sorted(rows,key=lambda r:-r['lineCount']):
                if r['total'] not in out: out.append(r['total'])
            return out
        cell['withUsmca']={'totals':tots(newU),'breakdown':newU}
        cell['withoutUsmca']={'totals':tots(newN),'breakdown':newN}

EU=['Netherlands','Germany','Belgium','Ireland','France']
countries=ia['countries']
by={c['country']:c for c in countries}
R=lambda **k:k
for c in countries:
    n=c['country']
    if n=='Canada':
        c['rule']=R(kind='usmca',extraPct=10,ch99Code='9903.05.29',usmcaCode='9903.05.93',label='USMCA-qualifying: free, no extra duty (9903.05.93). Otherwise base rate + 10% Section 301 (9903.05.29). The 35% IEEPA duty ended February 24, 2026.',sourceIds=['ustr-301-fl','eo-14389','hts-now'])
        rule_cells(c,('usmca',10,'9903.05.29','9903.05.93'))
    elif n=='Mexico':
        c['rule']=R(kind='usmca',extraPct=10,ch99Code='9903.05.55',usmcaCode='9903.05.94',label='USMCA-qualifying: free, no extra duty (9903.05.94). Otherwise base rate + 10% Section 301 (9903.05.55). The 25% IEEPA duty ended February 24, 2026. Cattle, bison and horses by land need an open APHIS port: only Douglas, AZ as of October 7, 2026.',sourceIds=['ustr-301-fl','eo-14389','aphis-nws-status','hts-now'])
        rule_cells(c,('usmca',10,'9903.05.55','9903.05.94'))
    elif n in EU:
        c['rule']=R(kind='eu15',extraPct=10,ch99Code='9903.05.39',label='EU: 10% in place of the base rate under Section 301, because every Chapter 01 base rate is under 10% (9903.05.39).',sourceIds=['ustr-301-fl','hts-now'])
        rule_cells(c,('inplace',10))
    elif n=='Viet Nam':
        c['rule']=R(kind='additive',extraPct=12.5,ch99Code='9903.05.84',label='Base rate + 12.5% Section 301 (9903.05.84).',sourceIds=['ustr-301-fl','hts-now'])
        rule_cells(c,('add',12.5))
    elif n=='Mauritius':
        c['rule']=R(kind='additive',extraPct=0,ch99Code='None',label='Base rate only: Mauritius is not one of the 60 economies in the 2026 Section 301 action, and the 15% reciprocal duty (9903.02.40) ended February 24, 2026.',sourceIds=['ustr-301-fl','eo-14389','hts-now'])
        rule_cells(c,('add',0))
    elif n=='United Kingdom':
        c['rule']=R(kind='additive',extraPct=10,ch99Code='9903.05.81',label='Base rate + 10% Section 301 (9903.05.81).',sourceIds=['ustr-301-fl','hts-now'])
        rule_cells(c,('add',10))
    elif n=='Any other country':
        c['rule']=R(kind='additive',extraPct=0,ch99Code='9903.05.20–9903.05.84',atLeast=True,label='Countries outside the 60 Section 301 economies pay only the base rate. The 60 pay +10% or +12.5% (9903.05.20–9903.05.84), or 10%–12.5% in total for Japan, South Korea, Switzerland and Taiwan; Brazil pays +37.5% (adds 9903.05.01). A few 0106 lines are exempt for some countries (U.S. note 52(j)).',sourceIds=['ustr-301-fl','ustr-301-br','hts-now'])
        rule_cells(c,('range',))
    else: raise Exception(n)

# add China row (copy UK shape), subtract its imports from Any other country
u=d['understandIndustry']
cn={r['heading']:r['importsUsd'] for r in u['byHeadingCountry'] if r['country']=='China'}
china=copy.deepcopy(by['United Kingdom'])
china['country']='China'
china['importsUsd']=sum(cn.values())
for h,cell in china['cells'].items(): cell['importsUsd']=cn.get(h,0)
china['rule']=R(kind='additive',extraPct=20,ch99Code='9903.05.31',label='Base rate + 12.5% Section 301 (9903.05.31) + 7.5% Section 301 List 4A (9903.88.15), which covers every Chapter 01 subheading: +20% in total.',sourceIds=['ustr-301-fl','ustr-301-cn-4a-cut','hts-now'])
rule_cells(china,('add',20))
for cell in china['cells'].values():
    for m in ('withUsmca','withoutUsmca'):
        for r in cell[m]['breakdown']: r['extra']='+12.5% (9903.05.31) + 7.5% (9903.88.15)'
ao=by['Any other country']
for h,v in cn.items(): ao['cells'][h]['importsUsd']-=v
ao['importsUsd']-=china['importsUsd']
idx=[c['country'] for c in countries].index('Any other country')
countries.insert(idx,china)

# biggest lanes
for l in ia['biggestLanes']:
    l['totals']=next(c for c in countries if c['country']==l['country'])['cells'][l['heading']]['withUsmca']['totals']

ia['assumptions']=[
 "Ranges like \"1¢/kg + 10%\" or \"Free · 11.8%\" mean the group has lines with different base rates; select a cell to see which lines carry which rate.",
 "A per-unit rate (1¢/kg, 68¢/head) plus a percentage cannot be added into one number without the shipment's weight and value, so it is shown as written.",
 "EU: 9903.05.39 sets a 10% total when the base rate, or its ad valorem equivalent, is under 10% (U.S. note 52(k)). Every Chapter 01 base rate is 6.8% at most, so all EU cells are 10%.",
 "Preferences other than USMCA are not applied. The schedule still lists GSP (A, A+) and AGOA (D) on these lines; check whether those programs are in force before relying on them. FTA preferences remove the base rate but not the Section 301 duty (U.S. note 52(a)).",
 "\"Any other country\" shows the range from no extra duty (countries outside the 60 Section 301 economies) to Brazil's +37.5%. Country exception lists in U.S. note 52(j) exempt a few 0106 lines for some countries; they are not applied in the matrix.",
 "The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.",
 "The rate is not the only gate: live cattle, bison and horses from Mexico can cross only at ports USDA APHIS has opened (Douglas, AZ as of October 7, 2026)."
]
ia['exemptionCheck']=('Read U.S. notes 50, 51 and 52 to Chapter 99 subchapter III in the 2026 Revision 21. No Chapter 01 code is on the Section 301 general exemption lists (note 52(b)–(e), 9903.05.86–9903.05.89), the Brazil exemption lists (note 50(a)(ii)–(v)) or the Canada Section 338 lists (note 51). '
 'The country lists in note 52(j) exempt only 0106 lines (for example 0106.19.91, 0106.20, 0106.90.01) for Switzerland, Taiwan, Malaysia, Cambodia, Guatemala, El Salvador, Argentina, Indonesia, Ecuador and Jordan. All 37 Chapter 01 subheadings are on China Section 301 List 4A (note 20(s)(i)).')
keep=['hts-now','ustr-301-fl','pm-301-fl','ustr-301-br','ustr-301-cn-4a','ustr-301-cn-4a-cut','eo-14389','csms-67834313','procl-11012','aphis-nws-status']
ia['sources']=[SRC[k] for k in keep]

# ---------------- understandIndustry ----------------
u['lastCheckedAt']=TODAY
u['why']=("U.S. imports of live animals fell from **$4.80B in 2024 to $3.71B in 2025** (-22.9%). Almost all of that is one lane: **cattle from Mexico** (heading 0102) went from $1.31B to $0.32B, a drop of $0.98B against a total drop of $1.10B. Canada grew over the same year.\n\n"
 "The tariff schedule doesn't explain the Mexican drop. USMCA-qualifying cattle from Mexico paid no extra duty, and the base rate is unchanged. Animal health does: USDA APHIS closed the southern border ports to live cattle, bison and horses from Mexico on July 9, 2025 because of New World screwworm. The first port, Douglas, Arizona, reopened to cattle on August 24, 2026; Santa Teresa and Columbus, New Mexico were still closed on October 7, 2026.\n\n"
 "The duty actually paid stays near zero because Canada and Mexico — 79% of 2025 imports — mostly enter under USMCA, and much of the rest of the chapter is duty-free under the general rate. 2025 is the latest full year of U.S. trade data.")
u['sources']=[
 dict(label='UN Comtrade (public API), United States imports, HS chapter 01',url='https://comtradeplus.un.org/'),
 dict(label='USDA APHIS, southern ports closed to Mexican cattle, bison and horses (July 9, 2025)',url=SRC['aphis-nws-2025-07']['url']),
 dict(label='USDA APHIS, phased reopening of southern ports (July 24, 2026)',url=SRC['aphis-ports-2026-07']['url']),
 dict(label='USDA APHIS, Current Status of New World Screwworm (updated October 7, 2026)',url=SRC['aphis-nws-status']['url']),
 dict(label='Federal Register 90 FR 40609 (New World screwworm emergency declaration, HHS)',url='https://www.federalregister.gov/documents/2025/08/20/2025-15918/declaration-of-emergency-pursuant-to-the-federal-food-drug-and-cosmetic-act-for-new-world-screwworm'),
]

# ---------------- tariffEngineering ----------------
te=d['tariffEngineering']
te['lastCheckedAt']=TODAY
for l in te['levers']:
    if l['id']=='usmca':
        l['saves']='The Section 301 duty — 10% of value for Canada or Mexico — plus any base rate'
        l['caveat']='Claiming without a valid certification exposes the entry to the 10% Section 301 duty plus penalties. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.'
        l['citations']=[dict(label='19 CFR 182.12',url='https://www.ecfr.gov/current/title-19/section-182.12'),
                        dict(label='HTSUS 9903.05.93 / 9903.05.94',url=REV21_URL),
                        dict(label='USTR statement on the USMCA joint review (July 1, 2026)',url=SRC['ustr-usmca-review']['url'])]
    if l['id']=='purebred':
        l['saves']=l['saves'].replace('Extra duties by country still apply.','The Section 301 duty for the country still applies.')
    if l['id']=='ch98':
        l['caveat']='Most Chapter 98 entries are also outside the Section 301 duty (U.S. note 52(a)); confirm with CBP before relying on it.'
        for c in l['citations']:
            if 'hts_2026' in c['url']: c['url']=REV21_URL
        l['citations'].append(dict(label='HTSUS Ch. 99, subch. III, U.S. note 52(a)',url='https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099'))
if not any(r['id']=='aphis-nws-mexico' for r in te['rules']):
    te['rules'].append(dict(id='aphis-nws-mexico',agency='USDA APHIS',title='Mexico: cattle, bison and horses by land only through ports APHIS has reopened (Douglas, AZ since August 24, 2026), under the New World screwworm protocol',citations=[
        dict(label='APHIS: Current Status of New World Screwworm',url=SRC['aphis-nws-status']['url']),
        dict(label='APHIS: phased reopening of southern ports (July 24, 2026)',url=SRC['aphis-ports-2026-07']['url'])]))
for g in te['groups']:
    if g['heading'] in ('0101','0102') and 'aphis-nws-mexico' not in g['ruleIds']: g['ruleIds'].append('aphis-nws-mexico')
for l in te['lines']:
    if l['heading'] in ('0101','0102') and 'aphis-nws-mexico' not in l['ruleIds']: l['ruleIds'].append('aphis-nws-mexico')

# ---------------- finalConclusion ----------------
fc=d['finalConclusion']
fc['lastCheckedAt']=TODAY
fc['keyTakeaways']=[
 "USMCA-qualifying animals from Canada and Mexico enter free — no base rate, no extra duty.",
 "The 2025 IEEPA tariffs ended on February 24, 2026. Since July 24, 2026 the extra duty is a Section 301 tariff: 10% in total for the EU, +10% or +12.5% for most other large suppliers, +20% for China.",
 "For live animals, USDA animal-health rules decide whether a shipment lands at all — Mexican cattle can cross only at Douglas, AZ as of October 2026. Check APHIS before every import."
]
A={
 'canada-cattle':"Not if they qualify for USMCA. Most cattle enter under 0102.29, with a base rate of 1¢/kg that USMCA makes Free, and USMCA-qualifying goods are exempt from the 10% Section 301 duty on Canadian products (9903.05.93). Cattle that don't qualify pay 1¢/kg plus 10% of their value (9903.05.29). The 35% IEEPA duty of 2025 ended on February 24, 2026. Canada shipped $1.82B of cattle to the U.S. in 2025.",
 'canada-horses':"Horses have a Free base rate. With a USMCA claim they stay free; horses that don't qualify for USMCA pay 10% of their value under the Section 301 duty on Canadian products (9903.05.29). The 35% IEEPA duty ended on February 24, 2026.",
 'eu-horses':"10% of the horse's value since July 24, 2026. For EU products whose base rate is under 10%, the Section 301 action charges 10% in place of the base rate (9903.05.39), and horses are Free at base. The 15% reciprocal rate of 2025 ended on February 24, 2026. Horses brought in temporarily for breeding, shows or competition can enter under 9813.00.60 (Free, under bond) — confirm with CBP whether the 10% also falls away. The U.S. imported $380M of horses and other equines from these five EU countries in 2025.",
 'horse-cost-europe':"The tariff part is 10% of the horse's value — $5,000 on a $50,000 horse (EU, 9903.05.39). On top of that come USDA requirements: an import permit, arrival at a designated port, inspection and quarantine (9 CFR 93.304, 93.306, 93.308). Transport and quarantine fees are not covered here.",
 'mexico-cattle':"Imports of Mexican cattle fell from $1.31B in 2024 to $324M in 2025. Tariffs don't explain it: USMCA-qualifying cattle from Mexico pay no extra duty and the base rate didn't change. Animal health does — USDA APHIS closed the southern border ports to cattle, bison and horses from Mexico on July 9, 2025 because of New World screwworm. Douglas, Arizona reopened to cattle on August 24, 2026; Santa Teresa and Columbus, New Mexico were still closed as of October 7, 2026. Check APHIS for the current status.",
 'dog':"Dogs are 0106.19.91.20, with a Free base rate. Entry is governed by CDC rules — including the CDC dog import form and a microchip (42 CFR 71.51). Commercial imports from one of the 60 Section 301 economies can owe +10% or +12.5%; see the rates by country.",
 'parrot':"Only within tight limits. Parrots are 0106.32 (1.8% base rate, plus any Section 301 duty for the country of origin), but the Wild Bird Conservation Act restricts imports of exotic birds (50 CFR part 15), most parrots need CITES permits (50 CFR part 23), and USDA requires an import permit, health certificate and quarantine (9 CFR 93.103, 93.104, 93.106), plus Fish & Wildlife Form 3-177.",
}
for f in fc['faqs']:
    if f['id'] in A: f['answer']=A[f['id']]

json.dump(d,open(P,'w'),ensure_ascii=False,indent=2)
print('ok')
