import json,subprocess,re,time,urllib.request
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
def code(u,extra=[]):
    for i in range(4):
        c=subprocess.run(['curl','-s','-o','/dev/null','-L','-A',UA,'-w','%{http_code}','--max-time','60']+extra+[u],capture_output=True,text=True).stdout
        if c in ('429','503'): time.sleep(20*(i+1)); continue
        return c
    return c
for u in [l.strip() for l in open('urls.txt') if l.strip()]:
    m=re.match(r'https://www.federalregister.gov/documents/\d+/\d+/\d+/([^/]+)/',u)
    e=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\w.\-]+)',u)
    if m:
        try:
            j=json.loads(urllib.request.urlopen(urllib.request.Request('https://www.federalregister.gov/api/v1/documents/%s.json?fields[]=html_url'%m.group(1),headers={'User-Agent':UA}),timeout=60).read())
            c='FR-OK' if j['html_url']==u else 'FR-MISMATCH '+j['html_url']
        except Exception as ex: c='FR-ERR '+str(ex)
    elif e:
        t,kind,s=e.groups(); q=('part=%s&section=%s'%(s.split('.')[0],s)) if kind=='section' else 'part='+s
        c='ECFR'+code('https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-%s.json?%s'%(t,q),['--compressed']) if kind=='part' else 'ECFR'+code('https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-%s.xml?%s'%(t,q),['--compressed'])
        time.sleep(4)
    elif 'fws.gov' in u: c='FWS(checked via WebFetch)'
    elif 'usitc.gov' in u and u.endswith('.json'): c=code(u,['-r','0-100'])
    else: c=code(u)
    print(c,u,flush=True); time.sleep(0.5)
