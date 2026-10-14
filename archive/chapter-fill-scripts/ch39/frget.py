import json,sys,subprocess,os,re,html,time
os.makedirs('fr',exist_ok=True)
def get(url):
    for i in range(6):
        r=subprocess.run(['curl','-s','-L','-A','Mozilla/5.0',url],capture_output=True,text=True).stdout
        if r and not r.lstrip().startswith('<!DOCTYPE html>') or 'govinfo' in url: 
            if r: return r
        time.sleep(3*(i+1))
    return r
for dn in sys.argv[1:]:
    p=f'fr/{dn}.txt'
    if os.path.exists(p) and os.path.getsize(p)>3000: continue
    raw=get(f'https://www.federalregister.gov/api/v1/documents/{dn}.json')
    try: m=json.loads(raw)
    except Exception: print('FAIL',dn); continue
    json.dump({k:m.get(k) for k in ['document_number','title','citation','publication_date','signing_date','html_url','type','executive_order_number','proclamation_number','effective_on','start_page']},open(f'fr/{dn}.meta.json','w'),default=str,indent=1)
    d=m['publication_date']
    t=get(f'https://www.govinfo.gov/content/pkg/FR-{d}/html/{dn}.htm')
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    open(p,'w').write(t)
    print(dn, m['citation'], d, m['title'][:110], len(t), m['html_url'])
    time.sleep(1)
