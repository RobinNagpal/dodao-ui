import json,sys,subprocess,os,re,html,time
os.makedirs('fr',exist_ok=True)
for dn in sys.argv[1:]:
    p=f'fr/{dn}.txt'
    if os.path.exists(p) and os.path.getsize(p)>5000: continue
    m=json.loads(subprocess.run(['curl','-s','-g',f'https://www.federalregister.gov/api/v1/documents/{dn}.json'],capture_output=True,text=True).stdout)
    json.dump({k:m.get(k) for k in ['document_number','title','citation','publication_date','signing_date','html_url','type','executive_order_number','proclamation_number','effective_on','start_page']},open(f'fr/{dn}.meta.json','w'),default=str,indent=1)
    d=m['publication_date']
    t=subprocess.run(['curl','-s','-L',f'https://www.govinfo.gov/content/pkg/FR-{d}/html/{dn}.htm'],capture_output=True,text=True).stdout
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    open(p,'w').write(t)
    print(dn, m['citation'], d, m.get('signing_date'), m.get('executive_order_number') or m.get('proclamation_number'), m['title'][:100], len(t), m['html_url'])
