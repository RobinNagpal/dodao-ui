import traceback

from cf_analysis_agent.agent_state import AgentState, Config, ProcessedProjectInfo
from cf_analysis_agent.utils.llm_utils import structured_llm_response
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress

# move the scraping part to a common file 
# show project scraping url status at the top of the report

REPORT_NAME = "red_flags"

def find_industry_details(config: Config, combined_text: str):
    """
    Examines the combinedScrapedContent and extracts a summary of the startup's industry,
    storing it in state['extractedIndustryDetails'].
    """

    prompt = (
    "From the text below, extract any relevant details or discussion regarding the startup’s industry. "
    "Focus on the following aspects:\n"
    "1) An overview of the industry.\n"
    "2) Which countries or markets this industry is relevant to (if mentioned).\n"
    "3) Growth trends of this industry in the last 2 years.\n"
    "4) Projected or anticipated growth for the next 3 years.\n"
    "5) Potential or common challenges faced by other startups in this industry.\n"
    "6) Unique benefits or opportunities within this industry.\n"
    "7) Any additional important points or insights about the industry mentioned in the text.\n\n"
    f"{combined_text}\n\n"
    "Return only the textual summary of these industry details, as concise as possible but covering each requested item."
    )

    return structured_llm_response(config, "find_industry_details", prompt)

def find_startup_red_flags(config: Config, combined_text: str):
    """
    Uses the LLM to extract the startup's red flags from the combinedScrapedContent.
    Exclude purely team-related or purely financial details, focusing on aspects that
    genuinely raise concerns for investors (e.g., weak product viability, market barriers, etc.).
    """

    prompt = (
        "Using the information below, highlight the red flags of the startup. "
        "Include only information that might reduce investor confidence, such as issues with product viability, "
        "market adoption problems, legal risks, poor partnerships, negative customer feedback, unclear market size, "
        "or other significant concerns. Avoid mentioning purely financial or team-related details.\n\n"
        f"Scraped Content:\n{combined_text}\n\n"
        "Return a text describing the startup's red flags, focusing on specific negative or concerning issues."
    )
    return structured_llm_response(config, "find_startup_red_flags", prompt)


def find_industry_red_flags(config: Config, industry_details: str):
    """
    Finds the 10 most commonly recognized red flags in the startup's industry,
    based on the extracted industry details.
    """
    prompt = (
        "Given the following industry description, outline the 10 most commonly recognized red flags "
        "for startups in this industry. Provide a clear list of critical indicators of potential failure. "
        "Each red flag should briefly explain why it poses a significant risk.\n\n"
        f"Industry Info:\n{industry_details}\n\n"
    )
    return structured_llm_response(config, "find_industry_red_flags", prompt)


def evaluate_red_applicable_to_startup(config: Config, startup_rf: str, industry_rf: str):
    """
    Compares the startup's red flags to the 10 industry red flags.
    Only mention red flags that are actually applicable to the startup.
    """
    prompt = (
        "Below are two pieces of information:\n\n"
        "1) The startup's identified red flags:\n"
        f"{startup_rf}\n\n"
        "2) The 10 most critical industry-standard red flags:\n"
        f"{industry_rf}\n\n"
        "Evaluate the startup's red flags by comparing them to the industry-standard red flags, focusing only on "
        "the ones that actually apply. If the startup does not exhibit a specific industry red flag, omit it. "
        "Return a clear explanation of which red flags apply, how severely, and why."
    )
    return structured_llm_response(config, "evaluate_red_applicable_to_startup", prompt)


def finalize_red_flags_report(config: Config, startup_rf: str, industry_rf: str, rf_evaluation: str):
    """
    Produces the final textual report about the startup's red flags, 
    integrating industry standards and the evaluation.
    """
    prompt = (
        "You have three pieces of content:\n\n"
        "1) The startup's red flags:\n"
        f"{startup_rf}\n\n"
        "2) The top 10 industry-standard red flags:\n"
        f"{industry_rf}\n\n"
        "3) The evaluation of how the startup aligns with these industry standards:\n"
        f"{rf_evaluation}\n\n"
        "Now create a final, detailed report focusing ONLY on the startup's red flags, integrating the identified "
        "industry-standard red flags and the evaluation of the startup’s performance against them. "
        "If a particular parameter does not indicate an actual red flag, remove it from the report. "
        "Avoid repetition unless absolutely necessary. Return only the textual report."
    )

    return structured_llm_response(config, "finalize_red_flags_report", prompt)

def create_red_flags_report(state: AgentState) -> None:
    """
    Orchestrates the entire red flags analysis process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating red flags report")
    try:
        processes_project_info: ProcessedProjectInfo = state.get("processed_project_info")
        content_of_additional_urls = processes_project_info.get("content_of_additional_urls")
        content_of_crowdfunding_url = processes_project_info.get("content_of_crowdfunding_url")
        content_of_website_url = processes_project_info.get("content_of_website_url")

        main_content = f"{content_of_crowdfunding_url} \n\n {content_of_website_url} \n\n {content_of_additional_urls}"
        update_report_status_in_progress(project_id, REPORT_NAME)
        industry_details = find_industry_details(state.get("config"), main_content)
        startup_rfs = find_startup_red_flags(state.get("config"), main_content)
        industry_rfs = find_industry_red_flags(state.get("config"), industry_details)
        rf_evaluation = evaluate_red_applicable_to_startup(state.get("config"), startup_rfs, industry_rfs)
        final_red_flags_report = finalize_red_flags_report(state.get("config"), startup_rfs, industry_rfs, rf_evaluation)
        create_report_file_and_upload_to_s3(project_id, REPORT_NAME, final_red_flags_report)
    except Exception as e:
        # Capture full stack trace
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            REPORT_NAME,
            error_message=error_message
        )
