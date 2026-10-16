import json,re,urllib.request,time,subprocess
urls=[u for u in open('urls.txt').read().split('\n') if u]
bad=[]
for u in urls:
    m=re.match(r'https://www\.federalregister\.gov/documents/\d+/\d+/\d+/([0-9-]+)/',u)
    if m:
        doc=m.group(1)
        try:
            r=json.load(urllib.request.urlopen(f'https://www.federalregister.gov/api/v1/documents/{doc}.json?fields[]=html_url',timeout=30))
            ok = r['html_url']==u
            print('FR',doc,'OK' if ok else 'MISMATCH '+r['html_url'])
            if not ok: bad.append(u)
        except Exception as e: print('FR',doc,'ERR',e); bad.append(u)
        time.sleep(0.3); continue
    m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-(.+)$',u)
    if m:
        t,k,s=m.groups()
        api=f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{k}={s}'
        code=subprocess.run(['curl','-s','--compressed','-o','/dev/null','-w','%{http_code}','-m','60','-A','Mozilla/5.0',api],capture_output=True,text=True).stdout
        print('ECFR',t,k,s,code); 
        if code!='200': bad.append(u)
        time.sleep(0.5); continue
    code=subprocess.run(['curl','-sL','-o','/dev/null','-w','%{http_code}','-m','60','-A','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',u],capture_output=True,text=True).stdout
    print('GET',code,u)
    if code not in ('200',): bad.append(u)
print('BAD',bad)
