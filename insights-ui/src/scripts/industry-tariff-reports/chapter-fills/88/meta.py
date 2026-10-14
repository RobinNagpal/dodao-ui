import json,urllib.request,time,sys,os
docs=sys.argv[1:]
M=json.load(open('fr_meta.json')) if os.path.exists('fr_meta.json') else {}
need=[d for d in docs if d not in M]
for i in range(0,len(need),20):
    chunk=need[i:i+20]
    u='https://www.federalregister.gov/api/v1/documents/'+','.join(chunk)+'.json?fields[]=document_number&fields[]=title&fields[]=citation&fields[]=publication_date&fields[]=html_url&fields[]=signing_date&fields[]=type&fields[]=presidential_document_number'
    for k in range(8):
        try: d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60)); break
        except Exception as e: print('retry',e); time.sleep(15*(k+1))
    res=d['results'] if 'results' in d else [d]
    for r in res: M[r['document_number']]=r
    for e in d.get('errors',{}).get('not_found',[]) if isinstance(d.get('errors'),dict) else []: print('NOT FOUND',e)
json.dump(M,open('fr_meta.json','w'),indent=1)
for x in docs: print(x, (M.get(x) or {}).get('citation'), (M.get(x) or {}).get('publication_date'), ((M.get(x) or {}).get('title') or 'MISSING')[:90])
