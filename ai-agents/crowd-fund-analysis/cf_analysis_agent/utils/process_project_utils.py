import json
import traceback
from typing import List

from langchain_core.messages import HumanMessage

from cf_analysis_agent.agent_state import ProcessingStatus, ProcessedProjectInfo, ProcessedSecInfo, Metric, \
    StartupMetrics, IndustryDetailsAndForecast
from cf_analysis_agent.structures.form_c_structures import StructuredFormCResponse
from cf_analysis_agent.structures.startup_metrics import StartupMetricsStructure, IndustryDetailsAndForecastStructure, \
    MetricStructure
from cf_analysis_agent.utils.llm_utils import structured_llm_response, MINI_4_0_CONFIG, \
    scrape_and_clean_content_with_same_details, get_llm, NORMAL_4_0_CONFIG
from cf_analysis_agent.utils.project_utils import scrape_urls
from cf_analysis_agent.utils.report_utils import get_project_status_file_path, ProcessedProjectInfoSchema, \
    ProjectStatusFileSchema, ProjectInfoInputSchema, ProcessedSecInfoSchema, ProcessedIndustryAndForecastsSchema, \
    ProcessesStartupMetricsSchema, MetricSchema
from cf_analysis_agent.utils.s3_utils import s3_client, BUCKET_NAME, upload_to_s3


def get_sec_structured_response(raw_content: str) -> StructuredFormCResponse:
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


def get_sec_info(sec_url: str) -> ProcessedSecInfoSchema:
    raw_content = scrape_and_clean_content_with_same_details(sec_url)
    json_data = get_sec_structured_response(raw_content)
    markdown_content = get_markdown_content_from_json(json_data.model_dump_json(indent=4))
    return {
        "secJsonContent": json_data.model_dump_json(indent=4),
        "secMarkdownContent": markdown_content,
        "secRawContent": raw_content,
    }


def get_project_industry_and_forecasts_info(project_text: str) -> IndustryDetailsAndForecastStructure:
    print("Getting project industry and forecasts info")
    prompt = """
    You are the expert in investing in startups and have been asked to provide a detailed analysis of the industry 
    and forecasts for the following project. When providing details of the industry, include the overall industry
    information and information about the specific sector the project is in. 
    
    Be as narrow as possible while choosing the sub-sector. Provide detailed how did you choose this sub-sector with
    the industry analysis.
    
    When providing forecasts, consider the growth rate of the sub-sector that matches the project.
    
    You have to be a critical thinker and provide detailed information about the Total addressable market, serviceable
    addressable market, and serviceable obtainable market.
    
    Make sure to consider only the relevant sub-sector while calculating the market sizes.
    
    Dont reply on the information shared in the project details. You have to provide the information based on your own knowledge.
    
    output the information in a structured format  and in the following JSON format: 
    { 
      "industry_details_and_forecast": "Your detailed analysis of the industry and forecasts for the project. Make sure it is as per the guidelines provided.",
      "total_addressable_market": "Total addressable market",
      "serviceable_addressable_market": "Serviceable addressable market",
      "serviceable_obtainable_market": "Serviceable obtainable market"
    }
    
    """ + project_text

    structured_llm = get_llm(NORMAL_4_0_CONFIG).with_structured_output(IndustryDetailsAndForecastStructure)

    response = structured_llm.invoke([HumanMessage(content=prompt)])
    print(response.model_dump_json(indent=4))
    return response


def get_startup_metrics_info(project_text: str) -> StartupMetricsStructure:
    print("Getting startup metrics info")
    prompt = """
    You are the expert in investing in startups and have been asked to provide a detailed analysis of the startup metrics
    for the following project. Some of these metrics might be mentioned in the project details, while others might need
    be derived from the information provided.
    
    If information is available mark the information_status as extracted. If you have derived then mark it as derived.
    
    It might be that some of the metrics are not applicable to the project, in which case you can mark them as 'not_applicable'.
    
    It might also be that there is no information available to be able to calculate them. In such cases, you can mark the information_status as 'missing'.
    
    Explain in detail how you have derived or calculated the metrics in the explanation field.
    
    Then as a startup evaluation expert, provide your opinion on the metrics whether they are good, okay, or bad compared to industry benchmarks.
    
    Explain in detail how industry benchmarks are calculated and what are the industry standards for these metrics. When
    considering the benchmarks, consider the sub-sector that matches the project.
    
    output the information in a structured format  and in the following JSON format:
    {
      growth_rate: {
        explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
        opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
        information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      organic_vs_paid_growth: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      virality: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      network_effect: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      customer_acquisition_cost: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      unit_economics: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      retention_rate: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      magic_moment: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      net_promoter_score: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      customer_lifetime_value: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      payback_period: {
          explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
          opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
          information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      revenue_growth: {
        explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
        opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
        information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      },
      churn_rate: {
        explanation: "Description of the metric, including the KPI and the startup's achieved number. If the information is extracted, derived, or missing explain detail how it was determined.",
        opinion: "Assessment of whether the number is good, okay, or bad compared to industry benchmarks, with detailed industry standards.",
        information_status: "Status indicating whether the information is missing, derived, or extracted or not_applicable."
      }
    }

    Startup Information:
    """ + project_text

    structured_llm = get_llm(NORMAL_4_0_CONFIG).with_structured_output(StartupMetricsStructure)

    response = structured_llm.invoke([HumanMessage(content=prompt)])
    print(response.model_dump_json(indent=4))
    return response


