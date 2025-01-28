from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv
import os

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

OPENAI_MODEL = os.getenv("OPENAI_MODEL")

if OPENAI_MODEL:
    llm = ChatOpenAI(model_name=OPENAI_MODEL, temperature=0)
else:
    llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)


class State(TypedDict):
    messages: Annotated[list, add_messages]
    projectUrls: List[str]
    scraped_content: List[str]         
    combinedScrapedContent: str        
    projectGeneralInfo: str           

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

def scrape_multiple_urls_node(state: State):
    """
    Scrapes each URL in state["projectUrls"] using ScrapingAntLoader
    and stores the page content in state["scraped_content"].
    """
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

    state["scraped_content"] = scraped_content_list

    return {
        "messages": [
            AIMessage(content="Finished scraping all URLs. Stored results in state['scraped_content'].")
        ],
        "scraped_content": state["scraped_content"]
    }

def aggregate_scraped_content_node(state: State):
    """
    Combine all scraped content from multiple links into a single text blob,
    stored in state["combinedScrapedContent"].
    """
    scraped_list = state.get("scraped_content", [])
    combined_text = "\n\n".join(scraped_list)

    state["combinedScrapedContent"] = combined_text

    return {
        "messages": [
            AIMessage(content="Aggregated all scraped content into `combinedScrapedContent`. Ready to analyze.")
        ],
        "combinedScrapedContent": state["combinedScrapedContent"]
    }

def generate_project_info_report_node(state: State):
    """
    Uses the LLM to produce a comprehensive, investor-facing report
    of the project's goals, achievements, product environment, etc.
    We exclude any risks, challenges, or assumptions.
    """
    combined_text = state["combinedScrapedContent"]
    
    prompt = (
        f"""
        Below are the details of the project. We need to show all the important information to the crowd-funding investors.
        The report should tell what does the startup do and capture the details about each of the headings below. You can skip some headings if they dont apply.

        1. Product/Service 
        2. Team Competence and Commitment
        3. Current traction or number of customers, or users
        4. Go-to-Market Strategy
        5. Market Opportunity and Total Addressable Market Size and explain how this size was calculated - Use your information, and not the provided data for this point.
        6. Revenue, Financial Health and Projections
        7. Business Model
        8. Marketing and Sales Strategy
        9. Most important highlights and milestones achieved so far
        10. Risks and Challenges
        
        STARTUP DETAILS:
        
        {combined_text}
  
        Return only the textual report of these details.
        """
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    state["projectGeneralInfo"] = response.content.strip()

    # with open("project_general_info_report.md", "w", encoding="utf-8") as f:
    #     f.write(state["projectGeneralInfo"])

    return {
        "messages": [
            AIMessage(content="Project general info report generated and stored in `state['projectGeneralInfo']`."),
        ],
        "projectGeneralInfo": state["projectGeneralInfo"]
    }

graph_builder.add_node("scrape_multiple_urls", scrape_multiple_urls_node)
graph_builder.add_node("aggregate_scraped_content", aggregate_scraped_content_node)
graph_builder.add_node("generate_project_info_report", generate_project_info_report_node)

graph_builder.add_edge(START, "scrape_multiple_urls")
graph_builder.add_edge("scrape_multiple_urls", "aggregate_scraped_content")
graph_builder.add_edge("aggregate_scraped_content", "generate_project_info_report")

app = graph_builder.compile(checkpointer=memory)


# events = app.stream(
#     {
#         "messages": [("user", "Please gather the project's general info.")],
#         "projectUrls": [
#             "https://wefunder.com/neighborhoodsun",
#             "https://neighborhoodsun.solar/"
#         ]
#     },
#     config,
#     stream_mode="values"
# )

# for event in events:
#     event["messages"][-1].pretty_print()
