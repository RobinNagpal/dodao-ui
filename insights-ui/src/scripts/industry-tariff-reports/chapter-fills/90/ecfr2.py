import re,sys,html,os,subprocess,time
os.makedirs('ecfr',exist_ok=True)
for arg in sys.argv[1:]:
    t,s=arg.split(':')
    kind='part' if s.startswith('p') else 'section'
    s2=s[1:] if kind=='part' else s
    p=f'ecfr/{t}_{s}.txt'
    for attempt in range(8):
        if os.path.exists(p) and os.path.getsize(p)>300 and 'Too Many' not in open(p).read(400) and 'Unavailable' not in open(p).read(400) and 'heavy load' not in open(p).read(400): break
        url=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={s2}'
        x=subprocess.run(["curl","-s","--compressed","-m","60",url],capture_output=True,text=True).stdout
        x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x)
        open(p,'w').write(x); time.sleep(4+attempt*6)
    x=open(p).read()
    print('=====',t,s,len(x)); print(x[:int(os.environ.get('N','400'))]); sys.stdout.flush()
