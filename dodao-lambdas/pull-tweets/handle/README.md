# About the Lambda
The lambda uses the `twscrape` package to scrape Twitter tweets based on the given handle in the endpoint `/tweets/<handle>`. The lambda is deployed using the Zappa framework on AWS Lambda. The `twscrape` library is modified to work with the AWS Lambda environment. So it has been installed as a local package in the `/libs/twscrape` directory and being used from there in the lambda script.

# Project setup
Zappa is being used to deploy the lambda. To set up a zappa project, follow the steps below:
1. Initialize a zappa project:
```bash
zappa init
```
Follow the prompts to set up the zappa project. You will be asked to provide the name of the stage, the AWS region, and the name of the S3 bucket to store the lambda code. A json file `zappa_settings.json` will be created with the configuration.

2. Zappa requires a virtual environment to run. Create a virtual environment and activate it:
```bash
python -m venv venv   
```

3. Activate the virtual environment:
For MacOS/Linux:
```bash
source venv/Scripts/activate 
```
For Windows:
```bash
.\venv\Scripts\Activate.ps1
```

4. Install the required packages:
```bash
pip install -r requirements.txt
```

5. Create a separate s3 bucket e.g. `my-credential-bucket`
6. Create a credentials json file `credential.json` and add all the Twitter accounts like so:
```json
{
    "TWITTER_USERNAME_1": "twitter_username",
    "TWITTER_PASSWORD_1": "twitter_password",
    "TWITTER_EMAIL_1": "twitter_email",
    "TWITTER_EMAIL_PASSWORD_1": "twitter_email_password",
    "TWITTER_COOKIES_1": [] // array of cookies
}
```
For getting cookies, install the chrome extension `Cookie-Editor` and use it to export the cookies in json format for a twitter account. Add the cookies to the `TWITTER_COOKIES_1` field in the `credential.json` file.

7. Upload the `credential.json` file to the s3 bucket `my-credential-bucket` either using the AWS console or the following command:
```bash
aws s3 cp credential.json s3://my-credential-bucket
```

# How to deploy and remove it

Zappa runs in the virtual environment, so make sure the virtual environment is activated before running the zappa commands.
```bash
source venv/Scripts/activate
```

To deploy the lambda, you need to have the AWS CLI installed and configured with the necessary permissions. You can use the following commands to deploy the lambda:

First time deployment:
```bash
zappa deploy <stage_name>
```
where `<stage_name>` is the name of the stage given during the initial setup of the zappa project.

To update the lambda:
```bash
zappa update <stage_name>
```

To remove the lambda:
```bash
zappa undeploy <stage_name>
```

## Testing on local
## Testing deployed lambda

After deploying the lambda, you can test it by hitting the endpoints and observing the response. If there is an error, use the following command to see the logs:
```bash
zappa tail <stage_name>
```

# About the changes you made

Two types of changes were made to the `twscrape` codebase:
1. To resolve the error `sqlite3.OperationalError: no such column: true`, added a function `log_and_sanitize_query()` to `db.py` and `accounts_pool.py` which replaces the `true` and `false` values in the query with `1` and `0` respectively.
2. To resolve the error `sqlite3.OperationalError: no such function: json_set`, replaced all the occurrences of `json_*()` functions with raw python logic in the `accounts_pool.py` file.

