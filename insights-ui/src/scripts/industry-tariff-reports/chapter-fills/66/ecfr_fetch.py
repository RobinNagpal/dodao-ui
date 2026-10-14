import subprocess,time,re,html,os,json
os.chdir(os.path.dirname(os.path.abspath(__file__)))
want=[('21','890.3075'),('21','807.40'),('21','807.65'),('16','1110.1'),('16','1303.1'),('16','1500.50'),('7','319.40-1'),('7','319.40-5'),('7','319.40-9'),('19','134.11'),('19','182.12'),('19','177.1'),('19','190.2'),('19','102.20'),('7','319.40-3')]
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
        if x['number'] in (7,16,19,21): print(x['number'],x['up_to_date_as_of'],x['latest_amended_on'],flush=True)
dates={str(x['number']):x['up_to_date_as_of'] for x in js['titles']}
for t_,s in want:
    p=f'ecfr/{t_}-{s}.txt'
    if os.path.exists(p): continue
    x=get(f'https://www.ecfr.gov/api/versioner/v1/full/{dates[t_]}/title-{t_}.xml?section={s}')
    if not x: continue
    x=html.unescape(re.sub(r'<[^>]+>',' ',x)); x=re.sub(r'\s+',' ',x)
    open(p,'w').write(x); print('ok',s,len(x),flush=True); time.sleep(3)
print('done')
