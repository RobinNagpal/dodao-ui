import json,sys,time,urllib.request,os
out=json.load(open('frmeta.json')) if os.path.exists('frmeta.json') else {}
for n in sys.argv[1:]:
    if n in out: continue
    u=f'https://www.federalregister.gov/api/v1/documents/{n}.json?fields[]=document_number&fields[]=title&fields[]=publication_date&fields[]=citation&fields[]=html_url&fields[]=abstract&fields[]=signing_date&fields[]=effective_on&fields[]=type&fields[]=agency_names&fields[]=presidential_document_number&fields[]=proclamation_number&fields[]=executive_order_number'
    u=u.replace('[','%5B').replace(']','%5D')
    try:
        r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read())
        out[n]=r
        print(n,r['citation'],r['publication_date'],r['html_url'][:140]); print('   ',r['title']); print('   ABS',(r.get('abstract') or '')[:500])
    except Exception as e:
        print(n,'ERR',e)
    time.sleep(1.5)
json.dump(out,open('frmeta.json','w'),indent=1)
