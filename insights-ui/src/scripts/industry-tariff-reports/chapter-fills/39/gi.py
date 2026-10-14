import sys,subprocess,re,html,os,time
# usage: gi.py YYYY-MM-DD:docnum ...
for a in sys.argv[1:]:
    d,dn=a.split(':')
    p=f'fr/{dn}.txt'
    if os.path.exists(p) and os.path.getsize(p)>3000: continue
    t=subprocess.run(['curl','-s','-L','-A','Mozilla/5.0',f'https://www.govinfo.gov/content/pkg/FR-{d}/html/{dn}.htm'],capture_output=True,text=True).stdout
    t=html.unescape(re.sub(r'<[^>]+>','',t))
    open(p,'w').write(t); print(dn,len(t)); time.sleep(0.5)
