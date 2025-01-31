import json
import os
from typing import List

from dotenv import load_dotenv
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_core.messages import HumanMessage
from langchain_google_community import GoogleSearchAPIWrapper
from typing_extensions import TypedDict

from cf_analysis_agent.agent_state import AgentState, Config
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.report_utils import upload_report_to_s3, update_report_status_failed

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class StartupInfo(TypedDict):
    startup_name: str
    startup_details: str

class SearchResult(TypedDict):
    title: str
    snippet: str
    link: str

class WebpageSummary(TypedDict):
    link: str
    summary: str

REPORT_NAME = "relevant_links"

def find_startup_info(config: Config, page_content: str):
    """
    Call the LLM with the prompt to extract 'startup_name', 'startupD_details' from the crowdfunded page content
    """
    prompt = (
        "From the scraped content, extract the following project info as JSON:\n\n"
        " - startup_name: str (The name of the project or startup being discussed)\n"
        " - startup_details: str (A short description explaining what the startup does)\n"
        f"Scraped Content:\n{page_content}\n\n"
        "Return ONLY raw JSON. Do not include code fences or any extra text."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        return json.loads(response.content)
    except:
        return {
            "startup_name": "",
            "startup_details": ""        
            }

def search_startup_on_google(startup_info: StartupInfo):
    """
    Uses the startup's name as the query to Google Search and fetches up to 10 results.
    Stores them in state["allGoogleResults"].
    """
    search = GoogleSearchAPIWrapper(k=10)
    startup_name = startup_info.get('startup_name','')
    if not startup_name:
        print(f'Startup name: {startup_name}')
        return []

    print(f"Performing Google search for: {startup_name}")

    results = search.results(startup_name, 10)  
    formatted_results: List[SearchResult] = []
    for item in results:
        formatted_results.append({
            "title": item.get("title"),
            "snippet": item.get("snippet"),
            "link": item.get("link")
        })
    
    return formatted_results

def summarize_google_search_results(config: Config, all_results: list):
    """
    For each link in state["allGoogleResults"], scrape the page content
    and create a short summary using load_summarize_chain.
    Then store these in state["googleSearchSummaries"].
    """
    llm = get_llm(config)
    chain = load_summarize_chain(llm, chain_type="stuff")

    summaries: List[WebpageSummary] = []

    for i, item in enumerate(all_results):
        link = item["link"]
        title = item["title"]
        snippet = item["snippet"]

        try:
            # Attempt to load the webpage
            loader = WebBaseLoader(link)
            docs = loader.load()
            # Summarize
            result = chain.invoke(docs)
            summary = result["output_text"] if isinstance(result, dict) else result
        except Exception as e:
            summary = f"Error summarizing {link}: {e}"
        
        summaries.append({
            "link": link,
            "summary": summary
        })
        print(f"[{i+1}/{len(all_results)}] Summarized: {link[:50]}...")

    return summaries

def filter_relevant_links_from_summaries(config: Config, startup_info: StartupInfo, summaries: list):
    """
    Uses an LLM prompt to pick the 3-4 most relevant links from allGoogleResults,
    in context of the startup's name/description, etc.
    """

    name = startup_info.get("startupN_name", "")
    details = startup_info.get("startupD_details", "")

    summaries_json = json.dumps(summaries, indent=2)

    prompt = (
        f"We have a startup named '{name}'.\n"
        f"Description: '{details}'\n\n"
        "Below is a JSON array of objects with 'link' and 'summary'. Each summary is a short overview of the webpage's content. "
        "Select the 3 or 4 that are MOST relevant to learning about this startup specifically—its mission, products, services, "
        "partnerships, etc. Return ONLY a raw JSON array of the chosen objects in the same shape, i.e. "
        "[{\"link\": str, \"summary\": str}, ...].\n\n"
        f"{summaries_json}\n\n"
        "Return ONLY the JSON array, no extra text."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    raw_content = response.content.strip()

    try:
        relevant = json.loads(raw_content)
        if not isinstance(relevant, list):
            relevant = []
    except:
        relevant = []

    relevant_links = [item["link"] for item in relevant if "link" in item]
    return relevant_links

def create_relevant_links_report(state: AgentState) -> None:
    """
    Orchestrates the entire relevant links search process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating relevant links")
    try:
        combined_text = state.get("processed_project_info").get("combined_scrapped_content")
        startup_info = find_startup_info(state.get("config"), combined_text)
        all_google_results = search_startup_on_google(startup_info)
        summaries = summarize_google_search_results(state.get("config"), all_google_results)
        relevant_links = filter_relevant_links_from_summaries(state.get("config"), startup_info, summaries)
        upload_report_to_s3(project_id, REPORT_NAME, "\n".join(relevant_links))
    except Exception as e:
        # Capture full stack trace
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            REPORT_NAME,
            error_message=error_message
        )
