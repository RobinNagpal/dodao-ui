import traceback

from cf_analysis_agent.agent_state import AgentState, get_combined_content, ReportType
from cf_analysis_agent.structures.report_structures import StructuredReportResponse
from cf_analysis_agent.utils.llm_utils import structured_report_response
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress, update_report_with_structured_output


def generate_traction_report(state: AgentState) -> StructuredReportResponse:
    """
    Uses the LLM to evaluate traction gained by the startup:
      - If no traction is found, explicitly state that there is no traction.
      - If there is traction, indicate how strong it is, referencing
        the startup's industry and sector.
      - Explain how this conclusion was reached based on the provided content.
    """
    combined_content = get_combined_content(state)

    # Prompt to instruct the LLM to focus only on traction
    prompt = f"""
    You are an expert startup evaluator. You have the following information about a startup:
    {combined_content}

    **Task**:
    1. Determine if the startup has any traction (e.g., paying customers, active users, growth metrics, etc.).
    2. If there is no traction, explicitly state: "There is no traction."
    3. If there is traction:
       - Discuss how good or strong the traction is, taking into account the industry and sector in which this startup operates.
       - Provide a brief explanation of how these conclusions were derived from the content above.
    4. When assess its strength as Strong/Moderate/Weak relative to typical industry benchmarks for their sector. Consider:
         * User/customer growth rate
         * Revenue/profit trends
         * Key partnerships or distribution channels secured
         * Product development stage (MVP, beta, launched)
         * Evidence of market validation (pilots, LOIs, testimonials)
    5. The report should be detailed and focus *only* on traction. Do not include information unrelated to traction.

    Return your final traction analysis *only*.
    
    Make sure the output is formatted nicely in markdown and doesn't have many nested points. Use longer sentences and
    paragraphs instead of second and third level bullet points.
    """

    return structured_report_response(
        state.get("config"),
        "detailed_traction_report",
        prompt
    )

def create_traction_report(state: AgentState) -> None:
    print("Generating traction report")
    project_id = state.get("project_info").get("project_id")
    triggered_by = state.get("triggered_by")
    try:
        update_report_status_in_progress(project_id, ReportType.TRACTION, triggered_by)
        report_output = generate_traction_report(state)
        update_report_with_structured_output(project_id, ReportType.TRACTION, report_output)
    except Exception as e:
        # Capture full stack trace
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.TRACTION,
            error_message=error_message
        )
