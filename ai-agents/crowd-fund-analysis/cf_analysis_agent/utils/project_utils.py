from typing import TypedDict, TypeVar, Protocol
from langchain_community.document_loaders import ScrapingAntLoader
from dotenv import load_dotenv
import os

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")



# Define a protocol that ensures the presence of 'projectUrls'
class HasProjectUrls(Protocol):
    projectUrls: list[str]

class HasSecUrl(Protocol):
    secUrl: str

# Define a generic TypeVar constrained to HasProjectUrls
StateType = TypeVar("StateType", bound=HasProjectUrls)
StateTypeSec = TypeVar("StateTypeSec", bound=HasSecUrl)

# Function that takes a generic state with required 'projectUrls' key
def scrape_project_urls(state: StateType) -> None:
    urls = state.get("projectUrls", [])
    scraped_content_list = []
    
    for url in urls:
        try:
            print(f"Scraping URL: {url}")
            loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
            documents = loader.load()
            page_content = documents[0].page_content
            scraped_content_list.append(page_content)
        except Exception as e:
            scraped_content_list.append(f"Error scraping {url}: {e}")
    return scraped_content_list

def scrape_sec_url(state: StateTypeSec) -> None:
    url = state.get("secUrl", "")
    try:
        print(f"Scraping SEC URL: {url}")
        loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        return [page_content]
    except Exception as e:
        return [f"Error scraping {url}: {e}"]