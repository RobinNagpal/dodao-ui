import json, urllib.request, urllib.parse, sys
def q(term, agency="international-trade-administration", since="2019-01-01", per=100, page=1, extra=None):
    p = [("conditions[term]", term), ("conditions[agencies][]", agency), ("conditions[publication_date][gte]", since), ("per_page", str(per)), ("page", str(page)), ("order", "newest")]
    for f in ["title", "document_number", "publication_date", "html_url", "type", "abstract"]:
        p.append(("fields[]", f))
    if extra: p += extra
    u = "https://www.federalregister.gov/api/v1/documents.json?" + urllib.parse.urlencode(p)
    return json.loads(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read())
if __name__ == "__main__":
    term = sys.argv[1]; since = sys.argv[2] if len(sys.argv) > 2 else "2019-01-01"
    r = q(term, since=since)
    print("count", r.get("count"))
    for d in r.get("results", []):
        print(d["publication_date"], d["document_number"], d["title"][:170])
