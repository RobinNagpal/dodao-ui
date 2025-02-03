import traceback
from langchain_core.messages import HumanMessage
import json
from cf_analysis_agent.utils.s3_utils import upload_to_s3
from cf_analysis_agent.agent_state import AgentState
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, get_combined_reports_from_s3, update_report_status_failed, \
    update_report_status_in_progress

REPORT_NAME = "finalReport"

def generate_project_info_report(state: AgentState, combined_reports: str):
    """
    Generate a structured evaluation report for a startup based on AI analysis.
    """
    prompt = (
        f"""You are an expert startup evaluator. Your task is to analyze the given startup reports and **score the startup on five categories**, using a **binary scoring system (0 or 1)** for five predefined sub-points in each category.
        ### **Scoring Rules**
        - Each **category has 5 predefined sub-points**.
        - Each **sub-point is scored as either 0 or 1** (no half points).
        - **Provide reasoning** for each sub-point score.
        - **Return JSON format as instructed**.

        ---
        """
        f"\n\n### Startup Reports\n{combined_reports}\n\n---\n\n"
        """
        ### **Evaluation Categories & Sub-Points**

        #### **1. Product Innovation**
        1. **Novelty** → Is the product fundamentally innovative compared to existing solutions?
        2. **Scalability** → Can the product scale effectively to serve a large market?
        3. **Competitive Edge** → Does the product have a strong competitive advantage?
        4. **Feasibility & Execution** → Is the technology feasible and has a working prototype?
        5. **Intellectual Property (IP) Protection** → Are patents or trade secrets protecting innovation?

        #### **2. Market Opportunity**
        1. **Total Addressable Market (TAM)** → Is the market size large enough for significant growth?
        2. **Customer Interest** → Are there Letters of Intent (LOIs) or early adopters showing demand?
        3. **Regulatory & Compliance Risks** → Are there significant legal or regulatory challenges?
        4. **Market Growth Rate** → Is the market expanding at a favorable rate?
        5. **Competitive Landscape** → Does the startup have room to operate despite competitors?

        #### **3. Team Strength**
        1. **Industry Experience** → Do key team members have relevant experience in this industry?
        2. **Diversity of Skills** → Does the team have a balance of technical, business, and marketing expertise?
        3. **Advisory Board & Investors** → Are there strong advisors, mentors, or investors supporting the startup?
        4. **Previous Success** → Have the founders or team members built successful startups before?
        5. **Leadership & Execution Capability** → Is there evidence of strong leadership and execution ability?

        #### **4. Financial Health**
        1. **Funding Secured** → Has the startup successfully raised capital from reputable investors?
        2. **Revenue Generation** → Is the company generating revenue, or is it still pre-revenue?
        3. **Cash Runway** → Does the company have enough cash to operate for at least 6-12 months?
        4. **Debt vs. Assets** → Is the company financially stable, or does it have excessive liabilities?
        5. **Financial Growth Potential** → Is there a clear path to profitability within a reasonable timeframe?

        #### **5. Business Model & Revenue Strategy**
        1. **Revenue Model Clarity** → Is there a clear and viable revenue model?
        2. **Recurring Revenue** → Does the startup have recurring revenue (SaaS, subscriptions, etc.)?
        3. **Go-To-Market Strategy** → Is there a well-defined customer acquisition plan?
        4. **Profitability Potential** → Can the business scale profitably in the long run?
        5. **Strategic Partnerships** → Are there partnerships that strengthen the business model?

        ---

        ### **Return JSON Format**
        Respond **ONLY** with a JSON object in this **exact format** without any text before or after:
        {
            "productInnovation": [
                { "comment": "The startup has a unique technology with patents.", "score": 1 },
                { "comment": "The product is scalable for large markets.", "score": 1 },
                { "comment": "Lacks strong differentiation from competitors.", "score": 0 },
                { "comment": "Technology feasibility is well-proven with a working prototype.", "score": 1 },
                { "comment": "No clear IP protection strategy.", "score": 0 }
            ],
            "marketOpportunity": [
                { "comment": "Large total addressable market exists.", "score": 1 },
                { "comment": "Has secured multiple customer LOIs.", "score": 1 },
                { "comment": "No regulatory concerns affecting expansion.", "score": 1 },
                { "comment": "Market growth rate is favorable.", "score": 1 },
                { "comment": "Highly competitive market, hard to stand out.", "score": 0 }
            ],
            "teamStrength": [
                { "comment": "CEO has over 10 years of experience in the sector.", "score": 1 },
                { "comment": "Lacks strong technical expertise outside of founding team.", "score": 0 },
                { "comment": "Backed by experienced advisors.", "score": 1 },
                { "comment": "Founders have successfully exited past startups.", "score": 1 },
                { "comment": "Leadership has demonstrated strong execution ability.", "score": 1 }
            ],
            "financialHealth": [
                { "comment": "Secured $2M in funding from top VCs.", "score": 1 },
                { "comment": "No revenue generated yet, still pre-revenue.", "score": 0 },
                { "comment": "Short cash runway of less than 3 months.", "score": 0 },
                { "comment": "Debt-to-assets ratio is concerning.", "score": 0 },
                { "comment": "Customer LOIs indicate potential revenue soon.", "score": 1 }
            ],
            "businessModel": [
                { "comment": "Clear revenue model with B2B energy storage sales.", "score": 1 },
                { "comment": "No recurring revenue streams like SaaS.", "score": 0 },
                { "comment": "Weak customer acquisition strategy.", "score": 0 },
                { "comment": "Strong potential for profitability in 5 years.", "score": 1 },
                { "comment": "Has partnerships with renewable energy firms.", "score": 1 }
            ]
        }
        """
    )
    
    llm = get_llm(state.get("config"))

    try:
        response = llm.invoke([HumanMessage(content=prompt)])
        raw_response = response.content.strip()
        print(f'raw response: {raw_response}')
        # Ensure JSON validity
        evaluation_data = json.loads(raw_response)

        return evaluation_data  # Returning JSON object instead of raw string

    except json.JSONDecodeError as e:
        print(f"JSON decoding error: {e}")
        return {"error": "Invalid JSON response from LLM"}

    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"error": "An unexpected error occurred"}

def create_final_report_test(state: AgentState) -> None:
    print("Generating final report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, REPORT_NAME)
        combined_reports = get_combined_reports_from_s3(project_id)
        report_content = generate_project_info_report(state, combined_reports)
        upload_to_s3(
            content=json.dumps(report_content, indent=4),
            s3_key=f"{project_id}/spider-graph.json",
            content_type="application/json"
        )
        # create_report_file_and_upload_to_s3(project_id, REPORT_NAME, report_content)
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
