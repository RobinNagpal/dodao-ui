from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List, Dict, Any
from dotenv import load_dotenv
from langchain_google_community import GoogleSearchAPIWrapper
import os
import json

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class StartupInfo(TypedDict):
    startupName: str
    startupDetails: str

class State(TypedDict):
    messages: Annotated[list, add_messages]
    crowdfunded_url: str
    scraped_content: str         
    startupInfo: StartupInfo     
    googleSearchResults: List[Dict[str, Any]]  
    relevantLinks: List[str] 

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

def scrape_crowdfunded_page_node(state: State):
    """
    1. We get the crowdfunded_url from state["crowdfunded_url"].
    2. Use ScrapingAntLoader to fetch and store content in state["scraped_content"].
    """

    SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
    url = state["crowdfunded_url"]

    try:
        loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
        docs = loader.load()
        page_content = docs[0].page_content
        state["scraped_content"] = page_content
    except Exception as e:
        state["scraped_content"] = f"Error scraping {url}: {str(e)}"

    return {
        "messages": [
            AIMessage(content="Scraped content from the crowdfunded page.")
        ],
        "scraped_content": state["scraped_content"]
    }

def extract_startup_info_node(state: State):
    """
    1. Call the LLM with the prompt to extract 'startupName', 'startupDetails' from the crowdfunded page content
    2. Store JSON in state["startupInfo"].
    """
    page_content = state["scraped_content"]
    
    prompt = (
        "From the scraped content, extract the following project info as JSON:\n\n"
        " - startupName: str (The name of the project or startup being discussed)\n"
        " - startupDetails: str (A short description explaining what the startup does)\n"
        f"Scraped Content:\n{page_content}\n\n"
        "Return ONLY raw JSON. Do not include code fences or any extra text."
    )

    response = llm.invoke([HumanMessage(content=prompt)])

    try:
        data = json.loads(response.content)
        state["startupInfo"] = data
    except:
        state["startupInfo"] = {
            "startupName": "",
            "startupDetails": ""        
            }
        
    return {
        "messages": [
            AIMessage(content="Startup info extracted and stored in state['startupInfo'].")
        ],
        "scraped_content": state["scraped_content"],
        "startupInfo": state["startupInfo"]
    }

def google_search_node(state: State):
    """
    Uses the startup's name as the query to Google Search and fetches up to 10 results.
    Stores them in state["googleSearchResults"].
    """

    search = GoogleSearchAPIWrapper(k=10)
    startup_name = state["startupInfo"]["startupName"]

    if not startup_name:
        startup_name = "Unknown Startup"

    print(f"Performing Google search for: {startup_name}")
    results = search.results(startup_name, 10)  
    formatted_results = []
    for item in results:
        formatted_results.append({
            "title": item.get("title"),
            "snippet": item.get("snippet"),
            "link": item.get("link")
        })
    
    state["googleSearchResults"] = formatted_results

    return {
        "messages": [
            AIMessage(content=f"Google search complete for '{startup_name}'. Stored top 10 results in state['googleSearchResults'].")
        ],
        "scraped_content": state["scraped_content"],
        "startupInfo": state["startupInfo"],
        "googleSearchResults": state["googleSearchResults"]
    }

def filter_relevant_links_node(state: State):
    """
    Uses an LLM prompt to pick the 3-4 most relevant links from googleSearchResults,
    in context of the startup's name/description, etc.
    """
    results = state.get("googleSearchResults", [])
    name = state["startupInfo"].get("startupName", "")
    startupDetails = state["startupInfo"].get("startupDetails", "")
    results_json = json.dumps(results, indent=2)

    prompt = (
        f"We have a startup named '{name}'.\n"
        f"Description of Startup: '{startupDetails}'\n\n"
        "Below is a JSON array of Google search results. Each item has a 'title', 'snippet', and 'link'.\n"
        "Identify the 3 or 4 links that are MOST relevant to learning more about this specific startup. "
        "Do not include links that only tangentially mention the startup. Return your final answer "
        "as a raw JSON array of the chosen links, with the shape: [{title: str, snippet: str, link: str}, ...].\n\n"
        f"{results_json}\n\n"
        "Return ONLY raw JSON array. Do not include code fences or any extra text."
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    raw_content = response.content.strip()

    try:
        relevant = json.loads(raw_content)
        if not isinstance(relevant, list):
            relevant = []
    except:
        relevant = []

    relevant_links = [item["link"] for item in relevant if "link" in item]
    
    state["relevantLinks"] = relevant_links
    print(f"Filtered relevant links: {relevant_links}")
    return {
        "messages": [
            AIMessage(content="Filtered the top links via LLM prompt. Stored result in state['relevantLinks'].")
        ],
        "relevantLinks": state["relevantLinks"]
    }

graph_builder.add_node("scrape_crowdfunded_page", scrape_crowdfunded_page_node)
graph_builder.add_node("extract_startup_info", extract_startup_info_node)
graph_builder.add_node("google_search", google_search_node)
graph_builder.add_node("filter_links", filter_relevant_links_node)

graph_builder.add_edge(START, "scrape_crowdfunded_page")
graph_builder.add_edge("scrape_crowdfunded_page", "extract_startup_info")
graph_builder.add_edge("extract_startup_info", "google_search")
graph_builder.add_edge("google_search", "filter_links")

app = graph_builder.compile(checkpointer=memory)

events = app.stream(
    {
        "messages": [("user", "Find more links about this startup.")],
        "crowdfunded_url": "https://wefunder.com/neighborhoodsun"
    },
    config,
    stream_mode="values"
)

for event in events:
    event["messages"][-1].pretty_print()