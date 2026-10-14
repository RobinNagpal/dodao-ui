import re,sys,html,os,time,subprocess
os.makedirs('ecfr',exist_ok=True)
for arg in sys.argv[1:]:
    t,kind,s=arg.split(':')  # e.g. 19:section:12.60  or 50:part:14
    p=f'ecfr/{t}_{kind}_{s}.txt'
    if not os.path.exists(p) or os.path.getsize(p)<300:
        url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={s}'
        x=subprocess.run(["curl","-s","--compressed","-m","90","-A","Mozilla/5.0",url],capture_output=True,text=True).stdout
        if len(x)<300: print('ERR',arg,x[:200]); continue
        x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'[ \t]+',' ',x); x=re.sub(r'\n\s*\n+','\n',x)
        open(p,'w').write(x); time.sleep(1)
    x=open(p).read()
    print('=====',arg,len(x)); print(x[:int(os.environ.get('N','800'))])
