import sys,urllib.request,re,time,gzip,os,json
out={}
for spec in sys.argv[1:]:
    t,sec=spec.split(':'); part=sec.split('.')[0]
    fn=f'e_{t}_{sec}.txt'
    if not os.path.exists(fn):
        u=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?part={part}&section={sec}'
        for k in range(6):
            try:
                r=urllib.request.urlopen(urllib.request.Request(u,headers={'Accept-Encoding':'gzip','User-Agent':'Mozilla/5.0'}),timeout=60)
                b=r.read()
                if r.headers.get('Content-Encoding')=='gzip': b=gzip.decompress(b)
                x=b.decode('utf8','ignore'); break
            except Exception as e:
                print('retry',spec,e); time.sleep(10*(k+1)); x=''
        txt=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',x))
        open(fn,'w').write(txt)
    txt=open(fn).read()
    print(spec,'|',txt[:220])
