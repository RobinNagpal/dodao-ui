from typing import Annotated, List
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class Configurable(TypedDict):
    model: str

class Config(TypedDict):
    configurable: dict[str, Configurable]

class ProjectInfo(TypedDict):
    project_name: str
    crowdfunding_link: str
    website_url: str
    latest_sec_filing_link: str
    additional_links: list
    project_id: str

class GeneralInfoReportState(TypedDict):
    general_info_report_content: str


class ProcessedProjectInfo(TypedDict):
    combined_scrapped_content: str

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    project_info: ProjectInfo
    report_input: str
    reports_to_generate: List[str] | None
    processed_project_info: ProcessedProjectInfo | None
    general_info_report: GeneralInfoReportState | None
    config: Config
