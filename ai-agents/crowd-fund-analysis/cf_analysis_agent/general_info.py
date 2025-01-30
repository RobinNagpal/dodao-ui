from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv
import os
from cf_analysis_agent.utils.report_utils import get_llm
from cf_analysis_agent.utils.project_utils import scrape_project_urls

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

class State(TypedDict):
    messages: Annotated[list, add_messages]
    project_urls: List[str]
    project_scraped_urls: List[str]         
    combinedScrapedContent: str        
    projectGeneralInfo: str           

graph_builder = StateGraph(State)
memory = MemorySaver()

def aggregate_scraped_content_node(state: State):
    """
    Combine all scraped content from multiple links into a single text blob,
    stored in state["combinedScrapedContent"].
    """
    scraped_list = state.get("project_scraped_urls", [])
    combined_text = "\n\n".join(scraped_list)

    state["combinedScrapedContent"] = combined_text
    
    return {
        "messages": [
            AIMessage(content="Aggregated all scraped content into `combinedScrapedContent`. Ready to analyze.")
        ],
        "combinedScrapedContent": state["combinedScrapedContent"]
    }

def generate_project_info_report_node(state: State, config):
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
    llm = get_llm(config)
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

graph_builder.add_node("scrape_project_urls", scrape_project_urls)
graph_builder.add_node("aggregate_scraped_content", aggregate_scraped_content_node)
graph_builder.add_node("generate_project_info_report", generate_project_info_report_node)

graph_builder.add_edge(START, "scrape_project_urls")
graph_builder.add_edge("scrape_project_urls", "aggregate_scraped_content")
graph_builder.add_edge("aggregate_scraped_content", "generate_project_info_report")

app = graph_builder.compile(checkpointer=memory)


# events = app.stream(
#     {
#         "messages": [("user", "Please gather the project's general info.")],
#         "project_urls": [
#             "https://wefunder.com/neighborhoodsun",
#             "https://neighborhoodsun.solar/"
#         ]
#     },
#     config,
#     stream_mode="values"
# )

# for event in events:
#     event["messages"][-1].pretty_print()
