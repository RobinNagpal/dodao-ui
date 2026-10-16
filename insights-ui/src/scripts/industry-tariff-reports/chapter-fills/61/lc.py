import json,sys,subprocess,re,concurrent.futures as cf,time
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
    r=subprocess.run(['curl','-s','-o','/dev/null','-L','--max-time','30','-A',UA,'-w','%{http_code}',u],capture_output=True,text=True); return r.stdout.strip()
def chk(u):
    m=re.match(r'https://www.federalregister.gov/documents/\d+/\d+/\d+/([^/]+)/',u)
    if m:
        r=subprocess.run(['curl','-s','--max-time','30',f'https://www.federalregister.gov/api/v1/documents/{m.group(1)}.json?fields[]=html_url'],capture_output=True,text=True)
        try: h=json.loads(r.stdout)['html_url']
        except Exception: return 'FRERR',u
        return ('200' if h==u else 'FRMISMATCH '+h),u
    m=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-(.+)$',u)
    if m:
        t,k,s=m.groups()
        for i in range(4):
            r=subprocess.run(['curl','-s','--compressed','--max-time','40',f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json' if False else f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{k}={s}','-o','/dev/null','-w','%{http_code}'],capture_output=True,text=True)
            if r.stdout!='429': return r.stdout,u
            time.sleep(3)
        return r.stdout,u
    return curl(u),u
ecfr=[u for u in allu if 'ecfr.gov' in u]; rest=[u for u in allu if u not in ecfr]
with cf.ThreadPoolExecutor(10) as ex: res=list(ex.map(chk,sorted(rest)))
res+= [(time.sleep(2), chk(u))[1] for u in sorted(ecfr)]
bad=[(c,u) for c,u in res if c!='200']
print(f'{len(res)} unique URLs, {len(res)-len(bad)} OK')
for c,u in bad: print(c,u)
