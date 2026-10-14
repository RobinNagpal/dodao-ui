import sys,urllib.request,re,time,os
for spec in sys.argv[1:]:
    t,s=spec.split(':')
    kind='part' if '.' not in s else 'section'
    out=f'ecfr/{t}-{s}.txt'
    if os.path.exists(out) and os.path.getsize(out)>200: 
        print(spec,'cached'); continue
    u=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={s}'
    for a in range(4):
        try:
            x=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0','Accept-Encoding':'identity'}),timeout=60).read().decode('utf8','ignore'); break
        except Exception as e:
            x='ERR '+str(e); time.sleep(5)
    txt=re.sub(r'<[^>]+>',' ',x); txt=re.sub(r'\s+',' ',txt)
    open(out,'w').write(txt); print(spec,len(txt),txt[:160])
    time.sleep(0.5)
