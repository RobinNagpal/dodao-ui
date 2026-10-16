import json,subprocess,time
urls=[u for u in open('urls.txt').read().split('\n') if 'federalregister.gov/documents' in u]
for u in urls:
    dn=u.split('/')[7]
    for i in range(8):
        r=subprocess.run(['curl','-s','-g','-A','Mozilla/5.0',f'https://www.federalregister.gov/api/v1/documents/{dn}.json?fields[]=html_url'],capture_output=True,text=True).stdout
        try: h=json.loads(r)['html_url']; break
        except Exception: h='ERR'; time.sleep(20)
    print('OK' if h==u else 'BAD', dn, h if h!=u else '', flush=True)
    time.sleep(1.5)
