import asyncio
import os
import argparse
import webbrowser  # To open the URL in the default browser
from io import BytesIO
import boto3
import json
from markdown import markdown  # Python-Markdown for converting Markdown to HTML
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from general_info import app as general_info_app
from team_info import app as team_info_app
from red_flags import app as red_flags_app
from green_flags import app as green_flags_app
from financial_review_agent import app as financial_review_app
from relevant_links import app as relevant_links_app

# AWS S3 client using credentials from environment variables
s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
REGION=os.getenv("AWS_DEFAULT_REGION")

def format_id(project_name):
    """
    Generates a deterministic ID by formatting the project name (e.g., replacing spaces with underscores).
    """
    return project_name.strip().replace(" ", "_").lower()

def read_markdown_from_s3(s3_key):
    """
    Reads Markdown content from an S3 file.
    """
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=s3_key)
        content = response['Body'].read().decode('utf-8')
        return content
    except s3_client.exceptions.NoSuchKey:
        print(f"Markdown file '{s3_key}' does not exist in S3.")
        return None
    except Exception as e:
        print(f"Error reading Markdown file from S3: {e}")
        return None


def parse_arguments():
    """
    Parses command-line arguments and returns project details.
    """
    parser = argparse.ArgumentParser(description="Run the project report generator.")
    parser.add_argument("project_name", help="The name of the project.")
    parser.add_argument("crowdfunding_link", help="The crowdfunding link for the project.")
    parser.add_argument("website_url", help="The official website URL of the project.")
    parser.add_argument("latest_sec_filing_link", help="The latest SEC filing link.")
    parser.add_argument(
        "--additional_links",
        help="Optional: Comma-separated list of additional links related to the project.",
        default="",  # Default to an empty string if not provided
    )

    args = parser.parse_args()

    # Sanitize inputs to remove unnecessary quotes or whitespace
    project_name = args.project_name.strip().strip('"')
    crowdfunding_link = args.crowdfunding_link.strip().strip('"')
    website_url = args.website_url.strip().strip('"')
    latest_sec_filing_link = args.latest_sec_filing_link.strip().strip('"')
    additional_links = [link.strip() for link in args.additional_links.split(",") if link.strip()]

    project_id = project_name.replace(" ", "_").lower()

    return {
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links,
        "project_id": project_id,
    }


def check_file_exists_on_s3(s3_key):
    """
    Checks if a file exists in the S3 bucket.
    """
    try:
        s3_client.head_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{s3_key}")
        return True
    except s3_client.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        raise


async def upload_to_s3(content, s3_key, content_type="text/plain"):
    """
    Uploads content to S3.
    """
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{s3_key}",
        Body=content,
        ContentType=content_type,
        ACL="public-read",
    )
    print(f"Uploaded to s3://{BUCKET_NAME}/{s3_key}")


async def run_agent_and_get_final_output_async(app, input_data, final_key, s3_key,):
    """
    Runs a single LangGraph agent asynchronously, checks for existing file on S3, updates status file, and uploads the result if necessary.
    """
    project_id=s3_key.split("/")[0]
    report_name=s3_key.split("/")[1].replace(".md", "")
    if check_file_exists_on_s3(s3_key):
        print(f"File '{s3_key}' already exists on S3. Skipping the agent.")
        await update_status_file(project_id, report_name, "completed", markdown_link=f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{s3_key}")
        return

    config = {"configurable": {"thread_id": "1", "id": input_data.get("id")}}

    def fetch_events():
        return list(app.stream(input_data, config, stream_mode="values"))

    events = await asyncio.to_thread(fetch_events)

    for event in events:
        final_state = event.get(final_key, None)
        if final_state is not None:
            if isinstance(final_state, list):
                final_state = "\n".join(final_state)
            elif not isinstance(final_state, str):
                final_state = json.dumps(final_state, indent=4)

            # Upload the result to S3
            await upload_to_s3(final_state, s3_key)

            await convert_markdown_to_pdf_and_upload(final_state, s3_key.replace(".md", ".pdf"))
            # Update status file in S3
            markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
            await update_status_file(project_id, report_name, "completed", markdown_link=markdown_link)
            return final_state

    raise ValueError(f"Final output key '{final_key}' not found in the agent's events.")



async def convert_markdown_to_pdf_and_upload(markdown_content, s3_key):
    """
    Converts Markdown content to PDF, uploads it to S3, and opens it in the browser.
    """
    html_content = markdown(markdown_content)
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    body_style = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, leading=12)
    elements = [Paragraph(html_content, body_style)]
    doc.build(elements)
    pdf_buffer.seek(0)

    # Upload PDF to S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{s3_key}",
        Body=pdf_buffer.getvalue(),
        ContentType="application/pdf",
        ACL="public-read",
    )
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".pdf", "")
    pdf_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
    await update_status_file(project_id, report_name, "completed", pdf_link=pdf_link)
    print(f"Uploaded PDF to s3://{BUCKET_NAME}/{s3_key}")
    
async def open_pdf(s3_key):
    webbrowser.open(f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}")

