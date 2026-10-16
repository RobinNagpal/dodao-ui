import sys, pdfplumber
with pdfplumber.open(sys.argv[1]) as pdf:
    for i in sys.argv[2:]:
        print("=== PAGE", i); print(pdf.pages[int(i)].extract_text())
