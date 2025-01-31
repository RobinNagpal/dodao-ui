import asyncio
import argparse
from agent import graph as parent_graph
from cf_analysis_agent.agent_state import AgentState, ProjectInfo
from cf_analysis_agent.utils.project_utils import scrape_urls


def parse_arguments() -> AgentState:
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
    report_type = args.report_type.strip().strip('"') if args.report_type else "all"
    model = args.model.strip().strip('"') if args.model else None

    project_id = project_name.replace(" ", "_").lower()

    project_info: ProjectInfo = {
        "project_name": project_name,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links,
        "project_id": project_id,
    }
    scraped_urls = scrape_urls(list([crowdfunding_link, website_url]))
    combined_content = "\n\n".join(scraped_urls)
    return {
        "messages": [],
        "project_info": project_info,
        "report_input": report_type,
        "config": {
            "configurable": {
                "model": model
            }
        },
        "reports_to_generate": None,
        "processed_project_info": {
            "combined_scrapped_content": combined_content
        },
        "general_info_report": None
    }



async def main_controller_async(agent_state: AgentState):
    """
    Replaces manual report execution with parent graph invocation.
    """
    await parent_graph.ainvoke(agent_state)


if __name__ == "__main__":
    initialState = parse_arguments()
    asyncio.run(main_controller_async(initialState))
