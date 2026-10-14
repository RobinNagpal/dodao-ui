import sys, pdfplumber
f, pat = sys.argv[1], sys.argv[2]
with pdfplumber.open(f) as pdf:
    print("pages", len(pdf.pages))
    for i,p in enumerate(pdf.pages):
        t = p.extract_text() or ''
        if pat in t:
            idx=t.find(pat)
            print("PAGE", i, "|", t[max(0,idx-200):idx+60].replace('\n',' | '))
