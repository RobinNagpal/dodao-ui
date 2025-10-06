import json
from flask import Flask, request, jsonify
import yfinance as yf

app = Flask(__name__)

def core_handler(symbol: str):
    if not symbol:
        return 400, {"error": "Missing symbol parameter"}

    try:
        t = yf.Ticker(symbol)
        info = t.get_info()

        if not info or info.get("regularMarketPrice") is None:
            return 200, {"symbol": symbol, "error": "Invalid symbol or no data", "data": None}

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
        return 200, data

    except Exception as e:
        return 500, {"symbol": symbol, "error": str(e), "data": None}

# Health & root
@app.route("/")
def root():
    return jsonify({"ok": True, "service": "stock-lambda", "hint": "Use /quote?symbol=AAPL"}), 200

@app.route("/healthz")
def healthz():
    return jsonify({"ok": True}), 200

# HTTP GET /quote?symbol=AAPL
@app.route("/quote")
def quote():
    symbol = request.args.get("symbol")
    status, payload = core_handler(symbol)
    return jsonify(payload), status

# Required for local testing
if __name__ == "__main__":
    app.run(debug=True)