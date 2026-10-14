import json,sys,urllib.request
for dn in sys.argv[1:]:
    u=f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=title&fields[]=abstract&fields[]=dates&fields[]=effective_on&fields[]=html_url&fields[]=citation&fields[]=publication_date&fields[]=signing_date&fields[]=type&fields[]=agency_names&fields[]=docket_ids&fields[]=comments_close_on&fields[]=raw_text_url&fields[]=executive_order_number&fields[]=proclamation_number'
    u=u.replace('[','%5B').replace(']','%5D')
    r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})))
    print('=====',dn); 
    for k,v in r.items(): print(' ',k,':',v)
