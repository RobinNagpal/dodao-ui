import json,sys,subprocess,time
for q in sys.argv[1:]:
    body=json.dumps({"query":"collection:FR "+q,"pageSize":25,"offsetMark":"*","sorts":[{"field":"publishdate","sortOrder":"DESC"}]})
    r=subprocess.run(['curl','-s','-m','40','-X','POST','https://api.govinfo.gov/search?api_key=DEMO_KEY','-H','Content-Type: application/json','-d',body],capture_output=True,text=True).stdout
    try: d=json.loads(r)
    except Exception: print('ERR',r[:200]); continue
    print('###',q,d.get('count'))
    for x in d.get('results',[]):
        if x.get('granuleId'): print(' ',x.get('dateIssued'),x.get('granuleId'),x.get('title')[:170])
    time.sleep(1)
