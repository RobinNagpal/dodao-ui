"""Check every URL in the Chapter 32 content file. FR via its API (html_url must match), eCFR via the structure API, others via curl."""
import json
import re
import subprocess
import sys
import time
import urllib.request

d = json.load(open(sys.argv[1]))
urls = set()


def walk(v):
    if isinstance(v, dict):
        for k, x in v.items():
            if k == "url" and isinstance(x, str):
                urls.add(x)
            else:
                walk(x)
    elif isinstance(v, list):
        for x in v:
            walk(x)


walk(d)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
ECFR_DATES = {"16": "2026-10-01", "19": "2026-08-26", "21": "2026-10-06", "40": "2026-10-08", "49": "2026-10-05"}
struct_cache = {}


def get_json(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))


def ecfr_ok(u):
    m = re.match(r"https://www\.ecfr\.gov/current/title-(\d+)/(section|part)-([\d.]+)$", u)
    if not m:
        return "?? unparsed ecfr"
    t, kind, x = m.groups()
    part = x.split(".")[0]
    key = (t, part)
    if key not in struct_cache:
        struct_cache[key] = get_json(f"https://www.ecfr.gov/api/versioner/v1/structure/{ECFR_DATES[t]}/title-{t}.json?part={part}")
        time.sleep(0.4)
    ids = set()

    def w(n):
        ids.add(n.get("identifier"))
        for c in n.get("children", []) or []:
            w(c)

    w(struct_cache[key])
    return "OK(api)" if x in ids else "MISSING"


bad = 0
for u in sorted(urls):
    if "federalregister.gov/documents/" in u:
        dn = u.split("/")[7]
        try:
            j = get_json(f"https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url")
            res = "OK(api)" if j["html_url"].rstrip("/") == u.rstrip("/") else f"URL-DIFF {j['html_url']}"
        except Exception as e:
            res = f"ERR {e}"
        time.sleep(0.3)
    elif "ecfr.gov/current" in u:
        try:
            res = ecfr_ok(u)
        except Exception as e:
            res = f"ERR {e}"
    else:
        extra = ["-r", "0-100"] if u.endswith(".json") else []
        res = subprocess.run(["curl", "-s", "-o", "/dev/null", "-L", *extra, "-A", UA, "-w", "%{http_code}", "--max-time", "60", u], capture_output=True, text=True).stdout
        time.sleep(0.5)
    ok = res.startswith("OK") or res in ("200", "206")
    if not ok:
        bad += 1
    print(res, u, flush=True)
print("urls:", len(urls), "not ok:", bad)
