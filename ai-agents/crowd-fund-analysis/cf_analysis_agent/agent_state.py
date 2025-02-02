from enum import Enum
from typing import Annotated, List, Optional
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class ProcessingStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Configurable(TypedDict):
    model: str

class Config(TypedDict):
    configurable: Configurable

class ProjectInfo(TypedDict):
    project_name: str
    crowdfunding_link: str
    website_url: str
    latest_sec_filing_link: str
    additional_links: list
    project_id: str

class ProcessedProjectInfo(TypedDict, total=False):
    additional_urls_used: Optional[list[str]]
    content_of_additional_urls: Optional[str]
    content_of_crowdfunding_url: str
    content_of_website_url: str
    sec_raw_content: str
    last_updated: str
    status: ProcessingStatus

class FinalReport(TypedDict):
    final_report_contents: str
    spider_graph_json_file_url: str | None

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    project_info: ProjectInfo
    report_input: str
    reports_to_generate: List[str] | None
    processed_project_info: ProcessedProjectInfo | None
    config: Config
    final_report: FinalReport | None


