import json,urllib.request,sys,time,os
UA={'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'}
f='frmeta.json'; d=json.load(open(f)) if os.path.exists(f) else {}
for dn in sys.argv[1:]:
    if dn in d: continue
    u=f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=citation&fields[]=publication_date&fields[]=signing_date&fields[]=title&fields[]=html_url&fields[]=type&fields[]=agencies&fields[]=effective_on&fields[]=presidential_document_number&fields[]=proclamation_number&fields[]=executive_order_number'
    for i in range(6):
        try: d[dn]=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=60).read()); break
        except Exception as e: print('retry',dn,e); time.sleep(10*(i+1))
    print(dn,d[dn]['citation'],d[dn]['publication_date'],d[dn]['title'][:100]); time.sleep(0.3)
json.dump(d,open(f,'w'),indent=1)
