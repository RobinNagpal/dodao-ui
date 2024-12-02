import dotenv from "dotenv";
dotenv.config();

import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import yahooFinance from "yahoo-finance";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "@langchain/core/tools";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { RSI, MACD, Stochastic } from "technicalindicators";

const FUNDAMENTAL_ANALYST_PROMPT = `
You are a fundamental analyst specializing in evaluating company (whose symbol is {company}) performance based on stock prices, technical indicators, and financial metrics. Your task is to provide a comprehensive summary of the fundamental analysis for a given stock.

You have access to the following tools:
1. **get_stock_prices**: Retrieves the latest stock price, historical price data, and technical Indicators like RSI, MACD, Drawdown, and VWAP.
2. **get_financial_metrics**: Retrieves key financial metrics, such as revenue, earnings per share (EPS), price-to-earnings ratio (P/E), and debt-to-equity ratio.

### Your Task:
1. **Input Stock Symbol**: Use the provided stock symbol to query the tools and gather the relevant information.
2. **Analyze Data**: Evaluate the results from the tools and identify potential resistance, key trends, strengths, or concerns.
3. **Provide Summary**: Write a concise, well-structured summary that highlights:
    - Recent stock price movements, trends, and potential resistance.
    - Key insights from technical indicators (e.g., whether the stock is overbought or oversold).
    - Financial health and performance based on financial metrics.

### Constraints:
- Use only the data provided by the tools.
- Avoid speculative language; focus on observable data and trends.
- If any tool fails to provide data, clearly state that in your summary.

### Output Format:
Respond in the following format:
"stock": "<Stock Symbol>",
"price_analysis": "<Detailed analysis of stock price trends>",
"technical_analysis": "<Detailed time series Analysis from ALL technical indicators>",
"financial_analysis": "<Detailed analysis from financial metrics>",
"final Summary": "<Full Conclusion based on the above analyses>"
"Asked Question Answer": "<Answer based on the details and analysis above>"

Ensure that your response is objective, concise, and actionable.
`;

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

class GetStockPrices extends Tool {
  name = "get_stock_prices";
  description =
    "Fetches historical stock price data and technical indicators for a given ticker.";
  //   schema = z.object({
  //     ticker: z.string().describe("Stock ticker symbol"),
  //   });

  //   async _call({ ticker }: z.infer<typeof this.schema>): Promise<string> {
  async _call(input: string): Promise<string> {
    const ticker = input.trim().toUpperCase();
    console.log(`[GetStockPrices] Called with ticker: ${ticker}`);

    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 24 * 7 * 3); // 24 weeks * 3

      const data = await yahooFinance.historical({
        symbol: ticker,
        from: formatDate(fromDate),
        to: formatDate(toDate),
        period: "w",
      });

      data.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const closes = data.map((d) => d.close);

      const rsiValues = RSI.calculate({ values: closes, period: 14 }).slice(
        -12
      );

      const macdValues = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      }).slice(-12);

      const highs = data.map((d) => d.high);
      const lows = data.map((d) => d.low);
      const stochValues = Stochastic.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 14,
        signalPeriod: 3,
      }).slice(-12);

      const indicators = {
        RSI: rsiValues,
        MACD: macdValues,
        Stochastic_Oscillator: stochValues,
      };

      return JSON.stringify({
        stock_price: data.slice(-12),
        indicators: indicators,
      });
    } catch (e) {
      return `Error fetching price data: ${e}`;
    }
  }
}

class GetFinancialMetrics extends Tool {
  name = "get_financial_metrics";
  description = "Fetches key financial ratios for a given ticker.";
  //   schema = z.object({
  //     ticker: z.string().describe("Stock ticker symbol"),
  //   });

  //   async _call({ ticker }: z.infer<typeof this.schema>): Promise<string> {
  async _call(input: string): Promise<string> {
    const ticker = input.trim().toUpperCase();
    console.log(`[GetFinancialMetrics] Called with ticker: ${ticker}`);

    try {
      const data = await yahooFinance.quote({
        symbol: ticker,
        modules: ["summaryDetail", "financialData", "defaultKeyStatistics"],
      });

      return JSON.stringify({
        pe_ratio: data.summaryDetail?.forwardPE,
        price_to_book: data.defaultKeyStatistics?.priceToBook,
        debt_to_equity: data.financialData?.debtToEquity,
        profit_margins: data.financialData?.profitMargins,
      });
    } catch (e) {
      return `Error fetching ratios: ${e}`;
    }
  }
}

(async () => {
  const tools = [new GetStockPrices(), new GetFinancialMetrics()];

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const agent = createReactAgent({
    llm: model,
    tools: tools,
  });

  const stockSymbol = "TSLA";
  const userQuestion = "Should I buy this stock?";

  const systemMessage = new SystemMessage(
    FUNDAMENTAL_ANALYST_PROMPT.replace("{company}", stockSymbol)
  );

  const agentFinalState = await agent.invoke({
    messages: [systemMessage, new HumanMessage(userQuestion)],
  });

  console.log(
    agentFinalState.messages[agentFinalState.messages.length - 1].content
  );
})();
