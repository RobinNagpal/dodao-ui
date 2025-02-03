import json
import traceback
from typing import List

from langchain_core.messages import HumanMessage

from cf_analysis_agent.agent_state import ProcessingStatus, ProcessedProjectInfo
from cf_analysis_agent.structures.form_c_structures import StructuredFormCResponse
from cf_analysis_agent.utils.llm_utils import structured_llm_response, MINI_4_0_CONFIG, \
    scrape_and_clean_content_with_same_details, get_llm, NORMAL_4_0_CONFIG
from cf_analysis_agent.utils.project_utils import scrape_urls
from cf_analysis_agent.utils.report_utils import get_project_status_file_path, ProcessedProjectInfoSchema, \
    ProjectStatusFileSchema, ProjectInfoInputSchema
from cf_analysis_agent.utils.s3_utils import s3_client, BUCKET_NAME, upload_to_s3


def get_sec_json_content(raw_content: str) -> StructuredFormCResponse:
    """
    Convert the raw SEC content to JSON format.
    """
    prompt = """Parse the following Form C document and return it in a structured JSON format based on the provided schema. Ensure that:

    * All fields are extracted correctly.
    * Numerical values are formatted as numbers, and missing values are set to null.
    * Lists are properly structured.
    * The structured output adheres to the schema.
    
    {
      "filing_status": "LIVE",
      "issuer": {
        "name": "Qnetic Corporation",
        "form": "Corporation",
        "jurisdiction": "DELAWARE",
        "incorporation_date": "09-20-2022",
        "physical_address": {
          "address_1": "276 5th Avenue",
          "address_2": "Suite 704 - 3137",
          "city": "New York",
          "state_country": "NEW YORK",
          "postal_code": "10001"
        },
        "website": "http://www.qnetic.energy",
        "is_co_issuer": true,
        "co_issuer": "Qnetic II, a series of Wefunder SPV, LLC"
      },
      "co_issuer": {
        "name": "Qnetic II, a series of Wefunder SPV, LLC",
        "form": "Limited Liability Company",
        "jurisdiction": "DELAWARE",
        "incorporation_date": "10-11-2024",
        "physical_address": {
          "address_1": "4104 24TH ST",
          "address_2": "PMB 8113",
          "city": "San Francisco",
          "state_country": "CALIFORNIA",
          "postal_code": "94114"
        },
        "website": "https://wefunder.com/"
      },
      "offering": {
        "intermediary_name": "Wefunder Portal LLC",
        "intermediary_cik": "0001670254",
        "commission_file_number": "007-00033",
        "crd_number": "283503",
        "compensation": "7.0% of the offering amount upon a successful fundraise...",
        "intermediary_interest": "No",
        "security_type": "Other",
        "security_specification": "Simple Agreement for Future Equity (SAFE)",
        "target_number_of_securities": 50000,
        "price_per_security": 1.00000,
        "price_determination_method": "Pro-rated portion of total principal value...",
        "target_offering_amount": 50000.00,
        "max_offering_amount": 618000.00,
        "oversubscriptions_accepted": true,
        "oversubscription_allocation": "As determined by the issuer",
        "deadline": "04-30-2025"
      },
      "financials": {
        "total_assets": {
          "most_recent": 1374533.00,
          "prior": 63476.00
        },
        "cash_and_equivalents": {
          "most_recent": 1254186.00,
          "prior": 60390.00
        },
        "accounts_receivable": {
          "most_recent": 0.00,
          "prior": 0.00
        },
        "short_term_debt": {
          "most_recent": 248047.00,
          "prior": 91065.00
        },
        "long_term_debt": {
          "most_recent": 1862592.00,
          "prior": 137974.00
        },
        "revenue": {
          "most_recent": 0.00,
          "prior": 0.00
        },
        "cost_of_goods_sold": {
          "most_recent": 0.00,
          "prior": 0.00
        },
        "taxes_paid": {
          "most_recent": 11634.00,
          "prior": 10361.00
        },
        "net_income": {
          "most_recent": -807523.00,
          "prior": -158546.00
        }
      },
      "jurisdictions_offered": [
        "ALABAMA", "ALASKA", "ARIZONA", "ARKANSAS", "CALIFORNIA", "COLORADO", 
        "CONNECTICUT", "DELAWARE", "DISTRICT OF COLUMBIA", "FLORIDA", "GEORGIA",
        "HAWAII", "IDAHO", "ILLINOIS", "INDIANA", "IOWA", "KANSAS", "KENTUCKY",
        "LOUISIANA", "MAINE", "MARYLAND", "MASSACHUSETTS", "MICHIGAN", "MINNESOTA",
        "MISSISSIPPI", "MISSOURI", "MONTANA", "NEBRASKA", "NEVADA", "NEW HAMPSHIRE",
        "NEW JERSEY", "NEW MEXICO", "NEW YORK", "NORTH CAROLINA", "NORTH DAKOTA",
        "OHIO", "OKLAHOMA", "OREGON", "PENNSYLVANIA", "RHODE ISLAND", "SOUTH CAROLINA",
        "SOUTH DAKOTA", "TENNESSEE", "TEXAS", "UTAH", "VERMONT", "VIRGINIA",
        "WASHINGTON", "WEST VIRGINIA", "WISCONSIN", "WYOMING"
      ],
      "signatures": [
        {
          "name": "Michael Pratt",
          "title": "Founder, CEO",
          "date": "10-16-2024"
        },
        {
          "name": "Loic Bastard",
          "title": "Founder, CTO",
          "date": "10-16-2024"
        }
      ]
    }
    
    
    SEC Content:
    """ + raw_content
    structured_llm = get_llm(NORMAL_4_0_CONFIG).with_structured_output(StructuredFormCResponse)
    response = structured_llm.invoke([HumanMessage(content=prompt)])
    return response

