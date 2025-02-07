import os
import subprocess
import sys
import traceback

from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from cf_analysis_agent.utils.env_variables import BUCKET_NAME, OPEN_AI_DEFAULT_MODEL, REGION, ADMIN_CODES
from cf_analysis_agent.utils.agent_utils import generate_hashed_key

# # Add the parent directory of app.py to the Python path this maybe temporary we can change it later for that we will have to change docker file as well
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from cf_analysis_agent.utils.report_utils import update_status_to_not_started_for_all_reports, \
    initialize_project_in_s3, update_report_status_in_progress
from cf_analysis_agent.controller import prepare_processing_command

app = Flask(__name__)
CORS(app)  # This will allow all origins by default


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
    project_id = request.form.get("project_id").strip()
    project_name = request.form.get("project_name").strip()
    crowdfunding_link = request.form.get("crowdfunding_link").strip()
    website_url = request.form.get("website_url").strip()
    latest_sec_filing_link = request.form.get("latest_sec_filing_link").strip()
    additional_links = request.form.getlist("additional_links")  # Collect additional links

    project_details={
        "project_id":project_id,
        "project_name":project_name,
        "crowdfunding_link":crowdfunding_link,
        "website_url":website_url,
        "latest_sec_filing_link":latest_sec_filing_link,
        "additional_links":additional_links
    }
    # Prepare the command to start processing
    initialize_project_in_s3(project_id=project_id, project_details=project_details)
    command = [
        "poetry", "run", "python", "cf_analysis_agent/controller.py",
        project_id,
        project_name,
        crowdfunding_link,
        website_url,
        latest_sec_filing_link,
    ]
    if additional_links:
        command.extend(["--additional_links", ",".join(additional_links)])

    # Append the selected model as an argument
    command.extend(["--model", OPEN_AI_DEFAULT_MODEL])

    # Run the command asynchronously
    subprocess.Popen(command)

    # Redirect to the status page with the project ID
    return redirect(url_for("status", project_id=project_id))


@app.route("/api/submit", methods=["POST"])
def api_submit():
    """
    Handles JSON-based form submission, starts processing, and returns a JSON response.
    """
    if not request.is_json:
        return jsonify({"error": "Invalid request. JSON expected."}), 400

    data = request.get_json()
    print(data)
    # Retrieve data safely
    project_id = data.get("projectId", "").strip()
    project_name = data.get("projectName", "").strip()
    project_img_url = data.get("projectImgUrl", "").strip()
    crowdfunding_link = data.get("crowdFundingUrl", "").strip()
    website_url = data.get("websiteUrl", "").strip()
    latest_sec_filing_link = data.get("secFilingUrl", "").strip()
    additional_links = data.get("additionalUrls", [])  # JSON sends this as an array

    if not project_id:
        return jsonify({"error": "Project ID is required"}), 400

    project_details = {
        "project_id": project_id,
        "project_name": project_name,
        "project_img_url": project_img_url,
        "crowdfunding_link": crowdfunding_link,
        "website_url": website_url,
        "latest_sec_filing_link": latest_sec_filing_link,
        "additional_links": additional_links,
    }

    # Initialize project (store in S3 or DB)
    initialize_project_in_s3(project_id=project_id, project_details=project_details)
    
    # Prepare command to run Python script asynchronously
    command = [
        "poetry", "run", "python", "cf_analysis_agent/controller.py",
        project_id,
        project_name,
        crowdfunding_link,
        website_url,
        latest_sec_filing_link,
    ]
    
    if additional_links:
        command.extend(["--additional_links", ",".join(additional_links)])

    # Append the selected model as an argument
    command.extend(["--model", OPEN_AI_DEFAULT_MODEL])

    # Run the command asynchronously
    subprocess.Popen(command)

    # Return success response with project ID
    return jsonify({"status": "success", "project_id": project_id, "message":"Project processing started"}), 200

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
        data = request.get_json(silent=True) or {} # Handle case if no body was sent
        model = data.get("model", OPEN_AI_DEFAULT_MODEL) 
        
        update_status_to_not_started_for_all_reports(project_id=projectId)
        command = prepare_processing_command(projectId, model)

        # Start the subprocess
        subprocess.Popen(command)

        return jsonify({
                    "status": "success",
                    "message": f"Regeneration of reports for {projectId} has started successfully."
                }), 200
        
    except FileNotFoundError as e:
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 404
    except ValueError as e:
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": str(e)}), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": f"An error occurred: {str(e)}"}), 500


@app.route('/api/projects/<projectId>/reports/<report_type>/regenerate', methods=['POST'])
def regenerate_specific_report(projectId, report_type):
    """
    Regenerates a specific report for a given project.
    """
    try:
        data = request.get_json(silent=True) or {} # Handle case if no body was sent
        model = data.get("model", OPEN_AI_DEFAULT_MODEL) 
        
        # Prepare the command to start processing
        update_report_status_in_progress(project_id=projectId, report_type=report_type)
        command = prepare_processing_command(projectId, model)

        # Add the report_type to the command
        command.extend(["--report_type", report_type])

        # Start the subprocess
        subprocess.Popen(command)
        return jsonify({
                    "status": "success",
                    "message": f"Regeneration of {report_type} report for {projectId} has started successfully."
                }), 200
        
    except Exception as e:
        print(traceback.format_exc())
        # Handle any errors
        return jsonify({
            "status": "error",
            "message": f"An error occurred: {str(e)}"
        }), 500
        
@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    data = request.get_json()
    code = data.get("code")

    if not code:
        return jsonify({"status": "error", "message": "Code is required"}), 400

    if code in ADMIN_CODES:
        hashed_key = generate_hashed_key(code)
        return jsonify({
                    "status": "success",
                    "message": "Authenticated successfully.",
                    "key": hashed_key
                }), 200

    return jsonify({"status": "error", "message": "Invalid code"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
