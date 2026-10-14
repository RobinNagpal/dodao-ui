import re,subprocess,time,sys
urls=[u for u in open(sys.argv[1]).read().split('\n') if 'ecfr.gov/current/' in u]
bad=0
for u in urls:
    t,kind,v=re.search(r'title-(\d+)/(section|part)-([\w.\-]+)',u).groups()
    for i in range(4):
        r=subprocess.run(['curl','-s','--compressed',f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{kind}={v}'],capture_output=True,text=True).stdout
        if 'Too many' in r or not r: time.sleep(15); continue
        break
    ok = f'N="{v}"' in r
    if not ok: bad+=1; print('BAD',u,r[:100])
    time.sleep(1)
print(len(urls),'ecfr checked, bad',bad)
