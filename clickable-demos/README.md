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
You can create a clickable demo or html captures using the script `populate-sample-captures.sql`.

This script refers to sample html files which are in the local folder and which refer to the local files.

This way you can modify the local files and test the clickable demos.


# Build
run `yarn build` and it will generate the files in the `prod-files` directory

Then you can run `make upload-clickable-demo-files-to-dev` or `make upload-clickable-demo-files-to-prod` to upload the files to the respective environments


