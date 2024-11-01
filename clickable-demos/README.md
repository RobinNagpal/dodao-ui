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

### Running Local Server
You can run a local server to test the clickable demos.

```shell
yarn test-server
```
This will start the server at port 9090 and will serve the local files from there.

### Referring to local files
You can create a clickable demo or HTML capture using the `populate-sample-captures.sql` script. Simply replace `DESIRED-DEMO-ID` with the ID of the demo for which you want to generate an HTML capture. For example:

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


