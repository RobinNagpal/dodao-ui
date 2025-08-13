from chalice import Chalice
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pygooglenews import GoogleNews
from newspaper import Article
import json

app = Chalice(app_name='pull-google-news')

# Database connection
def get_db_connection():
    conn = psycopg2.connect(
        os.environ.get('DATABASE_URL'),
        cursor_factory=RealDictCursor
    )
    return conn

@app.route('/')
def index():
    return {'hello': 'world'}

@app.route('/get-topics', methods=['POST'])
def get_topics():
    """
    Get all topics for a particular user
    Expects a JSON body with userId
    """
    request_body = app.current_request.json_body
    user_id = request_body.get('userId')

    if not user_id:
        return {'error': 'userId is required'}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to get all topics for a user
        cursor.execute(
            """
            SELECT * FROM news_topics 
            WHERE created_by = %s
            """, 
            (user_id,)
        )

        topics = cursor.fetchall()
        cursor.close()
        conn.close()

        # Convert RealDictRow objects to dictionaries
        topics_list = [dict(topic) for topic in topics]

        return {'topics': topics_list}
    except Exception as e:
        return {'error': str(e)}

@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    """
    Fetch news from Google for a particular topic
    Expects a JSON body with topic
    """
    request_body = app.current_request.json_body
    topic = request_body.get('topic')

    if not topic:
        return {'error': 'topic is required'}

    try:
        # Initialize Google News
        gn = GoogleNews()

        # Search for news related to the topic
        search_results = gn.search(topic)

        # Extract relevant information from search results
        news_items = []
        for entry in search_results['entries']:
            news_item = {
                'title': entry.get('title', ''),
                'link': entry.get('link', ''),
                'published': entry.get('published', ''),
                'source': entry.get('source', {}).get('title', '') if entry.get('source') else '',
                'summary': entry.get('summary', '')
            }
            news_items.append(news_item)

        return {'news': news_items}
    except Exception as e:
        return {'error': str(e)}

@app.route('/get-article', methods=['POST'])
def get_article():
    """
    Get news article content using newspaper library
    Expects a JSON body with url
    """
    request_body = app.current_request.json_body
    url = request_body.get('url')

    if not url:
        return {'error': 'url is required'}

    try:
        # Initialize Article
        article = Article(url)

        # Download and parse the article
        article.download()
        article.parse()

        # Extract article information
        article_data = {
            'title': article.title,
            'text': article.text,
            'authors': article.authors,
            'publish_date': str(article.publish_date) if article.publish_date else None,
            'top_image': article.top_image,
            'images': list(article.images),
            'movies': list(article.movies),
            'url': article.url,
        }

        return article_data
    except Exception as e:
        return {'error': str(e)}
