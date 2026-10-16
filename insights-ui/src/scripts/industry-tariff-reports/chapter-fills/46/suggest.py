import json,urllib.request,urllib.parse,time,sys
qs=[l.strip() for l in open('queries.txt') if l.strip()]
out=open('suggest.txt','a')
for q in qs:
    u='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(q)
    try:
        r=json.loads(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read().decode('utf-8','replace'))[1]
    except Exception as e: r=['ERR '+str(e)]
    line=f'{q} => {r}'; print(line); out.write(line+'\n'); time.sleep(0.4)
