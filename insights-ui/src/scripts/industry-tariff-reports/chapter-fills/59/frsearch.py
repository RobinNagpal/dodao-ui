import json,subprocess,sys,urllib.parse,time
def get(u):
    for i in range(4):
        out=subprocess.run(['curl','-s','-g','-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
        try: return json.loads(out)
        except Exception: time.sleep(3)
    return {'count':'ERR '+out[:100]}
for q in sys.argv[1:]:
    u='https://www.federalregister.gov/api/v1/documents.json?per_page=40&order=newest&conditions[agencies][]=international-trade-administration&fields[]=title&fields[]=publication_date&fields[]=document_number&fields[]=citation&conditions[term]='+urllib.parse.quote(q)
    r=get(u)
    print('#####',q,r.get('count'))
    seen=set()
    for d in r.get('results',[]):
        t=d['title'][:110]
        if t in seen: continue
        seen.add(t); print(' ',d['publication_date'],d['document_number'],d['citation'],t)
    time.sleep(1)
