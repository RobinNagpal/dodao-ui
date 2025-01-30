import asyncio
import argparse
from agent import graph as parent_graph

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
    Replaces manual report execution with parent graph invocation.
    """
    report_type = project_details["report_type"]

    if report_type:
        # Run a single report
        await parent_graph.invoke({
            "report": report_type,  
            **project_details
        })
    else:
        # Run all reports
        await parent_graph.invoke({
            "report": "all",  
            **project_details
        })


if __name__ == "__main__":
    project_details = parse_arguments()
    asyncio.run(main_controller_async(project_details))
