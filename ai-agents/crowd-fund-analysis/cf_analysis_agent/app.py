from flask import Flask, render_template, request, redirect, url_for,jsonify
import os
from dotenv import load_dotenv
import boto3
import json
import subprocess

app = Flask(__name__)
load_dotenv()
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
REGION=os.getenv("AWS_DEFAULT_REGION")

s3_client = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)

def extract_variables_from_s3(project_id):
    """
    Extracts variables from the agent-status.json file stored in S3.
    """
    import boto3
    import json

    s3_client = boto3.client('s3', region_name=REGION)

    try:
        # Define the S3 key for the status file
        status_key = f"crowd-fund-analysis/{project_id}/agent-status.json"

        # Fetch the agent-status.json file from S3
        response = s3_client.get_object(Bucket=BUCKET_NAME, Key=status_key)
        status_data = json.loads(response['Body'].read().decode('utf-8'))

        # Extract required variables
        project_name = status_data.get("name", "").strip()
        crowdfunding_link = status_data.get("projectInfoInput", {}).get("crowdFundingUrl", "").strip()
        website_url = status_data.get("projectInfoInput", {}).get("websiteUrl", "").strip()
        latest_sec_filing_link = status_data.get("projectInfoInput", {}).get("SecFillingUrl", "").strip()
        additional_links = status_data.get("projectInfoInput", {}).get("additionalUrl", [])

        # Validate required fields
        if not all([project_name, crowdfunding_link, website_url, latest_sec_filing_link]):
            raise ValueError("Missing required data in agent-status.json.")

        # Return extracted variables
        return {
            "project_name": project_name,
            "crowdfunding_link": crowdfunding_link,
            "website_url": website_url,
            "latest_sec_filing_link": latest_sec_filing_link,
            "additional_links": additional_links
        }

    except s3_client.exceptions.NoSuchKey:
        raise FileNotFoundError(f"agent-status.json not found for project {project_id}.")
    except Exception as e:
        raise RuntimeError(f"An error occurred while extracting variables: {str(e)}")

@app.route("/")
def index():
    """
    Renders the home page with the form.
    """
    return render_template("form.html")




@app.route("/submit", methods=["POST"])
def submit():
    """
    Handles form submission, starts processing, and redirects to the status page.
    """
    # Retrieve form data
    project_name = request.form.get("project_name").strip()
    crowdfunding_link = request.form.get("crowdfunding_link").strip()
    website_url = request.form.get("website_url").strip()
    latest_sec_filing_link = request.form.get("latest_sec_filing_link").strip()
    additional_links = request.form.getlist("additional_links")  # Collect additional links

    # Prepare the project ID
    project_id = project_name.replace(" ", "_").lower()

    # Prepare the command to start processing
    command = [
        "poetry", "run", "python", "cf_analysis_agent/controller.py",
        project_name,
        crowdfunding_link,
        website_url,
        latest_sec_filing_link,
    ]
    if additional_links:
        command.extend(["--additional_links", ",".join(additional_links)])

    # Run the command asynchronously
    subprocess.Popen(command)

    # Redirect to the status page with the project ID
    return redirect(url_for("status", project_id=project_id))


@app.route("/status/<project_id>")
def status(project_id):
    """
    Render the status monitoring page.
    """
    bucket_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com"
    print(bucket_url)
    return render_template("status.html", project_id=project_id, bucket_url=bucket_url)


@app.route("/commit-info")
def commit_info():
    """
    Display the latest git commit hash and message.
    """
    commit_file_path = os.path.join(os.path.dirname(__file__), "commit_info.txt")
    if os.path.exists(commit_file_path):
        with open(commit_file_path, "r") as file:
            lines = file.readlines()
        commit_hash = lines[0].strip().split("=")[1] if len(lines) > 0 else "Unavailable"
        commit_message = lines[1].strip().split("=")[1] if len(lines) > 1 else "Unavailable"
    else:
        commit_hash = "Unavailable"
        commit_message = "Unavailable"
    return render_template("commit_info.html", commit_hash=commit_hash, commit_message=commit_message)

@app.route('/api/projects/<projectId>/reports/regenerate', methods=['POST'])
def regenerate_reports(projectId):
    """
    Regenerates reports for a given project using values from agent-status.json in S3.
    """
    try:
        # Extract variables from S3
        variables = extract_variables_from_s3(projectId)

        # Prepare the command to start processing
        command = [
            "poetry", "run", "python", "cf_analysis_agent/controller.py",
            variables["project_name"],
            variables["crowdfunding_link"],
            variables["website_url"],
            variables["latest_sec_filing_link"]
        ]

        # Include additional links if they exist
        if variables["additional_links"]:
            command.extend(["--additional_links", ",".join(variables["additional_links"])])

        # Execute the command
        subprocess.Popen(command)

        # Return a success response
        return jsonify({
            "status": "success",
            "message": f"Reports for project {projectId} are being regenerated."
        }), 200

    except FileNotFoundError as e:
        return jsonify({"status": "error", "message": str(e)}), 404
    except ValueError as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": f"An error occurred: {str(e)}"}), 500



@app.route('/api/projects/<projectId>/reports/<report_type>/regenerate', methods=['POST'])
def regenerate_specific_report(projectId, report_type):
    """
    Regenerates a specific report for a given project.
    """
    try:
        # Extract variables from S3
        variables = extract_variables_from_s3(projectId)

        # Prepare the command to start processing
        command = [
            "poetry", "run", "python", "cf_analysis_agent/controller.py",
            variables["project_name"],
            variables["crowdfunding_link"],
            variables["website_url"],
            variables["latest_sec_filing_link"]
        ]

        # Include additional links if they exist
        if variables["additional_links"]:
            command.extend(["--additional_links", ",".join(variables["additional_links"])])

        # Add the report_type to the command
        command.extend(["--report_type", report_type])

        # Execute the command
        subprocess.Popen(command)

        # Return a success response
        return jsonify({
            "status": "success",
            "message": f"Regeneration started for report '{report_type}' in project '{projectId}'."
        }), 200

    except Exception as e:
        # Handle any errors
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
