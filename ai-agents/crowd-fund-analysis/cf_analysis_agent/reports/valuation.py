import traceback

from cf_analysis_agent.agent_state import AgentState, get_combined_content, ReportType
from cf_analysis_agent.structures.report_structures import StructuredReportResponse
from cf_analysis_agent.utils.llm_utils import structured_report_response
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress, update_report_with_structured_output


def generate_valuation_report(state: AgentState) -> StructuredReportResponse:
    """
    Uses the LLM to perform critical valuation analysis of the startup:
      - Detailed TAM, SAM, SOM analysis specific to the startup's sector
      - Traction validation with realistic numbers
      - Team evaluation and progress assessment
      - Critical analysis of startup's claims
    """
    combined_content = get_combined_content(state)

    # Prompt for comprehensive valuation analysis
    prompt = f"""
    You are an expert startup valuation analyst. Analyze that the valuation set by the company for the crowdfunding round is fair or not:
    
    When considering the valuation dont just consider the revenue, consider other things also like possible repeat rate, possible total 
    lifetime value, and consider the valuation of the company based on revenue and it can produce in the future and that revenue can be
    sustained in every year.
    
    {combined_content}

    **Valuation Report Requirements**:
    1. The valuation set by the company for the crowdfunding round.
    2. **Market Analysis**:
       - Calculate TAM (Total Addressable Market):
         * Use top-down analysis with latest sector-specific data
         * Clearly state assumptions and data sources
       - Calculate SAM (Serviceable Available Market):
         * Consider geographic, demographic, and product constraints
         * Bottom-up analysis using startup's actual capabilities
       - Calculate SOM (Serviceable Obtainable Market):
         * Realistic 3-5 year projection based on execution capabilities
         * Include market share analysis vs competitors

    2. **Startup Specifics**:
       - Traction Analysis:
         * Revenue/User growth rates (monthly/quarterly)
         * Customer acquisition costs vs lifetime value
         * Retention metrics and churn rates
         * Compare metrics to sector benchmarks
       - Progress Assessment:
         * Product development stage (prototype to scaling)
         * IP/technology advantages
         * Regulatory approvals/milestones achieved
    3. **Expected Valuation**:
         - Calculate yearly revenue based valuation using realistic revenue projections
         - If the yearly revenue is not available, consider the possible repeat rate, possible total lifetime value, and consider the
           valuation of the company based on revenue and it can produce in the future and that revenue can be sustained in every year.
         - Make a range from conservative to realistic valuation estimates
         - Explain in detail how you arrived at these estimates
    4. **Comparing Presented Valuation**:
       - Compare the valuation you calculated with the valuation set by the company in the crowdfunding round
       - Highlight any discrepancies or optimistic assumptions the company has made

    **Format Requirements**:
    - You can use small ranges for valuation estimates
    - Clearly explain calculation methodologies
    - Flag any unrealistic assumptions
    - Compare startup's metrics to sector benchmarks
    - Maintain skeptical but fair tone throughout

    Return final valuation analysis only.
    
    Make sure the output is formatted nicely in markdown and doesn't have many nested points. Use longer sentences and
    paragraphs instead of second and third level bullet points.
    """

    return structured_report_response(
        state.get("config"),
        "detailed_valuation_report",
        prompt
    )

def create_valuation_report(state: AgentState) -> None:
    print("Generating valuation report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, ReportType.VALUATION)
        report_output = generate_valuation_report(state)
        update_report_with_structured_output(project_id, ReportType.VALUATION, report_output)
    except Exception as e:
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.VALUATION,
            error_message=error_message
        )
