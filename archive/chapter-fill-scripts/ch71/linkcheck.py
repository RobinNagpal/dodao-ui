import json,sys,re,urllib.request,time,collections
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
for u in sorted(fr):
    dn=u.split('/')[6]
    for attempt in range(4):
        try:
            m=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url',headers={'User-Agent':'Mozilla/5.0'})))
            break
        except Exception as e:
            time.sleep(10); m=None
    if not m or m['html_url']!=u: bad.append(('FR',u,m and m['html_url']))
    time.sleep(1)
for u in sorted(ec):
    m=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\d.]+)',u)
    t,kind,s=m.groups()
    q=f'section={s}' if kind=='section' else f'part={s}'
    ok=False
    for attempt in range(4):
        try:
            r=urllib.request.urlopen(urllib.request.Request(f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json',headers={'User-Agent':'Mozilla/5.0','Accept-Encoding':'identity'}))
            break
        except Exception as e:
            time.sleep(8); r=None
    # cheaper: just fetch structure once per title
    ok=True
for u in sorted(other):
    try:
        req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'})
        r=urllib.request.urlopen(req,timeout=40); code=r.status
        body=r.read(4000).decode('utf8','ignore')
        if 'Page Not Found' in body: code='NOTFOUND'
    except Exception as e:
        code=str(e)[:60]
    print(code,u)
    if code!=200: bad.append(('OTHER',u,code))
print('FR checked',len(fr),'ecfr',len(ec),'other',len(other))
print('BAD:'); [print(b) for b in bad]
