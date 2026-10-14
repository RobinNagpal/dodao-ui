import json,sys,re,urllib.request,time
d=json.load(open(sys.argv[1]))
urls=set()
def walk(x):
    if isinstance(x,dict):
        for k,v in x.items():
            if k=='url' and isinstance(v,str): urls.add(v)
            else: walk(v)
    elif isinstance(x,list):
        for v in x: walk(v)
walk(d)
fr=[u for u in urls if 'federalregister.gov/documents/' in u]
ec=[u for u in urls if 'ecfr.gov' in u]
other=[u for u in urls if u not in fr and u not in ec]
bad=[]
UA={'User-Agent':'Mozilla/5.0'}
for u in sorted(fr):
    dn=u.split('/')[6]; m=None
    for a in range(4):
        try:
            m=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url',headers=UA))); break
        except Exception: time.sleep(10)
    if not m or m['html_url']!=u: bad.append(('FR',u,m and m['html_url']))
    time.sleep(1)
structs={}
def ids(node,acc):
    acc.add((node.get('type'),node.get('identifier')))
    for c in node.get('children') or []: ids(c,acc)
for u in sorted(ec):
    t,kind,s=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\d.]+)',u).groups()
    if t not in structs:
        for a in range(6):
            try:
                req=urllib.request.Request(f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json',headers={**UA,'Accept-Encoding':'gzip'})
                import gzip; raw=urllib.request.urlopen(req,timeout=120).read()
                try: raw=gzip.decompress(raw)
                except Exception: pass
                acc=set(); ids(json.loads(raw),acc); structs[t]=acc; break
            except Exception as e: print('retry',t,e); time.sleep(15)
    ok=(kind,s) in structs.get(t,set())
    print('ECFR',ok,u)
    if not ok: bad.append(('ECFR',u,None))
for u in sorted(other):
    code=None
    for a in range(2):
        try:
            r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}),timeout=60); code=r.status
            body=r.read(4000).decode('utf8','ignore')
            if 'Page Not Found' in body: code='NOTFOUND'
            break
        except Exception as e: code=str(e)[:60]; time.sleep(3)
    print(code,u)
    if code!=200: bad.append(('OTHER',u,code))
print('FR checked',len(fr),'ecfr',len(ec),'other',len(other))
print('BAD:'); [print(b) for b in bad]
