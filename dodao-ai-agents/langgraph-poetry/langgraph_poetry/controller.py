from red_flags import app as agent_one_app  # Import the first agent's LangGraph app
from green_flags import app as agent_two_app  # Import the second agent's LangGraph app

def run_agent_once(app, input_data):
    """
    Runs a single LangGraph agent with unique input and collects its final output.
    """
    config = {"configurable": {"thread_id": "1"}}  # Shared configuration
    events = app.stream(input_data, config, stream_mode="values")
    results = []
    for event in events:
        results.append(event["messages"][-1].content)
    return results

def main_controller():
    """
    Ensures agents run only once and merges their outputs into a unified report.
    """
    # Distinct input data for each agent
    input_agent_one = {
        "messages": [("user", "Scrape and analyze red flags.")],  # Task-specific input
        "projectUrls": [
            "https://wefunder.com/neighborhoodsun",
            "https://neighborhoodsun.solar/"
        ]
    }

    input_agent_two = {
        "messages": [("user", "Scrape and analyze green flags.")],  # Task-specific input
        "projectUrls": [
            "https://wefunder.com/neighborhoodsun",
            "https://neighborhoodsun.solar/"
        ]
    }

    # Run agents once with their respective tasks
    agent_one_results = run_agent_once(agent_one_app, input_agent_one)
    agent_two_results = run_agent_once(agent_two_app, input_agent_two)

    # Merge the results
    merged_results = {
        "red_flags_report": agent_one_results,
        "green_flags_report": agent_two_results
    }

    # Create a unified report
    unified_report = (
        f"Red Flags Report:\n{merged_results['red_flags_report']}\n\n"
        f"Green Flags Report:\n{merged_results['green_flags_report']}\n"
    )

    # Save the report
    with open("unified_report.md", "w", encoding="utf-8") as f:
        f.write(unified_report)

    print("Unified Report Generated:\n", unified_report)

# Execute the main function
if __name__ == "__main__":
    main_controller()
