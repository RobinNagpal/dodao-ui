import json,sys,subprocess,urllib.parse
for term in sys.argv[1:]:
    url='https://rulings.cbp.gov/api/search?'+urllib.parse.urlencode({'term':term,'collection':'ALL','commodityGrouping':'ALL','pageSize':'15','page':'1','sortBy':'RELEVANCE'})
    x=subprocess.run(['curl','-s','-m','60','-A','Mozilla/5.0',url],capture_output=True,text=True).stdout
    try: d=json.loads(x)
    except Exception: print('ERR',term,x[:200]); continue
    print('###',term,d.get('totalHits'))
    for r in d.get('rulings',[])[:15]:
        print(' ',r.get('rulingNumber'),r.get('rulingDate','')[:10],r.get('tariffs'),'|',(r.get('subject') or '')[:110])
