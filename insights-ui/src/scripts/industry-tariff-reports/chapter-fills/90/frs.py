import json,sys,urllib.parse,subprocess
# usage: frs.py "<term>" [agency] [type]
term=sys.argv[1]; ag=sys.argv[2] if len(sys.argv)>2 and sys.argv[2] else None; ty=sys.argv[3] if len(sys.argv)>3 else None
q=[('per_page','60'),('order','newest'),('conditions[term]',term)]
if ag: q.append(('conditions[agencies][]',ag))
if ty: q.append(('conditions[type][]',ty))
for f in ['document_number','publication_date','title','citation','html_url']: q.append(('fields[]',f))
url='https://www.federalregister.gov/api/v1/documents.json?'+urllib.parse.urlencode(q)
d=json.loads(subprocess.run(['curl','-s','-g',url],capture_output=True,text=True).stdout)
print('#',term,d.get('count'))
for r in d.get('results',[]): print(r['publication_date'],r['document_number'],r['citation'],r['title'][:160])
