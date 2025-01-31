from typing import Sequence

from langgraph.graph import END, START, StateGraph

from cf_analysis_agent.agent_state import AgentState
from cf_analysis_agent.utils.report_utils import (
    run_agent_and_get_final_output_async,
)
from financial_review_agent import app as financial_review_app
from general_info import create_general_info_report
from green_flags import create_green_flags_report
from red_flags import create_red_flags_report
from relevant_links import create_relevant_links_report
from team_info import app as team_info_app

# ------------------- STATE DEFINITION ------------------- #


# ------------------- REPORT MAPPING ------------------- #
report_apps = {
    "team_info": team_info_app,
    "financial_review": financial_review_app,
}
report_keys = list(report_apps.keys())

final_key_map = {
    "general_info": "projectGeneralInfo",
    "team_info": "teamInfo",
    "financial_review": "finalFinancialReport",
    "red_flags": "finalRedFlagsReport",
    "green_flags": "finalGreenFlagsReport",
    "relevant_links": "relevantLinks",
}

# ------------------- PAYLOAD CREATION ------------------- #
def initialize_first_step(agent_state: AgentState) -> None:
    """
    Creates input data required for report nodes.
    Extracts project details like URLs, team details, SEC filings.
    """
    print("Initializing first step")
    print(agent_state.get("project_info"))
    print("Initialized first step")


# ------------------- REPORT EXECUTION ------------------- #
async def invoke_report(state: AgentState):
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
        s3_key=report_name,
    )

# ------------------- REPORT HANDLING (Including PDF Conversion) ------------------- #
def create_final_report(state: AgentState) -> dict:
    """
    Aggregates all the reports into a final result.
    """
    return {"final_report": "Compiled Reports", "reports": state}

# ------------------- ROUTE SELECTION ------------------- #



def route_single_or_all(state: AgentState) -> Sequence[str]:
    """
    Routes execution to either a single report node or all nodes.
    """
    if state["report_input"] == "all":
        return report_keys  # Convert dict_keys to list
    else:
        return [state["report_input"]]

# ------------------- BUILDING THE GRAPH ------------------- #
builder = StateGraph(AgentState)

for report_name in report_apps.keys():
    builder.add_node(report_name, invoke_report)

builder.add_node("initialize_first_step", initialize_first_step)
builder.add_node("general_info", create_general_info_report)
builder.add_node("red_flags",  create_red_flags_report)
builder.add_node("green_flags",  create_green_flags_report)
builder.add_node("relevant_links",  create_relevant_links_report)
builder.add_node("create_final_report", create_final_report)

builder.add_edge(START, "initialize_first_step")
builder.add_conditional_edges("initialize_first_step", route_single_or_all, report_keys + ["general_info", "red_flags", "green_flags", "relevant_links"])
builder.add_edge(report_keys, "create_final_report")
builder.add_edge("create_final_report", END)

# Compile Graph
graph = builder.compile()
