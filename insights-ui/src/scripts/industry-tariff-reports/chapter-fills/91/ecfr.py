import sys,subprocess,re,html,time
for spec in sys.argv[1:]:
    t,s=spec.split(':')
    kind='part' if s.startswith('p') else 'section'
    s2=s[1:] if kind=='part' else s
    f=f'ecfr/{t}_{s}.xml'
    subprocess.run(['curl','-s','--compressed',f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={s2}','-o',f])
    x=open(f).read(); x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x).strip()
    open(f[:-4]+'.txt','w').write(x)
    print(f'{t} CFR {s} ::',x[:int(__import__("os").environ.get("N","260"))]); time.sleep(4)
