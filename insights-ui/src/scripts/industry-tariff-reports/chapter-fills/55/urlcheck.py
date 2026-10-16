import os as _os  # noqa: E402
import sys as _sys  # noqa: E402

_sys.path.insert(0, _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))))
from fillenv import IU  # noqa: E402,F401

import json,sys,subprocess,re,urllib.request,concurrent.futures as cf
F=IU + '/src/tariff-data/chapters/55-man-made-staple-fibers.json'
d=json.load(open(F)); U=set()
def walk(o):
  if isinstance(o,dict):
    for k,v in o.items():
      if k=='url' and isinstance(v,str): U.add(v)
      else: walk(v)
  elif isinstance(o,list):
    for x in o: walk(x)
walk(d)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
def chk(u):
  m=re.match(r'https://www\.federalregister\.gov/documents/\d{4}/\d\d/\d\d/([^/]+)/',u)
  if m:
    try:
      j=json.load(urllib.request.urlopen(urllib.request.Request(f'https://www.federalregister.gov/api/v1/documents/{m.group(1)}.json?fields[]=html_url',headers={'User-Agent':UA})))
      return ('OK' if j['html_url']==u else 'FR-MISMATCH '+j['html_url']),u
    except Exception as e: return 'FR-ERR '+str(e),u
  m=re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-([\d.]+)$',u)
  if m:
    t,kind,s=m.groups()
    q=f'section={s}' if kind=='section' else f'part={s}'
    r=subprocess.run(['curl','-s','--compressed','-o','/dev/null','-w','%{http_code}',f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?{q}'],capture_output=True,text=True)
    return ('OK' if r.stdout=='200' else 'ECFR '+r.stdout),u
  r=subprocess.run(['curl','-s','-o','/dev/null','-L','--max-time','30','-A',UA,'-w','%{http_code}',u],capture_output=True,text=True)
  return ('OK' if r.stdout=='200' else r.stdout),u
with cf.ThreadPoolExecutor(8) as ex: res=list(ex.map(chk,sorted(U)))
print(len(res),'urls')
for c,u in res:
  if c!='OK': print(c,u)
