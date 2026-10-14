import json,urllib.request,urllib.parse,sys,time
def get(u):
    for i in range(8):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=60).read()
        except Exception as e:
            if '429' in str(e): time.sleep(10*(i+1)); continue
            raise
    raise SystemExit('429 giving up')
if __name__=='__main__':
    q=sys.argv[1]; extra=sys.argv[2] if len(sys.argv)>2 else ''
    n=int(sys.argv[3]) if len(sys.argv)>3 else 12
    u='https://www.federalregister.gov/api/v1/documents.json?per_page=100&order=newest&fields[]=document_number&fields[]=publication_date&fields[]=title&fields[]=citation&fields[]=html_url&fields[]=type&conditions[term]='+urllib.parse.quote(q)+extra
    r=json.loads(get(u))
    print('count',r.get('count'))
    for d in r.get("results",[])[:n]:
        print(d['publication_date'],d['document_number'],d['citation'],d['type'][:6],'|',d['title'][:140])
