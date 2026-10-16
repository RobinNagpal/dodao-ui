import json,sys,time
from frq import get
out={}
try: out=json.load(open('frmeta.json'))
except: pass
for dn in sys.argv[1:]:
    if dn in out: continue
    r=json.loads(get(f'https://www.federalregister.gov/api/v1/documents/{dn}.json'))
    out[dn]={k:r.get(k) for k in ['document_number','citation','publication_date','signing_date','effective_on','title','html_url','type','presidential_document_number','executive_order_number','proclamation_number']}
    time.sleep(1.5)
json.dump(out,open('frmeta.json','w'),indent=1)
for dn in sys.argv[1:]: print(json.dumps(out[dn]))