def get_markdown_content_from_json(json_content: str) -> str:
    prompt = f"""Convert the following JSON content into a tables in markdown format. 
    
    Ensure that the markdown content is well-structured and easy to read.

    {json_content}
    """
    
    llm = get_llm(NORMAL_4_0_CONFIG)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()        

def convert_s3_processed_info_to_state(project_info_in_s3: ProcessedProjectInfoSchema) -> ProcessedProjectInfo:
    processed_info: ProcessedProjectInfo = {
        "additional_urls_used": project_info_in_s3.get("additionalUrlsUsed"),
        "content_of_additional_urls": project_info_in_s3.get("contentOfAdditionalUrls"),
        "content_of_crowdfunding_url": project_info_in_s3.get("contentOfCrowdfundingUrl"),
        "content_of_website_url": project_info_in_s3.get("contentOfWebsiteUrl"),
        "sec_raw_content": project_info_in_s3.get("secRawContent"),
        "sec_json_content": project_info_in_s3.get("secJsonContent"),
        "sec_markdown_content": project_info_in_s3.get("secMarkdownContent"),
        "last_updated": project_info_in_s3.get("lastUpdated"),
        "status": project_info_in_s3.get("status"),
    }
    return processed_info


def scrape_additional_links_and_update_project_info(
        project_info: ProcessedProjectInfoSchema) -> ProcessedProjectInfoSchema:
    """
    Scrape the URLs in 'project_info' and update the 'processed_project_info' with the scraped content.
    """
    print(
        f"Scraping URLs and updating 'processed_project_info' in S3 for project: {project_info.get('urlsUsedForScraping')}")
    current_urls = project_info.get("additionalUrlsUsed") or []
    scraped_content_list: List[str] = []
    if current_urls:
        scraped_content_list = scrape_urls(current_urls)

    # Combine the general scraped content
    if len(current_urls) > 0:
        combined_scrapped_content = "\n\n".join(scraped_content_list)

        prompt = "Remove the duplicates from the below content, but don't remove any information. Be as detailed as possible. Don't remove any information at all \n\n" + combined_scrapped_content
        content_of_scrapped_urls = structured_llm_response(MINI_4_0_CONFIG, "summarize_scraped_content", prompt)

        project_info["additionalUrlsUsed"] = current_urls
        project_info["contentOfAdditionalUrls"] = content_of_scrapped_urls
    return project_info


