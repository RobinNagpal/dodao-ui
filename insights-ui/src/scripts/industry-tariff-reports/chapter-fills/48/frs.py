import json,sys,subprocess,urllib.parse
q=sys.argv[1]; since=sys.argv[2] if len(sys.argv)>2 else '2019-01-01'
u=('https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest'
   '&conditions[term]='+urllib.parse.quote(q)+'&conditions[publication_date][gte]='+since+
   '&fields[]=document_number&fields[]=title&fields[]=publication_date&fields[]=citation&fields[]=type&fields[]=html_url&fields[]=agencies')
import time
for k in range(6):
    out=subprocess.run(['curl','-s','-g',u],capture_output=True,text=True).stdout
    try:
        r=json.loads(out); break
    except Exception:
        time.sleep(5*(k+1))
else:
    print('FAIL',out[:200]); sys.exit(1)
print('count',r.get('count'))
for x in r.get('results',[]):
    ag=','.join(a.get('slug','')[:12] for a in x['agencies'] if a)
    print(x['publication_date'],x['document_number'],x['citation'],ag,'|',x['title'][:150])
