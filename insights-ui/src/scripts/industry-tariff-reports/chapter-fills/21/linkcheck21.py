import json, sys, subprocess, time
d = json.load(open(sys.argv[1]))
urls = set()
def walk(v):
    if isinstance(v, dict):
        for k, x in v.items():
            if k == 'url' and isinstance(x, str): urls.add(x)
            else: walk(x)
    elif isinstance(v, list):
        for x in v: walk(x)
walk(d)
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
for u in sorted(urls):
    if u.endswith('.json') and 'usitc.gov' in u:
        cmd = ['curl', '-s', '-o', '/dev/null', '-r', '0-100', '-A', UA, '-w', '%{http_code}', '--max-time', '60', u]
    else:
        cmd = ['curl', '-s', '-o', '/dev/null', '-L', '-A', UA, '-w', '%{http_code}', '--max-time', '60', u]
    code = subprocess.run(cmd, capture_output=True, text=True).stdout
    print(code, u, flush=True)
    time.sleep(0.7)
