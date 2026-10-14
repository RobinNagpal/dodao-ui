import json,re,time,urllib.request,urllib.error,sys
urls=[l.strip() for l in open('urls.txt') if l.strip()]
meta=json.load(open('frmeta.json'))
bad=[]
def get(u,headers=None):
    for attempt in range(6):
        try:
            req=urllib.request.Request(u,headers=headers or {'User-Agent':'Mozilla/5.0'})
            return urllib.request.urlopen(req,timeout=40)
        except urllib.error.HTTPError as e:
            if e.code==429:
                time.sleep(30*(attempt+1)); continue
            raise
    raise Exception('429 after retries')
for u in urls:
    try:
        if 'federalregister.gov/documents/' in u:
            num=u.split('/')[7]
            if num not in meta or 'html_url' not in meta[num]:
                api=f'https://www.federalregister.gov/api/v1/documents/{num}.json?fields%5B%5D=html_url&fields%5B%5D=citation&fields%5B%5D=publication_date&fields%5B%5D=title'
                meta[num]=json.loads(get(api).read()); time.sleep(3)
            ok = meta[num]['html_url']==u
            print('FR',num,'OK' if ok else 'MISMATCH '+meta[num]['html_url'],flush=True)
            if not ok: bad.append(u)
        elif 'ecfr.gov' in u:
            t,kind,s=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\w.]+)',u).groups()
            r=get(f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={s}',headers={'User-Agent':'Mozilla/5.0','Accept-Encoding':'gzip'})
            print('ECFR',t,kind,s,r.status,flush=True); time.sleep(4)
        elif 'usitc.gov/sites' in u:
            print('SKIP (usitc.gov JSON 403s to scripts; known)',u,flush=True)
        else:
            r=get(u); print('GET',r.status,u[:110],flush=True); time.sleep(1)
    except Exception as e:
        print('ERR',e,u,flush=True); bad.append(u)
    json.dump(meta,open('frmeta.json','w'),indent=1)
print('BAD',bad)
