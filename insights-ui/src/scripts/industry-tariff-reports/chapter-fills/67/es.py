import json,sys,urllib.parse,subprocess
q=sys.argv[1]; title=sys.argv[2] if len(sys.argv)>2 else None
p=[('query',q),('per_page','30')]
if title: p.append(('hierarchy[title]',title))
u='https://www.ecfr.gov/api/search/v1/results?'+urllib.parse.urlencode(p)
x=subprocess.run(['curl','-s','--compressed','-m','60','-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
try: r=json.loads(x)
except Exception: print(x[:300]); sys.exit()
for it in r.get('results',[]):
  h=it['hierarchy']; print(h.get('title'),h.get('part'),h.get('section'),'|',(it.get('headings') or {}).get('section'),'|',(it.get('full_text_excerpt') or '')[:160].replace('\n',' '))
