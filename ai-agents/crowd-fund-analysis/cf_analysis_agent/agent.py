import asyncio
from typing import Sequence
from typing_extensions import TypedDict
from langgraph.graph import END, START, StateGraph

from general_info import app as general_info_app
from team_info import app as team_info_app
from red_flags import app as red_flags_app
from green_flags import app as green_flags_app
from financial_review_agent import app as financial_review_app
from relevant_links import app as relevant_links_app
from cf_analysis_agent.utils.report_utils import (
    run_agent_and_get_final_output_async,
    initialize_status_file_with_input_data,
    convert_markdown_to_pdf_and_upload,
)

# ------------------- STATE DEFINITION ------------------- #
class State(TypedDict):
    report: str
    project_id: str
    project_name: str
    crowdfunding_link: str
    website_url: str
    latest_sec_filing_link: str
    additional_links: list
    model: str
    input_data: dict

# ------------------- REPORT MAPPING ------------------- #
report_apps = {
    "general_info": general_info_app,
    "team_info": team_info_app,
    "financial_review": financial_review_app,
    "green_flags": green_flags_app,
    "red_flags": red_flags_app,
    "relevant_links": relevant_links_app,
}

final_key_map = {
    "general_info": "projectGeneralInfo",
    "team_info": "teamInfo",
    "financial_review": "finalFinancialReport",
    "red_flags": "finalRedFlagsReport",
    "green_flags": "finalGreenFlagsReport",
    "relevant_links": "relevantLinks",
}

# ------------------- PAYLOAD CREATION ------------------- #
def create_payload(state: State) -> TypedDict[str, dict]:
    """
    Creates input data required for report nodes.
    Extracts project details like URLs, team details, SEC filings.
    """
    project_id = state["project_id"]
    project_name = state["project_name"]
    crowdfunding_link = state["crowdfunding_link"]
    website_url = state["website_url"]
    latest_sec_filing_link = state["latest_sec_filing_link"]
    additional_links = state["additional_links"]
    model = state["model"]

    input_data = {
        report: {
            "id": project_id,
            "messages": [("user", f"Generate {report} report using {model}.")],
            "output_file": f"{project_id}/{report}.md",
            "project_urls": [crowdfunding_link, website_url] if report != "financial_review" else [latest_sec_filing_link],
            "model": model,
            "additional_links": additional_links,
        }
        for report in report_apps.keys()
    }

    # Initialize the status file in S3
    initialize_status_file_with_input_data(project_id, state)

    return {"input_data": input_data}

# ------------------- REPORT EXECUTION ------------------- #
async def invoke_report(state: State) -> dict:
    """
    Generalized function to invoke any report graph asynchronously.
    """
    report_name = state["report"]
    project_id = state["project_id"]
    input_data = state["input_data"].get(report_name, {})

    if report_name not in report_apps:
        raise ValueError(f"Invalid report: {report_name}")

    # Invoke the agent and upload results
    return await run_agent_and_get_final_output_async(
        app=report_apps[report_name],
        input_data=input_data,
        final_key=final_key_map[report_name],
        s3_key=input_data["output_file"],
    )

# ------------------- REPORT HANDLING (Including PDF Conversion) ------------------- #
async def handle_reports(state: State) -> dict:
    """
    Aggregates all the reports into a final result.
    """
    return {"final_report": "Compiled Reports", "reports": state}

# ------------------- ROUTE SELECTION ------------------- #
def route_single_or_all(state: State) -> Sequence[str]:
    """
    Routes execution to either a single report node or all nodes.
    """
    if state["report"] == "all":
        return list(report_apps.keys())  # Convert dict_keys to list
    elif state["report"] in report_apps:
        return [state["report"]]
    else:
        raise ValueError(f"Invalid report selection: {state['report']}")

# ------------------- BUILDING THE GRAPH ------------------- #
builder = StateGraph(State)

# First Level (Payload Creation)
builder.add_node("payload_creation", create_payload)
builder.add_edge(START, "payload_creation")

# Add report nodes dynamically
for report_name in report_apps.keys():
    builder.add_node(report_name, invoke_report)

# Add report handling node
builder.add_node("report_handling", handle_reports)

# Conditional Routing from Payload Creation to Reports
builder.add_conditional_edges(
    "payload_creation",
    route_single_or_all,
    list(report_apps.keys()),
)

# Reports fan-in into report_handling
for node in report_apps.keys():
    builder.add_edge(node, "report_handling")

builder.add_edge("report_handling", END)

# Compile Graph
graph = builder.compile()
