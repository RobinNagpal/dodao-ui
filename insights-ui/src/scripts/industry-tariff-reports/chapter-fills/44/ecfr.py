import subprocess,re,html,time,sys
for spec in sys.argv[1:]:
    t,part,sec=spec.split(':')
    q=f'part={part}'+(f'&section={sec}' if sec else '')
    u=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{q}'
    for i in range(6):
        x=subprocess.run(['curl','-s','--compressed',u],capture_output=True,text=True).stdout
        if '429 Too Many' in x: time.sleep(30*(i+1)); continue
        break
    y=re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',x)))
    name=sec or part
    open(f'ecfr/{name}.txt','w').write(y); print(name,len(y),y[:160],flush=True); time.sleep(10)
