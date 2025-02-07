import traceback

from cf_analysis_agent.agent_state import AgentState, get_combined_content, ReportType
from cf_analysis_agent.structures.report_structures import StructuredReportResponse
from cf_analysis_agent.utils.llm_utils import structured_report_response
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress, update_report_with_structured_output


def generate_execution_and_speed_report(state: AgentState) -> StructuredReportResponse:
    """
    Analyzes the company's execution speed and milestone achievement:
      - Key milestone tracking and timeline analysis
      - Development velocity metrics
      - Team productivity benchmarks
      - Industry-specific pace comparisons
      - Bottleneck identification
    """
    combined_content = get_combined_content(state)

    prompt = f"""
    You are an operations analyst specializing in startup execution velocity assessment. Analyze the company's 
    execution speed and milestone achievement based on their reports and industry benchmarks:

    {combined_content}

    **Execution & Speed Report Requirements**:

    1. **Execution Timeline Overview**:
       - Key milestones achieved with dates (product launches, funding rounds, partnerships)
       - Time between major milestones compared to initial projections
       - Critical path analysis for core objectives
       - Pivot frequency and adaptation speed

    2. **Development Velocity**:
       - Feature rollout rate and update frequency
       - Product iteration cycle time analysis
       - Technical debt management impact on speed
       - Team output metrics (e.g., story points completed, PR velocity)

    3. **Time Efficiency Metrics**:
       - Average time per milestone category (development, regulatory, partnerships)
       - Bottleneck identification in execution processes
       - Acceleration patterns before/after funding rounds
       - Downtime/Setback analysis between milestones

    4. **Resource Utilization**:
       - Team size vs output efficiency ratio
       - Tooling/process effectiveness assessment
       - Outsourcing impact on execution speed
       - Meeting/communication overhead analysis

    5. **Industry Comparison**:
       - Sector-specific pace benchmarks (feature development, market entry)
       - Competitor milestone achievement timelines
       - Funding-to-execution efficiency ratios
       - Regulatory/compliance speed comparisons

    **Required Analysis**:
    - Identify execution accelerators and impediments
    - Highlight velocity trends over time
    - Compare actual vs projected timelines
    - Assess team responsiveness to market changes
    - Evaluate technical and operational scalability
    - Analyze risk management impact on pace

    **Format Requirements**:
    - Use markdown formatting with clear section headers
    - Include timeline visualizations using ASCII charts
    - Present industry comparisons in table format
    - Highlight critical path dependencies in bold
    - Maintain analytical tone with actionable insights
    - Include both quantitative metrics and qualitative assessments

    Return complete execution velocity analysis only.
    
    

    """

    return structured_report_response(
        state.get("config"),
        "detailed_execution_speed_report",
        prompt
    )


def create_execution_and_speed_report(state: AgentState) -> None:
    print("Generating execution and speed report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, ReportType.EXECUTION_AND_SPEED)
        report_output = generate_execution_and_speed_report(state)
        update_report_with_structured_output(project_id, ReportType.EXECUTION_AND_SPEED, report_output)
    except Exception as e:
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.EXECUTION_AND_SPEED,
            error_message=error_message
        )