async def initialize_status_file(project_id,project_name, input_data):
    """
    Initializes the `agent-status.json` file in the S3 bucket if it does not already exist.
    """
    status_key = f"{project_id}/agent-status.json"

    # Check if the status file already exists
    if check_file_exists_on_s3(status_key):
        print(f"Status file '{status_key}' already exists. Skipping initialization.")
        return

    # Initialize a new status file with pending status and no links
    status_data = {
        "id": project_id,
        "name": project_name,
        "projectInfoInput":{
            "crowdFundingUrl": input_data["financial_review"]["additional_links"][0],
            "SecFillingUrl": input_data["financial_review"]["url_to_scrape"],
            "additionalUrl": input_data["financial_review"]["additional_links"][2:],
            "websiteUrl": input_data["financial_review"]["additional_links"][1],
        },
        "status": "pending",
        "reports": {
            key: {"status": "pending", "markdownLink": None, "pdfLink": None}
            for key in input_data.keys()
        },
        "finalReport":{
                "status": "in_progress",
                "markdownLink": None,
                "pdfLink": None,
            }
    }

    # Upload the initial status file to S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{status_key}",
        Body=json.dumps(status_data, indent=4),
        ContentType="application/json",
        ACL="public-read",
    )
    print(f"Initialized status file: s3://{BUCKET_NAME}/{status_key}")

async def update_status_file(project_id, report_name, status, markdown_link=None, pdf_link=None):
    """
    Updates the `agent-status.json` file in the S3 bucket.
    """
    status_key = f"{project_id}/agent-status.json"

    # Fetch the current status from S3 or create a new one
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{status_key}")
        print(response)
        status_data = json.loads(response['Body'].read().decode('utf-8'))
        print(status_data)
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

    if markdown_link:
        status_data["reports"][report_name]["markdownLink"] = markdown_link
    if pdf_link:
        status_data["reports"][report_name]["pdfLink"] = pdf_link

    # If all reports are complete, update the overall status
    if all(report.get("status") == "completed" for report in status_data["reports"].values()):
        status_data["status"] = "completed"

    # Upload the updated status to S3
    print(f"Updating status file: s3://{BUCKET_NAME}/{status_key}")
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{status_key}",
        Body=json.dumps(status_data, indent=4),
        ContentType="application/json",
        ACL="public-read",
    )
    print(f"Updated status file: s3://{BUCKET_NAME}/{status_key}")


async def main_controller_async(project_details):
    """
    Runs parallel tasks, checks for existing files on S3, and generates a PDF report from Markdown.
    """
    id = project_details["project_id"]
    name = project_details["project_name"]
    crowdfunding_link = project_details["crowdfunding_link"]
    website_url = project_details["website_url"]
    latest_sec_filing_link = project_details["latest_sec_filing_link"]
    additional_links = project_details["additional_links"]

    input_data = {
        "general_info": {
            "id": id,
            "messages": [("user", "Please gather the project's general info.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/general_info.md",
        },
        "team_info": {
            "id": id,
            "messages": [("user", crowdfunding_link)],
            "output_file": f"{id}/team_info.md",
        },
        "red_flags": {
            "id": id,
            "messages": [("user", "Scrape and analyze red flags.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/red_flags.md",
        },
        "green_flags": {
            "id": id,
            "messages": [("user", "Scrape and analyze green flags.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/green_flags.md",
        },
        "financial_review": {
            "id": id,
            "messages": [("user", latest_sec_filing_link)],
            "url_to_scrape": latest_sec_filing_link,
            "scraped_content": {},
            "additional_links": [crowdfunding_link, website_url] + additional_links,
            "output_file": f"{id}/financial_review.md",
        },
        "relevant_links": {
            "id": id,
            "messages": [("user", "Find more links about this startup.")],
            "crowdfunded_url": crowdfunding_link,
            "output_file": f"{id}/relevant_links.md",
        },
    }
    
     # Initialize the status file
    await initialize_status_file( f"{id}",name, input_data)
    
    parallel_tasks = [
        run_agent_and_get_final_output_async(
            general_info_app, input_data["general_info"], "projectGeneralInfo", input_data["general_info"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            team_info_app, input_data["team_info"], "teamInfo", input_data["team_info"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            financial_review_app, input_data["financial_review"], "finalFinancialReport", f"{id}/financial_review.md",
        ),
        run_agent_and_get_final_output_async(
            red_flags_app, input_data["red_flags"], "finalRedFlagsReport", input_data["red_flags"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            green_flags_app, input_data["green_flags"], "finalGreenFlagsReport", input_data["green_flags"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            relevant_links_app, input_data["relevant_links"], "relevantLinks", input_data["relevant_links"]["output_file"]
        ),
    ]

    results = await asyncio.gather(*parallel_tasks)

    # Convert Markdown files to PDFs and upload them to S3
    pdf_tasks = []
    for key, data in input_data.items():
        markdown_s3_key = data["output_file"]
        pdf_s3_key =markdown_s3_key.replace(".md", ".pdf")

        pdf_tasks.append(open_pdf(pdf_s3_key))

    # Execute all PDF upload tasks in parallel
    if pdf_tasks:
        await asyncio.gather(*pdf_tasks)


if __name__ == "__main__":
    project_details = parse_arguments()
    asyncio.run(main_controller_async(project_details))
