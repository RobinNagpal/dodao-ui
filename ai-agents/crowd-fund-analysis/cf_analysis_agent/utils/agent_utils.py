import hashlib
from cf_analysis_agent.utils.env_variables import SECRET_KEY
from flask import request, jsonify
from cf_analysis_agent.utils.env_variables import ADMIN_CODES

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

def extract_admin_name(code):
    """Extract admin name from admin code (everything before '-')"""
    return code.split("-")[0]  # Get the part before '-'

def get_admin_name_from_request():
    """Extract admin name from request headers"""
    hashed_key = request.headers.get("x-admin-key")
    
    if not hashed_key:
        return None, (jsonify({"status": "error", "message": "Unauthorized"}), 401)

    # Find the matching admin code by checking if its hash matches
    admin_code = next((code for code in ADMIN_CODES if generate_hashed_key(code) == hashed_key), None)
    
    if not admin_code:
        return None, (jsonify({"status": "error", "message": "Invalid code"}), 401)

    # Extract the admin name (everything before '-')
    admin_name = extract_admin_name(admin_code)
    
    return admin_name, None  # Return admin_name if found, otherwise None
