import sys, pdfplumber
f, pat, a, b = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
with pdfplumber.open(f) as pdf:
    n=len(pdf.pages)
    for i in range(a, min(b, n)):
        t = pdf.pages[i].extract_text() or ''
        if pat in t:
            # find nearest heading
            idx=t.find(pat)
            print("PAGE", i, t[:200].replace('\n',' | '))
            print("  ...", t[max(0,idx-300):idx+100].replace('\n',' | '))
