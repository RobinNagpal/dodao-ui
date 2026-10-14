import sys, re, time
from prod import search
KEEP = re.compile(r"(Duty Orders?\b|Duty Order;|Continuation of|Revocation|Revoking|Termination|; Determinations?$|Initiation of Less|Initiation of Countervailing Duty Inv|Preliminary Affirmative|Final Affirmative|Final Negative|Preliminary Negative)", re.I)
SKIP = re.compile(r"Administrative Review|Opportunity To Request|New Shipper|Scope Ruling|Changed Circumstances|Court Decision|Postponement|Correction|Five-Year Review|Sunset Review|Initiation of Five", re.I)
for prod in sys.argv[1:]:
    rs = [r for r in search('"%s"' % prod, since="2005-01-01") if prod.lower() in r["title"].lower()]
    hits = [r for r in rs if KEEP.search(r["title"]) and not SKIP.search(r["title"])]
    print("=====", prod, len(rs))
    for r in hits[:9]:
        print(" ", r["publication_date"], r["document_number"], r.get("citation"), "|", r["title"][:170])
    time.sleep(0.3)
