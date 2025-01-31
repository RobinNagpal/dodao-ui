def combine_partial_state(state: dict, partial: dict) -> dict:
    """
    Combine the partial state from node steps
    """
    return {
        **state,
        **partial
    }
