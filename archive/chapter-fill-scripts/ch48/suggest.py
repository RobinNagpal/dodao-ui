import json,subprocess,sys,urllib.parse,time
qs=sys.argv[1:]
for q in qs:
    u='https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q='+urllib.parse.quote(q)
    r=subprocess.run(['curl','-s','-A','Mozilla/5.0',u],capture_output=True,text=True).stdout
    try: s=json.loads(r)[1]
    except Exception: s=['ERR '+r[:80]]
    print(q,'=>',s); time.sleep(0.3)
