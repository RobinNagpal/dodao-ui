import json, urllib.request, urllib.parse, sys, re, time
def search(title_term, since="2000-01-01"):
    res = []
    for page in range(1, 6):
        p = [("conditions[term]", title_term), ("conditions[publication_date][gte]", since), ("per_page", "100"), ("page", str(page)), ("order", "newest")]
        for a in ["international-trade-administration", "international-trade-commission"]:
            p.append(("conditions[agencies][]", a))
        for f in ["title", "document_number", "publication_date", "html_url", "citation", "agencies"]:
            p.append(("fields[]", f))
        u = "https://www.federalregister.gov/api/v1/documents.json?" + urllib.parse.urlencode(p)
        r = json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())
        res += r.get("results", [])
        if not r.get("next_page_url"): break
    return res
KEY = re.compile(r"Order|Continuation|Revocation|Revok|Termination|Negative|Final Determination|Final Affirmative|Initiation of Less|Initiation of Countervailing|Institution of Antidumping|Institution of Five|Sunset|Rescission of Order|Five-Year", re.I)
if __name__ == '__main__':
  for prod in sys.argv[1:]:
    rs = search('"%s"' % prod)
    rs = [r for r in rs if prod.lower() in r["title"].lower()]
    print("=====", prod, len(rs))
    for r in rs:
        if KEY.search(r["title"]) and not re.search(r"Administrative Review|Opportunity To Request|Initiation of Antidumping and Countervailing Duty Administrative|New Shipper|Scope|Changed Circumstances|Court Decision|Amended Final Results of Antidumping Duty Admin", r["title"]):
            print(" ", r["publication_date"], r["document_number"], r.get("citation"), "|", r["title"][:200])
    time.sleep(0.3)
