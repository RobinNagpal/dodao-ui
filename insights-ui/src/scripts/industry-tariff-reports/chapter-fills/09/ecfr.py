import sys,time,urllib.request,re,gzip,os
os.makedirs('ecfr',exist_ok=True)
for spec in sys.argv[1:]:
    title,part,sec=spec.split(':')
    out=f'ecfr/{title}_{sec}.txt'
    if os.path.exists(out) and os.path.getsize(out)>200: continue
    q=f'part={part}'+(f'&section={sec}' if sec!='-' else '')
    url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{title}.xml?{q}'
    for a in range(5):
        try:
            req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept-Encoding':'gzip'})
            r=urllib.request.urlopen(req,timeout=60); b=r.read()
            if r.headers.get('Content-Encoding')=='gzip': b=gzip.decompress(b)
            t=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',b.decode()))
            open(out,'w').write(t); print(spec,len(t)); break
        except Exception as e:
            print(spec,'ERR',e); time.sleep(20*(a+1))
    time.sleep(6)
