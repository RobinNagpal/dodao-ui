import json,re,sys,urllib.request,urllib.error,time
f=sys.argv[1]
s=open(f).read()
urls=sorted(set(re.findall(r'https://[^"\s)]+',s)))
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36','Accept':'text/html,application/json,*/*'}
def check(u):
    test=u
    m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(.*)',u)
    if m:
        t,rest=m.groups()
        q=[]
        for part in rest.split('/'):
            k,_,v=part.partition('-'); 
            q.append(f'{k}={v}' if k!='chapter' and k!='subchapter' else f'{k}={v}')
        test=f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?'+'&'.join(q)
    m=re.match(r'https://www\.federalregister\.gov/documents/\d+/\d+/\d+/([\d-]+)/',u)
    if m: test=f'https://www.federalregister.gov/api/v1/documents/{m.group(1)}.json?fields[]=title'
    try:
        r=urllib.request.urlopen(urllib.request.Request(test,headers=UA),timeout=40)
        return r.status,test
    except urllib.error.HTTPError as e: return e.code,test
    except Exception as e: return str(e)[:60],test
for u in urls:
    st,t=check(u); print(st,u if t==u else f'{u}  [via {t[:90]}]'); time.sleep(0.4)
