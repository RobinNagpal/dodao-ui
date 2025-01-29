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
from cf_analysis_agent.utils.report_utils import get_llm

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

class State(TypedDict):
    messages: Annotated[list, add_messages]
    projectUrls: List[str]        
    scraped_content: List[str]
    combinedScrapedContent: str
    extractedIndustryDetails: str
    startupRedFlags: str       
    industryRedFlags: str     
    redFlagsEvaluation: str   
    finalRedFlagsReport: str

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

def scrape_multiple_urls_node(state: State):
    """
    Scrapes each URL in state["projectUrls"] using ScrapingAntLoader
    and stores the page content in state["scraped_content"] (list).
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
    Combine all scraped content from multiple links into a single text blob.
    We'll store the combined text in state["combinedScrapedContent"].
    """
    scraped_list = state.get("scraped_content", [])
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
    print("Industry Details", state["extractedIndustryDetails"])

    return {
        "messages": [
            HumanMessage(
                content="Extracted industry details from combinedScrapedContent. Stored in state['extractedIndustryDetails']."
            )
        ],
        "extractedIndustryDetails": state["extractedIndustryDetails"]
    }

def highlight_startup_red_flags_node(state: State, config):
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
        f"Scraped Content:\n{state['combinedScrapedContent']}\n\n"
        "Return a text describing the startup's red flags, focusing on specific negative or concerning issues."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    state["startupRedFlags"] = response.content.strip()
    print("Startup Red Flags", state["startupRedFlags"])

    return {
        "messages": [
            HumanMessage(content="Red flags extracted from the startup’s data. Storing result in state['startupRedFlags'].")
        ],
        "startupRedFlags": state["startupRedFlags"],
    }

def industry_red_flags_node(state: State, config):
    """
    Finds the 10 most commonly recognized red flags in the startup's industry,
    based on the extracted industry details.
    """
    industry_info = state.get("extractedIndustryDetails", "")

    prompt = (
        "Given the following industry description, outline the 10 most commonly recognized red flags "
        "for startups in this industry. Provide a clear list of critical indicators of potential failure. "
        "Each red flag should briefly explain why it poses a significant risk.\n\n"
        f"Industry Info:\n{industry_info}\n\n"
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    state["industryRedFlags"] = response.content.strip()
    print("Industry Red Flags", state["industryRedFlags"])

    return {
        "messages": [
            HumanMessage(content="Industry-level red flags identified and stored in state['industryRedFlags'].")
        ],
        "industryRedFlags": state["industryRedFlags"]
    }

def evaluate_red_flags_node(state: State, config):
    """
    Compares the startup's red flags to the 10 industry red flags.
    Only mention red flags that are actually applicable to the startup.
    """
    startup_rf = state["startupRedFlags"]
    industry_rf = state["industryRedFlags"]

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
    state["redFlagsEvaluation"] = response.content.strip()

    return {
        "messages": [
            HumanMessage(content="Evaluation of startup’s red flags vs. industry standards complete.")
        ],
        "redFlagsEvaluation": state["redFlagsEvaluation"]
    }

def finalize_red_flags_report_node(state: State, config):
    """
    Produces the final textual report about the startup's red flags, 
    integrating industry standards and the evaluation.
    """
    startup_rf = state["startupRedFlags"]
    industry_rf = state["industryRedFlags"]
    rf_evaluation = state["redFlagsEvaluation"]

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

    state["finalRedFlagsReport"] = final_report

    # with open("final_red_flags_report.md", "w", encoding="utf-8") as f:
    #     f.write(final_report)

    return {
        "messages": [
            AIMessage(content="Final Red Flags report generated and saved to final_red_flags_report.md"),
        ],
        "finalRedFlagsReport": state["finalRedFlagsReport"]
    }

graph_builder.add_node("scrape_multiple_urls", scrape_multiple_urls_node)
graph_builder.add_node("aggregate_scraped_content", aggregate_scraped_content_node)
graph_builder.add_node("extract_industry_details", extract_industry_details_node)
graph_builder.add_node("highlight_startup_red_flags", highlight_startup_red_flags_node)
graph_builder.add_node("industry_red_flags", industry_red_flags_node)
graph_builder.add_node("evaluate_red_flags", evaluate_red_flags_node)
graph_builder.add_node("finalize_red_flags_report", finalize_red_flags_report_node)

graph_builder.add_edge(START, "scrape_multiple_urls")
graph_builder.add_edge("scrape_multiple_urls", "aggregate_scraped_content")
graph_builder.add_edge("aggregate_scraped_content", "extract_industry_details")
graph_builder.add_edge("extract_industry_details", "highlight_startup_red_flags")
graph_builder.add_edge("highlight_startup_red_flags", "industry_red_flags")
graph_builder.add_edge("industry_red_flags", "evaluate_red_flags")
graph_builder.add_edge("evaluate_red_flags", "finalize_red_flags_report")

app = graph_builder.compile(checkpointer=memory)

# events = app.stream(
#     {
#         "messages": [("user", "Scrape and analyze red flags.")],
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
