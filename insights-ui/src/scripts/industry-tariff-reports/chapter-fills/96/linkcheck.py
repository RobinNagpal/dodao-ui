import json,sys,re,urllib.request,time,subprocess
d=json.load(open(sys.argv[1]))
urls=set()
def walk(x):
    if isinstance(x,dict):
        for k,v in x.items():
            if k=='url' and isinstance(v,str): urls.add(v)
            else: walk(v)
    elif isinstance(x,list):
        for v in x: walk(v)
walk(d)
# ecfr index
idx=set()
def w2(n,t):
    if n.get('type') in ('section','part'): idx.add((t,n['type'],n['identifier']))
    for c in n.get('children',[]) or []: w2(c,t)
for t in (16,19,21,49,50):
    w2(json.load(open(f'struct-{t}.json')),t)
bad=[]
fr=sorted(u for u in urls if 'federalregister.gov/documents/' in u)
ec=sorted(u for u in urls if 'ecfr.gov' in u)
other=sorted(u for u in urls if u not in fr and u not in ec)
for u in fr:
    dn=u.split('/')[7]
    m=None
    for a in range(4):
        try:
            r=subprocess.run(['curl','-s','-m','30','-A','Mozilla/5.0',f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url'],capture_output=True,text=True); m=json.loads(r.stdout); break
        except Exception as e: time.sleep(5)
    print('FR',dn,bool(m),flush=True)
    if not m or m['html_url']!=u: bad.append(('FR',u,m and m.get('html_url')))
    time.sleep(0.3)
for u in ec:
    m=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\d.]+)$',u)
    if not m: bad.append(('ECFR-FMT',u,None)); continue
    t,k,s=m.groups()
    if int(t) not in (16,19,21,49,50): bad.append(('ECFR-UNCHECKED',u,None)); continue
    if (int(t),k,s) not in idx: bad.append(('ECFR',u,'missing'))
for u in other:
    code=None
    try:
        r=subprocess.run(['curl','-s','-L','-o','/tmp/lc.out' if False else '/dev/null','-w','%{http_code}','-m','60','-A','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',u],capture_output=True,text=True)
        code=r.stdout.strip()
    except Exception as e: code=str(e)
    print(code,u,flush=True)
    if code!='200': bad.append(('OTHER',u,code))
print('FR',len(fr),'ECFR',len(ec),'OTHER',len(other))
print('BAD:')
for b in bad: print(b)
