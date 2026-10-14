import re,json,subprocess,time
urls=[u.strip() for u in open('urls.txt') if u.strip()]
fr=[u for u in urls if re.search(r'federalregister.gov/documents/\d{4}/',u)]
docs={u.split('/')[7]:u for u in fr}
bad=[]
keys=list(docs)
for i in range(0,len(keys),20):
    chunk=','.join(keys[i:i+20])
    j=None
    for t in range(10):
        r=subprocess.run(['curl','-s','-m','40','-A','Mozilla/5.0',f'https://www.federalregister.gov/api/v1/documents/{chunk}.json?fields[]=document_number&fields[]=html_url'],capture_output=True,text=True).stdout
        try:
            j=json.loads(r)
            if 'results' in j: break
            print('resp',str(j)[:200],flush=True)
        except Exception: pass
        time.sleep(20)
    got={x['document_number']:x['html_url'] for x in (j or {}).get('results',[])}
    for k in keys[i:i+20]:
        if got.get(k)!=docs[k]: bad.append((k,docs[k],got.get(k)))
print('FR checked',len(docs),'mismatches:',bad)
for u in urls:
    if u in fr: continue
    if 'ecfr.gov/current/' in u:
        m=re.match(r'https://www.ecfr.gov/current/title-(\d+)/(section|part)-([\d.]+)',u)
        t,kind,s=m.groups()
        api=f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?{kind}={s}'
        r=subprocess.run(['curl','-s','--compressed','-m','60','-o','/dev/null','-w','%{http_code}',api],capture_output=True,text=True).stdout
        print(r,u); time.sleep(0.5)
    else:
        r=subprocess.run(['curl','-s','-L','-m','40','-A','Mozilla/5.0','-o','/dev/null','-w','%{http_code}',u],capture_output=True,text=True).stdout
        print(r,u)
