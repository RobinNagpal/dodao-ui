import json,sys
d=json.load(open('gen.json'))
ia=d['industryAreas']; R={c['country']:c for c in ia['countries']}
rows={r['hts']:r for r in d['overview']['rateTable']['rows'] if r['htsCode10']}
def cell(country,line,side='withoutUsmca'):
    for cc in R[country]['cells'].values():
        for b in cc[side]['breakdown']:
            if line in b['lines']: return b
for a in sys.argv[1:]:
    country,line=a.split(':')[0],a.split(':')[1]
    side='withUsmca' if a.endswith(':u') else 'withoutUsmca'
    b=cell(country,line,side); r=rows[line]
    print(f'{country} {line} [{side}] {r["description"][:60]} base={r["effectiveGeneral"]}\n   extra={b["extra"]}\n   pref={b["preference"]}\n   total={b["total"]}')
