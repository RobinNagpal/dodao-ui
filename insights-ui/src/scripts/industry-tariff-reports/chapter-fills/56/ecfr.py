import sys,urllib.request,re,html,time
D='2026-10-08'
for spec in sys.argv[1:]:
    t,kind,s=spec.split(':')
    u=f'https://www.ecfr.gov/api/versioner/v1/full/{D}/title-{t}.xml?{kind}={s}'
    for i in range(4):
        try:
            x=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read().decode(); break
        except Exception as e:
            print(spec,'ERR',e); time.sleep(5)
    else: continue
    txt=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x)))
    open(f'{t}-{s}.txt','w').write(txt); print(spec,len(txt),txt[:120])
    time.sleep(1)
