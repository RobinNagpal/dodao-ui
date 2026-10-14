import sys,time,urllib.request,re,gzip,os
# usage: ecfr_part.py title:part ...  -> ecfr/<t>_part<p>.xml and prints section headings
for spec in sys.argv[1:]:
    title,part=spec.split(':')
    out=f'ecfr/{title}_part{part}.xml'
    if not (os.path.exists(out) and os.path.getsize(out)>500):
        url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{title}.xml?part={part}'
        for a in range(5):
            try:
                req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept-Encoding':'gzip'})
                r=urllib.request.urlopen(req,timeout=90); b=r.read()
                if r.headers.get('Content-Encoding')=='gzip': b=gzip.decompress(b)
                open(out,'wb').write(b); break
            except Exception as e:
                print(spec,'ERR',e); time.sleep(15*(a+1))
        time.sleep(3)
    x=open(out,encoding='utf-8').read()
    print('=== ',spec)
    for h in re.findall(r'<HEAD>(.*?)</HEAD>',x):
        if h.strip().startswith('§') or h.startswith('PART') or 'Subpart' in h: print('  ',re.sub(r'<[^>]+>','',h)[:160])
