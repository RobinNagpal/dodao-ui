import asyncio
import argparse
from cf_analysis_agent.utils.report_utils import run_agent_and_get_final_output_async, open_pdf
from general_info import app as general_info_app
from team_info import app as team_info_app
from red_flags import app as red_flags_app
from green_flags import app as green_flags_app
from financial_review_agent import app as financial_review_app
from relevant_links import app as relevant_links_app

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
    parser.add_argument(
        "--model",
        help="Optional: Specify the model to use for regeneration (e.g., 'gpt-4o' or 'gpt-4o-mini').",
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
    model = args.model.strip().strip('"') if args.model else None

    project_id = project_name.replace(" ", "_").lower()

    return {
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links,
        "report_type": report_type,
        "project_id": project_id,
        "model": model
    }

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
    model = project_details["model"]

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
            "messages": [("user", f"Please gather the project's general info using {model}.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/general_info.md",
            "model": model
        },
        "team_info": {
            "id": id,
            "messages": [("user", crowdfunding_link)],
            "output_file": f"{id}/team_info.md",
            "model": model
        },
        "red_flags": {
            "id": id,
            "messages": [("user", f"Scrape and analyze red flags using {model}.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/red_flags.md",
            "model": model
        },
        "green_flags": {
            "id": id,
            "messages": [("user", f"Scrape and analyze green flags using {model}.")],
            "projectUrls": [crowdfunding_link, website_url],
            "output_file": f"{id}/green_flags.md",
            "model": model
        },
        "financial_review": {
            "id": id,
            "messages": [("user", latest_sec_filing_link)],
            "url_to_scrape": latest_sec_filing_link,
            "scraped_content": {},
            "additional_links": [crowdfunding_link, website_url] + additional_links,
            "output_file": f"{id}/financial_review.md",
            "model": model
        },
        "relevant_links": {
            "id": id,
            "messages": [("user", f"Find more links about this startup using {model}.")],
            "crowdfunded_url": crowdfunding_link,
            "output_file": f"{id}/relevant_links.md",
            "model": model
        },
    }

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
            app_map[key], input_data[key], final_key_map[key], input_data[key]["output_file"]
        )
        for key in input_data
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
