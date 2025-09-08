from chalice import Chalice
import json
from google_news import GoogleNews
from newspaper import Article

app = Chalice(app_name='pull-google-news')


@app.route('/')
def index():
    return {'hello': 'world'}


@app.route('/get-user-topics', methods=['POST'])
def get_user_topics():
    """
    Route to pull all topics for a particular user.
    Expects a userId in the request body.
    """
    request_body = app.current_request.json_body
    if not request_body or 'userId' not in request_body:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'userId is required in the request body'})
        }

    user_id = request_body['userId']

    try:
        # Mock implementation - in a real scenario, this would query the database
        # This returns sample data based on the schema we examined
        sample_topics = [
            {
                'id': '1',
                'topic': 'Technology',
                'description': 'Latest technology news and updates',
                'filters': ['AI', 'Machine Learning', 'Cloud Computing'],
                'templateUsed': 'default',
                'folderId': None,
                'createdAt': '2023-01-01T00:00:00Z',
                'updatedAt': '2023-01-02T00:00:00Z',
                'createdBy': user_id,
                'updatedBy': None
            },
            {
                'id': '2',
                'topic': 'Business',
                'description': 'Business news and market updates',
                'filters': ['Finance', 'Startups', 'Economy'],
                'templateUsed': 'business',
                'folderId': None,
                'createdAt': '2023-01-03T00:00:00Z',
                'updatedAt': '2023-01-04T00:00:00Z',
                'createdBy': user_id,
                'updatedBy': None
            }
        ]

        return {
            'statusCode': 200,
            'body': json.dumps({'topics': sample_topics})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


@app.route('/fetch-news', methods=['POST'])
def fetch_news():
    """
    Route to fetch news from Google for a particular topic.
    Expects a topic string in the request body.
    """
    request_body = app.current_request.json_body
    if not request_body or 'topic' not in request_body:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'topic is required in the request body'})
        }

    topic = request_body['topic']

    try:
        # Initialize GoogleNews
        google_news = GoogleNews()

        # Search for news related to the topic
        news_results = google_news.search(topic)

        # Extract and format the results
        articles = []
        for entry in news_results.get('entries', []):
            article = {
                'title': entry.get('title', ''),
                'link': entry.get('link', ''),
                'published': entry.get('published', ''),
                'source': entry.get('source', {}).get('title', ''),
                'summary': entry.get('summary', '')
            }
            articles.append(article)

        return {
            'statusCode': 200,
            'body': json.dumps({'articles': articles})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


@app.route('/get-article', methods=['POST'])
def get_article():
    """
    Route to get a news article using the newspaper library.
    Expects a URL in the request body.
    """
    request_body = app.current_request.json_body
    if not request_body or 'url' not in request_body:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'url is required in the request body'})
        }

    url = request_body['url']

    try:
        # Initialize Article
        article = Article(url)

        # Download and parse the article
        article.download()
        article.parse()

        # Extract the article information
        article_data = {
            'title': article.title,
            'authors': article.authors,
            'publish_date': article.publish_date.isoformat() if article.publish_date else None,
            'text': article.text,
            'top_image': article.top_image,
            'images': list(article.images),
            'movies': article.movies,
            'keywords': article.keywords,
            'summary': article.summary,
            'html': article.html
        }

        return {
            'statusCode': 200,
            'body': json.dumps({'article': article_data})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }


# The view function above will return {"hello": "world"}
# whenever you make an HTTP GET request to '/'.
#
# Here are a few more examples:
#
# @app.route('/hello/{name}')
# def hello_name(name):
#    # '/hello/james' -> {"hello": "james"}
#    return {'hello': name}
#
# @app.route('/users', methods=['POST'])
# def create_user():
#     # This is the JSON body the user sent in their POST request.
#     user_as_json = app.current_request.json_body
#     # We'll echo the json body back to the user in a 'user' key.
#     return {'user': user_as_json}
#
# See the README documentation for more examples.
#
