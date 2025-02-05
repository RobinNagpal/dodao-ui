from typing import Sequence
from langgraph.graph import END, START, StateGraph
from cf_analysis_agent.agent_state import AgentState, ReportType
from cf_analysis_agent.reports.general_info import create_general_info_report
from cf_analysis_agent.reports.green_flags import create_green_flags_report
from cf_analysis_agent.reports.market_opportunity import create_market_opportunity_report
from cf_analysis_agent.reports.red_flags import create_red_flags_report
from cf_analysis_agent.reports.relevant_links import create_relevant_links_report
from cf_analysis_agent.reports.financial_review_agent import create_financial_review_report
from cf_analysis_agent.reports.founder_and_team import create_founder_and_team_report
from cf_analysis_agent.reports.final_report import create_final_report_test
from enum import Enum

from cf_analysis_agent.reports.traction import create_traction_report

# ------------------- REPORT MAPPING ------------------- #
report_keys = ["general_info", "red_flags", "green_flags", "relevant_links", "team_info","financial_review"]

class AgentNodes(str, Enum):
    GENERAL_INFO = "general_info",
    FOUNDER_AND_TEAM = "founder_and_team",
    TRACTION = "traction",
    MARKET_OPPORTUNITY = "market_opportunity",
    VALUATION = "valuation",
    EXECUTION_AND_SPEED = "execution_and_speed",
    FINANCIAL_HEALTH = "financial_health",
    RELEVANT_LINKS = "relevant_links"
    FINAL = "final"
    GENERATE_ALL_REPORTS_SERIALLY = "generate_all_reports_serially"

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

# ------------------- REPORT HANDLING ------------------- #
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
        return "generate_all_reports_serially"  # Convert dict_keys to list
    elif state["report_input"] == 'finalReport':
        return 'create_final_report_test'
    else:
        return [state["report_input"]]

# ------------------- BUILDING THE GRAPH ------------------- #
def generate_all_reports_serially(state: AgentState):
    """
    Generates all reports serially.
    """
    create_general_info_report(state)
    create_red_flags_report(state)
    create_green_flags_report(state)
    create_relevant_links_report(state)
    create_founder_and_team_report(state)
    create_financial_review_report(state)
    create_final_report(state)


builder = StateGraph(AgentState)

builder.add_node("initialize_first_step", initialize_first_step)
builder.add_node("general_info", create_general_info_report)
builder.add_node(ReportType.TRACTION.value, create_traction_report)
builder.add_node("red_flags",  create_red_flags_report)
builder.add_node("green_flags",  create_green_flags_report)
builder.add_node("relevant_links",  create_relevant_links_report)
builder.add_node("team_info", create_founder_and_team_report)
builder.add_node("financial_review", create_financial_review_report)
builder.add_node("create_final_report", create_final_report)
builder.add_node("create_final_report_test", create_final_report_test)
builder.add_node(ReportType.MARKET_OPPORTUNITY.value, create_market_opportunity_report)
builder.add_node(AgentNodes.GENERATE_ALL_REPORTS_SERIALLY, generate_all_reports_serially)

builder.add_edge(START, "initialize_first_step")
builder.add_conditional_edges("initialize_first_step", route_single_or_all)
builder.add_edge(report_keys, "create_final_report")
builder.add_edge("create_final_report", END)

# Compile Graph
graph = builder.compile()
