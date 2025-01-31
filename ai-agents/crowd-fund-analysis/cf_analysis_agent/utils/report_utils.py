import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import webbrowser  # To open the URL in the default browser
from io import BytesIO
import traceback
import sys
import json
from markdown import markdown  # Python-Markdown for converting Markdown to HTML
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from bs4 import BeautifulSoup

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

REGION=os.getenv("AWS_DEFAULT_REGION")
OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')

def get_agent_status_file_path(project_id: str) -> str:
    """
    Returns the path to the status file for the given project ID.
    """
    return f"crowd-fund-analysis/{project_id}/agent-status.json"


def extract_variables_from_s3(project_id):
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
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links
    }

def prepare_processing_command(project_id, model, script_path="cf_analysis_agent/controller.py"):
    """
    Prepares the command to start processing based on variables extracted from S3.
    
    Args:
        project_id (str): The project ID to extract variables for.
        model (str): The selected AI model for report regeneration.
        script_path (str): Path to the script to be executed. Defaults to "cf_analysis_agent/controller.py".
    
    Returns:
        list: The prepared command as a list of arguments.
    """
    # Extract variables from S3
    variables = extract_variables_from_s3(project_id)

    # Base command
    command = [
        "poetry", "run", "python", script_path,
        variables["project_name"],
        variables["crowdfunding_link"],
        variables["website_url"],
        variables["latest_sec_filing_link"]
    ]

    # Include additional links if they exist
    if variables.get("additional_links"):
        command.extend(["--additional_links", ",".join(variables["additional_links"])])
    
     # Append the selected model as an argument
    command.extend(["--model", model])

    return command


async def convert_markdown_to_pdf_and_upload(markdown_content, s3_key):
    """
    Converts Markdown content to PDF, uploads it to S3, and updates the status file.
    """
    # 1) Convert Markdown -> HTML
    html_content = markdown(markdown_content)

    # 2) Parse the HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # 3) Prepare a PDF buffer and styles
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    # You can tweak or add new styles as needed:
    heading1 = ParagraphStyle(
        "Heading1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        spaceAfter=10,
    )
    heading2 = ParagraphStyle(
        "Heading2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        spaceAfter=8,
    )
    normal_paragraph = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=10,
        leading=12,
        spaceAfter=6,
    )

    # 4) Build a list of flowables (Paragraphs, Lists, etc.) from the HTML
    flowables = []

    def parse_element(element):
        """
        Recursive parser to handle nested tags (e.g., <ul> inside <div>).
        You can expand this logic to handle more tags if desired.
        """
        # If it's a navigable string (plain text between tags), skip it if just whitespace
        if element.name is None:
            text = element.strip()
            if text:
                flowables.append(Paragraph(text, normal_paragraph))
            return

        # Handle block-level tags:
        if element.name in ["h1", "h2", "h3", "h4"]:
            # Map heading tags to styles
            style = heading1 if element.name == "h1" else heading2
            flowables.append(Paragraph(element.get_text(), style))
            flowables.append(Spacer(1, 6))

        elif element.name == "p":
            flowables.append(Paragraph(element.get_text(), normal_paragraph))
            flowables.append(Spacer(1, 6))

        elif element.name in ["ul", "ol"]:
            list_items = []
            for li in element.find_all("li", recursive=False):
                # Each <li> might have nested elements
                li_content = li.get_text()
                list_items.append(ListItem(Paragraph(li_content, normal_paragraph)))
            flowables.append(ListFlowable(list_items, bulletType="bullet" if element.name == "ul" else "1"))

        else:
            # For any other tag, just parse its children
            for child in element.children:
                parse_element(child)

    # 5) Parse top-level children of the HTML (body)
    for child in soup.children:
        parse_element(child)

    # 6) Build the PDF
    doc.build(flowables)
    pdf_buffer.seek(0)

    # 7) Upload PDF to S3
    upload_to_s3(pdf_buffer.getvalue(), s3_key, content_type="application/pdf")

    # 8) Update status file, etc. (same as in your current code)
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".pdf", "")
    pdf_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
    await update_status_file(project_id, report_name, "completed", pdf_link=pdf_link)

    print(f"Uploaded PDF to s3://{BUCKET_NAME}/{s3_key}")

