from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

from cf_analysis_agent.agent_state import Config
from cf_analysis_agent.structures.report_structures import StructuredLLMResponse, StructuredReportResponse
from cf_analysis_agent.utils.env_variables import OPEN_AI_DEFAULT_MODEL
from cf_analysis_agent.utils.project_utils import scrape_url

# Cache for storing initialized LLMs (prevents re-initialization)
_llm_cache: dict[str, BaseChatModel] = {}

DEFAULT_LLM_CONFIG: Config = {"configurable": {"model": OPEN_AI_DEFAULT_MODEL}}

MINI_4_0_CONFIG: Config = {"configurable": {"model": "gpt-4o-mini"}}
MINI_O_3_CONFIG: Config = {"configurable": {"model": "o3-mini"}}
NORMAL_4_0_CONFIG: Config = {"configurable": {"model": "gpt-4o"}}
DEEP_SEEK_R1_CONFIG: Config = {"configurable": {"model": "deepseek-r1-distill-llama-70b"}}


def get_llm(config: Config) -> BaseChatModel:
    """
    Retrieves the LLM model based on the config.
    Uses caching to prevent redundant model creation.
    """
    model = config.get("configurable", {}).get("model", OPEN_AI_DEFAULT_MODEL)

    # Check if the model is already initialized
    if model in _llm_cache:
        return _llm_cache[model]
    else:
        if model == "gpt-4o-mini" or model == "o3-mini" or model == "gpt-4o":
            _llm_cache[model] = ChatOpenAI(model=model, temperature=0, max_tokens=4000)
            return _llm_cache[model]
        elif model == "deepseek-r1-distill-llama-70b":
            _llm_cache[model] = ChatGroq(temperature=0, model=model, max_tokens=4000)
            return _llm_cache[model]
        else:
            raise Exception(f"Model {model} not supported")


def validate_structured_output(operation_name: str, output: StructuredLLMResponse) -> str:
    """Validate the structured output from the LLM"""
    if output.status == "failed":
        print(f"Failed to generate output for {operation_name}: {output.failureReason}")
        raise Exception(f"Failed to generate output: {output.failureReason}")

    print(
        f"Operation: {operation_name} completed with confidence: {output.confidence}. Output length {len(output.outputString)} ")
    return output.outputString


def validate_report_output(operation_name: str, output: StructuredReportResponse) -> StructuredReportResponse:
    """Validate the structured output from the LLM"""
    if output.status == "failed":
        print(f"Failed to generate output for {operation_name}: {output.failureReason}")
        raise Exception(f"Failed to generate output: {output.failureReason}")

    print(
        f"Operation: {operation_name} completed with confidence: {output.confidence}. Output length {len(output.outputString)} ")
    return output


def structured_llm_response(config: Config, operation_name: str, prompt: str) -> str:
    """Get the response from the LLM"""
    print(f'Fetching response from LLM for operation: {operation_name}')
    structured_llm = get_llm(config).with_structured_output(StructuredLLMResponse)
    response: StructuredLLMResponse = structured_llm.invoke([HumanMessage(content=prompt)])
    return validate_structured_output(operation_name, response)


def structured_report_response(config: Config, operation_name: str, prompt: str) -> StructuredReportResponse:
    """Get the response from the LLM"""
    print(f'Fetching response from LLM for operation: {operation_name}')
    structured_llm = get_llm(config).with_structured_output(StructuredReportResponse)
    response: StructuredReportResponse = structured_llm.invoke([HumanMessage(content=prompt)])
    return validate_report_output(operation_name, response)


def scrape_and_clean_content_with_same_details(url: str) -> str:
    """
    Clean the content by removing duplicate information.
    """

    scrapped_content = scrape_url(url)
    prompt = f"""Remove the duplicates from the below content, but don't remove any information.
        Be as detailed as possible. Don't remove any information at all. 
        Write the content in well structured markdown format and make sure images are not given width more than 300px
        Be as detailed as possible. Don't remove any information at all. 
        
        {scrapped_content}
    """
    cleaned_up_contents = structured_llm_response(MINI_4_0_CONFIG, "scrape_and_clean_content_with_same_details", prompt)

    return cleaned_up_contents
