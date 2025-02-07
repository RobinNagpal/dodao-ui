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
        f"""You are an expert startup evaluator. Your task is to analyze the given startup data and **score the startup on given categories**, using a **binary scoring system (0 or 1)** for five predefined sub-points in each category.
        ### **Evaluation Rules**
        - Each category has 5 predefined sub-points.
        - Provide a one liner question based summary of the sub-points.
        - Each sub-point is scored as either 0 or 1 (no half points).
        - Provide reasoning as comment for each sub-point score.
        - From the given startup data, list down 0-3 points related to startup's significant achievements
        - From the given startup data, list down 0-3 points related to startup's potential risk factors which an investor needs to consider
        - Return JSON format as instructed.

        ---
        """
        f"\n\n### Startup Related Data\n{combined_reports}\n\n---\n\n"
        """
        ### **Evaluation Categories & Sub-Points**

        #### **1. Founder & Team Strength**
        1. **Industry Experience** - Do the Founders or key team members have relevant experience in this industry?
        2. **Diversity of Skills** - Does the team have a balance of technical, business, and marketing expertise?
        3. **Execution Capability** - Has the team demonstrated the ability to build and scale a business in the past?
        4. **Resilience & Adaptability** - Has the team pivoted successfully in response to market feedback?  
        5. **Network & Credibility** - Do the founders have strong industry connections, investor trust, or prior successful ventures?  

        ### **2. Traction**  
        1. **Revenue or User Growth** - Is there a demonstrated increase in revenue, users, or customers?  
        2. **Customer Retention** - Are users returning, and is there strong customer engagement?  
        3. **Market Validation** - Has the startup secured key partnerships, early adopters, or major clients?  
        4. **Product Adoption Rate** - Is the product gaining traction without excessive spending on customer acquisition?  
        5. **Positive Customer Feedback** - Are reviews, testimonials, and referrals strong?  

        ### **3. Market Opportunity**  
        1. **Total Addressable Market (TAM)** - Is the market size large and growing?  
        2. **Customer Pain Point & Urgency** - Does the startup solve a pressing, real problem?  
        3. **Competitive Landscape** - Can the startup stand out in the market against competitors?  
        4. **Scalability Potential** - Can the business model expand efficiently (e.g., geography, verticals, automation)?  
        5. **Regulatory & Industry Trends** - Are there favorable policies or trends supporting growth?  

        ### **4. Valuation**  
        1. **Realistic Pricing** - Is the valuation reasonable compared to industry benchmarks?  
        2. **Revenue Multiples & Growth Expectations** - Does the valuation align with financial performance and growth?  
        3. **Exit Potential** - Is there a clear path to acquisition or IPO?  
        4. **Investor Confidence** - Have reputable investors backed the company?  
        5. **Market Sentiment & Comparables** - Does the valuation align with similar companies in the space?  

        ### **5. Execution & Speed**  
        1. **Go-to-Market Strategy** - Is there a clear, effective strategy to acquire users/customers?  
        2. **Product Development Efficiency** - Has the company launched a working product with improvements over time?  
        3. **Operational Agility** - Can the company quickly adapt to market changes?  
        4. **Decision-Making Speed** - Does the leadership act decisively and effectively?  
        5. **Competitive Edge in Execution** - Is the startup outperforming competitors in execution?  

        #### **6. Financial Health**
        1. **Funding Secured** → Has the startup successfully raised capital from reputable investors?
        2. **Revenue vs. Burn Rate** - Is the company generating enough revenue compared to its expenses?
        3. **Fundraising & Cash Runway** - Does the company have sufficient capital for sustainable growth?
        4. **Unit Economics** - Are customer acquisition costs sustainable relative to lifetime value?  
        5. **Financial Growth Potential** - Is there a clear path to profitability within a reasonable timeframe?

        ---

        ### **Return JSON Format**
        Respond **ONLY** with a JSON object in this **exact format** without any text before or after:
        {
            "highlights": {
                "achievements": [
                    "Earnings grew by 148.4% over the past year.", 
                    "Secured a funding of $25 million from Y combinator.",
                    "Monthly active users grew 30% QoQ."
                    ],
                "risks": ["No potential risks."]
            },
            "evaluation": {
                "teamStrength": {
                    "subpointsSummary": "Does the team have the experience, skills, and credibility to build and scale the business?",
                    "subpointsScoring": [
                        { "comment": "CEO has over 10 years of experience in the sector.", "score": 1 },
                        { "comment": "Lacks strong technical expertise outside of founding team.", "score": 0 },
                        { "comment": "Founders have successfully exited past startups.", "score": 1 },
                        { "comment": "No significant change", "score": 0 },
                        { "comment": "Backed by senior advisors.", "score": 1 }
                    ]
                },
                "traction": {
                    "subpointsSummary": "Does the startup show strong user growth, retention, and market validation?",
                    "subpointsScoring": [
                    { "comment": "Monthly active users grew 30% QoQ.", "score": 1 },
                    { "comment": "Low user retention beyond first 3 months.", "score": 0 },
                    { "comment": "Secured partnership with a major industry player.", "score": 1 },
                    { "comment": "High acquisition cost with slow organic adoption.", "score": 0 },
                    { "comment": "Positive early customer reviews and referrals.", "score": 1 }
                    ]
                },
                "marketOpportunity": {
                    "subpointsSummary": "Is the market large, growing, and does the startup have a competitive edge?",
                    "subpointsScoring": [
                    { "comment": "Total addressable market estimated at $10B.", "score": 1 },
                    { "comment": "Addresses a real but non-urgent problem.", "score": 0 },
                    { "comment": "Moderate competition with some differentiation.", "score": 1 },
                    { "comment": "Business model allows for expansion to new markets.", "score": 1 },
                    { "comment": "Regulatory landscape remains uncertain.", "score": 0 }
                    ]
                },
                "valuation": {
                    "subpointsSummary": "Is the valuation reasonable and aligned with financial performance?",
                    "subpointsScoring": [
                    { "comment": "Valuation aligns with industry benchmarks.", "score": 1 },
                    { "comment": "High revenue growth but low profit margins.", "score": 0 },
                    { "comment": "Potential exit opportunities via acquisition.", "score": 1 },
                    { "comment": "Backed by well-known investors.", "score": 1 },
                    { "comment": "Market comparables suggest valuation may be slightly overvalued.", "score": 0 }
                    ]
                },
                "executionSpeed": {
                    "subpointsSummary": "Is the startup executing efficiently and outpacing competitors?",
                    "subpointsScoring": [
                    { "comment": "Strong go-to-market execution with rapid user acquisition.", "score": 1 },
                    { "comment": "Product has been delayed twice.", "score": 0 },
                    { "comment": "Leadership has pivoted efficiently in response to feedback.", "score": 1 },
                    { "comment": "Slow decision-making process at executive level.", "score": 0 },
                    { "comment": "Outperforming direct competitors in key markets.", "score": 1 }
                    ]
                },
                "financialHealth": {
                    "subpointsSummary": "Is the startup financially stable with a clear path to profitability?",
                    "subpointsScoring": [
                    { "comment": "Successfully raised $5M in Series A.", "score": 1 },
                    { "comment": "High burn rate with no clear path to break-even.", "score": 0 },
                    { "comment": "Sufficient runway for the next 18 months.", "score": 1 },
                    { "comment": "Customer acquisition costs remain high relative to LTV.", "score": 0 },
                    { "comment": "Revenue projections indicate profitability in 2 years.", "score": 1 }
                    ]
                }
            }
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
    triggered_by = state.get("triggered_by")
    try:
        update_report_status_in_progress(project_id, REPORT_NAME, triggered_by)
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
