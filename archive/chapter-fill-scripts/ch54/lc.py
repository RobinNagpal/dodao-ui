import json,sys,subprocess,re,time,urllib.request,concurrent.futures as cf
F='/Users/robin/projects/worktrees/chapter-migration-1812-b2/insights-ui/src/tariff-data/chapters/54-man-made-filaments.json'
allu=set(re.findall(r'"url":\s*"(http[^"]+)"',open(F).read()))
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
def get(u):
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':UA}),timeout=60))
        except Exception as e: err=e; time.sleep(5*(i+1))
    raise err
out=[]
fru=[u for u in allu if 'federalregister.gov/documents/' in u]
for u in sorted(fru):
    dn=u.split('/')[7]
    try:
        m=get(f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url')
        out.append(('OK' if m['html_url']==u else 'MISMATCH '+m['html_url'],u))
    except Exception as e: out.append(('ERR '+str(e),u))
    time.sleep(1)
ec=[u for u in allu if 'ecfr.gov/current' in u]
for u in sorted(ec):
    m=re.search(r'title-(\d+)/(section|part)-([\w.\-]+)',u); t,kind,ident=m.groups()
    q=f'part={ident}' if kind=='part' else f'part={ident.split(".")[0]}&section={ident}'
    r=subprocess.run(['curl','-s','--compressed','-o','/dev/null','-w','%{http_code}','-A',UA,f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{q}'],capture_output=True,text=True)
    out.append(('OK' if r.stdout=='200' else 'HTTP '+r.stdout,u)); time.sleep(0.5)
rest=[u for u in allu if u not in fru and u not in ec]
def chk(u):
    r=subprocess.run(['curl','-s','-o','/dev/null','-L','--max-time','40','-A',UA,'-w','%{http_code}',u],capture_output=True,text=True)
    return ('OK' if r.stdout.strip()=='200' else 'HTTP '+r.stdout.strip()),u
with cf.ThreadPoolExecutor(8) as ex: out+=list(ex.map(chk,sorted(rest)))
print(len(allu),'urls;',sum(1 for s,_ in out if s=='OK'),'OK')
for s,u in out:
    if s!='OK': print(s,u)
open('urls.txt','w').write('\n'.join(sorted(allu)))
