import json,re,sys,subprocess,time,urllib.request
d=json.load(open(sys.argv[1]))
urls=set()
def walk(o):
    if isinstance(o,dict):
        for k,v in o.items():
            if k=='url' and isinstance(v,str): urls.add(v)
            else: walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(d)
def get(u,ua=True):
    r=subprocess.run(['curl','-s','-o','/dev/null','-L','--compressed','-A','Mozilla/5.0','-w','%{http_code}',u],capture_output=True,text=True)
    return r.stdout
bad=[]
for u in sorted(urls):
    if 'federalregister.gov/documents/' in u:
        m=re.search(r'/documents/\d{4}/\d\d/\d\d/([^/]+)/',u)
        j=json.loads(subprocess.run(['curl','-s',f'https://www.federalregister.gov/api/v1/documents/{m.group(1)}.json?fields[]=html_url'],capture_output=True,text=True).stdout)
        ok = j.get('html_url')==u; code='FR-ok' if ok else 'FR-MISMATCH '+str(j.get('html_url'))
    elif 'ecfr.gov/current/' in u:
        m=re.search(r'title-(\d+)/(section|part)-([\d.]+)',u)
        q=f"section={m.group(3)}" if m.group(2)=='section' else f"part={m.group(3)}"
        for i in range(4):
            code=subprocess.run(['curl','-s','--compressed','-o','/dev/null','-w','%{http_code}',f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{m.group(1)}.json?{q}' if False else f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{m.group(1)}.xml?{q}'],capture_output=True,text=True).stdout
            if code!='429': break
            time.sleep(10)
        ok = code=='200'
    else:
        code=get(u); ok = code in ('200',) or ('usitc.gov' in u and code=='403')
    print(code,u)
    if not ok: bad.append(u)
print('BAD',len(bad),bad,'TOTAL',len(urls))
