import json
import os
from datetime import datetime
from enum import Enum
from typing import List, Dict, Optional, Union
from dotenv import load_dotenv
from typing_extensions import TypedDict, NotRequired

from cf_analysis_agent.agent_state import ProjectInfo, ProcessedProjectInfo
from cf_analysis_agent.utils.project_utils import scrape_url, scrape_urls
from cf_analysis_agent.utils.s3_utils import s3_client, BUCKET_NAME, upload_to_s3

load_dotenv()

REGION = os.getenv("AWS_DEFAULT_REGION")
OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4')

# ---------------------------------------------------------
# 1) TypedDict Definitions
# ---------------------------------------------------------

class ReportStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectInfoInputSchema(TypedDict):
    """
    Represents the user-provided project input
    (URLs, etc.) that we need to track in the agent status.
    """
    crowdFundingUrl: str
    secFilingUrl: str
    additionalUrl: List[str]
    websiteUrl: str


class ReportSchema(TypedDict, total=False):
    """
    Represents the status and metadata of a single report
    (e.g., "team_info", "financial_review", etc.).
    Fields marked as `total=False` are optional
    (e.g., endTime, errorMessage) and may only appear
    under certain conditions.
    """
    status: ReportStatus
    markdownLink: Optional[str]
    startTime: str
    estimatedTimeInSec: int
    endTime: NotRequired[str]
    errorMessage: NotRequired[str]

class FinalReportSchema(ReportSchema, total=False):
    spiderGraphJsonFileUrl: Optional[str]


class ProcessedProjectInfoSchema(TypedDict, total=False):
    """
    Stores combined text results after scraping the various
    URLs for this project, plus a timestamp for when it was last updated.
    """
    urlsUsedForScraping: List[str]
    combinedScrappedContent: str
    secRawContent: str
    lastUpdated: str


class ProjectStatusFileSchema(TypedDict, total=False):
    """
    The top-level structure that gets stored in
    `crowd-fund-analysis/<project_id>/agent-status.json`.
    """
    id: str
    name: str
    projectInfoInput: ProjectInfoInputSchema
    status: ReportStatus
    reports: Dict[str, ReportSchema]
    finalReport: ReportSchema
    processedProjectInfo: NotRequired[ProcessedProjectInfoSchema]


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
    additional_links: list[str] = project_file_contents.get("projectInfoInput", {}).get("additionalUrl", [])

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
        "status": ReportStatus.NOT_STARTED,
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
            "status": ReportStatus.NOT_STARTED,
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
            "additionalUrl": project_details["additional_links"],
            "websiteUrl": project_details["website_url"]
        },
        "status": ReportStatus.IN_PROGRESS,
        "reports": reports_data,
        "finalReport": {
            "status": ReportStatus.NOT_STARTED,
            "markdownLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 260
        }
    }

    # Upload the file to S3
    upload_to_s3(json.dumps(project_file_contents, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Initialized status file: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}")

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
    agent_status_file_path = get_project_status_file_path(project_id)
    upload_to_s3(json.dumps(project_file_contents, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Updated status file: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}")


def update_report_status_in_progress(project_id: str, report_name: str):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "in_progress".
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name] = get_init_data_for_report(report_name)
    project_file_contents["reports"][report_name]["status"] = ReportStatus.IN_PROGRESS
    update_project_file(project_id, project_file_contents)
    print(f"Updated status of report '{report_name}' to 'in_progress'.")


def update_report_status_completed(project_id: str, report_name: str, markdown_link: Optional[str] = None):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "completed" and adds the markdown link.
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name]["status"] = ReportStatus.COMPLETED
    project_file_contents["reports"][report_name]["endTime"] = datetime.now().isoformat()
    if markdown_link:
        project_file_contents["reports"][report_name]["markdownLink"] = markdown_link

    report_statuses = [r["status"] for r in project_file_contents["reports"].values()]
    project_file_contents["status"] = "completed" if all(rs == ReportStatus.COMPLETED for rs in report_statuses) else ReportStatus.IN_PROGRESS

    update_project_file(project_id, project_file_contents)
    print(f"Updated status of report '{report_name}' to 'completed'.")


def update_report_status_failed(project_id: str, report_name: str, error_message: str):
    """
    Updates the `agent-status.json` file in S3 to set a report's status to "failed" and logs the error message.
    """
    project_file_contents = get_project_file(project_id)

    if report_name not in project_file_contents["reports"]:
        raise Exception(f"Report type '{report_name}' not found in the status file.")

    project_file_contents["reports"][report_name]["status"] = ReportStatus.FAILED
    project_file_contents["reports"][report_name]["endTime"] = datetime.now().isoformat()
    project_file_contents["reports"][report_name]["errorMessage"] = error_message
    project_file_contents["status"] = ReportStatus.FAILED

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
    print(f"Updated status file: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}")

