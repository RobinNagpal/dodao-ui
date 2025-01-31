from typing import Sequence
from langgraph.graph import END, START, StateGraph
from cf_analysis_agent.agent_state import AgentState
from general_info import create_general_info_report
from green_flags import create_green_flags_report
from red_flags import create_red_flags_report
from relevant_links import create_relevant_links_report
from financial_review_agent import create_financial_review_report
from team_info import create_team_info_report


# ------------------- REPORT MAPPING ------------------- #
report_keys = ["general_info", "red_flags", "green_flags", "relevant_links", "team_info","financial_review"]

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

builder.add_node("initialize_first_step", initialize_first_step)
builder.add_node("general_info", create_general_info_report)
builder.add_node("red_flags",  create_red_flags_report)
builder.add_node("green_flags",  create_green_flags_report)
builder.add_node("relevant_links",  create_relevant_links_report)
builder.add_node("team_info",  create_team_info_report)
builder.add_node("financial_review", create_financial_review_report)
builder.add_node("create_final_report", create_final_report)

builder.add_edge(START, "initialize_first_step")
builder.add_conditional_edges("initialize_first_step", route_single_or_all, report_keys)
builder.add_edge(report_keys, "create_final_report")
builder.add_edge("create_final_report", END)

# Compile Graph
graph = builder.compile()
