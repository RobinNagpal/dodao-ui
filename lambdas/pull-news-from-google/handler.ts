import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import googleNewsScraper from 'google-news-scraper';

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
 * Handler for fetching news from Google News
 * @param event - API Gateway event
 * @returns API Gateway response
 */
export const fetchNews = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  try {
    // Parse the request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body: FetchNewsRequestBody = JSON.parse(event.body);
    const { searchTerm, prettyURLs, queryVars, timeframe, puppeteerArgs, limit } = body;

    if (!searchTerm) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ error: 'searchTerm is required' }),
      };
    }

    // Configure options for the google-news-scraper
    const options = {
      searchTerm,
      prettyURLs: prettyURLs !== undefined ? prettyURLs : true,
      queryVars: queryVars || {},
      timeframe: timeframe || 0,
      puppeteerArgs: puppeteerArgs || [],
      limit: limit || 10,
    };

    // Fetch news articles
    const articles = await googleNewsScraper(options);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ articles }),
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message }),
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
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Credentials': true,
    },
    body: '',
  };
};
