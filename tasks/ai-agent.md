# Generated Files

1. The generated files should be saved in proposer folder structure. They should have standard or consistent files names
   and enclosing folders.
2. Before executing a step, we can see
3. if a file exists, if exists, we can skip the step. else execute it. This will
   help to partially run the steps and avoid re-executing the steps that are already fine.
4. This also helps in case some of the steps fail in the middle, the steps that ran successfully will not be re-executed.
5. Important thing to note is that the file is written as part of the final thing in each step. So, if the step fails in the middle,
   the file will not be written. This is a good thing as we can see the file and know that it is complete.

We can determine the id for the project and the top folder can be created with the id. The id can also be passed by the user.

# Information provided by user

We can create a form(fields) that the user can fill in. For example latestSecFiling is a string which will have the url of the latest sec filing.

Some fields that I can think of are

1. `latestSecFiling`
2. `crowdfundingLink`
3. `id` - so that the folder name for the project is always the same.
4. `websiteUrl` - Can be derived from the crowdfundingLink.

We need to think of these more and add more fields that are required.

# Relevance of the report

We will run it for 10 projects and make sure it produces very relevant reports.

# Final Report as 2-3 pager document

The final report should be a 2-3 pager document that can be shared with the user. It will have different sections
corresponding to each step.

# Proper arrangement of nodes and proper usage of edges/tools

# Deployment of the code on the server where we can run it from the browser

### General Information

- We will be deploying the code to aws lambda. AWS lambda produces a random URL when we deploy, its fine for now. Later
  on we can hook it up with API gateway where we can add a custom domain name.
- For lambda you will need to create account on AWS and they provide very generous free tier.
- Talk to Dawood to confirm the framework he used for deployment of lambda. I think he used zappa framework, but please confirm.

### Changes

- The files we are saving should be saved in s3, we can read the bucket name from .env file.
- All the files can be marked public and we can share the link to the user. So probably we should save the file in a PDF format also along wth mardown format.
- PDF files can straight away open in browser without need to download. You might have to also set some mime type on the pdf files, for it to open in browser.
- We should add code to show the response to the UI, which can be the link to files. Below is the logic that we can use.

### Show response to the UI

- When a request goes from the UI to the lambda, the lambda will run the code and save a agent_status.json file in the s3 bucket.
- The UI can keep making requests to this file and check if the status is complete. If the status is complete, then it can show the link to the user.
- contents of status the file can look like this

```json
{
  "status": "in_progress", // or completed
  "reports": {
    "teamInfo": {
      "status": "completed",
      "markdownLink": "https://s3.amazonaws.com/bucket_name/project_id/team_info.md",
      "pdfLink": "https://s3.amazonaws.com/bucket_name/project_id/team_info.pdf"
    }
  },
  "finalReport": {
    "status": "completed",
    "markdownLink": "https://s3.amazonaws.com/bucket_name/project_id/final_report.md",
    "pdfLink": "https://s3.amazonaws.com/bucket_name/project_id/final_report.pdf"
  }
}
```

THe UI can read this json and show the links to the user, as they are generated.

# Code cleanup

# A site where will be publish these reports on ongoing basis.

# Why and How we will we use the AWS Lambda Layers:

## Why will we use the AWS Lambda layers:

1. Lambda layers reduce the size of the deployment package by separating large dependencies from the function code.
2. Layers can be shared across multiple Lambda functions, avoiding redundant packaging of common dependencies.
3. Layers provide a clear separation between application code and dependencies, simplifying updates and management.

## How we can use the AWS Layer:

Sure! Here's an example of how to create and use a **Lambda Layer** with multiple dependencies, using a general approach without specifying any libraries, such as **LangChain** or any specific package. This guide will help you handle any number of dependencies you need to manage in a Lambda Layer.

---

## Setting Up AWS Lambda Layers for Multiple Dependencies

### Step 1: Create the Lambda Layer

1. **Create a directory** for your Lambda layer and its dependencies:

   ```bash
   mkdir my-layer/python
   ```

2. **Install your dependencies** into the `python` directory:
   Replace `your-package-1` and `your-package-2` with the actual package names you need (e.g., LangChain, or any other libraries).

   ```bash
   pip install your-package-1 your-package-2 -t my-layer/python
   ```

   You can install as many dependencies as needed by adding them in the command.

3. **Zip the contents of the directory** into a layer package:

   ```bash
   zip -r my-layer.zip my-layer/
   ```

4. **Publish the layer** to AWS Lambda using AWS CLI:
   ```bash
   aws lambda publish-layer-version \
     --layer-name my-layer \
     --zip-file fileb://my-layer.zip \
     --compatible-runtimes python3.8
   ```

### Step 2: Attach the Layer to Your Lambda Function

1. Go to the **AWS Lambda Console**.
2. Select your **Lambda function**.
3. In the **Layers** section, click **Add a layer**.
4. Choose **Custom layers** and select the **my-layer** that you just created.
5. Click **Add** to attach the layer to your function.

### Step 3: Use the Dependencies in Your Lambda Function Code

Now in your Lambda function code, you can simply import the libraries that were included in the layer:

```python
# Import your libraries
import your_package_1
import your_package_2

def lambda_handler(event, context):
    # Use the imported packages
    result = your_package_1.some_function()
    print(result)

    return "Lambda with dependencies from layer"
```

## Our Need

The **LangChain-related libraries** (`langgraph`,`langchain-community` `langchain-google-community`, `langchain-openai`) and their dependencies, such as **Google API Client** and **NumPy**, can take up a large amount of space. To manage this, we can create one or more **Lambda layers** specifically for these libraries, allowing us to keep the main Lambda function package smaller and within AWS Lambda's deployment size limits.

By using Lambda layers, we can efficiently handle the large dependencies, improving manageability and ensuring the deployment package stays within the allowable size.
