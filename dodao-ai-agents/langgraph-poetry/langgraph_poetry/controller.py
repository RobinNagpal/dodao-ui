import asyncio
from general_info import app as general_info_app  # General Info agent's LangGraph app
from team_info import app as team_info_app  # Team Info agent's LangGraph app
from red_flags import app as red_flags_app  # Red Flags agent's LangGraph app
from green_flags import app as green_flags_app  # Green Flags agent's LangGraph app
from financial_review_agent import app as financial_review_app  # Financial Review agent's LangGraph app
from relevant_links import app as relevant_links_app  # Relevant Links agent's LangGraph app


async def run_agent_and_get_final_output_async(app, input_data, final_key):
    """
    Runs a single LangGraph agent asynchronously and extracts the final output from the state.

    Args:
        app: The LangGraph app to run.
        input_data: The input data for the agent.
        final_key: The state key to extract the final output from.

    Returns:
        The final output stored in the specified state key.
    """
    config = {"configurable": {"thread_id": "1"}}  # Shared configuration

    def fetch_events():
        return list(app.stream(input_data, config, stream_mode="values"))

    # Run the blocking event fetch in a thread for compatibility with asyncio
    events = await asyncio.to_thread(fetch_events)

    # Process events to find the desired output
    for event in events:
        final_state = event.get(final_key, None)  # Directly fetch the final output using the key
        if final_state is not None:
            return final_state

    raise ValueError(f"Final output key '{final_key}' not found in the agent's events.")


async def main_controller_async():
    """
    Runs all agents in parallel and collects their final outputs.
    """
    # Input data for all agents
    input_data = {
        "general_info": {
            "messages": [("user", "Please gather the project's general info.")],
            "projectUrls": [
                "https://wefunder.com/neighborhoodsun",
                "https://neighborhoodsun.solar/"
            ]
        },
        "team_info": {
            "messages": [("user", "https://wefunder.com/neighborhoodsun")]
        },
        "red_flags": {
            "messages": [("user", "Scrape and analyze red flags.")],
            "projectUrls": [
                "https://wefunder.com/neighborhoodsun",
                "https://neighborhoodsun.solar/"
            ]
        },
        "green_flags": {
            "messages": [("user", "Scrape and analyze green flags.")],
            "projectUrls": [
                "https://wefunder.com/neighborhoodsun",
                "https://neighborhoodsun.solar/"
            ]
        },
        "financial_review": {
            "messages": [
                (
                    "user",
                    "https://www.sec.gov/Archives/edgar/data/1691595/000167025424000661/xslC_X01/primary_doc.xml"
                )
            ],
            "url_to_scrape": "https://www.sec.gov/Archives/edgar/data/1691595/000167025424000661/xslC_X01/primary_doc.xml",
            "additional_links": [
                "https://wefunder.com/neighborhoodsun",
                "https://neighborhoodsun.solar/",
            ],
            "scraped_content": {},
        },
        "relevant_links": {
            "messages": [("user", "Find more links about this startup.")],
            "crowdfunded_url": "https://wefunder.com/neighborhoodsun"
        }
    }

    # Map each agent to its corresponding input and key
    tasks = [
        # run_agent_and_get_final_output_async(
        #     financial_review_app, input_data["financial_review"], "finalFinancialReport"
        # ),
        run_agent_and_get_final_output_async(
            general_info_app, input_data["general_info"], "projectGeneralInfo"
        ),
        run_agent_and_get_final_output_async(
            team_info_app, input_data["team_info"], "teamInfo"
        ),
        run_agent_and_get_final_output_async(
            red_flags_app, input_data["red_flags"], "finalRedFlagsReport"
        ),
        run_agent_and_get_final_output_async(
            green_flags_app, input_data["green_flags"], "finalGreenFlagsReport"
        ),
        run_agent_and_get_final_output_async(
            relevant_links_app, input_data["relevant_links"], "relevantLinks"
        ),
    ]

    # Run all tasks concurrently
    results = await asyncio.gather(*tasks)

    # Generate the unified report
    unified_report = (
        f"\n{results[0]}\n\n"
        f"\n{results[1]}\n\n"
        f"\n{results[2]}\n\n"
        f"\n{results[3]}\n\n"
        f"\n{results[4]}\n\n"
        # f"Relevant Links:\n{results[5]}\n"
    )

    # Save the unified report
    with open("unified_report.md", "w", encoding="utf-8") as f:
        f.write(unified_report)

    print("Unified Report Generated:\n", unified_report)


if __name__ == "__main__":
    asyncio.run(main_controller_async())
