import pypdf, sys, re
for r in sys.argv[1:]:
    rd = pypdf.PdfReader(r)
    hit = None
    out = []
    for i, p in enumerate(rd.pages):
        t = p.extract_text() or ''
        if 'Heading 9903.03.13 applies' in t or (hit is not None and i < hit + 8):
            if hit is None: hit = i
            out.append(t)
    txt = '\n'.join(out)
    j = txt.find('Heading 9903.03.13 applies')
    seg = txt[j:j+20000]
    k = seg.find('(3) Heading 9903.03.14')
    seg = seg[:k] if k > 0 else seg
    codes = re.findall(r'35\d\d\.\d\d\.\d\d', seg)
    print(r, 'page', hit, sorted(set(codes)))
    # also first lines (compiler note)
    print(seg[:400])
