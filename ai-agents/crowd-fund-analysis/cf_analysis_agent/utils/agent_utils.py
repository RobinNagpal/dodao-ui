import hashlib
from cf_analysis_agent.utils.env_variables import SECRET_KEY

def combine_partial_state(state: dict, partial: dict) -> dict:
    """
    Combine the partial state from node steps
    """
    return {
        **state,
        **partial
    }

def generate_hashed_key(code):
    """Generate a hashed key using SHA256"""
    hash_obj = hashlib.sha256(f"{code}{SECRET_KEY}".encode())
    return hash_obj.hexdigest()