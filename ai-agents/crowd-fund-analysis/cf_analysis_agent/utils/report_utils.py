import json
from datetime import datetime
from typing import List, Dict, Optional

from dotenv import load_dotenv
from typing_extensions import TypedDict, NotRequired

from cf_analysis_agent.agent_state import ProjectInfo, ProcessingStatus
from cf_analysis_agent.utils.env_variables import REGION
from cf_analysis_agent.utils.s3_utils import s3_client, BUCKET_NAME, upload_to_s3

load_dotenv()


# ---------------------------------------------------------
# 1) TypedDict Definitions
# ---------------------------------------------------------


class ProjectInfoInputSchema(TypedDict):
    """
    Represents the user-provided project input
    (URLs, etc.) that we need to track in the agent status.
    """
    crowdFundingUrl: str
    secFilingUrl: str
    additionalUrls: List[str]
    websiteUrl: str


class ReportSchema(TypedDict, total=False):
    """
    Represents the status and metadata of a single report
    (e.g., "team_info", "financial_review", etc.).
    Fields marked as `total=False` are optional
    (e.g., endTime, errorMessage) and may only appear
    under certain conditions.
    """
    status: ProcessingStatus
    markdownLink: Optional[str]
    startTime: str
    estimatedTimeInSec: int
    endTime: Optional[str]
    errorMessage: NotRequired[str]


class FinalReportSchema(ReportSchema, total=False):
    spiderGraphJsonFileUrl: NotRequired[str]


class ProcessedProjectInfoSchema(TypedDict, total=False):
    """
    Stores combined text results after scraping the various
    URLs for this project, plus a timestamp for when it was last updated.
    """
    additionalUrlsUsed: List[str]
    contentOfAdditionalUrls: str
    contentOfCrowdfundingUrl: str
    contentOfWebsiteUrl: str
    secRawContent: str
    lastUpdated: str
    status: ProcessingStatus


class ProjectStatusFileSchema(TypedDict, total=False):
    """
    The top-level structure that gets stored in
    `crowd-fund-analysis/<project_id>/agent-status.json`.
    """
    id: str
    name: str
    projectInfoInput: ProjectInfoInputSchema
    status: ProcessingStatus
    reports: Dict[str, ReportSchema]
    finalReport: FinalReportSchema
    processedProjectInfo: ProcessedProjectInfoSchema


# ---------------------------------------------------------
# 2) Example usage of these schemas in code
# ---------------------------------------------------------
ALL_REPORT_TYPES: list[str] = [
    "general_info",
    "team_info",
    "financial_review",
    "red_flags",
    "green_flags",
    "relevant_links",
]


def get_project_status_file_path(project_id: str) -> str:
    """
    Returns the path to the status file for the given project ID.
    """
    return f"{project_id}/agent-status.json"


def get_project_info_from_s3(project_id: str) -> ProjectInfo:
    """
    Extracts variables from the agent-status.json file stored in S3.
    Returns a dictionary representing the essential project info.
    """
    # Define the S3 key for the status file
    agent_status_file_path = get_project_status_file_path(project_id)

    # Fetch the agent-status.json file from S3
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
    project_file_contents: ProjectStatusFileSchema = json.loads(response['Body'].read().decode('utf-8'))

    # Extract required variables
    project_name = project_file_contents.get("name", "").strip()
    crowdfunding_link = project_file_contents.get("projectInfoInput", {}).get("crowdFundingUrl", "").strip()
    website_url = project_file_contents.get("projectInfoInput", {}).get("websiteUrl", "").strip()
    latest_sec_filing_link = project_file_contents.get("projectInfoInput", {}).get("secFilingUrl", "").strip()
    additional_links: list[str] = project_file_contents.get("projectInfoInput", {}).get("additionalUrls", [])

    # Validate required fields
    if not all([project_name, crowdfunding_link, website_url, latest_sec_filing_link]):
        raise ValueError("Missing required data in agent-status.json.")

    # Return extracted variables
    return {
        "project_id": project_id,
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links
    }


def get_init_data_for_report(report_type: str) -> ReportSchema:
    """
    Returns an initialized ReportSchema dictionary
    for the given report_type.
    """
    return {
        "status": ProcessingStatus.NOT_STARTED,
        "markdownLink": None,
        "startTime": datetime.now().isoformat(),
        "estimatedTimeInSec": 240 if report_type in ["team_info", "financial_review"] else 150
    }


def initialize_project_in_s3(project_id: str, project_details: ProjectInfo):
    """
    Creates or re-initializes the agent-status.json file for a project,
    setting all reports to 'in_progress' along with basic metadata.
    """
    agent_status_file_path = get_project_status_file_path(project_id)
    current_time = datetime.now().isoformat()

    # Initialize all reports
    reports_data = {}
    for r_type in ALL_REPORT_TYPES:
        reports_data[r_type] = {
            "status": ProcessingStatus.NOT_STARTED,
            "markdownLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 240 if r_type in ["team_info", "financial_review"] else 150
        }

    # Construct the status data
    project_file_contents: ProjectStatusFileSchema = {
        "id": project_id,
        "name": project_details["project_name"],
        "projectInfoInput": {
            "crowdFundingUrl": project_details["crowdfunding_link"],
            "secFilingUrl": project_details["latest_sec_filing_link"],
            "additionalUrls": project_details["additional_links"],
            "websiteUrl": project_details["website_url"]
        },
        "status": ProcessingStatus.IN_PROGRESS,
        "reports": reports_data,
        "finalReport": {
            "status": ProcessingStatus.NOT_STARTED,
            "markdownLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 260
        }
    }

    # Upload the file to S3
    upload_to_s3(json.dumps(project_file_contents, indent=4), agent_status_file_path, content_type="application/json")
    print(
        f"Initialized status file: https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/crowd-fund-analysis/{agent_status_file_path}")


