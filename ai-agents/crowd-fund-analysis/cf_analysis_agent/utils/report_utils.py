import json
import os
from datetime import datetime

from dotenv import load_dotenv

from cf_analysis_agent.agent_state import ProjectInfo
from cf_analysis_agent.utils.pdf_utils import convert_markdown_to_pdf_and_upload
from cf_analysis_agent.utils.s3_utils import upload_to_s3, s3_client, BUCKET_NAME

ALL_REPORT_TYPES: list[str] = [
    "general_info",
    "team_info",
    "financial_review",
    "red_flags",
    "green_flags",
    "relevant_links",
]

load_dotenv()

REGION = os.getenv("AWS_DEFAULT_REGION")
OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')


def get_project_status_file_path(project_id: str) -> str:
    """
    Returns the path to the status file for the given project ID.
    """
    return f"crowd-fund-analysis/{project_id}/agent-status.json"


def get_project_info_from_s3(project_id) -> ProjectInfo:
    """
    Extracts variables from the agent-status.json file stored in S3.
    """
    # Define the S3 key for the status file
    agent_status_file_path = f"crowd-fund-analysis/{project_id}/agent-status.json"

    # Fetch the agent-status.json file from S3
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=agent_status_file_path)
    status_data = json.loads(response['Body'].read().decode('utf-8'))

    # Extract required variables
    project_name = status_data.get("name", "").strip()
    crowdfunding_link = status_data.get("projectInfoInput", {}).get("crowdFundingUrl", "").strip()
    website_url = status_data.get("projectInfoInput", {}).get("websiteUrl", "").strip()
    latest_sec_filing_link = status_data.get("projectInfoInput", {}).get("SecFillingUrl", "").strip()
    additional_links = status_data.get("projectInfoInput", {}).get("additionalUrl", [])

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


def get_init_data_for_report(report_type):
    return {
        "status": "in_progress",
        "markdownLink": None,
        "pdfLink": None,
        "startTime": datetime.now().isoformat(),
        "estimatedTimeInSec": 240 if report_type in ["team_info", "financial_review"] else 150
    }


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
    print(f"Updated status file: s3://{BUCKET_NAME}/{agent_status_file_path}")


def initialize_project_in_s3(project_id, project_details):
    # Initialize or reinitialize the file
    reports = ALL_REPORT_TYPES
    agent_status_file_path = f"{project_id}/agent-status.json"
    current_time = datetime.now().isoformat()
    status_data = {
        "id": project_id,
        "name": project_details["project_name"],
        "projectInfoInput": {
            "crowdFundingUrl": project_details["crowdfunding_link"],
            "SecFillingUrl": project_details["latest_sec_filing_link"],
            "additionalUrl": project_details["additional_links"],
            "websiteUrl": project_details["website_url"]
        },
        "status": "in_progress",
        "reports": {
            report: {
                "status": "in_progress",
                "markdownLink": None,
                "pdfLink": None,
                "startTime": current_time,
                "estimatedTimeInSec": 240 if report in ["team_info", "financial_review"] else 150
            }
            for report in reports
        },
        "finalReport": {
            "status": "in_progress",
            "markdownLink": None,
            "pdfLink": None,
            "startTime": current_time,
            "estimatedTimeInSec": 260  # Example estimate for the final report
        }
    }

    # Upload the updated or initialized status file to S3
    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Initialized status file: s3://{BUCKET_NAME}/{agent_status_file_path}")


def update_status_file(project_id, report_name, status, error_message=None, markdown_link=None, pdf_link=None):
    """
    Updates the `agent-status.json` file in the S3 bucket.
    """
    agent_status_file_path = f"{project_id}/agent-status.json"

    # Fetch the current status from S3 or create a new one
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
        status_data = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        # Initialize a new status file if it doesn't exist
        status_data = {
            "status": "in_progress",
            "reports": {}
        }

    # Update the specific report status
    if report_name not in status_data["reports"]:
        status_data["reports"][report_name] = {}

    status_data["reports"][report_name]["status"] = status

    # Add optional fields if provided
    if markdown_link:
        status_data["reports"][report_name]["markdownLink"] = markdown_link
    if pdf_link:
        status_data["reports"][report_name]["pdfLink"] = pdf_link

    # Automatically set endTime for completed or failed statuses
    if status in ["completed", "failed"]:
        status_data["reports"][report_name]["endTime"] = datetime.now().isoformat()

    # Add errorMessage if status is "failed" and errorMessage is not None
    if status == "failed" and error_message:
        status_data["reports"][report_name]["errorMessage"] = error_message

    # Determine the overall status
    if any(report.get("status") == "failed" for report in status_data["reports"].values()):
        status_data["status"] = "failed"
    elif all(report.get("status") == "completed" for report in status_data["reports"].values()):
        status_data["status"] = "completed"
    else:
        status_data["status"] = "in_progress"

    # Upload the updated status to S3
    print(f"Updating status file: s3://{BUCKET_NAME}/{agent_status_file_path}")

    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Updated status file: s3://{BUCKET_NAME}/{agent_status_file_path}")


def upload_report_to_s3(project_id: str, report_name: str, report_content: str):
    report_file_path = f"{project_id}/{report_name}.md"
    upload_to_s3(report_content, report_file_path)
    # Convert and upload PDF version
    convert_markdown_to_pdf_and_upload(report_content, report_file_path.replace(".md", ".pdf"))
    # Update status file to "completed"
    markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{report_file_path}"
    update_status_file(project_id, report_name, "completed", markdown_link=markdown_link)
