from flask import Flask, render_template, request, redirect, url_for
import os
import subprocess

app = Flask(__name__)

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
    return render_template("status.html", project_id=project_id)

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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