async def open_pdf(s3_key):
    webbrowser.open(f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}")
def get_init_data_for_report(report_type):
    return {
        "status": "in_progress",
        "markdownLink": None,
        "pdfLink": None,
        "startTime": datetime.now().isoformat(),
        "estimatedTimeInSec": 240 if report_type in ["team_info", "financial_review"] else 150
    }

def initialize_report(project_id,report_type):
    agent_status_file_path = f"{project_id}/agent-status.json"
    status_data = None
# Fetch the current status file
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
    status_data = json.loads(response['Body'].read().decode('utf-8'))
    if report_type not in status_data["reports"]:
        raise Exception(f"Report type '{report_type}' not found in the status file.")
    
    # Set the status to "in_progress" and initialize timestamps
    status_data["reports"][report_type] = get_init_data_for_report(report_type)
    
    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Set status of report '{report_type}' to 'in_progress'. Initialized startTime and estimatedTimeInSec.")
        

def initialize_all_reports(project_id):
    agent_status_file_path = f"{project_id}/agent-status.json"
    status_data = None

    # Fetch the current status file
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
    status_data = json.loads(response['Body'].read().decode('utf-8'))

    # Initialize all reports to "in_progress" and set timestamps
    for report_type in status_data["reports"]:
        status_data["reports"][report_type] = get_init_data_for_report(report_type)
        print(f"Set status of report '{report_type}' to 'in_progress'. Initialized startTime and estimatedTimeInSec.")
        
    upload_to_s3(json.dumps(status_data, indent=4), agent_status_file_path, content_type="application/json")
    print(f"Updated status file: s3://{BUCKET_NAME}/{agent_status_file_path}")
    
def initialize_status_file_with_input_data(project_id,project_details):
    # Initialize or reinitialize the file
    reports= ALL_REPORT_TYPES
    agent_status_file_path = f"{project_id}/agent-status.json"
    status_data = None
    current_time = datetime.now().isoformat()
    status_data = {
        "id": project_id,
        "name": project_details["project_name"],
        "projectInfoInput": {
            "crowdFundingUrl": project_details["crowdfunding_link"],
            "SecFillingUrl":    project_details["latest_sec_filing_link"],
            "additionalUrl":    project_details["additional_links"],
            "websiteUrl":      project_details["website_url"]
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

async def run_agent_and_get_final_output_async(app, input_data, final_key, s3_key):
    """
    Runs a single LangGraph agent asynchronously, checks for existing file on S3, updates status file, and uploads the result if necessary.
    """
    # Extract project ID and report name from the S3 key
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".md", "")

    try:
        # Extract the model from input_data
        model = input_data.get("model")

        # Prepare the configuration for the agent
        config = {"configurable": {"thread_id": "1", "id": input_data.get("id"), "model": model}}

        # Fetch events asynchronously
        def fetch_events():
            return list(app.stream(input_data, config, stream_mode="values"))

        events = await asyncio.to_thread(fetch_events)

        # Process events to find the final output
        for event in events:
            final_state = event.get(final_key, None)
            if final_state is not None:
                # Handle final state formatting
                if isinstance(final_state, list):
                    final_state = "\n".join(final_state)
                elif not isinstance(final_state, str):
                    final_state = json.dumps(final_state, indent=4)

                # Upload the result to S3
                upload_to_s3(final_state, s3_key)

                # Convert and upload PDF version
                await convert_markdown_to_pdf_and_upload(final_state, s3_key.replace(".md", ".pdf"))

                # Update status file to "completed"
                markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
                update_status_file(project_id, report_name, "completed", markdown_link=markdown_link)
                return final_state

        # If the final key wasn't found in the events, raise an error
        raise ValueError(f"Final output key '{final_key}' not found in the agent's events.")

    except Exception as e:
        # Capture full stack trace
        error_message = ''.join(traceback.format_exception(*sys.exc_info()))
        print(f"An error occurred:\n{error_message}")
        update_status_file(
            project_id,
            report_name,
            "failed",
            error_message=error_message
        )
        return None
    

