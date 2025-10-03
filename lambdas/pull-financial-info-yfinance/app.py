import json
import yfinance as yf

def lambda_handler(event, context):
    # Default: no symbol
    symbol = None
    if event.get("queryStringParameters"):
        symbol = event["queryStringParameters"].get("symbol")

    if not symbol:
        # If no symbol provided, return all fields as None
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Missing symbol parameter"})
        }

    try:
        t = yf.Ticker(symbol)
        info = t.get_info()

        # If Yahoo didn’t return valid info
        if not info or info.get("regularMarketPrice") is None:
            return {
                "statusCode": 200,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"symbol": symbol, "error": "Invalid symbol or no data", "data": None})
            }

        # Income statement (TTM) for revenue + net income
        ttm = t.ttm_income_stmt
        total_revenue = None
        net_income = None
        if ttm is not None and not ttm.empty:
            if "Total Revenue" in ttm.index:
                total_revenue = float(ttm.loc["Total Revenue"].dropna().iloc[0])
            if "Net Income" in ttm.index:
                net_income = float(ttm.loc["Net Income"].dropna().iloc[0])

        net_profit_margin = None
        if total_revenue and total_revenue != 0 and net_income is not None:
            net_profit_margin = net_income / total_revenue

        data = {
            "symbol": t.ticker,
            "currency": info.get("currency"),
            "price": info.get("regularMarketPrice"),
            "dayHigh": info.get("dayHigh"),
            "dayLow": info.get("dayLow"),
            "yearHigh": info.get("fiftyTwoWeekHigh"),
            "yearLow": info.get("fiftyTwoWeekLow"),
            "marketCap": info.get("marketCap"),
            "epsDilutedTTM": info.get("epsTrailingTwelveMonths"),
            "pe": info.get("trailingPE"),
            "avgVolume3M": info.get("averageDailyVolume3Month"),
            "dayVolume": info.get("volume"),
            "dividendYield": info.get("dividendYield"),
            "annualDividend": info.get("dividendRate"),
            "totalRevenue": total_revenue,
            "netIncome": net_income,
            "netProfitMargin": net_profit_margin,
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(data)
        }

    except Exception as e:
        # On error, respond with nulls
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "symbol": symbol,
                "error": str(e),
                "data": None
            })
        }
