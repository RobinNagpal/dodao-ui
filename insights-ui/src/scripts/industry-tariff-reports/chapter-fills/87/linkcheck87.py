"""Check every URL in a chapter file: FR via the FR API (html_url must match), eCFR via the versioner API, others via curl."""
import concurrent.futures as cf
import json
import re
import subprocess
import sys
import urllib.parse

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'


def urls(o, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == 'url' and isinstance(v, str) and v.startswith('http'):
                out.add(v)
            else:
                urls(v, out)
    elif isinstance(o, list):
        for x in o:
            urls(x, out)


def curl(u, extra=()):
    r = subprocess.run(['curl', '-s', '-o', '/dev/null', '-L', '--max-time', '40', '-A', UA, '-w', '%{http_code}', *extra, u],
                       capture_output=True, text=True)
    return r.stdout.strip()


def chk(u):
    if 'federalregister.gov/documents/' in u:
        dn = u.rstrip('/').split('/')[-2]
        r = subprocess.run(['curl', '-s', '--max-time', '40', f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url'],
                           capture_output=True, text=True)
        try:
            h = json.loads(r.stdout)['html_url']
        except Exception:
            return 'FR-API-ERR', u
        return ('200' if h == u else f'FR-MISMATCH {h}'), u
    m = re.match(r'https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-([\d.]+)$', u)
    if m:
        t, kind, s = m.groups()
        part = s.split('.')[0]
        q = f'part={part}' + (f'&section={s}' if kind == 'section' else '')
        api = f'https://www.ecfr.gov/api/versioner/v1/full/2026-10-08/title-{t}.xml?{q}'
        import time
        for k in range(8):
            c = curl(api, ('-H', 'Accept: application/xml', '--compressed'))
            if c != '429':
                return c, u
            time.sleep(10 * (k + 1))
        return c, u
    if 'hts.usitc.gov/reststop' in u or 'usitc.gov/sites' in u:
        return curl(u, ('-r', '0-1000')), u
    return curl(u), u


allu = set()
for f in sys.argv[1:]:
    urls(json.load(open(f)), allu)
EC = sorted(u for u in allu if 'ecfr.gov' in u)
with cf.ThreadPoolExecutor(6) as ex:
    res = list(ex.map(chk, sorted(allu - set(EC))))
res += [chk(u) for u in EC]
bad = [(c, u) for c, u in res if c not in ('200', '206')]
print(f'{len(res)} unique URLs, {len(res) - len(bad)} OK')
for c, u in bad:
    print(c, u)
