import subprocess,time,re,html,os,json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
want=[('27','447.52'),('27','447.41'),('27','447.42'),('27','447.21'),('27','447.11'),('27','447.45'),('27','478.111'),('27','478.112'),('27','478.113'),('27','478.115'),('27','478.92'),('27','478.39'),('27','479.111'),('27','53.61'),('22','126.1'),('22','123.4'),('22','120.1'),('15','746.8'),('19','182.12'),('19','177.1'),('19','190.2'),('19','134.11'),('19','10.1'),('19','10.8'),('19','10.31'),('27','447.22'),('27','478.11'),('27','478.118')]
def get(url):
    for i in range(30):
        r=subprocess.run(["curl","-s","--compressed","-m","60","-w","\n%{http_code}",url],capture_output=True,text=True).stdout
        body,code=r.rsplit('\n',1)
        if code=='200': return body
        print('retry',code,url,flush=True); time.sleep(20+i*10)
    return None
t=get('https://www.ecfr.gov/api/versioner/v1/titles.json')
if t:
    js=json.loads(t); open('ecfr/titles.json','w').write(t)
    for x in js['titles']:
        if x['number'] in (15,19,22,27): print(x['number'],x['up_to_date_as_of'],x['latest_amended_on'],flush=True)
dates={str(x['number']):x['up_to_date_as_of'] for x in js['titles']}
for t_,s in want:
    p=f'ecfr/{t_}-{s}.txt'
    if os.path.exists(p): continue
    x=get(f'https://www.ecfr.gov/api/versioner/v1/full/{dates[t_]}/title-{t_}.xml?section={s}')
    if not x: continue
    x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x)
    open(p,'w').write(x); print('ok',s,len(x),flush=True); time.sleep(3)
print('done')
