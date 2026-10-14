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
def curl(u):
    r=subprocess.run(['curl','-s','-o','/dev/null','-L','--max-time','30','-A',UA,'-w','%{http_code}',u],capture_output=True,text=True)
    return r.stdout.strip()
def chk(u):
    m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-([\w.\-]+)',u)
    if m:
        t,kind,x=m.groups()
        api=f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?'+('section' if kind=='section' else 'part')+f'={x}'
        if kind=='section':
            api=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?section={x}'
        for i in range(4):
            r=subprocess.run(['curl','-s','--compressed','-o','/dev/null','-w','%{http_code}',api],capture_output=True,text=True).stdout.strip()
            if r!='429': break
            time.sleep(5)
        return ('ecfr-api '+r),u
    return curl(u),u
with cf.ThreadPoolExecutor(6) as ex: res=list(ex.map(chk,sorted(allu)))
bad=[(c,u) for c,u in res if not c.endswith('200')]
print(f'{len(res)} unique URLs, {len(res)-len(bad)} OK')
for c,u in bad: print(c,u)
