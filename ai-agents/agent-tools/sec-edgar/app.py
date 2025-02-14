from chalice import Chalice, BadRequestError
from edgar import Company, set_identity

app = Chalice(app_name='sec-edgar')

@app.route('/extract', methods=['POST'])
def extract():
    """
    POST JSON body:
    {
      "ticker": "VICI",
      "sec_email": "myemail@example.com",
      "report_type": "balance_sheet"  # or "income_statement" / "cash_flow"
    }
    """
    request = app.current_request.json_body
    if not request:
        raise BadRequestError("Missing JSON body.")

    ticker = request.get("ticker")
    sec_email = request.get("sec_email", "example@domain.com")
    report_type = request.get("report_type", "balance_sheet")

    if not ticker:
        raise BadRequestError("ticker is required.")

    set_identity(sec_email)

    try:
        text_result = get_latest_10q_report_text(ticker, report_type)
    except Exception as e:
        raise BadRequestError(str(e))

    return {
        "ticker": ticker,
        "report_type": report_type,
        "result_text": text_result
    }


def get_latest_10q_report_text(ticker: str, report_type: str) -> str:
    """
    Fetch the latest 10-Q for the given ticker, identify attachments
    that match the desired report_type (balance_sheet, income_statement,
    or cash_flow), and return a limited number of attachments text.
    
    - balance_sheet: return first *two* matching attachments
    - income_statement: return *only first* match
    - cash_flow: return *only first* match
    """
    search_map = {
        "balance_sheet": ["balance sheet"],
        "income_statement": ["statements of comprehensive income"],
        "cash_flow": ["statements of cash flows"],
    }

    keywords = search_map.get(report_type.lower())
    if not keywords:
        return f"Error: unrecognized report_type '{report_type}'."

    company = Company(ticker)
    filings = company.get_filings(form="10-Q")
    latest_10q = filings.latest()
    attachments = latest_10q.attachments

    matched_texts = []
    for attach in attachments:
        purpose = (attach.purpose or "").lower()
        if any(k in purpose for k in keywords):
            try:
                matched_texts.append(attach.text())
            except Exception as e:
                matched_texts.append(
                    f"Error reading attachment seq={attach.sequence_number}: {str(e)}"
                )

            if report_type.lower() in ["income_statement", "cash_flow"] and len(matched_texts) == 1:
                break
            if report_type.lower() == "balance_sheet" and len(matched_texts) == 2:
                break

    if not matched_texts:
        return f"No attachments found for '{report_type}' in latest 10-Q for '{ticker}'."

    return "\n\n".join(matched_texts)