def get_markdown_content_from_json(json_content: str) -> str:
    prompt = f"""Convert the following JSON content into a tables in markdown format. 
    
    Ensure that the markdown content is well-structured and easy to read.

    {json_content}
    """

    llm = get_llm(NORMAL_4_0_CONFIG)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


def convert_metric_structure(metric: MetricStructure) -> MetricSchema:
    return {
        "explanation": metric.explanation,
        "opinion": metric.opinion,
        "informationStatus": metric.information_status
    }


def convert_s3_metrics(metrics_in_s3: MetricSchema) -> Metric:
    metric: Metric = {
        "explanation": metrics_in_s3.get("explanation"),
        "opinion": metrics_in_s3.get("opinion"),
        "information_status": metrics_in_s3.get("informationStatus"),
    }

    return metric


def convert_s3_processed_info_to_state(project_info_in_s3: ProcessedProjectInfoSchema) -> ProcessedProjectInfo:
    sec_info_in_s3: ProcessedSecInfoSchema = project_info_in_s3.get("secInfo")
    sec_info: ProcessedSecInfo = {
        "sec_json_content": sec_info_in_s3.get("secJsonContent"),
        "sec_markdown_content": sec_info_in_s3.get("secMarkdownContent"),
        "sec_raw_content": sec_info_in_s3.get("secRawContent"),
    }

    industry_details_in_s3: ProcessedIndustryAndForecastsSchema = project_info_in_s3.get("industryDetails")

    industry_details: IndustryDetailsAndForecast = {
        "industry_details_and_forecast": industry_details_in_s3.get("industryDetailsAndForecast"),
        "total_addressable_market": industry_details_in_s3.get("totalAddressableMarket"),
        "serviceable_addressable_market": industry_details_in_s3.get("serviceableAddressableMarket"),
        "serviceable_obtainable_market": industry_details_in_s3.get("serviceableObtainableMarket"),
    }

    startup_metrics_in_s3: ProcessesStartupMetricsSchema = project_info_in_s3.get("startupMetrics")

    startup_metrics: StartupMetrics = {
        "growth_rate": convert_s3_metrics(startup_metrics_in_s3.get("growthRate")),
        "organic_vs_paid_growth": convert_s3_metrics(startup_metrics_in_s3.get("organicVsPaidGrowth")),
        "virality": convert_s3_metrics(startup_metrics_in_s3.get("virality")),
        "network_effect": convert_s3_metrics(startup_metrics_in_s3.get("networkEffect")),
        "customer_acquisition_cost": convert_s3_metrics(startup_metrics_in_s3.get("customerAcquisitionCost")),
        "unit_economics": convert_s3_metrics(startup_metrics_in_s3.get("unitEconomics")),
        "retention_rate": convert_s3_metrics(startup_metrics_in_s3.get("retentionRate")),
        "magic_moment": convert_s3_metrics(startup_metrics_in_s3.get("magicMoment")),
        "net_promoter_score": convert_s3_metrics(startup_metrics_in_s3.get("netPromoterScore")),
        "customer_lifetime_value": convert_s3_metrics(startup_metrics_in_s3.get("customerLifetimeValue")),
        "payback_period": convert_s3_metrics(startup_metrics_in_s3.get("paybackPeriod")),
        "revenue_growth": convert_s3_metrics(startup_metrics_in_s3.get("revenueGrowth")),
        "churn_rate": convert_s3_metrics(startup_metrics_in_s3.get("churnRate")),
    }

    processed_info: ProcessedProjectInfo = {
        "additional_urls_used": project_info_in_s3.get("additionalUrlsUsed"),
        "content_of_additional_urls": project_info_in_s3.get("contentOfAdditionalUrls"),
        "content_of_crowdfunding_url": project_info_in_s3.get("contentOfCrowdfundingUrl"),
        "content_of_website_url": project_info_in_s3.get("contentOfWebsiteUrl"),
        "sec_info": sec_info,
        "industry_details": industry_details,

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
        f"Scraping URLs and updating 'processed_project_info' in S3 for project: {project_info.get('additionalUrlsUsed')}")
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
                        or project_info_in_s3.get("secInfo") is None
                        or project_info_in_s3.get("industryDetails") is None
                        or project_info_in_s3.get("startupMetrics") is None
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

    if project_info_in_s3.get("contentOfCrowdfundingUrl") is None or project_info_in_s3.get(
            "contentOfCrowdfundingUrl") == "":
        print("SEC Raw Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["contentOfCrowdfundingUrl"] = scrape_and_clean_content_with_same_details(
            project_input.get("crowdFundingUrl"))

    if project_info_in_s3.get("contentOfWebsiteUrl") is None or project_info_in_s3.get("contentOfWebsiteUrl") == "":
        print("SEC Raw Content is missing. Scraping SEC Filing URL.")
        project_info_in_s3["contentOfWebsiteUrl"] = scrape_and_clean_content_with_same_details(
            project_input.get("websiteUrl"))

    if project_info_in_s3.get("secInfo") is None or project_info_in_s3.get("secInfo").get(
            "secMarkdownContent") is None or project_info_in_s3.get("secInfo").get("secMarkdownContent") == "":
        print("SEC Info is missing. Scraping SEC Filing URL.")
        project_info_in_s3["secInfo"] = get_sec_info(sec_filing_url)

    combined_text = project_info_in_s3.get("contentOfCrowdfundingUrl") + project_info_in_s3.get(
        "contentOfWebsiteUrl") + project_info_in_s3.get("secInfo").get("secMarkdownContent")
    if project_info_in_s3.get("industryDetails") is None or project_info_in_s3.get("industryDetails").get(
            "industryDetailsAndForecast") is None:
        print("Industry Details are missing. Scraping Industry Details.")
        industry_and_forecast_structure = get_project_industry_and_forecasts_info(
            combined_text
        )
        project_info_in_s3["industryDetails"] = {
            "industryDetailsAndForecast": industry_and_forecast_structure.industry_details_and_forecast,
            "totalAddressableMarket": industry_and_forecast_structure.total_addressable_market,
            "serviceableAddressableMarket": industry_and_forecast_structure.serviceable_addressable_market,
            "serviceableObtainableMarket": industry_and_forecast_structure.serviceable_obtainable_market,
        }

    # or check any of the fields in none
    if project_info_in_s3.get("startupMetrics") is None or project_info_in_s3.get("startupMetrics").get(
            "growthRate") is None:
        print("Startup Metrics are missing. Scraping Startup Metrics.")
        startup_metrics_structure = get_startup_metrics_info(
            combined_text
        )
        growth_rate: MetricSchema = convert_metric_structure(startup_metrics_structure.growth_rate)
        organic_vs_paid_growth: MetricSchema = convert_metric_structure(
            startup_metrics_structure.organic_vs_paid_growth)
        virality: MetricSchema = convert_metric_structure(startup_metrics_structure.virality)
        network_effect: MetricSchema = convert_metric_structure(startup_metrics_structure.network_effect)
        customer_acquisition_cost: MetricSchema = convert_metric_structure(
            startup_metrics_structure.customer_acquisition_cost)
        unit_economics: MetricSchema = convert_metric_structure(startup_metrics_structure.unit_economics)
        retention_rate: MetricSchema = convert_metric_structure(startup_metrics_structure.retention_rate)
        magic_moment: MetricSchema = convert_metric_structure(startup_metrics_structure.magic_moment)
        net_promoter_score: MetricSchema = convert_metric_structure(startup_metrics_structure.net_promoter_score)
        customer_lifetime_value: MetricSchema = convert_metric_structure(
            startup_metrics_structure.customer_lifetime_value)
        payback_period: MetricSchema = convert_metric_structure(startup_metrics_structure.payback_period)
        revenue_growth: MetricSchema = convert_metric_structure(startup_metrics_structure.revenue_growth)
        churn_rate: MetricSchema = convert_metric_structure(startup_metrics_structure.churn_rate)

        project_info_in_s3["startupMetrics"] = {
            "growthRate": growth_rate,
            "organicVsPaidGrowth": organic_vs_paid_growth,
            "virality": virality,
            "networkEffect": network_effect,
            "customerAcquisitionCost": customer_acquisition_cost,
            "unitEconomics": unit_economics,
            "retentionRate": retention_rate,
            "magicMoment": magic_moment,
            "netPromoterScore": net_promoter_score,
            "customerLifetimeValue": customer_lifetime_value,
            "paybackPeriod": payback_period,
            "revenueGrowth": revenue_growth,
            "churnRate": churn_rate,
        }

    project_file_contents["processedProjectInfo"] = project_info_in_s3

    upload_to_s3(
        content=json.dumps(project_file_contents, indent=4),
        s3_key=f"{project_id}/agent-status.json",
        content_type="application/json"
    )
    print(
        f"Updated 'processed_project_info' uploaded to https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/crowd-fund-analysis/{agent_status_file_path}")

    return convert_s3_processed_info_to_state(project_info_in_s3)
