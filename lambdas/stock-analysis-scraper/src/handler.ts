import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  scrapeIncomeStatementAnnual,
  scrapeIncomeStatementAnnualRaw,
  scrapeIncomeStatementAnnualStrict,
} from "./cheerio/income-statement-annual";
import { scrapeFundamentalsSummary } from "./cheerio/fundamentals-summary";

/**
 * Type definition for the request body when fetching a specific article
 */
type FetchArticleRequestBody = {
  url: string;
};

/**
 * Handler for fetching user topics
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const scrapeTickerInfo = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  try {
    // Parse the request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "Request body is required" }),
      };
    }

    const body: FetchArticleRequestBody = JSON.parse(event.body);
    const { url } = body;

    if (!url) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "url is required" }),
      };
    }

    const { financialSummary, errors: errorsFinancialSummary } =
      await scrapeFundamentalsSummary(url);
    const { incomeStatementAnnual, errors: errorsIncomeStatement } =
      await scrapeIncomeStatementAnnual(url + "financials/");

    const {
      incomeStatementAnnual: incomeStatementAnnualRaw,
      errors: errorsIncomeStatementRaw,
    } = await scrapeIncomeStatementAnnualRaw(url + "financials/");

    const {
      incomeStatementAnnual: incomeStatementAnnualStrict,
      errors: errorsIncomeStatementStrict,
    } = await scrapeIncomeStatementAnnualStrict(url + "financials/");

    // Fetch topics for the user from the database

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        financialSummary,
        incomeStatementAnnual: {
          incomeStatementAnnual,
          incomeStatementAnnualRaw,
          incomeStatementAnnualStrict,
        },
        errors: {
          errorsFinancialSummary,
          incomeStatement: {
            errorsIncomeStatement,
            errorsIncomeStatementRaw,
            errorsIncomeStatementStrict,
          },
        },
      }),
    };
  } catch (error: any) {
    console.error("Error fetching user topics:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        error: "Internal server error",
        details: error?.message,
      }),
    };
  }
};

/**
 * Handler for OPTIONS requests (CORS preflight)
 * @returns API Gateway response
 */
export const handleOptions = async (): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Credentials": true,
    },
    body: "",
  };
};
