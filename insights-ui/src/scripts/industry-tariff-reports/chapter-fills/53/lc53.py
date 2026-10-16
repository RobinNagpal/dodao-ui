import json, re, subprocess, time, concurrent.futures as cf
urls = [u for u in open('urls.txt').read().split('\n') if u]
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
def curl(u, extra=()):
    r = subprocess.run(['curl', '-g', '-s', '-L', '--compressed', '--max-time', '30', '-A', UA, *extra, '-o', '/tmp/lc.out' if False else '/dev/null', '-w', '%{http_code}', u], capture_output=True, text=True)
    return r.stdout.strip()
def get(u):
    r = subprocess.run(['curl', '-g', '-s', '-L', '--compressed', '--max-time', '30', '-A', UA, u], capture_output=True, text=True)
    return r.stdout
res = []
fr = [u for u in urls if 'federalregister.gov/documents/' in u]
ec = [u for u in urls if 'ecfr.gov/current/' in u]
other = [u for u in urls if u not in fr and u not in ec]
for u in fr:
    doc = u.split('/')[7]
    j = json.loads(get(f'https://www.federalregister.gov/api/v1/documents/{doc}.json?fields[]=html_url'))
    res.append(('OK' if j.get('html_url') == u else 'FR-MISMATCH ' + str(j.get('html_url')), u))
for u in ec:
    m = re.search(r'title-(\d+)/(section|part)-([\w.\-]+)', u)
    t, kind, v = m.groups()
    api = f'https://www.ecfr.gov/api/versioner/v1/structure/2026-10-08/title-{t}.json?{kind}={v}'
    for i in range(3):
        body = get(api)
        if 'Too many' in body: time.sleep(20); continue
        break
    try:
        j = json.loads(body); ok = j.get('identifier') == v or v in json.dumps(j)[:400]
    except Exception:
        ok = False
    res.append(('OK' if ok else 'ECFR-BAD ' + body[:80], u))
    time.sleep(1.5)
with cf.ThreadPoolExecutor(8) as ex:
    for code, u in ex.map(lambda u: (curl(u), u), other):
        res.append(('OK' if code == '200' else code, u))
bad = [r for r in res if r[0] != 'OK']
print(len(res), 'checked;', len(bad), 'not OK')
for r in bad: print(*r)
