from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List, Dict, Any
from dotenv import load_dotenv
import os

from cf_analysis_agent.agent_state import AgentState, Config
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.project_utils import scrape_project_urls
from cf_analysis_agent.utils.report_utils import upload_report_to_s3, update_status_file

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

class State(TypedDict):
    messages: Annotated[list, add_messages]
    project_urls: List[str]
    project_scraped_urls: List[str]
    combinedScrapedContent: str
    extractedIndustryDetails: str
    startupRedFlags: str       
    industryRedFlags: str     
    redFlagsEvaluation: str   
    finalRedFlagsReport: str
    projectUrlScrapingStatus: Dict[str, str]
    
graph_builder = StateGraph(State)
memory = MemorySaver()

# move the scraping part to a common file 
# show project scraping url status at the top of the report

REPORT_NAME = "red_flags"

def find_industry_details(config: Config, combined_text: str):
    """
    Examines the combinedScrapedContent and extracts a summary of the startup's industry,
    storing it in state['extractedIndustryDetails'].
    """

    prompt = (
    "From the text below, extract any relevant details or discussion regarding the startup’s industry. "
    "Focus on the following aspects:\n"
    "1) An overview of the industry.\n"
    "2) Which countries or markets this industry is relevant to (if mentioned).\n"
    "3) Growth trends of this industry in the last 2 years.\n"
    "4) Projected or anticipated growth for the next 3 years.\n"
    "5) Potential or common challenges faced by other startups in this industry.\n"
    "6) Unique benefits or opportunities within this industry.\n"
    "7) Any additional important points or insights about the industry mentioned in the text.\n\n"
    f"{combined_text}\n\n"
    "Return only the textual summary of these industry details, as concise as possible but covering each requested item."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def find_startup_red_flags(config: Config, combined_text: str):
    """
    Uses the LLM to extract the startup's red flags from the combinedScrapedContent.
    Exclude purely team-related or purely financial details, focusing on aspects that
    genuinely raise concerns for investors (e.g., weak product viability, market barriers, etc.).
    """

    prompt = (
        "Using the information below, highlight the red flags of the startup. "
        "Include only information that might reduce investor confidence, such as issues with product viability, "
        "market adoption problems, legal risks, poor partnerships, negative customer feedback, unclear market size, "
        "or other significant concerns. Avoid mentioning purely financial or team-related details.\n\n"
        f"Scraped Content:\n{combined_text}\n\n"
        "Return a text describing the startup's red flags, focusing on specific negative or concerning issues."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


def find_industry_red_flags_node(config: Config, industry_details: str):
    """
    Finds the 10 most commonly recognized red flags in the startup's industry,
    based on the extracted industry details.
    """


    prompt = (
        "Given the following industry description, outline the 10 most commonly recognized red flags "
        "for startups in this industry. Provide a clear list of critical indicators of potential failure. "
        "Each red flag should briefly explain why it poses a significant risk.\n\n"
        f"Industry Info:\n{industry_details}\n\n"
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


def evaluate_red_applicable_to_startup(config: Config, startup_rf: str, industry_rf: str):
    """
    Compares the startup's red flags to the 10 industry red flags.
    Only mention red flags that are actually applicable to the startup.
    """
    prompt = (
        "Below are two pieces of information:\n\n"
        "1) The startup's identified red flags:\n"
        f"{startup_rf}\n\n"
        "2) The 10 most critical industry-standard red flags:\n"
        f"{industry_rf}\n\n"
        "Evaluate the startup's red flags by comparing them to the industry-standard red flags, focusing only on "
        "the ones that actually apply. If the startup does not exhibit a specific industry red flag, omit it. "
        "Return a clear explanation of which red flags apply, how severely, and why."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


def finalize_red_flags_report_node(config: Config, startup_rf: str, industry_rf: str, rf_evaluation: str):
    """
    Produces the final textual report about the startup's red flags, 
    integrating industry standards and the evaluation.
    """


    prompt = (
        "You have three pieces of content:\n\n"
        "1) The startup's red flags:\n"
        f"{startup_rf}\n\n"
        "2) The top 10 industry-standard red flags:\n"
        f"{industry_rf}\n\n"
        "3) The evaluation of how the startup aligns with these industry standards:\n"
        f"{rf_evaluation}\n\n"
        "Now create a final, detailed report focusing ONLY on the startup's red flags, integrating the identified "
        "industry-standard red flags and the evaluation of the startup’s performance against them. "
        "If a particular parameter does not indicate an actual red flag, remove it from the report. "
        "Avoid repetition unless absolutely necessary. Return only the textual report."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    final_report = response.content.strip()
    return final_report

def create_red_flags_report(state: AgentState) -> None:
    """
    Orchestrates the entire red flags analysis process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating red flags report")
    try:

        combined_text = state.get("processed_project_info").get("combined_scrapped_content")

        industry_details = find_industry_details(state.get("config"), combined_text)
        startup_rfs = find_startup_red_flags(state.get("config"), combined_text)
        industry_rfs = find_industry_red_flags_node(state.get("config"), industry_details)
        rf_evaluation = evaluate_red_applicable_to_startup(state.get("config"), startup_rfs, industry_rfs)
        final_red_flags_report = finalize_red_flags_report_node(state.get("config"), startup_rfs, industry_rfs, rf_evaluation)
        upload_report_to_s3(project_id, final_red_flags_report)
    except Exception as e:
        # Capture full stack trace
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_status_file(
            project_id,
            REPORT_NAME,
            "failed",
            error_message=error_message
        )
