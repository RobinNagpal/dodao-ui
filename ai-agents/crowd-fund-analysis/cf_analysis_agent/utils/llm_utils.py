import os

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from cf_analysis_agent.agent_state import Config
from cf_analysis_agent.structures.report_structures import StructuredLLMResponse

OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')

# Cache for storing initialized LLMs (prevents re-initialization)
_llm_cache: dict[str, ChatOpenAI] = {}

def get_llm(config: Config) -> ChatOpenAI:
    """
    Retrieves the LLM model based on the config.
    Uses caching to prevent redundant model creation.
    """
    model = config.get("configurable", {}).get("model", OPEN_AI_DEFAULT_MODEL)

    # Check if the model is already initialized
    if model not in _llm_cache:
        _llm_cache[model] = ChatOpenAI(model_name=model, temperature=0)

    return _llm_cache[model]  # Return the cached LLM instance

def validate_structured_output(operation_name: str, output: StructuredLLMResponse) -> str:
    """Validate the structured output from the LLM"""
    if output.status == "failed":
        print(f"Failed to generate output for {operation_name}: {output.failureReason}")
        raise Exception(f"Failed to generate output: {output.failureReason}")

    print(f"Operation: {operation_name} with confidence: {output.confidence}")
    return output.outputString

def structured_llm_response(config: Config, operation_name: str, prompt: str) -> str:
    """Get the response from the LLM"""
    structured_llm = get_llm(config).with_structured_output(StructuredLLMResponse)
    response = structured_llm.invoke([HumanMessage(content=prompt)])
    return validate_structured_output(operation_name, response)
