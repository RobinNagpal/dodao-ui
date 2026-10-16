import json,subprocess,sys,urllib.parse,time
def get(u):
    for i in range(3):
        out=subprocess.run(['curl','-s','-g','-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
        try: return json.loads(out)
        except Exception: time.sleep(5)
    return {'count':'ERR '+out[:100]}
since=sys.argv[1]
for q in sys.argv[2:]:
    u=('https://www.federalregister.gov/api/v1/documents.json?per_page=50&order=newest'
       '&conditions[agencies][]=international-trade-administration&conditions[agencies][]=international-trade-commission'
       f'&conditions[publication_date][gte]={since}'
       '&fields[]=title&fields[]=publication_date&fields[]=document_number&fields[]=citation&conditions[term]='+urllib.parse.quote(q))
    r=get(u); print('#####',q,r.get('count'))
    seen=set()
    for d in r.get('results',[]):
        t=d['title'][:120]
        if t in seen: continue
        seen.add(t); print(' ',d['publication_date'],d['document_number'],d['citation'],t)
    time.sleep(2)