def ensure_processed_project_info(project_id: str) -> ProcessedProjectInfo:
    """
    Ensures that 'processed_project_info' is present in agent-status.json in S3.
    This function checks if the URLs have changed. If they haven't and 'processed_project_info'
    exists, it does nothing. If they have changed (or don't exist), it scrapes the URLs again,
    then updates and uploads the new content back to S3.

    Returns the updated 'processed_project_info' from the status file.
    """
    # ----------------------- 1) Download agent-status.json -----------------------
    agent_status_file_path = get_project_status_file_path(project_id)

    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
        project_file_contents = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        raise FileNotFoundError(
            f"agent-status.json not found in S3 at path: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}"
        )

    # ----------------------- 2) Gather the current URLs -------------------------
    project_info = project_file_contents.get("projectInfoInput", {})
    crowd_funding_url = project_info.get("crowdFundingUrl", "").strip()
    website_url = project_info.get("websiteUrl", "").strip()
    sec_filing_url = project_info.get("secFillingUrl", "").strip()
    additional_urls = project_info.get("additionalUrl", [])

    # Combine all project-related URLs (except the SEC link, which we'll handle separately if needed)
    current_urls = []
    if crowd_funding_url:
        current_urls.append(crowd_funding_url)
    if website_url:
        current_urls.append(website_url)
    if additional_urls:
        current_urls.extend(additional_urls)

    # Sort for stable comparison
    current_urls_sorted = sorted(set(current_urls))

    # ----------------------- 3) Check existing processed info -------------------
    processed_project_info = project_file_contents.get("processedProjectInfo", {})
    previous_urls = processed_project_info.get("urlsUsedForScraping") or []

    # Also sort for stable comparison
    previous_urls_sorted = sorted(set(previous_urls))

    # ----------------------- 4) Determine if we need to re-scrape ---------------
    urls_changed = (current_urls_sorted != previous_urls_sorted)

    if processed_project_info and not urls_changed:
        print("URLs have not changed and 'processed_project_info' already exists. No re-scraping needed.")
        return processed_project_info

    # ----------------------- 5) Scrape the URLs ---------------------------------
    # We do this if:
    #    (a) There's no 'processed_project_info' at all, OR
    #    (b) The URLs changed
    print("Scraping URLs because they have changed or 'processed_project_info' is missing.")
    scraped_content_list: List[str] = []
    if current_urls_sorted:
        scraped_content_list = scrape_urls(current_urls_sorted)

    # If you want to scrape the SEC link separately (e.g., for a financial review):
    sec_raw_content = ""
    if sec_filing_url:
        try:
            sec_raw_content = scrape_url(sec_filing_url)
        except Exception as e:
            print(f"Failed to scrape SEC Filing URL: {e}")
            sec_raw_content = f"Error scraping SEC Filing URL: {str(e)}"

    # Combine the general scraped content
    combined_scrapped_content = "\n\n".join(scraped_content_list)

    # ----------------------- 6) Update agent-status.json with new info ----------
    new_processed_project_info: ProcessedProjectInfoSchema = {
        "urlsUsedForScraping": current_urls_sorted,
        "combinedScrappedContent": combined_scrapped_content,
        "secRawContent": sec_raw_content,
        "lastUpdated": datetime.now().isoformat()
    }

    project_file_contents["processedProjectInfo"] = new_processed_project_info

    # ----------------------- 7) Upload updated status file to S3 ----------------
    upload_to_s3(
        content=json.dumps(project_file_contents, indent=4),
        s3_key=f"{project_id}/agent-status.json",
        content_type="application/json"
    )
    print(f"Updated 'processed_project_info' uploaded to s3://{BUCKET_NAME}/crowd-fund-analysis/{project_id}/agent-status.json")

    return {
        "urls_used_for_scrapping": current_urls_sorted,
        "combined_scrapped_content": combined_scrapped_content,
        "sec_raw_content": sec_raw_content,
        "last_updated": new_processed_project_info["lastUpdated"]
    }


def create_report_file_and_upload_to_s3(project_id: str, report_name: str, report_content: str):
    report_file_path = f"{project_id}/{report_name}.md"
    upload_to_s3(report_content, report_file_path)
    # Update status file to "completed"
    markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{report_file_path}"
    update_report_status_completed(project_id, report_name, markdown_link=markdown_link)



