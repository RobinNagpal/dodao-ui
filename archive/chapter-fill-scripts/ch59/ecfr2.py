import re,sys,html,os,subprocess,time
os.makedirs('ecfr',exist_ok=True)
for arg in sys.argv[1:]:
    t,s=arg.split(':')
    p=f'ecfr/{s}.txt'
    for i in range(6):
        if os.path.exists(p) and os.path.getsize(p)>300 and 'Too Many' not in open(p).read(200): break
        url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?section={s}'
        x=subprocess.run(["curl","-s","--compressed","-m","60",url],capture_output=True,text=True).stdout
        x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x)
        if 'Too Many' in x or len(x)<300:
            time.sleep(15); continue
        open(p,'w').write(x)
    print(s, os.path.getsize(p) if os.path.exists(p) else 'FAIL')
