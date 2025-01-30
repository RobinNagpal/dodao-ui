from typing import TypedDict, TypeVar, Protocol
from langchain_community.document_loaders import ScrapingAntLoader
from dotenv import load_dotenv
import os
from typing import Annotated, List
from langgraph.graph.message import add_messages
from langchain_core.messages import AIMessage

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")


# Define a protocol that ensures the presence of 'project_urls'
class HasProjectUrls(Protocol):
    project_urls: list[str]


class ScrapeProjectUrlsResponse(TypedDict):
    messages: Annotated[list, add_messages]
    project_scraped_urls: List[str]


class HasSecUrl(Protocol):
    secUrl: str


# Define a generic TypeVar constrained to HasProjectUrls
StateType = TypeVar("StateType", bound=HasProjectUrls)

StateTypeSec = TypeVar("StateTypeSec", bound=HasSecUrl)


# Function that takes a generic state with required 'project_urls' key
def scrape_project_urls(state: StateType) -> ScrapeProjectUrlsResponse:
    urls = state.get("project_urls", [])
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
    return {
        "messages": [
            AIMessage(content="Finished scraping all URLs. Stored results in state['scraped_content'].")
        ],
        "project_scraped_urls": scraped_content_list
    }


def scrape_sec_url(state: StateTypeSec) -> list[str]:
    url = state.get("secUrl", "")
    try:
        print(f"Scraping SEC URL: {url}")
        loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        return [page_content]
    except Exception as e:
        return [f"Error scraping {url}: {e}"]
