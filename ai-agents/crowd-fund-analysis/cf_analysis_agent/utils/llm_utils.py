import os
from langchain_openai import ChatOpenAI
from cf_analysis_agent.agent_state import Config

OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')

# Cache for storing initialized LLMs (prevents re-initialization)
_llm_cache = {}

def get_llm(config: Config):
    """
    Retrieves the LLM model based on the config.
    Uses caching to prevent redundant model creation.
    """
    model = config.get("configurable", {}).get("model", OPEN_AI_DEFAULT_MODEL)

    # Check if the model is already initialized
    if model not in _llm_cache:
        _llm_cache[model] = ChatOpenAI(model_name=model, temperature=0)

    return _llm_cache[model]  # Return the cached LLM instance
