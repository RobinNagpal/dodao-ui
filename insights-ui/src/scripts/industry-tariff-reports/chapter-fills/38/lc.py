import json,sys,subprocess,re,time
d=json.load(open(sys.argv[1])); urls=set()
def w(v):
    if isinstance(v,dict):
        for k,x in v.items():
            if k=='url' and isinstance(x,str): urls.add(x)
            else: w(x)
    elif isinstance(v,list):
        for x in v: w(x)
w(d)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
def code(u,extra=[]):
    return subprocess.run(['curl','-s','-o','/dev/null','-L','-A',UA,'-w','%{http_code}','--max-time','60']+extra+[u],capture_output=True,text=True).stdout
print(len(urls))
for u in sorted(urls):
    m=re.match(r'https://www.federalregister.gov/documents/\d+/\d+/\d+/([^/]+)/',u)
    e=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\w.\-]+)',u)
    if m: c='API'+code('https://www.federalregister.gov/api/v1/documents/%s.json?fields[]=document_number'%m.group(1))
    elif e:
        t,kind,s=e.groups(); q=('part=%s&section=%s'%(s.split('.')[0],s)) if kind=='section' else 'part='+s
        c='ECFR'+code('https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-%s.json?%s'%(t,q),['--compressed']) if kind=='part' else 'ECFR'+code('https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-%s.xml?%s'%(t,q),['--compressed'])
    elif 'usitc.gov' in u and u.endswith('.json'): c=code(u,['-r','0-100'])
    else: c=code(u)
    print(c,u,flush=True); time.sleep(0.5)