def ensure_processed_project_info(project_id: str) -> ProcessedProjectInfo:
    """
    Ensures that 'processed_project_info' is present in agent-status.json in S3.
    This function checks if the URLs have changed. If they haven't and 'processed_project_info'
    exists, it does nothing. If they have changed (or don't exist), it scrapes the URLs again,
    then updates and uploads the new content back to S3.

    Returns the updated 'processed_project_info' from the status file.
    """
    # ----------------------- 1) Download agent-status.json -----------------------
    agent_status_file_path = get_project_status_file_path(project_id)

    try:
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=f"crowd-fund-analysis/{agent_status_file_path}")
        project_file_contents: ProjectStatusFileSchema = json.loads(response['Body'].read().decode('utf-8'))
    except s3_client.exceptions.NoSuchKey:
        print(traceback.format_exc())
        raise FileNotFoundError(
            f"agent-status.json not found in S3 at path: s3://{BUCKET_NAME}/crowd-fund-analysis/{agent_status_file_path}"
        )

    # ----------------------- 2) Gather the current URLs -------------------------
    project_input: ProjectInfoInputSchema = project_file_contents.get("projectInfoInput", {})
    sec_filing_url = project_input.get("secFilingUrl", "").strip()
    additional_urls = project_input.get("additionalUrls", [])

    # Combine all project-related URLs (except the SEC link, which we'll handle separately if needed)
    current_urls = []
    if additional_urls:
        current_urls.extend(additional_urls)

    # Sort for stable comparison
    current_urls_sorted = sorted(set(current_urls))

    project_info_in_s3: ProcessedProjectInfoSchema = project_file_contents.get("processedProjectInfo", {})
    previous_urls = project_info_in_s3.get("additionalUrlsUsed") or []

    # Also sort for stable comparison
    previous_urls_sorted = sorted(set(previous_urls))

    urls_changed = (current_urls_sorted != previous_urls_sorted)
    print(f"URLs Changed: {urls_changed}")
    needs_processing = (project_info_in_s3 is None
                        or urls_changed
                        or project_info_in_s3.get("status") != ProcessingStatus.COMPLETED
                        or project_info_in_s3.get("contentOfAdditionalUrls") is None
                        or project_info_in_s3.get("contentOfAdditionalUrls") == ""
                        or project_info_in_s3.get("contentOfCrowdfundingUrl") is None
                        or project_info_in_s3.get("contentOfCrowdfundingUrl") == ""
                        or project_info_in_s3.get("secRawContent") is None
                        or project_info_in_s3.get("secRawContent") == ""
                        or project_info_in_s3.get("secJsonContent") is None
                        or project_info_in_s3.get("secJsonContent") == ""
                        or project_info_in_s3.get("secMarkdownContent") is None
                        or project_info_in_s3.get("secMarkdownContent") == ""
                        )

    print(f"Project Info Needs Processing: {needs_processing}")
    if not needs_processing:
        print("Project Info is up-to-date. No need to re-scrape project URLs.")
        return convert_s3_processed_info_to_state(project_info_in_s3)

    if (urls_changed
            or project_info_in_s3.get("status") != ProcessingStatus.COMPLETED
            or project_info_in_s3.get("contentOfAdditionalUrls") is None
            or project_info_in_s3.get("contentOfAdditionalUrls") == ""):
        print("URLs have changed or 'processed_project_info' is incomplete. Re-scraping URLs.")
        project_info_in_s3 = scrape_additional_links_and_update_project_info(project_info_in_s3)

    if project_info_in_s3.get("secRawContent") is None or project_info_in_s3.get("secRawContent") == "":
        print("SEC Raw Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["secRawContent"] = scrape_and_clean_content_with_same_details(sec_filing_url)

    if project_info_in_s3.get("secJsonContent") is None or project_info_in_s3.get("secJsonContent") == "":
        print("SEC JSON Content is missing. Generating JSON from SEC Filing.")
        json_data = get_sec_json_content(project_info_in_s3["secRawContent"])
        print(json_data.model_dump_json(indent=4))
        project_info_in_s3["secJsonContent"] = json_data.model_dump_json(indent=4)

    if project_info_in_s3.get("secMarkdownContent") is None or project_info_in_s3.get("secMarkdownContent") == "":
        print("SEC Markdown Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["secMarkdownContent"] = get_markdown_content_from_json(project_info_in_s3["secJsonContent"])

    if project_info_in_s3.get("contentOfCrowdfundingUrl") is None or project_info_in_s3.get(
            "contentOfCrowdfundingUrl") == "":
        print("SEC Raw Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["contentOfCrowdfundingUrl"] = scrape_and_clean_content_with_same_details(
            project_input.get("crowdFundingUrl"))

    if project_info_in_s3.get("contentOfWebsiteUrl") is None or project_info_in_s3.get("contentOfWebsiteUrl") == "":
        print("SEC Raw Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["contentOfWebsiteUrl"] = scrape_and_clean_content_with_same_details(
            project_input.get("websiteUrl"))

    project_file_contents["processedProjectInfo"] = project_info_in_s3

    upload_to_s3(
        content=json.dumps(project_file_contents, indent=4),
        s3_key=f"{project_id}/agent-status.json",
        content_type="application/json"
    )
    print(
        f"Updated 'processed_project_info' uploaded to https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/crowd-fund-analysis/{agent_status_file_path}")

    return convert_s3_processed_info_to_state(project_info_in_s3)
