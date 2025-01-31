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
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.project_utils import scrape_project_urls

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

class State(TypedDict):
    messages: Annotated[list, add_messages]
    project_urls: List[str]
    project_scraped_urls: List[str]
    combinedScrapedContent: str
    extractedIndustryDetails: str
    startupGreenFlags: str       
    industryGreenFlags: str     
    greenFlagsEvaluation: str   
    finalGreenFlagsReport: str

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

def aggregate_scraped_content_node(state: State):
    """
    Combine all scraped content from multiple links into a single text blob.
    We'll store the combined text in state["combinedScrapedContent"].
    """
    scraped_list = state.get("project_scraped_urls", [])
    combined_text = "\n\n".join(scraped_list) 
    
    state["combinedScrapedContent"] = combined_text

    return {
        "messages": [
            AIMessage(
                content="Aggregated all scraped content into `combinedScrapedContent`. Ready to process further."
            )
        ],
        "combinedScrapedContent": state["combinedScrapedContent"]
    }

def extract_industry_details_node(state: State, config):
    """
    Examines the combinedScrapedContent and extracts a summary of the startup's industry,
    storing it in state['extractedIndustryDetails'].
    """
    combined_text = state.get("combinedScrapedContent", "")

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
    state["extractedIndustryDetails"] = response.content.strip()

    return {
        "messages": [
            HumanMessage(
                content="Extracted industry details from combinedScrapedContent. Stored in state['extractedIndustryDetails']."
            )
        ],
        "extractedIndustryDetails": state["extractedIndustryDetails"]
    }

def highlight_startup_green_flags_node(state: State, config):
    """
    Uses the LLM to extract green flags from the combinedScrapedContent.
    We exclude any team-related or purely financial details as per requirements.
    """
    prompt = (
        "Using the information below, highlight the green flags of the startup. "
        "Only include information that instills confidence in investors, focusing on aspects like product innovation, "
        "market opportunity, scalability, partnerships, and strategic positioning. "
        "Avoid forcing any information that does not clearly align with investor confidence, and exclude details "
        "related to the startup's team or purely financial metrics.\n\n"
        f"Scraped Content:\n{state['combinedScrapedContent']}\n\n"
        "Return a clear text describing the startup's green flags."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    state["startupGreenFlags"] = response.content.strip()

    return {
        "messages": [
            HumanMessage(content="Green flags extracted from startup’s data. Storing result in state['startupGreenFlags'].")
        ],
        "startupGreenFlags": state["startupGreenFlags"],
    }

def industry_green_flags_node(state: State, config):
    """
    Finds the 10 most commonly recognized green flags in the startup's industry.
    We rely on the 'industry' field in projectInfo or from scraped content.
    """
    industry_info = state.get("extractedIndustryDetails", "")

    prompt = (
        "Given the following industry description, outline the 10 most commonly recognized green flags for startups in this industry. "
        "Provide a clear list of these critical indicators of success.\n\n"
        f"Industry Info:\n{industry_info}\n\n"
        "Return a comprehensive list of the most critical indicators of success for startups in this industry.. You may add short explanations for each."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    state["industryGreenFlags"] = response.content.strip()

    return {
        "messages": [
            HumanMessage(content="Industry-level green flags identified and stored in state['industryGreenFlags'].")
        ],
        "industryGreenFlags": state["industryGreenFlags"]
    }

def evaluate_green_flags_node(state: State, config):
    """
    Compares the startup's green flags to the 10 industry green flags, highlighting
    strengths, partial alignments, etc.
    """
    startup_gf = state["startupGreenFlags"]
    industry_gf = state["industryGreenFlags"]

    prompt = (
        "Below are two pieces of information:\n\n"
        "1) The startup's identified green flags:\n"
        f"{startup_gf}\n\n"
        "2) The 10 most critical industry-standard green flags:\n"
        f"{industry_gf}\n\n"
        "Evaluate the startup's green flags by comparing them against the 10 most critical industry-standard green flags. "
        "Provide a detailed analysis of how the startup aligns with each measure, highlighting "
        "strengths or partial alignments."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    state["greenFlagsEvaluation"] = response.content.strip()

    return {
        "messages": [
            HumanMessage(content="Evaluation of startup’s green flags vs. industry standards complete.")
        ],
        "greenFlagsEvaluation": state["greenFlagsEvaluation"]
    }

def finalize_green_flags_report_node(state: State, config):
    """
    Produces the final textual report integrating the startup's green flags,
    the industry’s standard flags, and the evaluation results.
    """
    startup_gf = state["startupGreenFlags"]
    industry_gf = state["industryGreenFlags"]
    gf_evaluation = state["greenFlagsEvaluation"]

    prompt = (
        "You have three pieces of content:\n\n"
        "1) The startup's green flags:\n"
        f"{startup_gf}\n\n"
        "2) The top 10 industry-standard green flags:\n"
        f"{industry_gf}\n\n"
        "3) The evaluation of how the startup aligns with these industry standards:\n"
        f"{gf_evaluation}\n\n"
        "Now create a final, detailed report focusing ONLY on the startup's green flags, integrating the identified industry-standard green flags and the evaluation of the startup’s performance against them. "
        "The report should only cover green flags. "
        "If a particular parameter does not indicate a green flag, remove it from the report. Avoid any repetition of information unless necessary. "
        "Return only the textual report."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    final_report = response.content.strip()
    state["finalGreenFlagsReport"] = final_report

    # Optionally save or print
    # with open("final_green_flags_report.md", "w", encoding="utf-8") as f:
    #     f.write(final_report)

    return {
        "messages": [
            AIMessage(content="Final Green Flags report generated and saved to final_green_flags_report.md"),
        ],
        "finalGreenFlagsReport": state["finalGreenFlagsReport"]
    }

graph_builder.add_node("scrape_project_urls", scrape_project_urls)
graph_builder.add_node("aggregate_scraped_content", aggregate_scraped_content_node)
graph_builder.add_node("extract_industry_details", extract_industry_details_node)
graph_builder.add_node("highlight_green_flags", highlight_startup_green_flags_node)
graph_builder.add_node("industry_green_flags", industry_green_flags_node)
graph_builder.add_node("evaluate_green_flags", evaluate_green_flags_node)
graph_builder.add_node("finalize_green_flags_report", finalize_green_flags_report_node)

graph_builder.add_edge(START, "scrape_project_urls")
graph_builder.add_edge("scrape_project_urls", "aggregate_scraped_content")
graph_builder.add_edge("aggregate_scraped_content", "extract_industry_details")
graph_builder.add_edge("extract_industry_details", "highlight_green_flags")
graph_builder.add_edge("highlight_green_flags", "industry_green_flags")
graph_builder.add_edge("industry_green_flags", "evaluate_green_flags")
graph_builder.add_edge("evaluate_green_flags", "finalize_green_flags_report")

app = graph_builder.compile(checkpointer=memory)

# events = app.stream(
#     {
#         "messages": [("user", "Scrape and analyze green flags.")],
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
