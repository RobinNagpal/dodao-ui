import re,sys,html,urllib.request,os,time
os.makedirs('ecfr',exist_ok=True)
for arg in sys.argv[1:]:
    t,s=arg.split(':')
    p=f'ecfr/{s}.txt'
    if not os.path.exists(p):
        url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?section={s}'
        try:
            import subprocess; x=subprocess.run(["curl","-s","--compressed","-m","60",url],capture_output=True,text=True).stdout
            assert len(x)>200, x[:200]
        except Exception as e:
            print('ERR',s,e); continue
        x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x)
        open(p,'w').write(x); time.sleep(0.5)
    x=open(p).read()
    print('=====',s,len(x)); print(x[:int(os.environ.get('N','800'))])
