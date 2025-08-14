import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import googleNewsScraper from "google-news-scraper";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { GNSUserConfig } from "google-news-scraper/dist/tsc/types";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Type definition for the request body when fetching news
 */
type FetchNewsRequestBody = {
  searchTerm: string;
  prettyURLs?: boolean;
  queryVars?: {
    hl?: string;
    gl?: string;
    ceid?: string;
  };
  timeframe?: number;
  puppeteerArgs?: string[];
  limit?: number;
};

/**
 * Type definition for the request body when fetching a specific article
 */
type FetchArticleRequestBody = {
  url: string;
};

/**
 * Type definition for the request body when fetching user topics
 */
type GetUserTopicsRequestBody = {
  userId: string;
};

/**
 * Type definition for a news topic
 */
type NewsTopic = {
  id: string;
  topic: string;
  description: string;
  filters: string[];
  templateUsed: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
};

/**
 * Type definition for a news article
 */
type NewsArticle = {
  title: string;
  link: string;
  published: string;
  source: string;
  summary: string;
};

/**
 * Type definition for a parsed article
 */
type ParsedArticle = {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  dir: string;
  siteName: string | null;
  lang: string;
  url: string;
};

/**
 * Handler for fetching user topics
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const getUserTopics = async (
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

    const body: GetUserTopicsRequestBody = JSON.parse(event.body);
    const { userId } = body;

    if (!userId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "userId is required" }),
      };
    }

    // Fetch topics for the user from the database
    const topics = await prisma.newsTopic.findMany({
      where: {
        createdBy: userId,
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ topics }),
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
 * Handler for fetching news from Google News
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const fetchNews = async (
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

    const body: FetchNewsRequestBody = JSON.parse(event.body);
    const {
      searchTerm,
      prettyURLs,
      queryVars,
      timeframe,
      puppeteerArgs,
      limit,
    } = body;

    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "searchTerm is required" }),
      };
    }

    // Configure options for the google-news-scraper
    const options: GNSUserConfig = {
      searchTerm,
      prettyURLs: prettyURLs !== undefined ? prettyURLs : true,
      queryVars: queryVars || {},
      timeframe: "24h",
      puppeteerArgs: puppeteerArgs || [],
      limit: limit || 10,
    };

    // Fetch news articles
    const articles = await googleNewsScraper(options);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ articles }),
    };
  } catch (error: any) {
    console.error("Error fetching news:", error);
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
 * Handler for fetching and parsing a news article
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const getNewsArticle = async (
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

    // Fetch the article content
    const response = await axios.get(url);
    const html = response.data;

    // Parse the article using Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: "Could not parse article" }),
      };
    }

    // Format the article data
    const articleData: ParsedArticle = {
      title: article.title,
      content: article.content,
      textContent: article.textContent,
      length: article.length,
      excerpt: article.excerpt,
      byline: article.byline,
      dir: article.dir,
      siteName: article.siteName,
      lang: article.lang,
      url: url,
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ article: articleData }),
    };
  } catch (error: any) {
    console.error("Error fetching article:", error);
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
