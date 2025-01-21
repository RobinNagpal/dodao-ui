# About Project
There are three main files in this project:
```text
├── clickableDemoServiceWorker.ts
├── clickableDemoTooltipScript.ts
└── styles
    └── clickableDemoTooltipStyles.scss
```
You will be modifying these files to fix some of the issues related to clickable demos


# Local Setup
As part of the development we modify  `clickableDemoTooltipScript.ts` and `clickableDemoTooltipStyles.scss` files. 
To test the changes we will have to upload these to S3. 

But this is a longer process. We want to test the changes locally before uploading them to S3.

We can run the local server which will serve these files from the local machine. 

So the things we need are
1. A local server to serve the files. See `Running Local Server` section below.
2. Some HTML Captures that refer to these files. We have these in the `clickable-demos/sample-captures/safe-captures` folder.
   and these files are served by the local server.
3. Add these HTML Captures for a demo in the database. See `Adding a New HTML Capture` section below.


# Running Local Server
You can run a local server to test the clickable demos.

```shell
yarn test-server
```
This will start the server at port 9090 and will serve the local files from there.

# Referring to local files
You can create a clickable demo and then add HTML capture using the `populate-sample-captures.sql` script. The html
captures in this script refer to the local files.

Simply replace `DESIRED-DEMO-ID` with the ID of the demo for which you want to use HTML capture. For example:

```sql
insert into public.clickable_demo_html_cpatures
values (md5(random()::text),
        'DESIRED-DEMO-ID',
        'file-10-30-2024-8-55-39-am',
        'http://localhost:9090/sample-captures/safe-captures/file-10-30-2024-8-55-39-am/index.html',
        'http://localhost:9090/sample-captures/safe-screenshots/1730292942806_file-10-30-2024-8-55-39-AMscreenshot.png',
        '2024-10-30 08:55:39');
```

Replace `DESIRED-DEMO-ID` with the specific ID of your demo.

This script refers to sample html files which are in the local folder and which refer to the local files.

This way you can modify the local files and test the clickable demos.


# Build
run `yarn build` and it will generate the files in the `prod-files` directory

Then you can run `make upload-clickable-demo-files-to-dev` or `make upload-clickable-demo-files-to-prod` to upload the files to the respective environments


# Adding a New HTML Capture

Follow these steps to add a new HTML capture:

1. **Download the HTML Capture as a Zip File**:
   - Copy the link of the hosted `index.html` file and paste it in your browser's address bar.
   - Replace `unzipped-html` with `zipped-html` and remove everything after the last slash, including the slash itself, then add `.zip` at the end of the URL.
   - **Example**: If the URL is:

     ```
     https://dodao-dev-public-assets.s3.us-east-1.amazonaws.com/unzipped-html-captures/alchemix/dev-demo-1-alchemix-ba33/etherscan/index.html
     ```

     It should become:

     ```
     https://dodao-dev-public-assets.s3.us-east-1.amazonaws.com/zipped-html-captures/alchemix/dev-demo-1-alchemix-ba33/etherscan.zip
     ```

   - Press `Enter` to download the zip file.

2. **Save the Capture Screenshot**:
   - Open the HTML capture from the modal.
   - Right-click on the capture image and select `Save image as...` to download the image.

3. **Unzip and Move Files**:
   - Unzip the downloaded folder.
   - Copy the entire unzipped folder to the following location:
     ```
     dodao-ui/clickable-demos/sample-captures/safe-captures
     ```

4. **Move the Screenshot**:
   - Copy the saved image file to:
     ```
     dodao-ui/clickable-demos/sample-captures/safe-screenshots
     ```

5. **Update URLs in `index.html`**:
   - Open the `index.html` file in the unzipped folder you just copied.
   - Search for all instances of:
     ```
     https://dodao-dev-public-assets.s3.amazonaws.com/clickable-demos-prod-files
     ```
   - Replace them with:
     ```
     http://localhost:9090/prod-files
     ```

6. **Update URLs in `clickableDemoTooltipScript.js` and `clickableDemoTooltipScript.ts`**:
   - Open the `clickableDemoTooltipScript.js` file present in the `prod-files` folder
   - Replace `/clickable-demos-prod-files/` with `/prod-files/` at these four places:
      ```js
      materialStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/themes/material.css';
      shiftTowardsStyle.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/animationsshift-towarcss';
      tippyData.href = '/clickable-demos-prod-files/dependencies/tippy.js@6/stylesheet/tippy-data.css';
      link.href = '/clickable-demos-prod-files/clickableDemoTooltipStyles.css';
      ```
      like so:
      ```js
      materialStyle.href = '/prod-files/dependencies/tippy.js@6/themes/material.css';
      shiftTowardsStyle.href = '/prod-files/dependencies/tippy.js@6/animationsshift-towarcss';
      tippyData.href = '/prod-files/dependencies/tippy.js@6/stylesheet/tippy-data.css';
      link.href = '/prod-files/clickableDemoTooltipStyles.css';
      ```
   - Do the above same thing for `clickableDemoTooltipScript.ts` file present in the `src` folder

7. **Insert the Record into the Database**:
   - Use the following SQL command to insert the record into the `clickable_demo_html_cpatures` table:

     ```sql
     insert into public.clickable_demo_html_cpatures
     values (md5(random()::text),
             'demo-id',                       -- Replace with your Demo ID
             'file-name',                     -- Replace with your file name
             'http://localhost:9090/sample-captures/safe-captures/etherscan/index.html',  -- Replace with your HTML file URL
             'http://localhost:9090/sample-captures/safe-screenshots/etherscanImagepng.png',  -- Replace with your image URL
             'YYYY-MM-DD HH:MM:SS');          -- Replace with the current date and time
     ```

   - **Note**: Replace `demo-id`, `file-name`, the URLs, and the timestamp accordingly.
