import asyncio
import os
import argparse
import traceback
import webbrowser  # To open the URL in the default browser
from io import BytesIO
import sys
import boto3
import json
from markdown import markdown  # Python-Markdown for converting Markdown to HTML
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from general_info import app as general_info_app
from team_info import app as team_info_app
from red_flags import app as red_flags_app
from green_flags import app as green_flags_app
from financial_review_agent import app as financial_review_app
from relevant_links import app as relevant_links_app
from bs4 import BeautifulSoup  # make sure to install via pip install beautifulsoup4

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
    parser.add_argument(
        "--report_type",
        help="Optional: Specify a single report type to regenerate (e.g., 'general_info').",
        default=None  # Default to None if not provided
    )

    args = parser.parse_args()

    # Sanitize inputs to remove unnecessary quotes or whitespace
    project_name = args.project_name.strip().strip('"')
    crowdfunding_link = args.crowdfunding_link.strip().strip('"')
    website_url = args.website_url.strip().strip('"')
    latest_sec_filing_link = args.latest_sec_filing_link.strip().strip('"')
    additional_links = [link.strip() for link in args.additional_links.split(",") if link.strip()]
    report_type = args.report_type.strip().strip('"') if args.report_type else None

    project_id = project_name.replace(" ", "_").lower()

    return {
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links,
        "report_type": report_type,
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

async def run_agent_and_get_final_output_async(app, input_data, final_key, s3_key):
    """
    Runs a single LangGraph agent asynchronously, checks for existing file on S3, updates status file, and uploads the result if necessary.
    """
    # Extract project ID and report name from the S3 key
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".md", "")

    try:

        # Prepare the configuration for the agent
        config = {"configurable": {"thread_id": "1", "id": input_data.get("id")}}

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
                await upload_to_s3(final_state, s3_key)

                # Convert and upload PDF version
                await convert_markdown_to_pdf_and_upload(final_state, s3_key.replace(".md", ".pdf"))

                # Update status file to "completed"
                markdown_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/{s3_key}"
                await update_status_file(project_id, report_name, "completed", markdown_link=markdown_link)
                return final_state

        # If the final key wasn't found in the events, raise an error
        raise ValueError(f"Final output key '{final_key}' not found in the agent's events.")

    except Exception as e:
        # Capture full stack trace
        error_message = ''.join(traceback.format_exception(*sys.exc_info()))
        print(f"An error occurred:\n{error_message}")
        await update_status_file(
            project_id,
            report_name,
            "failed",
            error_message=error_message
        )
        return None



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
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{s3_key}",
        Body=pdf_buffer.getvalue(),
        ContentType="application/pdf",
        ACL="public-read",
    )

    # 8) Update status file, etc. (same as in your current code)
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".pdf", "")
    pdf_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
    await update_status_file(project_id, report_name, "completed", pdf_link=pdf_link)

    print(f"Uploaded PDF to s3://{BUCKET_NAME}/{s3_key}")

async def open_pdf(s3_key):
    webbrowser.open(f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}")

async def initialize_status_file(project_id, project_name, input_data, report_type=None):
    """
    Initializes the `agent-status.json` file in the S3 bucket.
    If it exists, updates the status of the specified report type to "in_progress".
    If no report type is specified, re-initializes the file completely.
    """
    status_key = f"{project_id}/agent-status.json"
    status_data = None

    # Check if the status file already exists
    if check_file_exists_on_s3(status_key):
        print(f"Status file '{status_key}' already exists.")

        # Fetch the current status file
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{status_key}")
        status_data = json.loads(response['Body'].read().decode('utf-8'))

        if report_type:
            # Update the status of the specified report type
            if report_type in status_data["reports"]:
                # Remove `errorMessage` if it exists
                if "errorMessage" in status_data["reports"][report_type]:
                    del status_data["reports"][report_type]["errorMessage"]
                    print(f"Removed errorMessage from report '{report_type}'.")

                # Set the status to "in_progress"
                status_data["reports"][report_type]["status"] = "in_progress"
                print(f"Set status of report '{report_type}' to 'in_progress'.")
            else:
                print(f"Report type '{report_type}' not found in the status file.")
                return
        else:
            print(f"No report type specified. Re-initializing the status file.")

    if not status_data or not report_type:
        # Initialize or reinitialize the file
        status_data = {
            "id": project_id,
            "name": project_name,
            "projectInfoInput": {
                "crowdFundingUrl": input_data["financial_review"]["additional_links"][0],
                "SecFillingUrl": input_data["financial_review"]["url_to_scrape"],
                "additionalUrl": input_data["financial_review"]["additional_links"][2:],
                "websiteUrl": input_data["financial_review"]["additional_links"][1],
            },
            "status": "in_progress",
            "reports": {
                key: {"status": "in_progress", "markdownLink": None, "pdfLink": None}
                for key in input_data.keys()
            },
            "finalReport": {
                "status": "in_progress",
                "markdownLink": None,
                "pdfLink": None,
            }
        }

    # Upload the updated or initialized status file to S3
    s3_client.put_object(
        Bucket=BUCKET_NAME,
        Key=f"crowd-fund-analysis/{status_key}",
        Body=json.dumps(status_data, indent=4),
        ContentType="application/json",
        ACL="public-read",
    )
    print(f"Updated status file: s3://{BUCKET_NAME}/{status_key}")




async def update_status_file(project_id, report_name, status, error_message=None, markdown_link=None, pdf_link=None):
    """
    Updates the `agent-status.json` file in the S3 bucket.
    """
    status_key = f"{project_id}/agent-status.json"

    # Fetch the current status from S3 or create a new one
    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{status_key}")
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
    report_type = project_details["report_type"]
    
    app_map = {
        "general_info": general_info_app,
        "team_info": team_info_app,
        "financial_review": financial_review_app,
        "red_flags": red_flags_app,
        "green_flags": green_flags_app,
        "relevant_links": relevant_links_app,
    }

    final_key_map = {
        "general_info": "projectGeneralInfo",
        "team_info": "teamInfo",
        "financial_review": "finalFinancialReport",
        "red_flags": "finalRedFlagsReport",
        "green_flags": "finalGreenFlagsReport",
        "relevant_links": "relevantLinks",
    }


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
    await initialize_status_file( f"{id}",name, input_data,project_details["report_type"])

    if report_type:
        # Run a single agent based on the provided report type
        if report_type in input_data:
            await run_agent_and_get_final_output_async(
                app=app_map[report_type],
                input_data=input_data[report_type],
                final_key=final_key_map[report_type],
                s3_key=input_data[report_type]["output_file"],
            )
        else:
            print(f"Report type '{report_type}' is not valid.")
        return
    
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
