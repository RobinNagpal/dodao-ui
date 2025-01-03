import asyncio
import os
import argparse
from markdown import markdown  # Python-Markdown for converting Markdown to HTML
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle

from general_info import app as general_info_app
from team_info import app as team_info_app
from red_flags import app as red_flags_app
from green_flags import app as green_flags_app
from financial_review_agent import app as financial_review_app
from relevant_links import app as relevant_links_app

def format_id(project_name):
    """
    Generates a deterministic ID by formatting the project name (e.g., replacing spaces with underscores).
    """
    return project_name.strip().replace(" ", "_").lower()


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


async def run_agent_and_get_final_output_async(app, input_data, final_key, output_file):
    """
    Runs a single LangGraph agent asynchronously, checks for an existing file, and extracts the final output.
    """
    if os.path.exists(output_file):
        print(f"File '{output_file}' already exists. Reading content from the file.")
        with open(output_file, "r", encoding="utf-8") as f:
            return f.read()

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

            with open(output_file, "w", encoding="utf-8") as f:
                f.write(final_state)
            return final_state

    raise ValueError(f"Final output key '{final_key}' not found in the agent's events.")


async def main_controller_async(project_details):
    """
    Runs parallel tasks, checks for existing files, and generates a PDF report from Markdown.
    """
    id = project_details["project_id"]
    crowdfunding_link = project_details["crowdfunding_link"]
    website_url = project_details["website_url"]
    latest_sec_filing_link = project_details["latest_sec_filing_link"]
    additional_links = project_details["additional_links"]

    reports_dir = f"{id}.reports"

    if not os.path.exists(reports_dir):
        os.makedirs(reports_dir)
        print(f"Directory '{reports_dir}' created.")
    else:
        print(f"Directory '{reports_dir}' already exists.")

    input_data = {
        "general_info": {
            "id": id,
            "messages": [("user", "Please gather the project's general info.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": os.path.join(reports_dir, "general_info.md"),
        },
        "team_info": {
            "id": id,
            "messages": [("user", crowdfunding_link)],
            "output_file": os.path.join(reports_dir, "team_info.md"),
        },
        "red_flags": {
            "id": id,
            "messages": [("user", "Scrape and analyze red flags.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": os.path.join(reports_dir, "red_flags.md"),
        },
        "green_flags": {
            "id": id,
            "messages": [("user", "Scrape and analyze green flags.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": os.path.join(reports_dir, "green_flags.md"),
        },
        "financial_review": {
            "id": id,
            "messages": [("user", latest_sec_filing_link)],
            "url_to_scrape": latest_sec_filing_link,
            "additional_links": [crowdfunding_link, website_url] + additional_links,
            "output_file": os.path.join(reports_dir, "financial_review.md"),
        },
        "relevant_links": {
            "id": id,
            "messages": [("user", "Find more links about this startup.")],
            "crowdfunded_url": crowdfunding_link,
            "output_file": os.path.join(reports_dir, "relevant_links.md"),
        },
    }

    parallel_tasks = [
        run_agent_and_get_final_output_async(
            general_info_app, input_data["general_info"], "projectGeneralInfo", input_data["general_info"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            team_info_app, input_data["team_info"], "teamInfo", input_data["team_info"]["output_file"]
        ),
        run_agent_and_get_final_output_async(
            financial_review_app, input_data["financial_review"], "finalFinancialReport", input_data["financial_review"]["output_file"]
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

    parallel_results = await asyncio.gather(*parallel_tasks)
    filtered_results = [item for item in parallel_results if item]

    # Markdown content generation
    markdown_content = f"# Project Report: {project_details['project_name']}\n\n"
    for section_title, content in zip(input_data.keys(), filtered_results):
        markdown_content += f"## {section_title.replace('_', ' ').capitalize()}\n\n{content}\n\n"

    # Convert Markdown to HTML
    html_content = markdown(markdown_content)

    # Replace <br> with <br/> for compatibility
    html_content = html_content.replace("<br>", "<br/>")

    # Generate PDF
    pdf_path = os.path.join(reports_dir, f"{id}_report.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)

    styles = getSampleStyleSheet()
    body_style = ParagraphStyle("Body", parent=styles["BodyText"], fontSize=10, leading=12)

    elements = []

    # Add content to PDF
    elements.append(Paragraph(html_content, body_style))
    doc.build(elements)

    print(f"Unified Report PDF Generated at: {pdf_path}")

if __name__ == "__main__":
    project_details = parse_arguments()
    asyncio.run(main_controller_async(project_details))