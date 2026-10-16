import re,subprocess,json,time,sys
urls=open('urls.txt').read().split('\n')
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
bad=[]
for u in urls:
    if not u: continue
    m=re.match(r'https://www\.federalregister\.gov/documents/\d+/\d+/\d+/([^/]+)/',u)
    if m:
        dn=m.group(1)
        r=subprocess.run(['curl','-s','-g','-m','40',f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url'],capture_output=True,text=True).stdout
        try: h=json.loads(r)['html_url']
        except Exception: h='ERR '+r[:80]
        ok = h==u
        print('FR',ok,u if ok else (u,h)); 
        if not ok: bad.append((u,h))
        time.sleep(1.0); continue
    m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-(.+)$',u)
    if m:
        t,k,s=m.groups()
        for a in range(6):
            r=subprocess.run(['curl','-s','-m','60','-o','/dev/null','-w','%{http_code}',f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?{k}={s}'],capture_output=True,text=True).stdout
            if r=='200': break
            time.sleep(5+a*5)
        print('ECFR',r,u)
        if r!='200': bad.append((u,r))
        time.sleep(1.5); continue
    r=subprocess.run(['curl','-s','-L','-m','60','-o','/dev/null','-A',UA,'-w','%{http_code} %{url_effective}',u],capture_output=True,text=True).stdout
    print('GEN',r,u)
    if not r.startswith('200'): bad.append((u,r))
print('BAD',json.dumps(bad,indent=1))
