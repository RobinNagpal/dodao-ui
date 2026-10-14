import json,re,sys,urllib.request,time
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
# also citations in tariffEngineering
print(len(urls),'urls')
bad=[]
def get(u,headers=None):
    r=urllib.request.Request(u,headers=headers or {'User-Agent':'Mozilla/5.0'})
    return urllib.request.urlopen(r,timeout=30)
for u in sorted(urls):
    try:
        m=re.match(r'https://www\.federalregister\.gov/documents/\d{4}/\d\d/\d\d/([0-9a-z-]+?)/',u)
        if m:
            doc=m.group(1)
            for attempt in range(3):
                try:
                    x=json.load(get(f'https://www.federalregister.gov/api/v1/documents/{doc}.json?fields[]=html_url'))
                    break
                except Exception as e:
                    time.sleep(5)
            if x['html_url']!=u: bad.append((u,'FR html_url differs: '+x['html_url']))
            continue
        m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-([\d.]+)$',u)
        if m:
            t,kind,s=m.groups()
            q=f'section={s}' if kind=='section' else f'part={s}'
            r=urllib.request.Request(f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{q}',headers={'Accept-Encoding':'gzip','User-Agent':'Mozilla/5.0'})
            time.sleep(4)
            code=urllib.request.urlopen(r,timeout=60).status
            if code!=200: bad.append((u,code))
            continue
        if 'usitc.gov/sites' in u: continue
        code=get(u).status
        if code!=200: bad.append((u,code))
    except Exception as e:
        bad.append((u,str(e)[:100]))
print('BAD:',len(bad))
for b in bad: print(b)
