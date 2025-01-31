import json
import os
from datetime import datetime
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
    status: str
    markdownLink: Optional[str]
    startTime: str
    estimatedTimeInSec: int
    endTime: NotRequired[str]
    errorMessage: NotRequired[str]


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
    status: str
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
    status_data: ProjectStatusFileSchema = json.loads(response['Body'].read().decode('utf-8'))

    # Extract required variables
    project_name = status_data.get("name", "").strip()
    crowdfunding_link = status_data.get("projectInfoInput", {}).get("crowdFundingUrl", "").strip()
    website_url = status_data.get("projectInfoInput", {}).get("websiteUrl", "").strip()
    latest_sec_filing_link = status_data.get("projectInfoInput", {}).get("secFilingUrl", "").strip()
    additional_links: list[str] = status_data.get("projectInfoInput", {}).get("additionalUrl", [])

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
        "status": "in_progress",
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
            "status": "in_progress",
            "markdownLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 240 if r_type in ["team_info", "financial_review"] else 150
        }

    # Construct the status data
    status_data: ProjectStatusFileSchema = {
        "id": project_id,
        "name": project_details["project_name"],
        "projectInfoInput": {
            "crowdFundingUrl": project_details["crowdfunding_link"],
            "secFilingUrl": project_details["latest_sec_filing_link"],
            "additionalUrl": project_details["additional_links"],
            "websiteUrl": project_details["website_url"]
        },
        "status": "in_progress",
        "reports": reports_data,
        "finalReport": {
            "status": "in_progress",
            "markdownLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 260
        }
    }

    # Upload the file to S3
    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Initialized status file: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}")


def update_status_file(
        project_id: str,
        report_name: str,
        status: str,
        error_message: Optional[str] = None,
        markdown_link: Optional[str] = None
):
    """
    Updates the `agent-status.json` file in the S3 bucket for a
    specific report's status, endTime, errorMessage, etc.
    """
    agent_status_file_path = f"crowd-fund-analysis/{project_id}/agent-status.json"

    # Fetch current status from S3
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=agent_status_file_path)
        status_data: ProjectStatusFileSchema = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        # If the file doesn't exist, create a minimal structure
        status_data = {
            "id": project_id,
            "name": "",
            "projectInfoInput": {
                "crowdFundingUrl": "",
                "secFilingUrl": "",
                "additionalUrl": [],
                "websiteUrl": ""
            },
            "status": "in_progress",
            "reports": {},
            "finalReport": {
                "status": "in_progress",
                "markdownLink": None,
                "startTime": datetime.now().isoformat(),
                "estimatedTimeInSec": 200
            }
        }

    # Ensure the report entry exists
    if report_name not in status_data["reports"]:
        status_data["reports"][report_name] = {
            "status": "in_progress",
            "markdownLink": None,
            "startTime": datetime.now().isoformat(),
            "estimatedTimeInSec": 150
        }

    # Update status
    status_data["reports"][report_name]["status"] = status

    # Optionally add markdown link
    if markdown_link:
        status_data["reports"][report_name]["markdownLink"] = markdown_link

    # If completed or failed, add endTime
    if status in ["completed", "failed"]:
        status_data["reports"][report_name]["endTime"] = datetime.now().isoformat()

    # If failed and there's an error_message
    if status == "failed" and error_message:
        status_data["reports"][report_name]["errorMessage"] = error_message

    # Determine the overall project status
    report_statuses = [r["status"] for r in status_data["reports"].values()]
    if any(rs == "failed" for rs in report_statuses):
        status_data["status"] = "failed"
    elif all(rs == "completed" for rs in report_statuses):
        status_data["status"] = "completed"
    else:
        status_data["status"] = "in_progress"

    # Upload updated file to S3
    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Updated status file: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}")




def initialize_report(project_id, report_type):
    agent_status_file_path = f"{project_id}/agent-status.json"
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
    status_data = json.loads(response['Body'].read().decode('utf-8'))
    if report_type not in status_data["reports"]:
        raise Exception(f"Report type '{report_type}' not found in the status file.")

    # Set the status to "in_progress" and initialize timestamps
    status_data["reports"][report_type] = get_init_data_for_report(report_type)

    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Set status of report '{report_type}' to 'in_progress'. Initialized startTime and estimatedTimeInSec.")


def set_in_progress_for_all_reports(project_id):
    agent_status_file_path = f"{project_id}/agent-status.json"

    # Fetch the current status file
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
    status_data = json.loads(response['Body'].read().decode('utf-8'))

    # Initialize all reports to "in_progress" and set timestamps
    for report_type in status_data["reports"]:
        status_data["reports"][report_type] = get_init_data_for_report(report_type)
        print(f"Set status of report '{report_type}' to 'in_progress'. Initialized startTime and estimatedTimeInSec.")

    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
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
        status_data = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        raise FileNotFoundError(
            f"agent-status.json not found in S3 at path: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}"
        )

    # ----------------------- 2) Gather the current URLs -------------------------
    project_info = status_data.get("projectInfoInput", {})
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
    processed_project_info = status_data.get("processedProjectInfo", {})
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

    status_data["processed_project_info"] = new_processed_project_info

    # ----------------------- 7) Upload updated status file to S3 ----------------
    upload_to_s3(
        content=json.dumps(status_data, indent=4),
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


def upload_report_to_s3(project_id: str, report_name: str, report_content: str):
    report_file_path = f"{project_id}/{report_name}.md"
    upload_to_s3(report_content, report_file_path)
    # Update status file to "completed"
    markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{report_file_path}"
    update_status_file(project_id, report_name, "completed", markdown_link=markdown_link)



