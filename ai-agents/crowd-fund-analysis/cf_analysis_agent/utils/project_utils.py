import traceback
from typing import TypedDict, TypeVar
from langchain_community.document_loaders import ScrapingAntLoader
from dotenv import load_dotenv
import os
from typing import Annotated, List
from langgraph.graph.message import add_messages
from langchain_core.messages import AIMessage

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")


# Define a protocol that ensures the presence of 'project_urls'
class HasProjectUrls(TypedDict):
    project_urls: list[str]


class ScrapeProjectUrlsResponse(TypedDict):
    messages: Annotated[list, add_messages]
    project_scraped_urls: List[str]


class HasSecUrl(TypedDict):
    secUrl: str


# Define a generic TypeVar constrained to HasProjectUrls
StateType = TypeVar("StateType", bound=HasProjectUrls)

StateTypeSec = TypeVar("StateTypeSec", bound=HasSecUrl)


# Function that takes a generic state with required 'project_urls' key
def scrape_project_urls(state: StateType) -> ScrapeProjectUrlsResponse:
    urls = state.get("project_urls", [])
    scraped_urls = scrape_urls(urls)
    return {
        "messages": [
            AIMessage(content="Finished scraping all URLs. Stored results in state['scraped_content'].")
        ],
        "project_scraped_urls": scraped_urls
    }

def scrape_urls(urls: list[str]) -> list[str]:
    scraped_content_list = []
    for url in urls:
        try:
            scraped_content_list.append(scrape_url(url))
        except Exception as e:
            print(traceback.format_exc())
            print(f"Error scraping {url}: {e}")
            scraped_content_list.append(f"Error scraping {url}: {e}")
    return scraped_content_list

def scrape_url(url: str) -> str:
    try:
        print(f"Scraping URL: {url}")
        loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        print(f"Successfully scraped URL: {url}. Length of content: {len(page_content)}")
        return page_content
    except Exception as e:
        print(traceback.format_exc())
        print(f"Error scraping {url}: {e}")
        raise e


