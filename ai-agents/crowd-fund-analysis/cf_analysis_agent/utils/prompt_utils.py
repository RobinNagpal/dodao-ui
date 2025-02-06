

def create_prompt_for_checklist(report_type: str) -> str:

    return f"""
    Make sure the output is formatted nicely in markdown and doesn't have many nested points. Use longer sentences and
    paragraphs instead of second and third level bullet points. Include timeline comparisons and velocity metrics.
    
    Create a checklist of Five Key Points for the {report_type} report which an ideal company should meet to be the best
    in its industry and specific sector, and see how many of these points met by the provided startup. 
    If the company meets that specific point, give a score of 1, otherwise 0. Explain the reasons for the
    score given. Be conservative in your scoring and provide detailed explanations on how the evaluation was made.
    """