def get_project_file(project_id: str) -> ProjectStatusFileSchema:
    """
    Fetches and returns the project status data from S3.
    """
    agent_status_file_path = get_project_status_file_path(project_id)
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key="crowd-fund-analysis/" + agent_status_file_path)
    return json.loads(response['Body'].read().decode('utf-8'))


def update_project_file(project_id: str, project_file_contents: ProjectStatusFileSchema):
    """
    Uploads the updated project status data to S3.
    """
    # populate agent-status.json file with the updated data and upload it to S3

    reports = project_file_contents["reports"]
    new_reports: dict[str, ReportSchema] = {}
    for report_type in reports.keys():
        report: ReportSchema = reports[report_type]
        new_report = {
            "status": report["status"],
            "markdownLink": report["markdownLink"],
            "startTime": report["startTime"],
            "estimatedTimeInSec": report["estimatedTimeInSec"],
            # check report["endTime"] exists and is not None
            "endTime": datetime.now().isoformat() if report.get("endTime") else None
        }
        new_reports[report_type] = new_report

    new_project_file_contents: ProjectStatusFileSchema = {
        "id": project_id,
        "name": project_file_contents["name"],
        "projectInfoInput": project_file_contents["projectInfoInput"],
        "status": project_file_contents["status"],
        "finalReport": {
            "status": project_file_contents["finalReport"]["status"],
            "markdownLink": project_file_contents["finalReport"]["markdownLink"],
            "startTime": project_file_contents["finalReport"]["startTime"],
            "estimatedTimeInSec": project_file_contents["finalReport"]["estimatedTimeInSec"],
            # check report["endTime"] exists and if not then set it empty
            "endTime":  datetime.now().isoformat() if project_file_contents["finalReport"].get("endTime") else None
        },
        "processedProjectInfo": {
            "additionalUrlsUsed": project_file_contents["processedProjectInfo"].get("additionalUrlsUsed"),
            "contentOfAdditionalUrls": project_file_contents["processedProjectInfo"].get("contentOfAdditionalUrls"),
            "contentOfCrowdfundingUrl": project_file_contents["processedProjectInfo"].get("contentOfCrowdfundingUrl"),
            "contentOfWebsiteUrl": project_file_contents["processedProjectInfo"].get("contentOfWebsiteUrl"),
            "secRawContent": project_file_contents["processedProjectInfo"].get("secRawContent"),
            "lastUpdated": project_file_contents["processedProjectInfo"].get("lastUpdated"),
            "status": project_file_contents["processedProjectInfo"].get("status")
        },
        "reports": new_reports
    }

    agent_status_file_path = get_project_status_file_path(project_id)
    upload_to_s3(json.dumps(new_project_file_contents, indent=4), agent_status_file_path,
                 content_type="application/json")
    print(
        f"Updated status file: https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/crowd-fund-analysis/{agent_status_file_path}")


def update_report_status_in_progress(project_id: str, report_name: str):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "in_progress".
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name] = get_init_data_for_report(report_name)
    project_file_contents["reports"][report_name]["status"] = ProcessingStatus.IN_PROGRESS
    update_project_file(project_id, project_file_contents)
    print(f"Updated status of report '{report_name}' to 'in_progress'.")


def update_report_status_completed(project_id: str, report_name: str, markdown_link: Optional[str] = None):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "completed" and adds the markdown link.
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name]["status"] = ProcessingStatus.COMPLETED
    project_file_contents["reports"][report_name]["endTime"] = datetime.now().isoformat()
    if markdown_link:
        project_file_contents["reports"][report_name]["markdownLink"] = markdown_link

    report_statuses = [r["status"] for r in project_file_contents["reports"].values()]
    project_file_contents["status"] = "completed" if all(
        rs == ProcessingStatus.COMPLETED for rs in report_statuses) else ProcessingStatus.IN_PROGRESS

    update_project_file(project_id, project_file_contents)
    print(f"Updated status of report '{report_name}' to 'completed'.")


def update_report_status_failed(project_id: str, report_name: str, error_message: str):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "failed" and logs the error message.
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name]["status"] = ProcessingStatus.FAILED
    project_file_contents["reports"][report_name]["endTime"] = datetime.now().isoformat()
    project_file_contents["reports"][report_name]["errorMessage"] = error_message
    project_file_contents["status"] = ProcessingStatus.FAILED

    update_project_file(project_id, project_file_contents)
    print(f"Updated status of report '{report_name}' to 'failed' with error message: {error_message}")


def update_status_to_not_started_for_all_reports(project_id):
    agent_status_file_path = f"{project_id}/agent-status.json"

    project_file_contents = get_project_file(project_id)

    # Initialize all reports to "in_progress" and set timestamps
    for report_type in project_file_contents["reports"]:
        project_file_contents["reports"][report_type] = get_init_data_for_report(report_type)
        print(f"Set status of report '{report_type}' to 'not_started'. Initialized startTime and estimatedTimeInSec.")

    upload_to_s3(json.dumps(project_file_contents, indent=4), agent_status_file_path, content_type="application/json")
    print(
        f"Updated status file: https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/crowd-fund-analysis/{agent_status_file_path}")


def create_report_file_and_upload_to_s3(project_id: str, report_name: str, report_content: str):
    report_file_path = f"{project_id}/{report_name}.md"
    upload_to_s3(report_content, report_file_path)
    # Update status file to "completed"
    markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{report_file_path}"
    update_report_status_completed(project_id, report_name, markdown_link=markdown_link)
