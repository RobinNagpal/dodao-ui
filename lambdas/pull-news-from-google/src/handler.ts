import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import googleNewsScraper from "./google-news-scraper";
import { PrismaClient } from "@prisma/client";
import { GNSUserConfig } from "./google-news-scraper/types";
import Parser from "@postlight/parser";

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
  excerpt: string;
  author: string | null;
  date_published: string | null;
  lead_image_url: string | null;
  dek: string | null;
  next_page_url: string | null;
  url: string;
  domain: string;
  word_count: number;
  direction: string;
  total_pages: number;
  rendered_pages: number;
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
    console.log("Body:", event.body);
    const body: FetchNewsRequestBody = JSON.parse(event.body);
    const { searchTerm } = body;

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
      timeframe: "24h",
      limit: 10,
      puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
      puppeteerHeadlessMode: true,
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

    // Fetch and parse the article using @postlight/parser
    const article = await Parser.parse(url);

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
      excerpt: article.excerpt,
      author: article.author,
      date_published: article.date_published,
      lead_image_url: article.lead_image_url,
      dek: article.dek,
      next_page_url: article.next_page_url,
      url: article.url,
      domain: article.domain,
      word_count: article.word_count,
      direction: article.direction,
      total_pages: article.total_pages,
      rendered_pages: article.rendered_pages,
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
