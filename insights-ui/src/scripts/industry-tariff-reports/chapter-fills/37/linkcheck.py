import json,sys,subprocess,re,time,concurrent.futures as cf
def urls(o,out):
    if isinstance(o,dict):
        for k,v in o.items():
            if k=='url' and isinstance(v,str) and v.startswith('http'): out.add(v)
            else: urls(v,out)
    elif isinstance(o,list):
        for x in o: urls(x,out)
allu=set(); urls(json.load(open(sys.argv[1])),allu)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
def curl(args):
    return subprocess.run(['curl','-s','--max-time','30','-A',UA]+args,capture_output=True,text=True).stdout
def chk(u):
    m=re.match(r'https://www\.federalregister\.gov/documents/\d{4}/\d\d/\d\d/([^/]+)/',u)
    if m:
        j=curl([f'https://www.federalregister.gov/api/v1/documents/{m.group(1)}.json?fields[]=html_url'])
        try: h=json.loads(j)['html_url']
        except Exception: return 'FRAPI-ERR',u
        return ('200' if h==u else 'FR-MISMATCH '+h),u
    m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/section-(.+)$',u)
    if m:
        for i in range(4):
            x=curl(['--compressed',f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{m.group(1)}.xml?section={m.group(2)}'])
            if 'Too Many' in x: time.sleep(10); continue
            return ('200' if f'{m.group(2)}' in x and '<' in x else 'ECFR-BAD'),u
        return 'ECFR-429',u
    m=re.match(r'https://rulings\.cbp\.gov/ruling/(\w+)$',u)
    if m:
        x=curl([f'https://rulings.cbp.gov/api/ruling/{m.group(1)}'])
        return ('200' if m.group(1) in x else 'CROSS-BAD'),u
    c=subprocess.run(['curl','-s','-o','/dev/null','-L','--max-time','30','-A',UA,'-w','%{http_code}',u],capture_output=True,text=True).stdout.strip()
    return c,u
res=[]
ecfr=[u for u in allu if 'ecfr.gov' in u]; rest=[u for u in allu if 'ecfr.gov' not in u]
with cf.ThreadPoolExecutor(8) as ex: res=list(ex.map(chk,sorted(rest)))
for u in sorted(ecfr): res.append(chk(u)); time.sleep(0.5)
bad=[(c,u) for c,u in res if c!='200']
print(f'{len(res)} unique URLs, {len(res)-len(bad)} OK')
for c,u in bad: print(c,u)
