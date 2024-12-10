from langchain_community.document_loaders import ScrapingAntLoader

def scrape_url(url: str) -> str:
    """Scrape the content of a URL using ScrapingAntLoader."""
    try:
        print("Scraping URL:", url)
        loader = ScrapingAntLoader([url], api_key="adfc00b0a0a241d1986007248c0c8444")  
        documents = loader.load()  
        page_content = documents[0].page_content
        print(page_content)
        return page_content
    except Exception as e:
        return f"Failed to scrape URL: {e}"

print(scrape_url("https://wefunder.com/fluyo"))